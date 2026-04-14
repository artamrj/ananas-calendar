import { useState, useEffect } from "react";
import { env } from "@/lib/env";

const VALID_PREFIXES = ["mistral-", "open-mistral-", "pixtral-"];
const STORAGE_KEY = "aiModuleName";

const isValidModelName = (value: string): boolean =>
  VALID_PREFIXES.some((prefix) => value.startsWith(prefix));

export const useAppSettings = () => {
  const [moduleName, setModuleName] = useState<string>(() => {
    if (typeof window === "undefined") {
      return env.defaultAiModel;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && isValidModelName(stored)) {
      return stored;
    }

    return isValidModelName(env.defaultAiModel)
      ? env.defaultAiModel
      : "mistral-small-2409";
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.setItem(STORAGE_KEY, moduleName);
  }, [moduleName]);

  return { moduleName, setModuleName };
};
