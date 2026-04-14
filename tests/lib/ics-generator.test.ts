import { describe, expect, it, vi } from "vitest";
import { generateIcs } from "@/lib/ics-generator";

describe("generateIcs", () => {
  it("builds timed events and defaults missing end time to one hour later", () => {
    vi.spyOn(Date, "now").mockReturnValue(1_700_000_000_000);
    vi.spyOn(Math, "random").mockReturnValue(0.123456789);
    vi.setSystemTime(new Date("2026-04-14T08:00:00.000Z"));

    const result = generateIcs({
      title: "Weekly Sync",
      description: "Agenda, notes",
      location: "Room A; 2nd Floor",
      link: "https://ananas.app/meet",
      date_start: "2026-04-14",
      time_start: "09:30",
      recurrence_rule: "RRULE:FREQ=WEEKLY;BYDAY=TU",
    });

    expect(result).toContain("BEGIN:VCALENDAR");
    expect(result).toContain("SUMMARY:Weekly Sync");
    expect(result).toContain("DESCRIPTION:Agenda\\, notes");
    expect(result).toContain("LOCATION:Room A\\; 2nd Floor");
    expect(result).toContain("DTSTART:20260414T093000");
    expect(result).toContain("DTEND:20260414T103000");
    expect(result).toContain("RRULE:FREQ=WEEKLY;BYDAY=TU");
  });

  it("builds all-day events with an exclusive next-day DTEND by default", () => {
    const result = generateIcs({
      title: "Offsite",
      date_start: "2026-04-14",
    });

    expect(result).toContain("DTSTART;VALUE=DATE:20260414");
    expect(result).toContain("DTEND;VALUE=DATE:20260415");
  });
});
