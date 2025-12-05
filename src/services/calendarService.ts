import { generateIcs, EventDetails } from "@/lib/ics-generator";
import { toast } from "sonner";
import { showError } from "@/utils/toast";

export const handleCalendarExport = (eventDetails: EventDetails | null) => {
  if (!eventDetails || !eventDetails.date_start) {
    showError("No valid event details to add to calendar.");
    return;
  }

  try {
    const icsContent = generateIcs(eventDetails);
    const sanitizedTitle = (eventDetails.title || "Event")
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
      .substring(0, 100); // Limit filename length

    // Detect platform
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(ua);
    const isMac = /macintosh/.test(ua) && "ontouchend" in document === false; // Real Mac (not iPad pretending to be Mac)
    const isAppleDevice = isIOS || isMac;

    if (isAppleDevice) {
      // METHOD 1: webcal:// + base64 data URI → Opens directly in Calendar.app (best method 2025)
      try {
        const encoder = new TextEncoder();
        const uint8Array = encoder.encode(icsContent);
        const base64 = btoa(String.fromCharCode(...uint8Array));
        const webcalUrl = `webcal://data:text/calendar;base64,${base64}`;

        window.location.href = webcalUrl;
        toast.success("Opening in Calendar…");
        return;
      } catch (err) {
        console.warn("webcal base64 method failed, falling back...", err);
      }

      // METHOD 2: Fallback using hidden <a> download + click (still triggers Calendar on iOS/macOS)
      try {
        const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `${sanitizedTitle}.ics`;
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success("Opening in Calendar… (or check Downloads)");
        return;
      } catch (err) {
        console.warn("Blob download fallback failed", err);
      }
    }

    // NON-APPLE DEVICES: Standard download
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${sanitizedTitle}.ics`;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Event downloaded! Open with your calendar app");
  } catch (error: any) {
    console.error("Calendar export failed:", error);
    showError(`Failed to export calendar: ${error.message || "Unknown error"}`);
  }
};