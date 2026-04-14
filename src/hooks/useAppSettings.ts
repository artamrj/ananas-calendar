"use client";

import { useState, useEffect } from "react";

const FALLBACK_MODULE_NAME = "mistral-large-latest";

export const useAppSettings = () => {
  const [moduleName, setModuleName] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("aiModuleName") || import.meta.env.VITE_DEFAULT_AI_MODULE || FALLBACK_MODULE_NAME;
    }
    return import.meta.env.VITE_DEFAULT_AI_MODULE || FALLBACK_MODULE_NAME;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("aiModuleName", moduleName);
    }
  }, [moduleName]);

  return { moduleName, setModuleName };
};