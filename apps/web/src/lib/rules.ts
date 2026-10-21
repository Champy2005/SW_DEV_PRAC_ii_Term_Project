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
