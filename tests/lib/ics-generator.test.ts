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

  it("uses the explicit date_end for a multi-day all-day event", () => {
    const result = generateIcs({
      title: "Conference",
      date_start: "2026-06-01",
      date_end: "2026-06-03",
    });

    expect(result).toContain("DTSTART;VALUE=DATE:20260601");
    expect(result).toContain("DTEND;VALUE=DATE:20260603");
  });

  it("uses an explicit time_end when provided for timed events", () => {
    const result = generateIcs({
      title: "Workshop",
      date_start: "2026-04-14",
      time_start: "13:00",
      time_end: "17:30",
    });

    expect(result).toContain("DTSTART:20260414T130000");
    expect(result).toContain("DTEND:20260414T173000");
  });

  it("uses an explicit date_end and time_end for a timed multi-day event", () => {
    const result = generateIcs({
      title: "Overnight",
      date_start: "2026-04-14",
      date_end: "2026-04-15",
      time_start: "22:00",
      time_end: "06:00",
    });

    expect(result).toContain("DTSTART:20260414T220000");
    expect(result).toContain("DTEND:20260415T060000");
  });

  it("falls back to 'Untitled Event' when title is empty", () => {
    const result = generateIcs({
      title: "",
      date_start: "2026-04-14",
    });

    expect(result).toContain("SUMMARY:Untitled Event");
  });

  it("includes a URL line when a link is provided", () => {
    const result = generateIcs({
      title: "Webinar",
      date_start: "2026-04-14",
      link: "https://example.com/webinar",
    });

    expect(result).toContain("URL:https://example.com/webinar");
  });

  it("does not include a RRULE line when the recurrence rule is stripped as unsafe", () => {
    const result = generateIcs({
      title: "Bad Rule",
      date_start: "2026-04-14",
      recurrence_rule: "FREQ=DAILY;<script>alert(1)</script>",
    });

    expect(result).not.toContain("RRULE:");
  });

  it("escapes backslashes, newlines, semicolons, and commas in text fields", () => {
    const result = generateIcs({
      title: "Meet\\Greet",
      description: "Line1\nLine2",
      location: "Hall A; Room 1, 2nd Floor",
      date_start: "2026-04-14",
    });

    expect(result).toContain("SUMMARY:Meet\\\\Greet");
    expect(result).toContain("DESCRIPTION:Line1\\nLine2");
    expect(result).toContain("LOCATION:Hall A\\; Room 1\\, 2nd Floor");
  });

  it("joins all ICS lines with CRLF line endings", () => {
    const result = generateIcs({
      title: "Test",
      date_start: "2026-04-14",
    });

    expect(result).toContain("\r\n");
    expect(result.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
  });
});
