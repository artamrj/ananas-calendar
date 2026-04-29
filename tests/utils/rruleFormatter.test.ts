import { describe, expect, it, vi } from "vitest";
import { formatRrule } from "@/utils/rruleFormatter";

describe("formatRrule", () => {
  it("returns undefined for undefined input", () => {
    expect(formatRrule(undefined)).toBeUndefined();
  });

  it("returns undefined for empty string", () => {
    expect(formatRrule("")).toBeUndefined();
  });

  it("strips the RRULE: prefix before parsing", () => {
    expect(formatRrule("RRULE:FREQ=DAILY")).toBe("Daily");
  });

  describe("DAILY frequency", () => {
    it("returns 'Daily' for a plain daily rule", () => {
      expect(formatRrule("FREQ=DAILY")).toBe("Daily");
    });

    it("includes the occurrence count when COUNT is present", () => {
      expect(formatRrule("FREQ=DAILY;COUNT=5")).toBe("Daily for 5 occurrences");
    });

    it("includes a formatted until date when UNTIL is present", () => {
      Object.defineProperty(window, "navigator", {
        value: { language: "en-US" },
        configurable: true,
        writable: true,
      });
      const result = formatRrule("FREQ=DAILY;UNTIL=20260414");
      expect(result).toMatch(/^Daily until /);
      expect(result).toContain("2026");
    });
  });

  describe("WEEKLY frequency", () => {
    it("returns 'Weekly' for a plain weekly rule", () => {
      expect(formatRrule("FREQ=WEEKLY")).toBe("Weekly");
    });

    it("includes occurrence count without BYDAY", () => {
      expect(formatRrule("FREQ=WEEKLY;COUNT=3")).toBe("Weekly for 3 occurrences");
    });

    it("includes until date without BYDAY", () => {
      Object.defineProperty(window, "navigator", {
        value: { language: "en-US" },
        configurable: true,
        writable: true,
      });
      const result = formatRrule("FREQ=WEEKLY;UNTIL=20260414");
      expect(result).toMatch(/^Weekly until /);
      expect(result).toContain("2026");
    });

    it("formats a single BYDAY value", () => {
      expect(formatRrule("FREQ=WEEKLY;BYDAY=MO")).toBe("Every Monday");
    });

    it("formats multiple BYDAY values joined by comma-space", () => {
      expect(formatRrule("FREQ=WEEKLY;BYDAY=MO,WE,FR")).toBe(
        "Every Monday, Wednesday, Friday",
      );
    });

    it("maps all six remaining day abbreviations correctly", () => {
      expect(formatRrule("FREQ=WEEKLY;BYDAY=SU")).toBe("Every Sunday");
      expect(formatRrule("FREQ=WEEKLY;BYDAY=TU")).toBe("Every Tuesday");
      expect(formatRrule("FREQ=WEEKLY;BYDAY=WE")).toBe("Every Wednesday");
      expect(formatRrule("FREQ=WEEKLY;BYDAY=TH")).toBe("Every Thursday");
      expect(formatRrule("FREQ=WEEKLY;BYDAY=FR")).toBe("Every Friday");
      expect(formatRrule("FREQ=WEEKLY;BYDAY=SA")).toBe("Every Saturday");
    });

    it("preserves an unrecognized day abbreviation as-is", () => {
      expect(formatRrule("FREQ=WEEKLY;BYDAY=XX")).toBe("Every XX");
    });

    it("includes occurrence count with BYDAY", () => {
      expect(formatRrule("FREQ=WEEKLY;BYDAY=MO;COUNT=4")).toBe(
        "Every Monday for 4 occurrences",
      );
    });

    it("includes until date with BYDAY", () => {
      Object.defineProperty(window, "navigator", {
        value: { language: "en-US" },
        configurable: true,
        writable: true,
      });
      const result = formatRrule("FREQ=WEEKLY;BYDAY=MO;UNTIL=20260414");
      expect(result).toMatch(/^Every Monday until /);
      expect(result).toContain("2026");
    });
  });

  describe("MONTHLY frequency", () => {
    it("returns 'Monthly' for a plain monthly rule", () => {
      expect(formatRrule("FREQ=MONTHLY")).toBe("Monthly");
    });

    it("includes occurrence count", () => {
      expect(formatRrule("FREQ=MONTHLY;COUNT=6")).toBe("Monthly for 6 occurrences");
    });

    it("includes until date", () => {
      Object.defineProperty(window, "navigator", {
        value: { language: "en-US" },
        configurable: true,
        writable: true,
      });
      const result = formatRrule("FREQ=MONTHLY;UNTIL=20260414");
      expect(result).toMatch(/^Monthly until /);
      expect(result).toContain("2026");
    });
  });

  describe("YEARLY frequency", () => {
    it("returns 'Yearly' for a plain yearly rule", () => {
      expect(formatRrule("FREQ=YEARLY")).toBe("Yearly");
    });

    it("includes occurrence count", () => {
      expect(formatRrule("FREQ=YEARLY;COUNT=2")).toBe("Yearly for 2 occurrences");
    });

    it("includes until date", () => {
      Object.defineProperty(window, "navigator", {
        value: { language: "en-US" },
        configurable: true,
        writable: true,
      });
      const result = formatRrule("FREQ=YEARLY;UNTIL=20261231");
      expect(result).toMatch(/^Yearly until /);
      expect(result).toContain("2026");
    });
  });

  it("returns the cleaned rule string for unrecognized frequencies", () => {
    expect(formatRrule("FREQ=HOURLY;COUNT=5")).toBe("FREQ=HOURLY;COUNT=5");
  });

  it("ignores key-only parts that have no value", () => {
    expect(formatRrule("FREQ=DAILY;BADPART")).toBe("Daily");
  });
});
