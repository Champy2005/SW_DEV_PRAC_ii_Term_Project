import { ApiError } from "./api";
import { serverApi } from "./server";
import type { User } from "./types";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "./server";
import { cache } from "react";

export const getUser = cache(async (): Promise<User | null> => {
  if (!(await cookies()).has(SESSION_COOKIE)) return null;
  try {
    return await serverApi<User>("/auth/me");
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
});
