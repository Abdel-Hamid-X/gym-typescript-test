import { apiDelete, apiGet, apiPatch, apiPost } from "./client";

export interface BackendMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  status: "UNREAD" | "READ" | "ARCHIVED";
  createdAt: string;
}

export async function submitContactMessage(input: {
  name: string;
  email: string;
  message: string;
}): Promise<{ message: BackendMessage; note?: string }> {
  const res = await apiPost<{ data: { message: BackendMessage; note?: string } }>("/contact-messages", input);
  return res.data;
}

export async function fetchContactMessagesByAdmin(status?: string): Promise<{ messages: BackendMessage[] }> {
  const queryString = status ? `?status=${status}` : "";
  const res = await apiGet<{ data: { messages: BackendMessage[] } }>(`/admin/contact-messages${queryString}`);
  return res.data;
}

export async function updateMessageStatusByAdmin(
  id: string,
  status: "UNREAD" | "READ" | "ARCHIVED"
): Promise<{ message: BackendMessage }> {
  const res = await apiPatch<{ data: { message: BackendMessage } }>(`/admin/contact-messages/${id}/status`, { status });
  return res.data;
}

export async function deleteContactMessageByAdmin(id: string): Promise<void> {
  await apiDelete(`/admin/contact-messages/${id}`);
}
