import { apiFetch } from "@/api/client";
import type { Member } from "@/types/member";

export type CreateMemberBody = {
  displayName: string;
  email?: string | null;
};

export async function fetchMembers(): Promise<Member[]> {
  return apiFetch<Member[]>("/api/members");
}

export async function createMember(body: CreateMemberBody): Promise<Member> {
  return apiFetch<Member>("/api/members", {
    method: "POST",
    body: JSON.stringify({
      displayName: body.displayName.trim(),
      email: body.email?.trim() || null,
    }),
  });
}

export async function deleteMember(id: string): Promise<void> {
  await apiFetch<void>(`/api/members/${encodeURIComponent(id)}`, { method: "DELETE" });
}
