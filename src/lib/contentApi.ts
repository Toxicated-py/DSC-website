import { apiPost } from "./apiClient";

type JsonRecord = Record<string, unknown>;

async function insertContent(endpoint: string, payload: JsonRecord) {
  try {
    await apiPost(endpoint, payload, { auth: true });
    return { mode: "remote" as const };
  } catch (error: any) {
    if (error?.status === 401) {
      throw new Error("Please log in before saving.");
    }
    throw error;
  }
}

export async function submitEventProposal(payload: JsonRecord) {
  return insertContent("/api/submissions/event-proposals", payload);
}

export async function submitProject(payload: JsonRecord) {
  return insertContent("/api/submissions/projects", payload);
}

export async function publishBlogPost(payload: JsonRecord) {
  return insertContent("/api/submissions/blog-posts", payload);
}

export async function submitGallery(payload: JsonRecord) {
  return insertContent("/api/submissions/gallery", payload);
}

export function getPersistenceLabel(_mode: "remote") {
  return "You'll see its status in your profile.";
}
