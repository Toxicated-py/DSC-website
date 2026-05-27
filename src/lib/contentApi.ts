import { isSupabaseConfigured, supabase } from "./supabase";

type JsonRecord = Record<string, unknown>;

async function insertContent(table: string, payload: JsonRecord, draftKey: string) {
  if (!isSupabaseConfigured || !supabase) {
    localStorage.setItem(draftKey, JSON.stringify(payload));
    return { mode: "local" as const };
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error("Please log in before saving.");
  }

  const ownedPayload = {
    ...payload,
    ...(table === "event_proposals" ? { proposed_by: userData.user.id } : {}),
    ...(table === "projects" ? { author_id: userData.user.id } : {}),
    ...(table === "blog_posts" ? { author_id: userData.user.id } : {}),
  };

  const title = typeof payload.title === "string" ? payload.title.trim() : "";
  if (title) {
    const ownerColumn =
      table === "event_proposals" ? "proposed_by" :
      table === "projects" ? "author_id" :
      table === "blog_posts" ? "author_id" :
      "";
    if (ownerColumn) {
      const { data: existing, error: existingError } = await supabase
        .from(table)
        .select("id")
        .eq(ownerColumn, userData.user.id)
        .eq("title", title)
        .in("status", ["draft", "submitted", "pending", "approved", "published"])
        .limit(1);
      if (existingError) {
        throw existingError;
      }
      if (existing?.length) {
        throw new Error("This item was already submitted. Please wait for review or edit the existing one.");
      }
    }
  }

  const { error } = await supabase.from(table).insert(ownedPayload);
  if (error) {
    if (error.code === "23505") {
      throw new Error("This item was already submitted. Please wait for review or edit the existing one.");
    }
    if (error.code === "42P01" || error.message.toLowerCase().includes("could not find the table")) {
      throw new Error("This feature is not available yet. Please contact the admin team.");
    }
    throw error;
  }
  return { mode: "remote" as const };
}

export async function submitEventProposal(payload: JsonRecord) {
  return insertContent("event_proposals", payload, "dsc-event-proposal");
}

export async function submitProject(payload: JsonRecord) {
  return insertContent("projects", payload, "dsc-project-submission");
}

export async function publishBlogPost(payload: JsonRecord) {
  return insertContent("blog_posts", payload, "dsc-blog-post");
}

export function getPersistenceLabel(mode: "local" | "remote") {
  return mode === "remote"
    ? "You'll see its status in your profile."
    : "Saved on this device for now.";
}
