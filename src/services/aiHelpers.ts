"use client";

const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";
const FALLBACK_MODULE_NAME = "mistral-large-latest";
const AI_TEMPERATURE = 0.2;

interface MistralCompletionResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * Formats the current date and time in an unambiguous way for AI to use as context.
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
 * Generic function to call the Mistral API for chat completions.
 */
export const callMistralApi = async (
  promptContent: string,
  moduleName: string,
  mistralApiKey: string,
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

  const response = await fetch(MISTRAL_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${mistralApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Mistral API error: ${response.statusText}`);
  }

  const data: MistralCompletionResponse = await response.json();
  const content = data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Mistral API returned no content.");
  }
  return content;
};