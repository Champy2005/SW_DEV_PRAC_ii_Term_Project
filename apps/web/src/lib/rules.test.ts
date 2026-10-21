import { describe, expect, it } from "vitest";
import { formatWorkshopDate, isUpcoming, todayUtc } from "./rules";

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
