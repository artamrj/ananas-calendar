import { generateIcs, EventDetails } from "@/lib/ics-generator";
import { toast } from "sonner";
import { showError } from "@/utils/toast";

export const handleCalendarExport = async (eventDetails: EventDetails | null) => {
  if (!eventDetails || !eventDetails.date_start) {
    showError("No valid event details to add to calendar. 🗓️");
    return;
  }

  try {
    const icsContent = generateIcs(eventDetails);
    const sanitizedTitle = (eventDetails.title || "event").replace(/[<>:"/\\|?*\x00-\x1F]/g, '_');
    const fileName = `${sanitizedTitle}.ics`;

    // 1. Create a File Object (Preferred for iOS sharing)
    const file = new File([icsContent], fileName, { type: "text/calendar" });

    // 2. DETECT IPHONE / IPAD (iOS)
    // We use the Share API specifically for iOS to simulate "Direct Import"
    const isIOS = /ipad|iphone|ipod/.test(navigator.userAgent.toLowerCase());

    if (isIOS && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: eventDetails.title || "Event",
        });
        toast.success("Tap 'Add to Calendar' in the menu! 📅");
        return;
      } catch (err) {
        // If user cancels share, do nothing.
        if ((err as Error).name === 'AbortError') return;
      }
    }

    // 3. DESKTOP (Mac/Windows) & Android Fallback
    // 'webcal://' does not work for local blobs, so we must download the file.
    // Safari on Mac handles this gracefully.
    
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();

    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);

    const isMac = navigator.userAgent.toLowerCase().includes("mac");
    if (isMac) {
      toast.success("File downloaded. Click it to add to Calendar! 🍎");
    } else {
      toast.success("Event file downloaded! 📥");
    }

  } catch (error: any) {
    console.error(error);
    showError(`Failed to export: ${error.message || "Unknown error"}`);
  }
};