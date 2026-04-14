import { generateIcs } from "@/lib/ics-generator";
import { toast } from "sonner";
import { showError } from "@/utils/toast";
import type { EventDetails } from "@/types/event";

const isLegacyIosBrowser = (): boolean =>
  "MSStream" in window;

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "Unknown error";

const sanitizeFilename = (value: string): string =>
  Array.from(value, (char) => {
    const code = char.charCodeAt(0);
    const isControlChar = code >= 0 && code <= 31;
    const isInvalidFilenameChar = '<>:"/\\|?*'.includes(char);
    return isControlChar || isInvalidFilenameChar ? "_" : char;
  }).join("");

export const handleCalendarExport = (eventDetails: EventDetails | null) => {
  if (!eventDetails || !eventDetails.date_start) {
    showError("No valid event details are available to export.");
    return false;
  }

  try {
    const icsContent = generateIcs(eventDetails);
    const sanitizedTitle = sanitizeFilename(eventDetails.title || "event");

    // 1. Detect OS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isMac = userAgent.includes("macintosh");
    const isIOS = /ipad|iphone|ipod/.test(userAgent) && !isLegacyIosBrowser();
    const isAppleDevice = isMac || isIOS;

    // 2. Apple Logic (Direct Import via programmatic click)
    if (isAppleDevice) {
      const dataUrl = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;
      const a = document.createElement("a");
      a.href = dataUrl;
      a.setAttribute("download", `${sanitizedTitle}.ics`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Calendar file prepared. If Calendar does not open automatically, open the downloaded file manually.");
      return true;
    }

    // 3. Windows/Android Logic (Download)
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.setAttribute("download", `${sanitizedTitle}.ics`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Calendar file downloaded.");
    return true;
  } catch (error: unknown) {
    showError(`Failed to export calendar file: ${getErrorMessage(error)}`);
    return false;
  }
};
