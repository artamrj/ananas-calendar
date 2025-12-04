import { useState, useEffect } from "react";

const DEFAULT_MODULE_NAME = "openai/gpt-oss-safeguard-20b";

export const useAppSettings = () => {
  const [moduleName, setModuleName] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("aiModuleName") || DEFAULT_MODULE_NAME;
    }
    return DEFAULT_MODULE_NAME;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("aiModuleName", moduleName);
    }
  }, [moduleName]);

  return { moduleName, setModuleName };
};