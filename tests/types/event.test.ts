import { describe, expect, it } from "vitest";
import { eventDetailsSchema } from "@/types/event";

describe("eventDetailsSchema", () => {
  it("trims optional fields, validates links, and sanitizes recurrence rules", () => {
    const parsed = eventDetailsSchema.parse({
      title: " Demo Event ",
      description: "  hello world  ",
      link: "https://ananas.app/demo",
      location: "  Berlin  ",
      date_start: "2026-04-14",
      time_start: "09:00",
      recurrence_rule: "RRULE:FREQ=WEEKLY;BYDAY=TU",
    });

    expect(parsed).toMatchObject({
      title: "Demo Event",
      description: "hello world",
      link: "https://ananas.app/demo",
      location: "Berlin",
      recurrence_rule: "FREQ=WEEKLY;BYDAY=TU",
    });
  });

  it("rejects unsafe links", () => {
    expect(() =>
      eventDetailsSchema.parse({
        title: "Bad Link",
        link: "javascript:alert(1)",
        date_start: "2026-04-14",
      }),
    ).toThrow(/Link must be a valid http\(s\) URL/);
  });

  it("drops blank optional values", () => {
    const parsed = eventDetailsSchema.parse({
      title: "Blank Optional",
      description: "   ",
      location: "",
      date_start: "2026-04-14",
    });

    expect(parsed.description).toBeUndefined();
    expect(parsed.location).toBeUndefined();
  });
});
