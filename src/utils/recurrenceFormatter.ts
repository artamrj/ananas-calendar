export const formatRecurrenceRule = (rrule: string | undefined): string => {
  if (!rrule) {
    return "";
  }

  const parts = rrule.split(';').reduce((acc, part) => {
    const [key, value] = part.split('=');
    if (key && value) {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, string>);

  let humanReadable = "Repeats ";

  const freq = parts['FREQ'];
  const byday = parts['BYDAY'];
  const interval = parts['INTERVAL'];
  const count = parts['COUNT'];
  const until = parts['UNTIL'];

  switch (freq) {
    case 'DAILY':
      humanReadable += "daily";
      break;
    case 'WEEKLY':
      humanReadable += "weekly";
      if (byday) {
        const daysMap: Record<string, string> = {
          SU: "Sundays", MO: "Mondays", TU: "Tuesdays", WE: "Wednesdays",
          TH: "Thursdays", FR: "Fridays", SA: "Saturdays"
        };
        const formattedDays = byday.split(',').map(day => daysMap[day] || day).join(', ');
        humanReadable += ` on ${formattedDays}`;
      }
      break;
    case 'MONTHLY':
      humanReadable += "monthly";
      if (byday) {
        const dayOfMonth = byday.match(/(\d+)(SU|MO|TU|WE|TH|FR|SA)/);
        if (dayOfMonth) {
          const [, weekNum, dayAbbr] = dayOfMonth;
          const weekOrdinal = { "1": "first", "2": "second", "3": "third", "4": "fourth", "-1": "last" }[weekNum] || "";
          const dayName = { SU: "Sunday", MO: "Monday", TU: "Tuesday", WE: "Wednesday", TH: "Thursday", FR: "Friday", SA: "Saturday" }[dayAbbr] || "";
          humanReadable += ` on the ${weekOrdinal} ${dayName}`;
        }
      }
      break;
    case 'YEARLY':
      humanReadable += "yearly";
      break;
    default:
      return `Recurrence: ${rrule}`; // Fallback to raw if unknown frequency
  }

  if (interval && parseInt(interval) > 1) {
    humanReadable = humanReadable.replace('Repeats ', `Repeats every ${interval} `);
    if (freq === 'WEEKLY') humanReadable += "weeks";
    else if (freq === 'MONTHLY') humanReadable += "months";
    else if (freq === 'YEARLY') humanReadable += "years";
    else humanReadable += "days"; // Default for daily or unknown
  }

  if (count) {
    humanReadable += ` for ${count} times`;
  } else if (until) {
    try {
      const year = until.substring(0, 4);
      const month = until.substring(4, 6);
      const day = until.substring(6, 8);
      const date = new Date(`${year}-${month}-${day}`);
      humanReadable += ` until ${new Intl.DateTimeFormat(navigator.language, { year: 'numeric', month: 'long', day: 'numeric' }).format(date)}`;
    } catch (e) {
      console.error("Error parsing UNTIL date:", until, e);
    }
  }

  return humanReadable.trim() + ".";
};