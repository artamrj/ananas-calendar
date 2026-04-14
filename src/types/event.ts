import { z } from "zod";

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
  link: optionalText,
  location: optionalText,
  date_start: z.string().trim().min(1, "Missing start date."),
  date_end: optionalText,
  time_start: optionalText,
  time_end: optionalText,
  recurrence_rule: optionalText,
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

export interface LocalCalendarUser {
  id: string;
  name: string;
  createdAt: string;
}
