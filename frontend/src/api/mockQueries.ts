import { mockMembers, mockTasks } from "@/data/mockData";
import type { Member } from "@/types/member";
import type { TaskItem } from "@/types/task";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function fetchMockTasks(options?: {
  simulateError?: boolean;
  delayMs?: number;
}): Promise<TaskItem[]> {
  const ms = options?.delayMs ?? 700;
  await delay(ms);
  if (options?.simulateError) {
    throw new Error("Could not load tasks. Check your connection and try again.");
  }
  return structuredClone(mockTasks);
}

export async function fetchMockMembers(delayMs = 400): Promise<Member[]> {
  await delay(delayMs);
  return structuredClone(mockMembers);
}
