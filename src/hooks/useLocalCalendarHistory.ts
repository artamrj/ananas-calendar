import { useEffect, useState } from "react";
import type { LocalCalendarRecord } from "@/types/event";

const HISTORY_STORAGE_KEY = "ananas.calendarHistory";

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const sortHistory = (records: LocalCalendarRecord[]) =>
  [...records].sort(
    (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
  );

const readStoredHistory = (): LocalCalendarRecord[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const useLocalCalendarHistory = () => {
  const [history, setHistory] = useState<LocalCalendarRecord[]>(() => readStoredHistory());

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  const saveCalendar = (record: Omit<LocalCalendarRecord, "id" | "createdAt" | "updatedAt" | "exportCount">) => {
    const timestamp = new Date().toISOString();
    const nextRecord: LocalCalendarRecord = {
      ...record,
      id: createId(),
      createdAt: timestamp,
      updatedAt: timestamp,
      exportCount: 0,
    };

    setHistory((currentHistory) => sortHistory([nextRecord, ...currentHistory]));

    return nextRecord;
  };

  const removeCalendar = (recordId: string) => {
    setHistory((currentHistory) => currentHistory.filter((record) => record.id !== recordId));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const markCalendarExported = (recordId: string) => {
    const exportedAt = new Date().toISOString();

    setHistory((currentHistory) =>
      sortHistory(
        currentHistory.map((record) =>
          record.id === recordId
            ? {
                ...record,
                updatedAt: exportedAt,
                lastExportedAt: exportedAt,
                exportCount: record.exportCount + 1,
              }
            : record
        )
      )
    );
  };

  return {
    history,
    saveCalendar,
    removeCalendar,
    clearHistory,
    markCalendarExported,
  };
};
