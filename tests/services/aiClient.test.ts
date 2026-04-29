import { beforeEach, describe, expect, it, vi } from "vitest";
import { callAi, getAiConfigurationStatus, resolveAiModel } from "@/services/aiClient";

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

  it("uses the caller-provided model when it is non-empty", () => {
    expect(resolveAiModel("open-mistral-7b")).toBe("open-mistral-7b");
  });

  it("uses the default model when no model argument is given", () => {
    expect(resolveAiModel()).toBe("mistral-small-2409");
  });

  it("surfaces a fallback message when the error response body is not JSON", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(
      new Response("Internal Server Error", {
        status: 500,
        headers: { "Content-Type": "text/plain" },
      }),
    );

    await expect(callAi("extract this", "mistral-small-latest")).rejects.toThrow(
      "Request failed with status 500.",
    );
  });

  it("reports that the proxy is available", () => {
    const status = getAiConfigurationStatus();
    expect(status.hasProxy).toBe(true);
  });
});
