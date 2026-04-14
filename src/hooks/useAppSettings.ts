"use client";

import { useState, useEffect } from "react";

const FALLBACK_MODULE_NAME = "mistral-large-latest";

// List of valid Mistral model prefixes to validate stored settings
const VALID_PREFIXES = ["mistral-", "open-mistral-", "pixtral-"];

export const useAppSettings = () => {
  const [moduleName, setModuleName] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("aiModuleName");
      
      // If we have a stored value, check if it's a valid Mistral model
      if (stored) {
        const isValid = VALID_PREFIXES.some(prefix => stored.startsWith(prefix));
        if (isValid) return stored;
      }
      
      // Fallback to env var or hardcoded default
      const envDefault = import.meta.env.VITE_DEFAULT_AI_MODULE;
      if (envDefault && VALID_PREFIXES.some(prefix => envDefault.startsWith(prefix))) {
        return envDefault;
      }
      
      return FALLBACK_MODULE_NAME;
    }
    return FALLBACK_MODULE_NAME;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("aiModuleName", moduleName);
    }
  }, [moduleName]);

  return { moduleName, setModuleName };
};