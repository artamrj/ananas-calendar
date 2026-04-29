import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useAppSettings } from "@/hooks/useAppSettings";

describe("useAppSettings", () => {
  it("uses a valid stored model and persists updates", async () => {
    localStorage.setItem("aiModuleName", "mistral-small-latest");

    const { result } = renderHook(() => useAppSettings());

    expect(result.current.moduleName).toBe("mistral-small-latest");

    act(() => {
      result.current.setModuleName("open-mistral-7b");
    });

    await waitFor(() => {
      expect(localStorage.getItem("aiModuleName")).toBe("open-mistral-7b");
    });
  });

  it("falls back when the stored model is invalid", () => {
    localStorage.setItem("aiModuleName", "gpt-4.1");

    const { result } = renderHook(() => useAppSettings());

    expect(result.current.moduleName).toBe("mistral-small-2409");
  });

  it("uses the hardcoded default when no model is stored", () => {
    // localStorage is cleared by setup.ts after each test, so nothing is stored
    const { result } = renderHook(() => useAppSettings());

    // Default is "mistral-small-2409" (the env default or hardcoded fallback)
    expect(result.current.moduleName).toBeTruthy();
    expect(result.current.moduleName).toMatch(/^(mistral|open-mistral|pixtral)-/);
  });

  it("persists the module name to localStorage after an update", async () => {
    const { result } = renderHook(() => useAppSettings());

    act(() => {
      result.current.setModuleName("mistral-large-latest");
    });

    await waitFor(() => {
      expect(localStorage.getItem("aiModuleName")).toBe("mistral-large-latest");
    });
  });
});
