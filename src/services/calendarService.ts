import { generateIcs, EventDetails } from "@/lib/ics-generator";
import { toast } from "sonner";
import { showError } from "@/utils/toast";

export const handleCalendarExport = (eventDetails: EventDetails | null) => {
  if (!eventDetails || !eventDetails.date_start) {
    showError("No valid event details to add to calendar. 🗓️");
    return;
  }

  try {
    const icsContent = generateIcs(eventDetails);
    const sanitizedTitle = (eventDetails.title || "event").replace(/[<>:"/\\|?*\x00-\x1F]/g, '_');

    // 1. Detect OS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isMac = userAgent.includes("macintosh");
    const isIOS = /ipad|iphone|ipod/.test(userAgent) && !((window as any).MSStream);
    const isAppleDevice = isMac || isIOS;

    // 2. Apple Logic (Direct Import via programmatic click)
    if (isAppleDevice) {
      const dataUrl = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;
      const a = document.createElement("a");
      a.href = dataUrl;
      a.setAttribute("download", `${sanitizedTitle}.ics`); // Re-added download attribute
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Attempting to open in Calendar... (you may need to open the downloaded file) 🍍📆");
      return;
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

    toast.success("Event file downloaded! (please open it to add to calendar) 📥");
  } catch (error: any) {
    console.error(error);
    showError(`Failed to add event to calendar: ${error.message || "Unknown error"} 😭`);
  }
};