import type { Registration } from "./types";

/** The supplied API uses UTC calendar dates, including the entire workshop day. */
export function todayUtc(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function formatWorkshopDate(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
  }).format(new Date(value));
}

export function isUpcoming(value: string, now = new Date()): boolean {
  return value.slice(0, 10) >= todayUtc(now);
}

export const ACTIVE_REGISTRATION_LIMIT = 3;

/**
 * Matches the API's limit rule: a registration is active while its workshop is
 * still active and dated today or later in UTC. Past and soft-deleted workshops do not count.
 */
export function countActiveRegistrations(registrations: Registration[], now = new Date()): number {
  return registrations.filter((item) => item.workshop?.isActive && isUpcoming(item.workshop.workshopDate, now)).length;
}
