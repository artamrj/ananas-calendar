import type { EventDetails } from "@/types/event";

const browserLocale =
  typeof navigator !== "undefined" ? navigator.language : "en-US";

export const formatEventDate = (dateString?: string): string => {
  if (!dateString) {
    return "";
  }

  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return new Intl.DateTimeFormat(browserLocale, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

export const formatEventTime = (timeString?: string): string => {
  if (!timeString) {
    return "";
  }

  const [hours, minutes] = timeString.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  if (Number.isNaN(date.getTime())) {
    return timeString;
  }

  return new Intl.DateTimeFormat(browserLocale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};

export const getEventDateRangeLabel = (eventDetails: EventDetails): string => {
  const start = formatEventDate(eventDetails.date_start);
  const end = formatEventDate(eventDetails.date_end);

  if (!end || start === end) {
    return start;
  }

  return `${start} - ${end}`;
};

export const getEventTimeRangeLabel = (
  eventDetails: EventDetails,
): string | null => {
  const start = formatEventTime(eventDetails.time_start);
  const end = formatEventTime(eventDetails.time_end);

  if (!start) {
    return null;
  }

  if (!end || start === end) {
    return start;
  }

  return `${start} to ${end}`;
};
