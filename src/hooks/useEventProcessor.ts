import { useState, useCallback } from "react";
import { toast } from "sonner";
import { processTextWithAI } from "@/services/aiService";
import { summarizeEventDescription } from "@/services/summarizationService";
import { EventDetails } from "@/lib/ics-generator";

interface UseEventProcessorReturn {
  isLoading: boolean;
  extractedJson: string | null;
  eventDetails: EventDetails | null;
  processText: (text: string, moduleName: string, apiKey: string) => Promise<void>;
  setExtractedJson: React.Dispatch<React.SetStateAction<string | null>>;
  setEventDetails: React.Dispatch<React.SetStateAction<EventDetails | null>>;
  clearEventDetails: () => void; // New function to clear event details
}

export const useEventProcessor = (): UseEventProcessorReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [extractedJson, setExtractedJson] = useState<string | null>(null);
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);

  // New function to explicitly clear the event details state
  const clearEventDetails = useCallback(() => {
    setExtractedJson(null);
    setEventDetails(null);
  }, []);

  const processText = useCallback(async (text: string, moduleName: string, apiKey: string) => {
    setIsLoading(true);
    // IMPORTANT: Do NOT clear extractedJson and eventDetails here.
    // They should only be cleared when starting a *new* event from scratch
    // via clearEventDetails. For regeneration, we want to keep the old data
    // visible until new data arrives.

    const apiCallPromise = processTextWithAI(text, "", moduleName, apiKey)
      .then(async (result) => {
        let finalEventDetails = result.eventDetails;

        if (finalEventDetails.description && finalEventDetails.description.length > 250) {
          const summarizedDescription = await summarizeEventDescription(
            finalEventDetails.description,
            moduleName,
            apiKey
          );
          finalEventDetails = {
            ...finalEventDetails,
            description: summarizedDescription,
          };
        }

        setExtractedJson(JSON.stringify(finalEventDetails, null, 2));
        setEventDetails(finalEventDetails);
        return "Event details extracted and summarized! ✨";
      });

    toast.promise(apiCallPromise, {
      loading: "Ananas is thinking... 🍍✨",
      success: (message) => message,
      error: (err: any) => {
        console.error("Error processing text:", err);
        return `Failed to process text: ${err.message || "Unknown error"} 💔`;
      },
      finally: () => {
        setIsLoading(false);
      }
    });
  }, []);

  return { isLoading, extractedJson, eventDetails, processText, setExtractedJson, setEventDetails, clearEventDetails };
};