import { useState, useCallback } from "react";
import { toast } from "sonner";
import { processTextWithAI } from "@/services/aiService"; // Your existing service
import { EventDetails } from "@/lib/ics-generator";

interface UseEventProcessorReturn {
  isLoading: boolean;
  extractedJson: string | null;
  eventDetails: EventDetails | null;
  processText: (text: string, moduleName: string, apiKey: string) => Promise<void>;
}

export const useEventProcessor = (): UseEventProcessorReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [extractedJson, setExtractedJson] = useState<string | null>(null);
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);

  const processText = useCallback(async (text: string, moduleName: string, apiKey: string) => {
    setIsLoading(true);
    setExtractedJson(null);
    setEventDetails(null);

    const apiCallPromise = processTextWithAI(text, "", moduleName, apiKey);

    toast.promise(apiCallPromise, {
      loading: "Ananas is thinking... 🍍✨",
      success: (result) => {
        setExtractedJson(result.extractedJson);
        setEventDetails(result.eventDetails);
        return "Event details extracted! ✨";
      },
      error: (err: any) => {
        console.error("Error processing text:", err);
        return `Failed to process text: ${err.message || "Unknown error"} 💔`;
      },
      finally: () => {
        setIsLoading(false);
      }
    });
  }, []);

  return { isLoading, extractedJson, eventDetails, processText };
};