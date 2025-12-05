import { EventDetails } from "@/lib/ics-generator"; // Needed for OpenRouterCompletionResponse type if it were here, but it's not.
// Re-defining constants here to avoid circular dependencies or passing them around too much.
// Alternatively, these could be in a shared constants file if many services needed them.
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const FALLBACK_MODULE_NAME = "mistralai/mistral-7b-instruct:free";
const AI_TEMPERATURE = 0.2;

interface OpenRouterCompletionResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * Formats the current date and time in an unambiguous way for AI to use as context.
 * @param locale Optional: The user's locale (e.g., "en-US").
 * @param timeZone Optional: The user's time zone (e.g., "America/New_York").
 * @returns A string representing the current date, time, and time zone.
 */
export const getCurrentContext = (locale?: string, timeZone?: string): string => {
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
export const callOpenRouterApi = async (
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