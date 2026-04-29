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

  describe("formatEventDate", () => {
    it("returns an empty string for undefined input", () => {
      expect(formatEventDate(undefined)).toBe("");
    });

    it("returns the raw string when the date is invalid", () => {
      expect(formatEventDate("not-a-date")).toBe("not-a-date");
    });
  });

  describe("formatEventTime", () => {
    it("returns an empty string for undefined input", () => {
      expect(formatEventTime(undefined)).toBe("");
    });

    it("returns the raw string when the time is invalid", () => {
      expect(formatEventTime("bad-time")).toBe("bad-time");
    });
  });

  describe("getEventDateRangeLabel", () => {
    it("returns only the start date when end is absent", () => {
      const label = getEventDateRangeLabel({
        title: "Solo",
        date_start: "2026-04-14",
      });
      expect(label).toContain("2026");
      expect(label).not.toContain(" - ");
    });

    it("returns only the start date when start and end are equal", () => {
      const label = getEventDateRangeLabel({
        title: "Same Day",
        date_start: "2026-04-14",
        date_end: "2026-04-14",
      });
      expect(label).not.toContain(" - ");
    });
  });

  describe("getEventTimeRangeLabel", () => {
    it("returns only the start time when end time is absent", () => {
      expect(
        getEventTimeRangeLabel({
          title: "Open End",
          date_start: "2026-04-14",
          time_start: "14:00",
        }),
      ).toBe("14:00");
    });

    it("returns only the start time when start and end are equal", () => {
      expect(
        getEventTimeRangeLabel({
          title: "Instant",
          date_start: "2026-04-14",
          time_start: "09:00",
          time_end: "09:00",
        }),
      ).toBe("09:00");
    });
  });
});
