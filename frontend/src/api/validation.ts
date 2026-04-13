import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ApiError } from "@/api/client";

/** Maps ASP.NET / FluentValidation property names to react-hook-form field names. */
function normalizeKey(key: string): string {
  if (key.startsWith("$") || key === "") return key;
  return key.charAt(0).toLowerCase() + key.slice(1);
}

/**
 * Applies `errors` from a 400 Problem Details body to RHF `setError`.
 * Returns true if at least one field was set.
 */
export function applyServerValidationErrors<T extends FieldValues>(
  err: unknown,
  setError: UseFormSetError<T>,
): boolean {
  if (!(err instanceof ApiError) || err.status !== 400) return false;
  const body = err.body as { errors?: Record<string, string[]> } | null;
  if (!body?.errors || typeof body.errors !== "object") return false;

  let applied = false;
  for (const [rawKey, messages] of Object.entries(body.errors)) {
    const key = normalizeKey(rawKey) as Path<T>;
    const msg = Array.isArray(messages) ? messages[0] : undefined;
    if (typeof msg === "string" && msg) {
      setError(key, { message: msg });
      applied = true;
    }
  }
  return applied;
}
