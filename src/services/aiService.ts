import { EventDetails } from "@/lib/ics-generator";

const FALLBACK_MODULE_NAME = "mistralai/mistral-7b-instruct:free"; // Fallback if env var is not set

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

  // Use ISO-like date and month name
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

/** Build AI prompt */
const buildPrompt = (inputText: string, context: string): string => `
You are an expert AI assistant that extracts structured event information from unstructured text with perfect consistency.

Instructions:
1. Detect the language of the input text and return the JSON in the same language.
2. Use the provided "Current Date" context when interpreting dates. The date is provided in unambiguous format: Year, Month Name, Day number, and YYYY-MM-DD.
3. All extracted event information must be accurate, consistent, and in proper format.
4. Populate all JSON fields. If a field is not mentioned, leave it as an empty string.
5. The "title" must be concise, specific, and summarize the event.
6. Dates must be in YYYY-MM-DD format. Times must be in HH:MM (24-hour) format.
7. If an event is recurring:
   - Determine the next valid occurrence relative to the current date.
   - Use RRULE format with FREQ, BYDAY, and UNTIL if a duration is specified (do not rely on COUNT unless duration is explicitly given in number of occurrences).
   - The start date must never be earlier than the current date.
   - If no specific weekday is mentioned, use the current date as the start date.
8. Ensure the "date_end" matches the duration of the event if given. If duration is missing, set it equal to "date_start".
9. Ensure time consistency: "time_end" can be empty if not specified.
10. Return ONLY the JSON object with this exact structure:

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

Input Text:
"${inputText}"
`;

/** Main service to process text with AI */
export const processTextWithAI = async (
  inputText: string,
  userLocation: string = "",
  moduleName: string, // moduleName is now always passed from useAppSettings
  openRouterApiKey?: string,
  locale?: string,
  timeZone?: string
): Promise<ProcessTextResult> => {
  if (!inputText.trim()) throw new Error("Input text is empty.");
  if (!openRouterApiKey) throw new Error("OpenRouter API Key is missing.");

  const effectiveModuleName = moduleName || import.meta.env.VITE_DEFAULT_AI_MODULE || FALLBACK_MODULE_NAME;

  const context = getCurrentContext(locale, timeZone);
  const prompt = buildPrompt(inputText, context);

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openRouterApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: effectiveModuleName,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;

  if (!content) throw new Error("Could not extract event details.");

  const parsedJson: EventDetails = JSON.parse(content);

  return {
    extractedJson: JSON.stringify(parsedJson, null, 2),
    eventDetails: parsedJson,
  };
};