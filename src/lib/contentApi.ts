import { apiPost } from "./apiClient";

type JsonRecord = Record<string, unknown>;

async function insertContent(endpoint: string, payload: JsonRecord, draftKey: string) {
  try {
    await apiPost(endpoint, payload, { auth: true });
    return { mode: "remote" as const };
  } catch (error: any) {
    if (error?.status === 401) {
      throw new Error("Please log in before saving.");
    }
    if (error?.status === 503) {
      localStorage.setItem(draftKey, JSON.stringify(payload));
      return { mode: "local" as const };
    }
    throw error;
  }
}

export async function submitEventProposal(payload: JsonRecord) {
  return insertContent("/api/submissions/event-proposals", payload, "dsc-event-proposal");
}

export async function submitProject(payload: JsonRecord) {
  return insertContent("/api/submissions/projects", payload, "dsc-project-submission");
}

export async function publishBlogPost(payload: JsonRecord) {
  return insertContent("/api/submissions/blog-posts", payload, "dsc-blog-post");
}

export async function submitGallery(payload: JsonRecord) {
  return insertContent("/api/submissions/gallery", payload, "dsc-gallery-submission");
}

export async function saveLocalDraft(payload: JsonRecord, draftKey: string) {
    localStorage.setItem(draftKey, JSON.stringify(payload));
  return { mode: "local" as const };
}

export function getPersistenceLabel(mode: "local" | "remote") {
  return mode === "remote"
    ? "You'll see its status in your profile."
    : "Saved on this device for now.";
}
