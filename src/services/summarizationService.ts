import { EventDetails } from "@/lib/ics-generator";

const DEFAULT_MODULE_NAME = "mistralai/mistral-7b-instruct:free";

/**
 * Summarizes an event description to a maximum of 350 characters using AI if it exceeds the limit.
 * @param description The original event description.
 * @param moduleName The AI module name to use for summarization.
 * @param openRouterApiKey The OpenRouter API key.
 * @returns A promise that resolves to the summarized or original description.
 */
export const summarizeEventDescription = async (
  description: string | undefined,
  moduleName: string = DEFAULT_MODULE_NAME,
  openRouterApiKey?: string,
): Promise<string | undefined> => {
  const MAX_SUMMARY_LENGTH = 350; // Changed from 250 to 350

  if (!description || description.length <= MAX_SUMMARY_LENGTH) {
    return description;
  }

  if (!openRouterApiKey) {
    console.warn("OpenRouter API Key is missing for summarization. Returning original description.");
    return description;
  }

  const prompt = `Summarize the following event description to a maximum of ${MAX_SUMMARY_LENGTH} characters. Ensure the summary is concise and captures the main points. Return ONLY the summarized text.

Description:
"${description}"`;

  try {
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
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("AI summarization API error:", errorData.message || response.statusText);
      return description; // Fallback to original description on API error
    }

    const data = await response.json();
    const summarizedContent = data?.choices?.[0]?.message?.content;

    if (!summarizedContent) {
      console.warn("AI summarization returned no content. Returning original description.");
      return description; // Fallback to original description if AI fails to return content
    }

    // Ensure the summarized content doesn't exceed the maximum length, even if AI tries to go over.
    return summarizedContent.length > MAX_SUMMARY_LENGTH ? summarizedContent.substring(0, MAX_SUMMARY_LENGTH) + "..." : summarizedContent;

  } catch (error) {
    console.error("Error during AI summarization:", error);
    return description; // Fallback to original description on network/parsing error
  }
};