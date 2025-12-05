import { useState, useCallback } from "react";
import { toast } from "sonner";
import { processTextForEventExtraction, summarizeEventDescription } from "@/services/aiService";
import { EventDetails } from "@/lib/ics-generator";

interface UseEventProcessorReturn {
  isLoading: boolean;
  extractedJson: string | null;
  eventDetails: EventDetails | null;
  processText: (text: string, defaultModuleName: string, apiKey: string, overrideModuleName?: string) => Promise<void>;
  setExtractedJson: React.Dispatch<React.SetStateAction<string | null>>;
  setEventDetails: React.Dispatch<React.SetStateAction<EventDetails | null>>;
  clearEventDetails: () => void;
}

export const useEventProcessor = (): UseEventProcessorReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [extractedJson, setExtractedJson] = useState<string | null>(null);
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);

  const clearEventDetails = useCallback(() => {
    setExtractedJson(null);
    setEventDetails(null);
  }, []);

  const processText = useCallback(async (text: string, defaultModuleName: string, apiKey: string, overrideModuleName?: string) => {
    setIsLoading(true);
    const moduleToUse = overrideModuleName || defaultModuleName;

    const apiCallPromise = processTextForEventExtraction(text, moduleToUse, apiKey)
      .then(async (result) => {
        let finalEventDetails = result.eventDetails;

        if (finalEventDetails.description && finalEventDetails.description.length > 250) {
          const summarizedDescription = await summarizeEventDescription(
            finalEventDetails.description,
            moduleToUse, // Use the same module for summarization
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