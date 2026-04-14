import { eventExtractionPrompt } from "@/ai-prompts/eventExtractionPrompt";
import { summarizationPrompt } from "@/ai-prompts/summarizationPrompt";
import { callAi, resolveAiModel } from "@/services/aiClient";
import { getCurrentContext } from "./aiHelpers";
import {
  eventDetailsSchema,
  type ProcessTextResult,
} from "@/types/event";

const MAX_SUMMARY_LENGTH = 350;

export const processTextForEventExtraction = async (
  inputText: string,
  moduleName: string,
  locale?: string,
  timeZone?: string
): Promise<ProcessTextResult> => {
  if (!inputText.trim()) {
    throw new Error("Input text cannot be empty for event extraction.");
  }

  const context = getCurrentContext(locale, timeZone);
  const prompt = eventExtractionPrompt(inputText, context);
  const content = await callAi(prompt, resolveAiModel(moduleName), {
    type: "json_object",
  });

  try {
    const parsedJson = eventDetailsSchema.parse(JSON.parse(content));
    return {
      extractedJson: JSON.stringify(parsedJson, null, 2),
      eventDetails: parsedJson,
    };
  } catch (parseError) {
    const message =
      parseError instanceof Error ? parseError.message : "Unknown parse failure.";
    const error = new Error(`AI response was not valid event JSON. ${message}`) as Error & {
      cause?: unknown;
    };
    error.cause = parseError;
    throw error;
  }
};

export const summarizeEventDescription = async (
  description: string | undefined,
  moduleName: string,
): Promise<string | undefined> => {
  if (!description || description.length <= MAX_SUMMARY_LENGTH) {
    return description;
  }

  const prompt = summarizationPrompt(description, MAX_SUMMARY_LENGTH);

  try {
    const summarizedContent = await callAi(prompt, resolveAiModel(moduleName));

    return summarizedContent.length > MAX_SUMMARY_LENGTH
      ? `${summarizedContent.slice(0, MAX_SUMMARY_LENGTH)}...`
      : summarizedContent;
  } catch {
    return description;
  }
};
