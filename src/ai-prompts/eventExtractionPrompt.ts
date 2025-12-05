export const eventExtractionPrompt = (inputText: string, context: string): string => `
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