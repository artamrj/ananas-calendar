import { EventDetails } from "@/lib/ics-generator";
import { eventExtractionPrompt } from "@/ai-prompts/eventExtractionPrompt";
import { summarizationPrompt } from "@/ai-prompts/summarizationPrompt";
import { getCurrentContext, callMistralApi } from "./aiHelpers";

// --- Constants ---
const MAX_SUMMARY_LENGTH = 350;

// --- Interfaces ---
export interface ProcessTextResult {
  extractedJson: string;
  eventDetails: EventDetails;
}

/**
 * Processes input text with AI to extract structured event details.
 */
export const processTextForEventExtraction = async (
  inputText: string,
  moduleName: string,
  mistralApiKey?: string,
  locale?: string,
  timeZone?: string
): Promise<ProcessTextResult> => {
  if (!inputText.trim()) {
    throw new Error("Input text cannot be empty for event extraction.");
  }
  if (!mistralApiKey) {
    throw new Error("Mistral API Key is missing for event extraction.");
  }

  const context = getCurrentContext(locale, timeZone);
  const prompt = eventExtractionPrompt(inputText, context);

  const content = await callMistralApi(
    prompt,
    moduleName,
    mistralApiKey,
    { type: "json_object" }
  );

  try {
    const parsedJson: EventDetails = JSON.parse(content);
    return {
      extractedJson: JSON.stringify(parsedJson, null, 2),
      eventDetails: parsedJson,
    };
  } catch (parseError) {
    console.error("Failed to parse AI response as JSON:", content, parseError);
    throw new Error("AI response was not valid JSON for event details.", {
      cause: parseError,
    });
  }
};

/**
 * Summarizes an event description using AI if it exceeds a predefined maximum length.
 */
export const summarizeEventDescription = async (
  description: string | undefined,
  moduleName: string,
  mistralApiKey?: string,
): Promise<string | undefined> => {
  if (!description || description.length <= MAX_SUMMARY_LENGTH) {
    return description;
  }

  if (!mistralApiKey) {
    console.warn("Mistral API Key is missing for summarization. Returning original description.");
    return description;
  }

  const prompt = summarizationPrompt(description, MAX_SUMMARY_LENGTH);

  try {
    const summarizedContent = await callMistralApi(
      prompt,
      moduleName,
      mistralApiKey
    );

    return summarizedContent.length > MAX_SUMMARY_LENGTH ? summarizedContent.substring(0, MAX_SUMMARY_LENGTH) + "..." : summarizedContent;

  } catch (error) {
    console.error("Error during AI summarization:", error);
    return description;
  }
};
