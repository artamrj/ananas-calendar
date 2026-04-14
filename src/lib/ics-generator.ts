export interface EventDetails {
  title: string;
  description?: string;
  link?: string;
  location?: string;
  date_start: string; // YYYY-MM-DD
  date_end?: string; // YYYY-MM-DD
  time_start?: string; // HH:MM
  time_end?: string; // HH:MM
  recurrence_rule?: string; // e.g., "FREQ=DAILY;COUNT=10"
}

// Utility for zero-padding numbers
const pad = (num: number) => num.toString().padStart(2, '0');

// Format date/time for ICS
const formatDateTime = (date: string, time?: string, allDay = false): string => {
  const [year, month, day] = date.split('-').map(Number);

  if (time) {
    const [hours, minutes] = time.split(':').map(Number);
    const dt = new Date(year, month - 1, day, hours, minutes);
    return `${dt.getFullYear()}${pad(dt.getMonth() + 1)}${pad(dt.getDate())}T${pad(dt.getHours())}${pad(dt.getMinutes())}${pad(dt.getSeconds())}`;
  }

  // All-day event
  const dt = allDay ? new Date(Date.UTC(year, month - 1, day)) : new Date(year, month - 1, day);
  return dt.toISOString().split('T')[0].replace(/-/g, '');
};

// Generate ICS string
export const generateIcs = (event: EventDetails): string => {
  const uid = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}@ananas.app`;
  const dtStamp = new Date().toISOString().replace(/[-:]|\.\d{3}/g, '').slice(0, -1) + 'Z';

  const isTimed = Boolean(event.time_start);
  const dtStart = formatDateTime(event.date_start, event.time_start, !isTimed);

  // Calculate DTEND
  let dtEnd: string;
  const dtEndProp = `DTEND${isTimed ? '' : ';VALUE=DATE'}`;

  if (isTimed) {
    let endDate = event.date_end || event.date_start;
    let endTime = event.time_end;

    if (!endTime) {
      const [y, m, d] = event.date_start.split('-').map(Number);
      const [h, min] = event.time_start!.split(':').map(Number);
      const endDt = new Date(y, m - 1, d, h, min);
      endDt.setHours(endDt.getHours() + 1); // default 1-hour duration
      endDate = `${endDt.getFullYear()}-${pad(endDt.getMonth() + 1)}-${pad(endDt.getDate())}`;
      endTime = `${pad(endDt.getHours())}:${pad(endDt.getMinutes())}`;
    }

    dtEnd = formatDateTime(endDate, endTime);
  } else {
    if (event.date_end) {
      dtEnd = formatDateTime(event.date_end);
    } else {
      const [y, m, d] = event.date_start.split('-').map(Number);
      const nextDay = new Date(Date.UTC(y, m - 1, d + 1));
      dtEnd = nextDay.toISOString().split('T')[0].replace(/-/g, '');
    }
  }

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Ananas App//NONSGML v1.0//EN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART${isTimed ? '' : ';VALUE=DATE'}:${dtStart}`,
    `${dtEndProp}:${dtEnd}`,
    `SUMMARY:${event.title || 'Untitled Event'}`,
  ];

  if (event.description) icsLines.push(`DESCRIPTION:${event.description}`);
  if (event.location) icsLines.push(`LOCATION:${event.location}`);
  if (event.link) icsLines.push(`URL:${event.link}`);
  if (event.recurrence_rule) icsLines.push(`RRULE:${event.recurrence_rule}`);

  icsLines.push('END:VEVENT', 'END:VCALENDAR');

  return icsLines.join('\n');
};
