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

  it("returns the newly created record from saveCalendar", async () => {
    vi.stubGlobal("crypto", {
      randomUUID: () => "new-id",
    });
    vi.setSystemTime(new Date("2026-06-01T08:00:00.000Z"));

    const { result } = renderHook(() => useLocalCalendarHistory());

    let saved: ReturnType<typeof result.current.saveCalendar> | undefined;

    act(() => {
      saved = result.current.saveCalendar({
        sourceText: "dentist appointment",
        extractedJson: '{"title":"Dentist"}',
        eventDetails: { title: "Dentist", date_start: "2026-06-01" },
      });
    });

    expect(saved).toMatchObject({
      id: "new-id",
      sourceText: "dentist appointment",
      exportCount: 0,
    });
    expect(saved?.createdAt).toBeTruthy();
  });

  it("sorts history by updatedAt in descending order", async () => {
    let callCount = 0;
    vi.stubGlobal("crypto", {
      randomUUID: () => `id-${++callCount}`,
    });

    const { result } = renderHook(() => useLocalCalendarHistory());

    act(() => {
      vi.setSystemTime(new Date("2026-04-01T10:00:00.000Z"));
      result.current.saveCalendar({
        sourceText: "first",
        extractedJson: "{}",
        eventDetails: { title: "First", date_start: "2026-04-01" },
      });
    });

    act(() => {
      vi.setSystemTime(new Date("2026-04-02T10:00:00.000Z"));
      result.current.saveCalendar({
        sourceText: "second",
        extractedJson: "{}",
        eventDetails: { title: "Second", date_start: "2026-04-02" },
      });
    });

    await waitFor(() => {
      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[0]?.eventDetails.title).toBe("Second");
      expect(result.current.history[1]?.eventDetails.title).toBe("First");
    });
  });

  it("persists history to localStorage", async () => {
    vi.stubGlobal("crypto", { randomUUID: () => "persist-id" });
    vi.setSystemTime(new Date("2026-04-14T10:00:00.000Z"));

    const { result } = renderHook(() => useLocalCalendarHistory());

    act(() => {
      result.current.saveCalendar({
        sourceText: "save to storage",
        extractedJson: '{"title":"Stored"}',
        eventDetails: { title: "Stored", date_start: "2026-04-14" },
      });
    });

    await waitFor(() => {
      const stored = localStorage.getItem("ananas.calendarHistory");
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].id).toBe("persist-id");
    });
  });
});
