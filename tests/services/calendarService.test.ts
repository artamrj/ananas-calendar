import { beforeEach, describe, expect, it, vi } from "vitest";

const toastSuccessMock = vi.fn();
const showErrorMock = vi.fn();
const generateIcsMock = vi.fn(() => "BEGIN:VCALENDAR\r\nEND:VCALENDAR");

vi.mock("sonner", () => ({
  toast: {
    success: toastSuccessMock,
  },
}));

vi.mock("@/utils/toast", () => ({
  showError: showErrorMock,
}));

vi.mock("@/lib/ics-generator", () => ({
  generateIcs: generateIcsMock,
}));

describe("handleCalendarExport", () => {
  beforeEach(() => {
    toastSuccessMock.mockReset();
    showErrorMock.mockReset();
    generateIcsMock.mockReset();
    generateIcsMock.mockReturnValue("BEGIN:VCALENDAR\r\nEND:VCALENDAR");
  });

  it("shows an error when event details are missing", async () => {
    const { handleCalendarExport } = await import("@/services/calendarService");

    expect(handleCalendarExport(null)).toBe(false);
    expect(showErrorMock).toHaveBeenCalledWith(
      "No valid event details are available to export.",
    );
  });

  it("downloads a blob for non-Apple devices", async () => {
    const { handleCalendarExport } = await import("@/services/calendarService");
    const originalCreateElement = document.createElement.bind(document);
    const createObjectUrlMock = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:test");
    const revokeObjectUrlMock = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => {});
    const clickMock = vi.fn();
    const appendChildSpy = vi.spyOn(document.body, "appendChild");
    const removeChildSpy = vi.spyOn(document.body, "removeChild");
    const createElementSpy = vi.spyOn(document, "createElement");

    createElementSpy.mockImplementation(((tagName: string) => {
      if (tagName === "a") {
        const anchor = originalCreateElement("a");
        vi.spyOn(anchor, "click").mockImplementation(clickMock);
        return anchor;
      }

      return originalCreateElement(tagName);
    }) as typeof document.createElement);

    Object.defineProperty(window.navigator, "userAgent", {
      value: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      configurable: true,
    });

    expect(
      handleCalendarExport({
        title: 'Quarterly:Review/2026',
        date_start: "2026-04-14",
      }),
    ).toBe(true);

    expect(generateIcsMock).toHaveBeenCalled();
    expect(createObjectUrlMock).toHaveBeenCalled();
    expect(revokeObjectUrlMock).toHaveBeenCalledWith("blob:test");
    expect(clickMock).toHaveBeenCalled();
    expect(appendChildSpy).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();
    expect(toastSuccessMock).toHaveBeenCalledWith("Calendar file downloaded.");
  });

  it("uses a data URL on Apple devices", async () => {
    const { handleCalendarExport } = await import("@/services/calendarService");
    const originalCreateElement = document.createElement.bind(document);
    const clickMock = vi.fn();
    const setAttributeMock = vi.fn();

    vi.spyOn(document, "createElement").mockImplementation(((tagName: string) => {
      if (tagName === "a") {
        const anchor = originalCreateElement("a");
        vi.spyOn(anchor, "click").mockImplementation(clickMock);
        vi.spyOn(anchor, "setAttribute").mockImplementation(setAttributeMock);
        return anchor;
      }

      return originalCreateElement(tagName);
    }) as typeof document.createElement);

    Object.defineProperty(window.navigator, "userAgent", {
      value: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      configurable: true,
    });

    expect(
      handleCalendarExport({
        title: "Apple Event",
        date_start: "2026-04-14",
      }),
    ).toBe(true);

    expect(setAttributeMock).toHaveBeenCalledWith("download", "Apple Event.ics");
    expect(clickMock).toHaveBeenCalled();
    expect(toastSuccessMock).toHaveBeenCalledWith(
      "Calendar file prepared. If Calendar does not open automatically, open the downloaded file manually.",
    );
  });

  it("uses a data URL on iOS devices", async () => {
    const { handleCalendarExport } = await import("@/services/calendarService");
    const originalCreateElement = document.createElement.bind(document);
    const clickMock = vi.fn();
    const setAttributeMock = vi.fn();

    vi.spyOn(document, "createElement").mockImplementation(((tagName: string) => {
      if (tagName === "a") {
        const anchor = originalCreateElement("a");
        vi.spyOn(anchor, "click").mockImplementation(clickMock);
        vi.spyOn(anchor, "setAttribute").mockImplementation(setAttributeMock);
        return anchor;
      }
      return originalCreateElement(tagName);
    }) as typeof document.createElement);

    Object.defineProperty(window.navigator, "userAgent", {
      value: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
      configurable: true,
    });

    expect(
      handleCalendarExport({
        title: "iOS Event",
        date_start: "2026-04-14",
      }),
    ).toBe(true);

    expect(setAttributeMock).toHaveBeenCalledWith("download", "iOS Event.ics");
    expect(toastSuccessMock).toHaveBeenCalledWith(
      "Calendar file prepared. If Calendar does not open automatically, open the downloaded file manually.",
    );
  });

  it("sanitizes illegal filename characters to underscores", async () => {
    const { handleCalendarExport } = await import("@/services/calendarService");
    const originalCreateElement = document.createElement.bind(document);
    const setAttributeMock = vi.fn();

    vi.spyOn(document, "createElement").mockImplementation(((tagName: string) => {
      if (tagName === "a") {
        const anchor = originalCreateElement("a");
        vi.spyOn(anchor, "click").mockImplementation(() => {});
        vi.spyOn(anchor, "setAttribute").mockImplementation(setAttributeMock);
        return anchor;
      }
      return originalCreateElement(tagName);
    }) as typeof document.createElement);

    Object.defineProperty(window.navigator, "userAgent", {
      value: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      configurable: true,
    });

    handleCalendarExport({
      title: 'Review: Q1/2026 "Results"',
      date_start: "2026-04-14",
    });

    const downloadCall = setAttributeMock.mock.calls.find(
      ([attr]) => attr === "download",
    );
    expect(downloadCall).toBeDefined();
    expect(downloadCall?.[1]).toBe("Review_ Q1_2026 _Results_.ics");
  });

  it("shows an error and returns false when ICS generation throws", async () => {
    const { handleCalendarExport } = await import("@/services/calendarService");
    generateIcsMock.mockImplementation(() => {
      throw new Error("ICS generation failed");
    });

    Object.defineProperty(window.navigator, "userAgent", {
      value: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      configurable: true,
    });

    const result = handleCalendarExport({
      title: "Boom",
      date_start: "2026-04-14",
    });

    expect(result).toBe(false);
    expect(showErrorMock).toHaveBeenCalledWith(
      "Failed to export calendar file: ICS generation failed",
    );
  });
});
