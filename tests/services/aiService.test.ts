import { beforeEach, describe, expect, it, vi } from "vitest";

const callAiMock = vi.fn();
const resolveAiModelMock = vi.fn((model?: string) => model?.trim() || "resolved-default");
const getCurrentContextMock = vi.fn(() => "Current Date: mock.");

vi.mock("@/services/aiClient", () => ({
  callAi: callAiMock,
  resolveAiModel: resolveAiModelMock,
}));

vi.mock("@/services/aiHelpers", () => ({
  getCurrentContext: getCurrentContextMock,
}));

describe("aiService", () => {
  beforeEach(() => {
    callAiMock.mockReset();
    resolveAiModelMock.mockClear();
    getCurrentContextMock.mockClear();
  });

  it("extracts and validates event JSON returned by the AI", async () => {
    const { processTextForEventExtraction } = await import("@/services/aiService");
    callAiMock.mockResolvedValue(
      JSON.stringify({
        title: "Team Sync",
        date_start: "2026-04-14",
        time_start: "09:30",
      }),
    );

    const result = await processTextForEventExtraction(
      "team sync tomorrow at 09:30",
      "mistral-small-latest",
      "en-US",
      "Europe/Berlin",
    );

    expect(result.eventDetails.title).toBe("Team Sync");
    expect(result.extractedJson).toContain('"date_start": "2026-04-14"');
    expect(getCurrentContextMock).toHaveBeenCalledWith("en-US", "Europe/Berlin");
    expect(resolveAiModelMock).toHaveBeenCalledWith("mistral-small-latest");
  });

  it("rejects empty input before calling the AI", async () => {
    const { processTextForEventExtraction } = await import("@/services/aiService");

    await expect(
      processTextForEventExtraction("   ", "mistral-small-latest"),
    ).rejects.toThrow("Input text cannot be empty for event extraction.");
    expect(callAiMock).not.toHaveBeenCalled();
  });

  it("rejects invalid AI payloads", async () => {
    const { processTextForEventExtraction } = await import("@/services/aiService");
    callAiMock.mockResolvedValue("{\"title\":\"Broken\"}");

    await expect(
      processTextForEventExtraction("broken payload", "mistral-small-latest"),
    ).rejects.toThrow(/AI response was not valid event JSON/);
  });

  it("rejects input that exceeds the maximum prompt length", async () => {
    const { processTextForEventExtraction } = await import("@/services/aiService");
    const oversized = "A".repeat(12001);

    await expect(
      processTextForEventExtraction(oversized, "mistral-small-latest"),
    ).rejects.toThrow(/too long/);
    expect(callAiMock).not.toHaveBeenCalled();
  });

  it("summarizes only long descriptions and falls back on failure", async () => {
    const { summarizeEventDescription } = await import("@/services/aiService");
    const longDescription = "A".repeat(400);

    callAiMock.mockResolvedValue("Short summary");
    await expect(
      summarizeEventDescription(longDescription, "mistral-small-latest"),
    ).resolves.toBe("Short summary");

    callAiMock.mockRejectedValue(new Error("upstream failed"));
    await expect(
      summarizeEventDescription(longDescription, "mistral-small-latest"),
    ).resolves.toBe(longDescription);

    await expect(
      summarizeEventDescription("short", "mistral-small-latest"),
    ).resolves.toBe("short");
  });

  it("returns undefined as-is from summarizeEventDescription", async () => {
    const { summarizeEventDescription } = await import("@/services/aiService");

    await expect(
      summarizeEventDescription(undefined, "mistral-small-latest"),
    ).resolves.toBeUndefined();
  });

  it("truncates summaries that still exceed the maximum length", async () => {
    const { summarizeEventDescription } = await import("@/services/aiService");
    const longDescription = "A".repeat(400);
    callAiMock.mockResolvedValue("B".repeat(360));

    const result = await summarizeEventDescription(
      longDescription,
      "mistral-small-latest",
    );

    expect(result).toHaveLength(353);
    expect(result?.endsWith("...")).toBe(true);
  });
});
