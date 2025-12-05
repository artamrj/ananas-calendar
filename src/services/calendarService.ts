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
      .substring(0, 100);

    // Detect platform (improved for iPadOS desktop mode)
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(ua) && !window.MSStream;
    const isMac = /macintosh/.test(ua) && !isIOS; // Exclude iPad pretending to be Mac
    const isAppleDevice = isIOS || isMac;
    const isSafari = /^((?!chrome|android).)*safari/i.test(ua);

    if (isAppleDevice && isSafari) {
      // METHOD 1: webcal:// + base64 (direct open in Calendar, no download)
      try {
        // Ensure UTF-8 base64 (handles special chars)
        const encoder = new TextEncoder();
        const uint8Array = encoder.encode(icsContent);
        const base64 = btoa(String.fromCharCode(...Array.from(uint8Array)));
        const webcalUrl = `webcal://data:text/calendar;base64,${base64}`;

        window.location.href = webcalUrl;
        toast.success("Opening in Calendar…");
        return;
      } catch (err) {
        console.warn("webcal failed, trying fallback...", err);
      }

      // METHOD 2: Fallback - Open raw .ics in new tab (Safari prompts import)
      try {
        const dataUrl = `data:text/plain;charset=utf-8,${encodeURIComponent(icsContent)}`;
        const newWindow = window.open(dataUrl, "_blank");
        if (newWindow) {
          toast.success("Check the new tab – import to Calendar there.");
          return;
        }
      } catch (err) {
        console.warn("New tab fallback failed", err);
      }
    }

    // METHOD 3: Download with octet-stream (forces Safari to download without MIME rejection)
    try {
      let blob: Blob;
      if (isSafari) {
        // Use octet-stream for Safari to avoid "cannot download" error
        blob = new Blob([icsContent], { type: "application/octet-stream;charset=utf-8" });
      } else {
        blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${sanitizedTitle}.ics`;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      const message = isAppleDevice ? "Check Downloads & open in Calendar" : "Event downloaded!";
      toast.success(message);
      return;
    } catch (err) {
      console.warn("Download failed, ultimate fallback...", err);
    }

    // ULTIMATE FALBACK: data: URI with plain text (user can copy-paste to .ics file)
    const dataUrl = `data:text/plain;charset=utf-8,${encodeURIComponent(icsContent)}`;
    window.location.href = dataUrl;
    toast.success("Raw event data loaded – save as .ics & import manually.");

  } catch (error: any) {
    console.error("Calendar export failed:", error);
    showError(`Failed to export: ${error.message || "Unknown error"}`);
  }
};