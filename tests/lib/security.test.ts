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
});
