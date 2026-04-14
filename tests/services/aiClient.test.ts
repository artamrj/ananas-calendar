import { beforeEach, describe, expect, it, vi } from "vitest";
import { callAi, resolveAiModel } from "@/services/aiClient";

describe("aiClient", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("uses the provided model when calling the proxy", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: "  extracted content  " } }],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    await expect(
      callAi("extract this", "mistral-small-latest", { type: "json_object" }),
    ).resolves.toBe("extracted content");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/mistral",
      expect.objectContaining({
        method: "POST",
      }),
    );
  });

  it("surfaces API error messages", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ error: "Missing prompt." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(callAi("extract this", "mistral-small-latest")).rejects.toThrow(
      "Missing prompt.",
    );
  });

  it("fails when the AI response has no content", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ choices: [{ message: {} }] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(callAi("extract this", "mistral-small-latest")).rejects.toThrow(
      "AI response did not contain any message content.",
    );
  });

  it("falls back to the default configured model", () => {
    expect(resolveAiModel("  ")).toBe("mistral-small-2409");
  });
});
