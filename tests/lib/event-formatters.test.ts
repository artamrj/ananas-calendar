import { describe, expect, it } from "vitest";
import {
  formatEventDate,
  formatEventTime,
  getEventDateRangeLabel,
  getEventTimeRangeLabel,
} from "@/lib/event-formatters";

describe("event formatters", () => {
  it("formats dates and times for display", () => {
    expect(formatEventDate("2026-04-14")).toBeTruthy();
    expect(formatEventTime("09:30")).toMatch(/09:30/);
  });

  it("returns combined range labels when start and end differ", () => {
    expect(
      getEventDateRangeLabel({
        title: "Trip",
        date_start: "2026-04-14",
        date_end: "2026-04-16",
      }),
    ).toContain("2026");

    expect(
      getEventTimeRangeLabel({
        title: "Trip",
        date_start: "2026-04-14",
        time_start: "09:30",
        time_end: "11:00",
      }),
    ).toBe("09:30 to 11:00");
  });

  it("returns null when there is no start time", () => {
    expect(
      getEventTimeRangeLabel({
        title: "All Day",
        date_start: "2026-04-14",
      }),
    ).toBeNull();
  });
});
