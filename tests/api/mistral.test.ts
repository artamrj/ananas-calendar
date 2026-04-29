import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import handler from "../../api/mistral";

describe("api/mistral handler", () => {
  const originalEnv = process.env.MISTRAL_API_KEY;

  beforeEach(() => {
    process.env.MISTRAL_API_KEY = "test-key";
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    process.env.MISTRAL_API_KEY = originalEnv;
  });

  it("rejects unsupported methods", async () => {
    const response = await handler(new Request("http://localhost/api/mistral"));

    expect(response.status).toBe(405);
    await expect(response.json()).resolves.toEqual({ error: "Method not allowed." });
  });

  it("rejects requests when the API key is missing", async () => {
    process.env.MISTRAL_API_KEY = "";

    const response = await handler(
      new Request("http://localhost/api/mistral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: "hello", model: "mistral-small-latest" }),
      }),
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Server is missing MISTRAL_API_KEY.",
    });
  });

  it("validates the request body before calling upstream", async () => {
    const response = await handler(
      new Request("http://localhost/api/mistral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: "", model: "mistral-small-latest" }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Missing prompt." });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("rejects unsupported model names", async () => {
    const response = await handler(
      new Request("http://localhost/api/mistral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: "hello", model: "gpt-4.1" }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Unsupported model name.",
    });
  });

  it("forwards valid requests to Mistral", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: "ok" } }],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const response = await handler(
      new Request("http://localhost/api/mistral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: "Extract this event",
          model: "mistral-small-latest",
          responseFormat: { type: "json_object" },
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.mistral.ai/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer test-key",
        }),
      }),
    );
  });

  it("maps upstream failures into API errors", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ message: "Upstream bad request" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const response = await handler(
      new Request("http://localhost/api/mistral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: "Extract this event",
          model: "mistral-small-latest",
        }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Upstream bad request",
    });
  });

  it("rejects a request with an invalid JSON body", async () => {
    const response = await handler(
      new Request("http://localhost/api/mistral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{ not valid json",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Request body must be valid JSON.",
    });
  });

  it("rejects a request without a model field", async () => {
    const response = await handler(
      new Request("http://localhost/api/mistral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: "hello" }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Missing model." });
  });

  it("rejects a prompt that exceeds the maximum length", async () => {
    const response = await handler(
      new Request("http://localhost/api/mistral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: "A".repeat(12001),
          model: "mistral-small-latest",
        }),
      }),
    );

    expect(response.status).toBe(400);
    const body = await response.json() as { error: string };
    expect(body.error).toContain("too long");
  });

  it("falls back to a generic error message when the upstream response has no message field", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({}), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const response = await handler(
      new Request("http://localhost/api/mistral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: "Extract this event",
          model: "mistral-small-latest",
        }),
      }),
    );

    expect(response.status).toBe(503);
    const body = await response.json() as { error: string };
    expect(body.error).toContain("503");
  });
});
