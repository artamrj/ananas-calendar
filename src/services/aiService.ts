import { EventDetails } from "@/lib/ics-generator";

const DEFAULT_MODULE_NAME = "openai/gpt-oss-safeguard-20b";

interface ProcessTextResult {
  extractedJson: string;
  eventDetails: EventDetails;
}

export const processTextWithAI = async (
  inputText: string,
  moduleName: string,
  openRouterApiKey: string,
): Promise<ProcessTextResult> => {
  if (!inputText.trim()) {
    throw new Error("Please enter some text to process. 📝");
  }
  if (!openRouterApiKey) {
    throw new Error("OpenRouter API Key is not configured. 🔑");
  }

  const now = new Date();
  const todayDate = now.toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' });
  const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
  const currentTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  const contextString = `Current Date: ${todayDate}, Day of Week: ${dayOfWeek}, Current Time: ${currentTime}.`;

  const prompt = `You are an AI assistant specialized in extracting event details from unstructured text.
  ${contextString}
  Detect the language of the input text and return the JSON output in the same language.
  Extract the following event details into a JSON object. If a field is missing, leave its value as an empty string.
  The 'title' field should be a concise and specific summary of the event.
  Dates should be in YYYY-MM-DD format. Times should be in HH:MM (24-hour) format.
  Recurrence rule should be a valid iCalendar RRULE string.

  JSON Structure:
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

  Return ONLY the JSON object.

  Input Text:
  "${inputText}"`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openRouterApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: moduleName,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (content) {
    const parsedJson: EventDetails = JSON.parse(content);
    return {
      extractedJson: JSON.stringify(parsedJson, null, 2),
      eventDetails: parsedJson,
    };
  } else {
    throw new Error("Could not extract event details. 🧐");
  }
};