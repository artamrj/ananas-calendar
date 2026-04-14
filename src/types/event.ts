import { z } from "zod";
import { isSafeUrl, sanitizeRrule } from "@/lib/security";

const optionalText = z
  .string()
  .optional()
  .transform((value) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
  });

export const eventDetailsSchema = z.object({
  title: z.string().trim().default("Untitled Event"),
  description: optionalText,
  link: optionalText.refine((value) => value === undefined || isSafeUrl(value), {
    message: "Link must be a valid http(s) URL.",
  }),
  location: optionalText,
  date_start: z.string().trim().min(1, "Missing start date."),
  date_end: optionalText,
  time_start: optionalText,
  time_end: optionalText,
  recurrence_rule: optionalText.transform((value) => {
    if (!value) {
      return undefined;
    }

    const sanitized = sanitizeRrule(value);
    return sanitized || undefined;
  }),
});

export type EventDetails = z.infer<typeof eventDetailsSchema>;

export interface ProcessTextResult {
  extractedJson: string;
  eventDetails: EventDetails;
}

export type ProcessingStatus = "idle" | "processing" | "success" | "error";

export interface LocalCalendarRecord {
  id: string;
  sourceText: string;
  eventDetails: EventDetails;
  extractedJson: string;
  createdAt: string;
  updatedAt: string;
  lastExportedAt?: string;
  exportCount: number;
}
