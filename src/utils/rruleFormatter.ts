export const formatRrule = (rrule: string | undefined): string | undefined => {
  if (!rrule) {
    return undefined;
  }

  // Strip "RRULE:" prefix if present
  const cleanRrule = rrule.startsWith('RRULE:') ? rrule.substring(6) : rrule;

  const parts = cleanRrule.split(';').reduce((acc, part) => {
    const [key, value] = part.split('=');
    if (key && value) {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, string>);

  const freq = parts['FREQ'];
  const byday = parts['BYDAY'];
  const count = parts['COUNT'];
  const until = parts['UNTIL'];

  let humanReadable = '';

  switch (freq) {
    case 'DAILY':
      humanReadable = 'Daily';
      break;
    case 'WEEKLY':
      if (byday) {
        const days = byday.split(',').map(day => {
          switch (day) {
            case 'SU': return 'Sunday';
            case 'MO': return 'Monday';
            case 'TU': return 'Tuesday';
            case 'WE': return 'Wednesday';
            case 'TH': return 'Thursday';
            case 'FR': return 'Friday';
            case 'SA': return 'Saturday';
            default: return day;
          }
        });
        humanReadable = `Every ${days.join(', ')}`;
      } else {
        humanReadable = 'Weekly';
      }
      break;
    case 'MONTHLY':
      humanReadable = 'Monthly';
      break;
    case 'YEARLY':
      humanReadable = 'Yearly';
      break;
    default:
      // If frequency is not recognized, return the cleaned rule,
      // as it might be a valid but unhandled RRULE part.
      return cleanRrule;
  }

  if (count) {
    humanReadable += ` for ${count} occurrences`;
  } else if (until) {
    try {
      // UNTIL format is YYYYMMDD or YYYYMMDDTHHMMSSZ
      const datePart = until.substring(0, 8);
      const year = parseInt(datePart.substring(0, 4));
      const month = parseInt(datePart.substring(4, 6)) - 1; // Month is 0-indexed
      const day = parseInt(datePart.substring(6, 8));
      const untilDate = new Date(year, month, day);

      const formattedUntil = new Intl.DateTimeFormat(navigator.language, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(untilDate);
      humanReadable += ` until ${formattedUntil}`;
    } catch (e) {
      console.error("Error formatting UNTIL date:", until, e);
      // Fallback to showing the raw UNTIL if parsing fails
      humanReadable += ` until ${until}`;
    }
  }

  return humanReadable;
};