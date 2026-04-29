import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("concatenates multiple class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("filters out falsy conditional values", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
    expect(cn("base", undefined, null, "end")).toBe("base end");
  });

  it("resolves tailwind conflicts by keeping the last matching utility", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("returns an empty string when no classes are provided", () => {
    expect(cn()).toBe("");
  });

  it("handles object notation for conditional classes", () => {
    expect(cn({ "font-bold": true, "underline": false })).toBe("font-bold");
  });
});
