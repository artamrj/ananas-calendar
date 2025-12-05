import { EventDetails } from "@/lib/ics-generator";
import { eventExtractionPrompt } from "@/ai-prompts/eventExtractionPrompt";
import { summarizationPrompt } from "@/ai-prompts/summarizationPrompt";

const FALLBACK_MODULE_NAME = "mistralai/mistral-7b-instruct:free";
const MAX_SUMMARY_LENGTH = 350;

export interface ProcessTextResult {
  extractedJson: string;
  eventDetails: EventDetails;
}

/** Format current date/time in an unambiguous way for AI */
const getCurrentContext = (locale?: string, timeZone?: string): string => {
  const userLocale =
    locale || (typeof navigator !== "undefined" ? navigator.language : "en-US");

  const userTimeZone =
    timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

  const now = new Date();

  const isoDate = now.toISOString().slice(0, 10);
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

/** Generic function to call OpenRouter API */
const callOpenRouterApi = async (
  promptContent: string,
  moduleName: string,
  openRouterApiKey: string,
  responseFormat?: { type: "json_object" }
): Promise<any> => {
  const effectiveModuleName = moduleName || import.meta.env.VITE_DEFAULT_AI_MODULE || FALLBACK_MODULE_NAME;

  const body: any = {
    model: effectiveModuleName,
    messages: [{ role: "user", content: promptContent }],
    temperature: 0.2,
  };

  if (responseFormat) {
    body.response_format = responseFormat;
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openRouterApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content;
};

/** Main service to process text with AI for event extraction */
export const processTextWithAI = async (
  inputText: string,
  moduleName: string,
  openRouterApiKey?: string,
  locale?: string,
  timeZone?: string
): Promise<ProcessTextResult> => {
  if (!inputText.trim()) throw new Error("Input text is empty.");
  if (!openRouterApiKey) throw new Error("OpenRouter API Key is missing.");

  const context = getCurrentContext(locale, timeZone);
  const prompt = eventExtractionPrompt(inputText, context);

  const content = await callOpenRouterApi(
    prompt,
    moduleName,
    openRouterApiKey,
    { type: "json_object" }
  );

  if (!content) throw new Error("Could not extract event details.");

  const parsedJson: EventDetails = JSON.parse(content);

  return {
    extractedJson: JSON.stringify(parsedJson, null, 2),
    eventDetails: parsedJson,
  };
};

/**
 * Summarizes an event description to a maximum of 350 characters using AI if it exceeds the limit.
 * @param description The original event description.
 * @param moduleName The AI module name to use for summarization.
 * @param openRouterApiKey The OpenRouter API key.
 * @returns A promise that resolves to the summarized or original description.
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

    if (!summarizedContent) {
      console.warn("AI summarization returned no content. Returning original description.");
      return description;
    }

    // Ensure the summarized content doesn't exceed the maximum length, even if AI tries to go over.
    return summarizedContent.length > MAX_SUMMARY_LENGTH ? summarizedContent.substring(0, MAX_SUMMARY_LENGTH) + "..." : summarizedContent;

  } catch (error) {
    console.error("Error during AI summarization:", error);
    return description; // Fallback to original description on network/parsing error
  }
};