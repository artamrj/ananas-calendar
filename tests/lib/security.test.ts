import { describe, expect, it } from "vitest";
import { isAllowedModelName, isSafeUrl, sanitizeRrule } from "@/lib/security";

describe("security helpers", () => {
  it("accepts only http and https URLs", () => {
    expect(isSafeUrl("https://ananas.app")).toBe(true);
    expect(isSafeUrl("http://ananas.app")).toBe(true);
    expect(isSafeUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeUrl("ftp://ananas.app/file")).toBe(false);
  });

  it("sanitizes RRULE values and strips the RRULE prefix", () => {
    expect(sanitizeRrule(" RRULE:FREQ=WEEKLY;BYDAY=MO,WE \n")).toBe(
      "FREQ=WEEKLY;BYDAY=MO,WE",
    );
    expect(sanitizeRrule("FREQ=DAILY\nCOUNT=2")).toBe("FREQ=DAILYCOUNT=2");
    expect(sanitizeRrule("FREQ=DAILY;BYDAY=<script>")).toBe("");
  });

  it("validates supported model names", () => {
    expect(isAllowedModelName("mistral-small-latest")).toBe(true);
    expect(isAllowedModelName(" open-mistral-7b ")).toBe(true);
    expect(isAllowedModelName("gpt-4.1")).toBe(false);
  });

  describe("isSafeUrl edge cases", () => {
    it("returns false for an empty string", () => {
      expect(isSafeUrl("")).toBe(false);
    });

    it("returns false for a relative URL", () => {
      expect(isSafeUrl("/relative/path")).toBe(false);
    });

    it("returns false for a data: URL", () => {
      expect(isSafeUrl("data:text/html,<h1>hi</h1>")).toBe(false);
    });

    it("returns false for a plain string with no protocol", () => {
      expect(isSafeUrl("ananas.app")).toBe(false);
    });
  });

  describe("sanitizeRrule edge cases", () => {
    it("returns empty string for whitespace-only input", () => {
      expect(sanitizeRrule("   ")).toBe("");
    });

    it("strips the RRULE: prefix case-insensitively", () => {
      expect(sanitizeRrule("rrule:FREQ=DAILY")).toBe("FREQ=DAILY");
    });

    it("allows uppercase letters, digits, =, ;, ,, :, and -", () => {
      expect(sanitizeRrule("FREQ=WEEKLY;BYDAY=MO,WE;UNTIL=20261231T000000Z")).toBe(
        "FREQ=WEEKLY;BYDAY=MO,WE;UNTIL=20261231T000000Z",
      );
    });
  });

  describe("isAllowedModelName edge cases", () => {
    it("returns true for pixtral model names", () => {
      expect(isAllowedModelName("pixtral-12b-2409")).toBe(true);
    });

    it("returns false for an empty string", () => {
      expect(isAllowedModelName("")).toBe(false);
    });

    it("returns false for a model name with an unsupported prefix", () => {
      expect(isAllowedModelName("claude-3-sonnet")).toBe(false);
    });
  });
});
