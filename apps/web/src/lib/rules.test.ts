import { describe, expect, it } from "vitest";
import { countActiveRegistrations, formatWorkshopDate, isUpcoming, todayUtc } from "./rules";
import type { Registration } from "./types";

describe("dates match the supplied backend's UTC calendar rules", () => {
  it("does not treat a local next day as UTC today", () => {
    expect(todayUtc(new Date("2026-10-21T01:00:00+07:00"))).toBe("2026-10-20");
  });
  it("keeps today's workshop open until UTC midnight", () => {
    const now = new Date("2026-10-20T23:59:59.999Z");
    expect(isUpcoming("2026-10-20T00:00:00.000Z", now)).toBe(true);
    expect(isUpcoming("2026-10-19T00:00:00.000Z", now)).toBe(false);
  });
  it("formats dates independently of the host timezone", () => {
    expect(formatWorkshopDate("2026-10-20T00:00:00.000Z")).toBe("20 Oct 2026");
  });
});

describe("active registrations follow the API's three-workshop limit definition", () => {
  const registration = (workshopDate: string, isActive = true): Registration => ({
    _id: workshopDate + String(isActive),
    user: null,
    workshop: { _id: "w", name: "W", description: "", instructor: "", location: "", capacity: 1, workshopDate, isActive },
  });
  it("counts today and future active workshops only", () => {
    const now = new Date("2026-10-20T12:00:00.000Z");
    const registrations = [
      registration("2026-10-20T00:00:00.000Z"), // today: counts
      registration("2026-11-01T00:00:00.000Z"), // future: counts
      registration("2026-10-19T00:00:00.000Z"), // yesterday: history
      registration("2026-12-01T00:00:00.000Z", false), // soft-deleted: history
      { _id: "orphan", user: null, workshop: null },
    ];
    expect(countActiveRegistrations(registrations, now)).toBe(2);
  });
});
