import { describe, expect, it, vi } from "vitest";

const toastSuccessMock = vi.fn();
const toastErrorMock = vi.fn();

vi.mock("sonner", () => ({
  toast: {
    success: toastSuccessMock,
    error: toastErrorMock,
  },
}));

describe("toast utilities", () => {
  it("showSuccess delegates to toast.success", async () => {
    const { showSuccess } = await import("@/utils/toast");
    showSuccess("Operation succeeded");
    expect(toastSuccessMock).toHaveBeenCalledWith("Operation succeeded");
  });

  it("showError delegates to toast.error", async () => {
    const { showError } = await import("@/utils/toast");
    showError("Something went wrong");
    expect(toastErrorMock).toHaveBeenCalledWith("Something went wrong");
  });
});
