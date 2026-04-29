import { describe, expect, it } from "vitest";
import { summarizationPrompt } from "@/ai-prompts/summarizationPrompt";

describe("summarizationPrompt", () => {
  it("embeds the description text in the generated prompt", () => {
    const prompt = summarizationPrompt("A detailed event description.", 350);

    expect(prompt).toContain("A detailed event description.");
  });

  it("embeds the max length value in the generated prompt", () => {
    const prompt = summarizationPrompt("Some text.", 200);

    expect(prompt).toContain("200");
  });

  it("instructs the model to return only the summarized text", () => {
    const prompt = summarizationPrompt("Some text.", 350);

    expect(prompt).toContain("Return ONLY the summarized text");
  });
});
