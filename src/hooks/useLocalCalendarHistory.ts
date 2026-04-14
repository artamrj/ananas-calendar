import { useEffect, useState } from "react";
import type { LocalCalendarRecord, LocalCalendarUser } from "@/types/event";

const USERS_STORAGE_KEY = "ananas.localCalendarUsers";
const ACTIVE_USER_STORAGE_KEY = "ananas.activeLocalCalendarUser";
const HISTORY_STORAGE_PREFIX = "ananas.calendarHistory";

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const createDefaultUser = (): LocalCalendarUser => {
  const timestamp = new Date().toISOString();

  return {
    id: createId(),
    name: "My Studio",
    createdAt: timestamp,
  };
};

const getHistoryStorageKey = (userId: string) => `${HISTORY_STORAGE_PREFIX}.${userId}`;

const sortHistory = (records: LocalCalendarRecord[]) =>
  [...records].sort(
    (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
  );

const readStoredUsers = (): LocalCalendarUser[] => {
  if (typeof window === "undefined") {
    return [createDefaultUser()];
  }

  try {
    const stored = window.localStorage.getItem(USERS_STORAGE_KEY);
    if (!stored) {
      return [createDefaultUser()];
    }

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [createDefaultUser()];
  } catch {
    return [createDefaultUser()];
  }
};

const readStoredHistory = (userId: string): LocalCalendarRecord[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(getHistoryStorageKey(userId));
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
  const [users, setUsers] = useState<LocalCalendarUser[]>(() => readStoredUsers());
  const [activeUserId, setActiveUserIdState] = useState<string>(() => {
    const seededUsers = readStoredUsers();

    if (typeof window === "undefined") {
      return seededUsers[0].id;
    }

    const storedActiveUserId = window.localStorage.getItem(ACTIVE_USER_STORAGE_KEY);

    return storedActiveUserId && seededUsers.some((user) => user.id === storedActiveUserId)
      ? storedActiveUserId
      : seededUsers[0].id;
  });
  const [history, setHistory] = useState<LocalCalendarRecord[]>(() => readStoredHistory(activeUserId));

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(ACTIVE_USER_STORAGE_KEY, activeUserId);
  }, [activeUserId]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(getHistoryStorageKey(activeUserId), JSON.stringify(history));
  }, [activeUserId, history]);

  const activeUser = users.find((user) => user.id === activeUserId) ?? null;

  const setActiveUserId = (nextUserId: string) => {
    setActiveUserIdState(nextUserId);
    setHistory(sortHistory(readStoredHistory(nextUserId)));
  };

  const updateActiveUserName = (name: string) => {
    const normalized = name.trim();
    if (!normalized) {
      return;
    }

    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        user.id === activeUserId
          ? {
              ...user,
              name: normalized,
            }
          : user
      )
    );
  };

  const createUser = () => {
    const user = createDefaultUser();
    setUsers((currentUsers) => [user, ...currentUsers]);
    setActiveUserIdState(user.id);
    setHistory([]);
    return user;
  };

  const saveCalendar = (record: Omit<LocalCalendarRecord, "id" | "createdAt" | "updatedAt" | "exportCount">) => {
    const timestamp = new Date().toISOString();
    const nextRecord: LocalCalendarRecord = {
      ...record,
      id: createId(),
      createdAt: timestamp,
      updatedAt: timestamp,
      exportCount: 0,
    };

    setHistory((currentHistory) =>
      sortHistory([nextRecord, ...currentHistory])
    );

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
    users,
    activeUser,
    activeUserId,
    setActiveUserId,
    updateActiveUserName,
    createUser,
    history,
    saveCalendar,
    removeCalendar,
    clearHistory,
    markCalendarExported,
  };
};
