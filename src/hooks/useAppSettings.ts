import { useState, useEffect } from "react";
import { env } from "@/lib/env";
import { isAllowedModelName } from "@/lib/security";

const STORAGE_KEY = "aiModuleName";

export const useAppSettings = () => {
  const [moduleName, setModuleName] = useState<string>(() => {
    if (typeof window === "undefined") {
      return env.defaultAiModel;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && isAllowedModelName(stored)) {
      return stored;
    }

    return isAllowedModelName(env.defaultAiModel)
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
