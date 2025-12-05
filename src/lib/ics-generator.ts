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

const formatDateTime = (date: string, time?: string): string => {
  const [year, month, day] = date.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day)); // Use UTC to avoid timezone issues

  if (time) {
    const [hours, minutes] = time.split(':').map(Number);
    d.setUTCHours(hours, minutes, 0, 0);
    return d.toISOString().replace(/[-:]|\.\d{3}/g, '').slice(0, -1) + 'Z'; // YYYYMMDDTHHMMSSZ
  }
  return d.toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD for all-day events
};

export const generateIcs = (event: EventDetails): string => {
  const uid = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}@ananas.app`;
  const now = new Date().toISOString().replace(/[-:]|\.\d{3}/g, '').slice(0, -1) + 'Z';

  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Ananas App//NONSGML v1.0//EN',
    `UID:${uid}`,
    'BEGIN:VEVENT',
    `DTSTAMP:${now}`,
  ];

  const dtStart = formatDateTime(event.date_start, event.time_start);
  icsContent.push(`DTSTART${event.time_start ? '' : ';VALUE=DATE'}:${dtStart}`);

  let dtEnd: string;
  let dtEndProperty = 'DTEND';

  if (event.time_start) { // If DTSTART has a time, DTEND must also have a time
    const endTime = event.time_end || event.time_start; // Fallback to start time if end time is missing
    dtEnd = formatDateTime(event.date_end || event.date_start, endTime);
  } else { // If DTSTART is an all-day event
    dtEndProperty += ';VALUE=DATE';
    if (event.date_end) {
      dtEnd = formatDateTime(event.date_end);
    } else {
      // For all-day events without an explicit end date, ICS requires DTEND to be the next day
      const [year, month, day] = event.date_start.split('-').map(Number);
      const nextDay = new Date(Date.UTC(year, month - 1, day + 1));
      dtEnd = nextDay.toISOString().split('T')[0].replace(/-/g, '');
    }
  }
  icsContent.push(`${dtEndProperty}:${dtEnd}`);

  // Ensure SUMMARY is always present, with a fallback title
  icsContent.push(`SUMMARY:${event.title || 'Untitled Event'}`);
  
  if (event.description) {
    icsContent.push(`DESCRIPTION:${event.description}`);
  }
  if (event.location) {
    icsContent.push(`LOCATION:${event.location}`);
  }
  if (event.link) {
    icsContent.push(`URL:${event.link}`);
  }
  if (event.recurrence_rule) {
    icsContent.push(`RRULE:${event.recurrence_rule}`);
  }

  icsContent.push(
    'END:VEVENT',
    'END:VCALENDAR'
  );

  return icsContent.join('\n');
};