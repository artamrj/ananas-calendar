export const summarizationPrompt = (description: string, maxLength: number): string => `Summarize the following event description to a maximum of ${maxLength} characters. Ensure the summary is concise and captures the main points. Return ONLY the summarized text.

Description:
"${description}"`;