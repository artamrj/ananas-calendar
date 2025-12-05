import { EventDetails } from "@/lib/ics-generator";
import { eventExtractionPrompt } from "@/ai-prompts/eventExtractionPrompt";
import { summarizationPrompt } from "@/ai-prompts/summarizationPrompt";

// --- Constants ---
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const FALLBACK_MODULE_NAME = "mistralai/mistral-7b-instruct:free";
const MAX_SUMMARY_LENGTH = 350;
const AI_TEMPERATURE = 0.2; // Consistent temperature for AI calls

// --- Interfaces ---
export interface ProcessTextResult {
  extractedJson: string;
  eventDetails: EventDetails;
}

interface OpenRouterCompletionResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

// --- Helper Functions ---

/**
 * Formats the current date and time in an unambiguous way for AI to use as context.
 * @param locale Optional: The user's locale (e.g., "en-US").
 * @param timeZone Optional: The user's time zone (e.g., "America/New_York").
 * @returns A string representing the current date, time, and time zone.
 */
const getCurrentContext = (locale?: string, timeZone?: string): string => {
  const userLocale = locale || (typeof navigator !== "undefined" ? navigator.language : "en-US");
  const userTimeZone = timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const now = new Date();

  const isoDate = now.toISOString().slice(0, 10); // YYYY-MM-DD
  const dayOfMonth = now.getUTCDate().toString().padStart(2, "0");
  const monthNumber = (now.getUTCMonth() + 1).toString().padStart(2, "0");
  const monthName = now.toLocaleString("en-US", { month: "long", timeZone: userTimeZone });
  const year = now.getUTCFullYear();
  const dayOfWeek = now.toLocaleString("en-US", { weekday: "long", timeZone: userTimeZone });
  const currentTime = now.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: userTimeZone,
  });

  return `Current Date: ${year}-${monthNumber}-${dayOfMonth} (Year ${year}, Month ${monthName}, Day ${dayOfMonth}), Day of Week: ${dayOfWeek}, Current Time: ${currentTime}, Time Zone: ${userTimeZone}.`;
};

/**
 * Generic function to call the OpenRouter API for chat completions.
 * @param promptContent The content of the user's prompt.
 * @param moduleName The AI module name to use.
 * @param openRouterApiKey The API key for OpenRouter.
 * @param responseFormat Optional: specifies the desired response format (e.g., JSON object).
 * @returns A promise that resolves to the content of the AI's response message.
 * @throws Error if the API call fails or returns no content.
 */
const callOpenRouterApi = async (
  promptContent: string,
  moduleName: string,
  openRouterApiKey: string,
  responseFormat?: { type: "json_object" }
): Promise<string> => {
  const effectiveModuleName = moduleName || import.meta.env.VITE_DEFAULT_AI_MODULE || FALLBACK_MODULE_NAME;

  const body: any = {
    model: effectiveModuleName,
    messages: [{ role: "user", content: promptContent }],
    temperature: AI_TEMPERATURE,
  };

  if (responseFormat) {
    body.response_format = responseFormat;
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openRouterApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `OpenRouter API error: ${response.statusText}`);
  }

  const data: OpenRouterCompletionResponse = await response.json();
  const content = data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("OpenRouter API returned no content.");
  }
  return content;
};

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