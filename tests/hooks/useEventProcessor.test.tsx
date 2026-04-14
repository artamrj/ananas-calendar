import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const processTextForEventExtractionMock = vi.fn();
const summarizeEventDescriptionMock = vi.fn();
const toastPromiseMock = vi.fn(
  <T,>(promise: Promise<T>, handlers?: { error?: (err: unknown) => string }) =>
    promise.catch((error) => {
      handlers?.error?.(error);
      throw error;
    }),
);

vi.mock("@/services/aiService", () => ({
  processTextForEventExtraction: processTextForEventExtractionMock,
  summarizeEventDescription: summarizeEventDescriptionMock,
}));

vi.mock("sonner", () => ({
  toast: {
    promise: toastPromiseMock,
  },
}));

describe("useEventProcessor", () => {
  beforeEach(() => {
    processTextForEventExtractionMock.mockReset();
    summarizeEventDescriptionMock.mockReset();
    toastPromiseMock.mockClear();
  });

  it("processes text and summarizes long descriptions", async () => {
    const { useEventProcessor } = await import("@/hooks/useEventProcessor");
    processTextForEventExtractionMock.mockResolvedValue({
      extractedJson: '{"title":"Demo"}',
      eventDetails: {
        title: "Demo",
        description: "A".repeat(300),
        date_start: "2026-04-14",
      },
    });
    summarizeEventDescriptionMock.mockResolvedValue("Short summary");

    const { result } = renderHook(() => useEventProcessor());

    await act(async () => {
      await result.current.processText("demo", "mistral-small-latest");
    });

    await waitFor(() => {
      expect(result.current.status).toBe("success");
      expect(result.current.eventDetails?.description).toBe("Short summary");
      expect(result.current.extractedJson).toContain('"description": "Short summary"');
    });
  });

  it("captures processing errors and exposes the message", async () => {
    const { useEventProcessor } = await import("@/hooks/useEventProcessor");
    processTextForEventExtractionMock.mockRejectedValue(new Error("AI offline"));

    const { result } = renderHook(() => useEventProcessor());

    let caughtError: unknown;
    await act(async () => {
      try {
        await result.current.processText("demo", "mistral-small-latest");
      } catch (error) {
        caughtError = error;
      }
    });

    expect(caughtError).toBeInstanceOf(Error);
    expect((caughtError as Error).message).toBe("AI offline");
    await waitFor(() => {
      expect(result.current.status).toBe("error");
      expect(result.current.errorMessage).toBe("AI offline");
    });
  });

  it("can load and clear stored events", async () => {
    const { useEventProcessor } = await import("@/hooks/useEventProcessor");
    const { result } = renderHook(() => useEventProcessor());

    act(() => {
      result.current.loadStoredEvent({
        extractedJson: '{"title":"Stored"}',
        eventDetails: {
          title: "Stored",
          date_start: "2026-04-14",
        },
      });
    });

    expect(result.current.status).toBe("success");
    expect(result.current.eventDetails?.title).toBe("Stored");

    act(() => {
      result.current.clearEventDetails();
    });

    expect(result.current.status).toBe("idle");
    expect(result.current.eventDetails).toBeNull();
    expect(result.current.extractedJson).toBeNull();
  });
});
