import type { ApiEnvelope } from "./types";

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

/** Browser requests go through the same-origin BFF. Tokens never enter client state. */
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api/backend${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init.headers },
    cache: "no-store",
  });
  const result = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || !result.success) {
    throw new ApiError(result.error || "Something went wrong. Please try again.", response.status);
  }
  return result.data;
}
