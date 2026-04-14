import type { EventDetails } from "@/types/event";
import { sanitizeRrule } from "@/lib/security";

const pad = (num: number) => num.toString().padStart(2, "0");

const formatDateTime = (date: string, time?: string, allDay = false): string => {
  const [year, month, day] = date.split("-").map(Number);

  if (time) {
    const [hours, minutes] = time.split(":").map(Number);
    const dt = new Date(year, month - 1, day, hours, minutes);
    return `${dt.getFullYear()}${pad(dt.getMonth() + 1)}${pad(dt.getDate())}T${pad(dt.getHours())}${pad(dt.getMinutes())}${pad(dt.getSeconds())}`;
  }

  const dt = allDay ? new Date(Date.UTC(year, month - 1, day)) : new Date(year, month - 1, day);
  return dt.toISOString().split("T")[0].replace(/-/g, "");
};

const escapeIcsText = (value: string): string =>
  value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");

export const generateIcs = (event: EventDetails): string => {
  const uid = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}@ananas.app`;
  const dtStamp =
    new Date().toISOString().replace(/[-:]|\.\d{3}/g, "").slice(0, -1) + "Z";

  const isTimed = Boolean(event.time_start);
  const dtStart = formatDateTime(event.date_start, event.time_start, !isTimed);

  let dtEnd: string;
  const dtEndProp = `DTEND${isTimed ? "" : ";VALUE=DATE"}`;

  if (isTimed) {
    let endDate = event.date_end || event.date_start;
    let endTime = event.time_end;

    if (!endTime) {
      const [y, m, d] = event.date_start.split("-").map(Number);
      const [h, min] = event.time_start!.split(":").map(Number);
      const endDt = new Date(y, m - 1, d, h, min);
      endDt.setHours(endDt.getHours() + 1);
      endDate = `${endDt.getFullYear()}-${pad(endDt.getMonth() + 1)}-${pad(endDt.getDate())}`;
      endTime = `${pad(endDt.getHours())}:${pad(endDt.getMinutes())}`;
    }

    dtEnd = formatDateTime(endDate, endTime);
  } else {
    if (event.date_end) {
      dtEnd = formatDateTime(event.date_end);
    } else {
      const [y, m, d] = event.date_start.split("-").map(Number);
      const nextDay = new Date(Date.UTC(y, m - 1, d + 1));
      dtEnd = nextDay.toISOString().split("T")[0].replace(/-/g, "");
    }
  }

  const safeRrule = event.recurrence_rule
    ? sanitizeRrule(event.recurrence_rule)
    : undefined;

  const icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Ananas App//NONSGML v1.0//EN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART${isTimed ? "" : ";VALUE=DATE"}:${dtStart}`,
    `${dtEndProp}:${dtEnd}`,
    `SUMMARY:${escapeIcsText(event.title || "Untitled Event")}`,
  ];

  if (event.description) icsLines.push(`DESCRIPTION:${escapeIcsText(event.description)}`);
  if (event.location) icsLines.push(`LOCATION:${escapeIcsText(event.location)}`);
  if (event.link) icsLines.push(`URL:${escapeIcsText(event.link)}`);
  if (safeRrule) icsLines.push(`RRULE:${safeRrule}`);

  icsLines.push("END:VEVENT", "END:VCALENDAR");

  return icsLines.join("\r\n");
};
