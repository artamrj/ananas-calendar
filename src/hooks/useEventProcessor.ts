import { useState, useCallback } from "react";
import { toast } from "sonner";
import { processTextForEventExtraction, summarizeEventDescription } from "@/services/aiService";
import { EventDetails } from "@/lib/ics-generator";

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "Unknown error";

interface UseEventProcessorReturn {
  isLoading: boolean;
  extractedJson: string | null;
  eventDetails: EventDetails | null;
  processText: (text: string, moduleName: string, apiKey: string) => Promise<void>;
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

  const processText = useCallback(async (text: string, moduleName: string, apiKey: string) => {
    setIsLoading(true);

    const apiCallPromise = processTextForEventExtraction(text, moduleName, apiKey)
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
      error: (err: unknown) => {
        console.error("Error processing text:", err);
        return `Failed to process text: ${getErrorMessage(err)} 💔`;
      },
      finally: () => {
        setIsLoading(false);
      }
    });
  }, []);

  return { isLoading, extractedJson, eventDetails, processText, setExtractedJson, setEventDetails, clearEventDetails };
};
