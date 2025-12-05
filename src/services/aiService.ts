import { EventDetails } from "@/lib/ics-generator";
import { eventExtractionPrompt } from "@/ai-prompts/eventExtractionPrompt";
import { summarizationPrompt } from "@/ai-prompts/summarizationPrompt";
import { getCurrentContext, callOpenRouterApi } from "./aiHelpers"; // Import helpers

// --- Constants ---
const MAX_SUMMARY_LENGTH = 350;

// --- Interfaces ---
export interface ProcessTextResult {
  extractedJson: string;
  eventDetails: EventDetails;
}

// --- Exported Service Functions ---

/**
 * Processes input text with AI to extract structured event details.
 * @param inputText The unstructured text containing event information.
 * @param moduleName The AI module name to use for extraction.
 * @param openRouterApiKey The OpenRouter API key.
 * @param locale Optional: user's locale for context.
 * @param timeZone Optional: user's time zone for context.
 * @returns A promise that resolves to an object containing the raw JSON string and parsed EventDetails.
 * @throws Error if input is empty, API key is missing, or extraction fails.
 */
export const processTextForEventExtraction = async (
  inputText: string,
  moduleName: string,
  openRouterApiKey?: string,
  locale?: string,
  timeZone?: string
): Promise<ProcessTextResult> => {
  if (!inputText.trim()) {
    throw new Error("Input text cannot be empty for event extraction.");
  }
  if (!openRouterApiKey) {
    throw new Error("OpenRouter API Key is missing for event extraction.");
  }

  const context = getCurrentContext(locale, timeZone);
  const prompt = eventExtractionPrompt(inputText, context);

  const content = await callOpenRouterApi(
    prompt,
    moduleName,
    openRouterApiKey,
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
    throw new Error("AI response was not valid JSON for event details.");
  }
};

/**
 * Summarizes an event description using AI if it exceeds a predefined maximum length.
 * @param description The original event description.
 * @param moduleName The AI module name to use for summarization.
 * @param openRouterApiKey The OpenRouter API key.
 * @returns A promise that resolves to the summarized description, or the original if no summarization was needed/possible.
 */
export const summarizeEventDescription = async (
  description: string | undefined,
  moduleName: string,
  openRouterApiKey?: string,
): Promise<string | undefined> => {
  if (!description || description.length <= MAX_SUMMARY_LENGTH) {
    return description;
  }

  if (!openRouterApiKey) {
    console.warn("OpenRouter API Key is missing for summarization. Returning original description.");
    return description;
  }

  const prompt = summarizationPrompt(description, MAX_SUMMARY_LENGTH);

  try {
    const summarizedContent = await callOpenRouterApi(
      prompt,
      moduleName,
      openRouterApiKey
    );

    // Ensure the summarized content doesn't exceed the maximum length, even if AI tries to go over.
    return summarizedContent.length > MAX_SUMMARY_LENGTH ? summarizedContent.substring(0, MAX_SUMMARY_LENGTH) + "..." : summarizedContent;

  } catch (error) {
    console.error("Error during AI summarization:", error);
    return description; // Fallback to original description on network/parsing error
  }
};