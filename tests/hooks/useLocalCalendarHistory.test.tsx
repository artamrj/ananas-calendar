import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useLocalCalendarHistory } from "@/hooks/useLocalCalendarHistory";

describe("useLocalCalendarHistory", () => {
  it("reads, saves, updates, and clears stored history", async () => {
    vi.stubGlobal("crypto", {
      randomUUID: () => "fixed-id",
    });
    vi.setSystemTime(new Date("2026-04-14T10:00:00.000Z"));

    const { result } = renderHook(() => useLocalCalendarHistory());

    act(() => {
      result.current.saveCalendar({
        sourceText: "meeting tomorrow",
        extractedJson: '{"title":"Meeting"}',
        eventDetails: {
          title: "Meeting",
          date_start: "2026-04-14",
        },
      });
    });

    await waitFor(() => {
      expect(result.current.history).toHaveLength(1);
    });

    act(() => {
      result.current.markCalendarExported("fixed-id");
    });

    await waitFor(() => {
      expect(result.current.history[0]?.exportCount).toBe(1);
      expect(result.current.history[0]?.lastExportedAt).toBeTruthy();
    });

    act(() => {
      result.current.removeCalendar("fixed-id");
    });

    await waitFor(() => {
      expect(result.current.history).toHaveLength(0);
    });

    act(() => {
      result.current.saveCalendar({
        sourceText: "meeting tomorrow",
        extractedJson: '{"title":"Meeting"}',
        eventDetails: {
          title: "Meeting",
          date_start: "2026-04-14",
        },
      });
      result.current.clearHistory();
    });

    await waitFor(() => {
      expect(result.current.history).toEqual([]);
    });
  });

  it("gracefully ignores invalid stored history", () => {
    localStorage.setItem("ananas.calendarHistory", "{bad-json");

    const { result } = renderHook(() => useLocalCalendarHistory());

    expect(result.current.history).toEqual([]);
  });
});
