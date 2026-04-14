import { useCallback, useState } from "react";
import { toast } from "sonner";
import { processTextForEventExtraction, summarizeEventDescription } from "@/services/aiService";
import type { EventDetails, ProcessTextResult, ProcessingStatus } from "@/types/event";

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "Unknown error";

interface UseEventProcessorReturn {
  status: ProcessingStatus;
  isLoading: boolean;
  errorMessage: string | null;
  extractedJson: string | null;
  eventDetails: EventDetails | null;
  processText: (text: string, moduleName: string) => Promise<ProcessTextResult>;
  clearEventDetails: () => void;
  loadStoredEvent: (payload: { eventDetails: EventDetails; extractedJson: string }) => void;
}

export const useEventProcessor = (): UseEventProcessorReturn => {
  const [status, setStatus] = useState<ProcessingStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [extractedJson, setExtractedJson] = useState<string | null>(null);
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);

  const clearEventDetails = useCallback(() => {
    setStatus("idle");
    setErrorMessage(null);
    setExtractedJson(null);
    setEventDetails(null);
  }, []);

  const loadStoredEvent = useCallback(
    ({ eventDetails: storedEventDetails, extractedJson: storedExtractedJson }: { eventDetails: EventDetails; extractedJson: string }) => {
      setStatus("success");
      setErrorMessage(null);
      setExtractedJson(storedExtractedJson);
      setEventDetails(storedEventDetails);
    },
    []
  );

  const processText = useCallback(async (text: string, moduleName: string) => {
    setStatus("processing");
    setErrorMessage(null);
    setExtractedJson(null);
    setEventDetails(null);

    const apiCallPromise = processTextForEventExtraction(text, moduleName)
      .then(async (result) => {
        let finalEventDetails = result.eventDetails;

        if (finalEventDetails.description && finalEventDetails.description.length > 250) {
          const summarizedDescription = await summarizeEventDescription(
            finalEventDetails.description,
            moduleName
          );
          finalEventDetails = {
            ...finalEventDetails,
            description: summarizedDescription,
          };
        }

        const nextExtractedJson = JSON.stringify(finalEventDetails, null, 2);

        setExtractedJson(nextExtractedJson);
        setEventDetails(finalEventDetails);
        setStatus("success");
        return {
          extractedJson: nextExtractedJson,
          eventDetails: finalEventDetails,
        };
      });

    toast.promise(apiCallPromise, {
      loading: "Extracting event details...",
      success: () => "Event details extracted successfully.",
      error: (err: unknown) => {
        const message = getErrorMessage(err);
        setStatus("error");
        setErrorMessage(message);
        return `Failed to process text: ${message}`;
      },
    });

    return apiCallPromise;
  }, []);

  return {
    status,
    isLoading: status === "processing",
    errorMessage,
    extractedJson,
    eventDetails,
    processText,
    clearEventDetails,
    loadStoredEvent,
  };
};
