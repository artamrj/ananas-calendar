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
});
