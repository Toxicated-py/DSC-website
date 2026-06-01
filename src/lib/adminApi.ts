import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "./apiClient";

export function adminListResource<T>(resource: string, status?: string) {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiGet<T[]>(`/api/admin/resources/${resource}${query}`, { auth: true });
}

export function adminCreateResource<T>(resource: string, data: Record<string, unknown>) {
  return apiPost<T>(`/api/admin/resources/${resource}`, { data }, { auth: true });
}

export function adminUpdateResource<T>(resource: string, id: string, data: Record<string, unknown>) {
  return apiPatch<T>(`/api/admin/resources/${resource}/${id}`, { data }, { auth: true });
}

export function adminUpdateResourceStatus<T>(resource: string, id: string, status: string) {
  return apiPatch<T>(`/api/admin/resources/${resource}/${id}/status`, { status }, { auth: true });
}

export function adminDeleteResource(resource: string, id: string) {
  return apiDelete(`/api/admin/resources/${resource}/${id}`, { auth: true });
}

export function adminListEventStaff<T>(eventId: string) {
  return apiGet<T[]>(`/api/admin/events/${eventId}/staff`, { auth: true });
}

export function adminReplaceEventStaff<T>(eventId: string, emails: string[]) {
  return apiPut<T[]>(`/api/admin/events/${eventId}/staff`, { emails }, { auth: true });
}

export function adminCreateEventFromProposal<T>(proposalId: string) {
  return apiPost<T>(`/api/admin/event-proposals/${proposalId}/create-event`, {}, { auth: true });
}

export function adminSaveSiteSettings<T>(value: Record<string, unknown>) {
  return apiPut<T>("/api/admin/site-settings", { value }, { auth: true });
}

export function adminListContacts<T>() {
  return apiGet<T[]>("/api/admin/contacts", { auth: true });
}

export function adminUpdateContactStatus<T>(id: string, status: string) {
  return apiPatch<T>(`/api/admin/contacts/${id}/status`, { status }, { auth: true });
}

export function adminDeleteContact(id: string) {
  return apiDelete(`/api/admin/contacts/${id}`, { auth: true });
}
