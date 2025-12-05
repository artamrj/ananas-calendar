import { EventDetails } from "@/lib/ics-generator";

const DEFAULT_MODULE_NAME = "openai/gpt-oss-safeguard-20b";

export interface ProcessTextResult {
  extractedJson: string;
  eventDetails: EventDetails;
}

/** Format current date/time using user's locale and timezone */
const getCurrentContext = (locale?: string, timeZone?: string): string => {
  const userLocale =
    locale || (typeof navigator !== "undefined" ? navigator.language : "en-US");
  const userTimeZone =
    timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const now = new Date();

  const todayDate = now.toLocaleDateString(userLocale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: userTimeZone,
  });

  const dayOfWeek = now.toLocaleDateString(userLocale, {
    weekday: "long",
    timeZone: userTimeZone,
  });

  const currentTime = now.toLocaleTimeString(userLocale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: userTimeZone,
  });

  return `Current Date: ${todayDate}, Day of Week: ${dayOfWeek}, Current Time: ${currentTime}, Time Zone: ${userTimeZone}.`;
};

/** Build AI prompt */
const buildPrompt = (
  inputText: string,
  context: string,
  location?: string
): string => `
You are an AI assistant designed to extract structured event information from unstructured text with high precision and consistency.

Your tasks:
1. Identify the language of the input text and produce the final JSON in that same language.
2. Interpret all provided context and use it to enhance the accuracy of extracted fields.
3. If a location parameter is provided, treat it as authoritative for the event unless the input text clearly specifies a different one.
4. Extract all event-related details and populate the JSON fields exactly as defined. When information is missing, return an empty string for that field.
5. The "title" must be a short, specific summary that captures the essence of the event.
6. Normalize dates to YYYY-MM-DD format and times to HH:MM (24-hour) format.
7. The recurrence rule must follow the iCalendar RRULE specification.
8. If the text describes a recurring event but does not include a start date, determine the correct start date using the Current Date from the provided context:
   - If the text references a weekday relative to the current day, compute the upcoming occurrence of that weekday.
   - If no weekday or temporal reference is provided, default to the current date itself.

Required JSON output (return this object and nothing else):
{
  "title": "string",
  "description": "string",
  "link": "string",
  "location": "string",
  "date_start": "YYYY-MM-DD",
  "date_end": "YYYY-MM-DD",
  "time_start": "HH:MM",
  "time_end": "HH:MM",
  "recurrence_rule": "string"
}

Context:
${context}

${location ? `Event Location Override: ${location}` : ""}

Input Text:
"${inputText}"
`;

/** Main service to process text with AI */
export const processTextWithAI = async (
  inputText: string,
  userLocation: string = "", // Made optional with a default empty string
  moduleName: string = DEFAULT_MODULE_NAME,
  openRouterApiKey?: string,
  locale?: string,
  timeZone?: string
): Promise<ProcessTextResult> => {
  if (!inputText.trim()) throw new Error("Input text is empty. 📝");
  if (!openRouterApiKey) throw new Error("OpenRouter API Key is missing. 🔑");

  const context = getCurrentContext(locale, timeZone);
  const prompt = buildPrompt(inputText, context, userLocation);

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openRouterApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: moduleName,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        response_format: { type: "json_object" },
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;

  if (!content) throw new Error("Could not extract event details. 🧐");

  const parsedJson: EventDetails = JSON.parse(content);

  return {
    extractedJson: JSON.stringify(parsedJson, null, 2),
    eventDetails: parsedJson,
  };
};
