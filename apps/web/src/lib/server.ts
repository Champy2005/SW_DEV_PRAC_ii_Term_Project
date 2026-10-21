import { cookies } from "next/headers";
import { ApiError } from "./api";
import type { ApiEnvelope } from "./types";

export const SESSION_COOKIE = "workshop_session";
export const backendUrl = () => process.env.API_URL || "http://127.0.0.1:5000/api/v1";

export async function serverApi<T>(path: string): Promise<T> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  let response: Response;
  try {
    response = await fetch(`${backendUrl()}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    throw new ApiError("The workshop service is unavailable. Please try again shortly.", 503);
  }
  let result: ApiEnvelope<T>;
  try {
    result = await response.json();
  } catch {
    throw new ApiError("The workshop service returned an invalid response. Please try again shortly.", 502);
  }
  if (!response.ok || !result.success) {
    throw new ApiError(result.error || "The workshop service returned an error.", response.status);
  }
  return result.data;
}
