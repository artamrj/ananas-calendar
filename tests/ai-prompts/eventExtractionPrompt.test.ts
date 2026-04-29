import { describe, expect, it } from "vitest";
import { eventExtractionPrompt } from "@/ai-prompts/eventExtractionPrompt";

describe("eventExtractionPrompt", () => {
  it("embeds the input text and context in the generated prompt", () => {
    const prompt = eventExtractionPrompt(
      "team meeting tomorrow at 3pm",
      "Current Date: 2026-04-14.",
    );

    expect(prompt).toContain("team meeting tomorrow at 3pm");
    expect(prompt).toContain("Current Date: 2026-04-14.");
  });

  it("includes all required JSON field names in the schema example", () => {
    const prompt = eventExtractionPrompt("", "");

    expect(prompt).toContain('"title"');
    expect(prompt).toContain('"description"');
    expect(prompt).toContain('"link"');
    expect(prompt).toContain('"location"');
    expect(prompt).toContain('"date_start"');
    expect(prompt).toContain('"date_end"');
    expect(prompt).toContain('"time_start"');
    expect(prompt).toContain('"time_end"');
    expect(prompt).toContain('"recurrence_rule"');
  });

  it("instructs the model to detect language and return JSON in that language", () => {
    const prompt = eventExtractionPrompt("réunion demain", "");

    expect(prompt).toContain("Detect the language");
    expect(prompt).toContain("réunion demain");
  });
});
