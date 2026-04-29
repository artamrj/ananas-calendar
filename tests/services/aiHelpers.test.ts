import { describe, expect, it, vi } from "vitest";
import { getCurrentContext } from "@/services/aiHelpers";

describe("getCurrentContext", () => {
  it("returns a string containing the current UTC date, day of week, time, and timezone", () => {
    vi.setSystemTime(new Date("2026-04-14T10:00:00.000Z"));

    const result = getCurrentContext("en-US", "Europe/Berlin");

    expect(result).toContain("2026-04-14");
    expect(result).toContain("Year 2026");
    expect(result).toContain("Month April");
    expect(result).toContain("Day 14");
    expect(result).toContain("Time Zone: Europe/Berlin");
  });

  it("includes the month name and day of week based on the provided timezone", () => {
    vi.setSystemTime(new Date("2026-04-14T10:00:00.000Z"));

    const result = getCurrentContext("en-US", "UTC");

    expect(result).toContain("April");
    expect(result).toContain("Tuesday");
  });

  it("falls back to the system timezone when none is provided", () => {
    vi.setSystemTime(new Date("2026-04-14T10:00:00.000Z"));

    const result = getCurrentContext();

    expect(result).toContain("2026-04-14");
    expect(result).toContain("Time Zone:");
  });

  it("includes the current time formatted in HH:MM", () => {
    vi.setSystemTime(new Date("2026-04-14T10:30:00.000Z"));

    const result = getCurrentContext("en-US", "UTC");

    expect(result).toContain("Current Time: 10:30");
  });
});
