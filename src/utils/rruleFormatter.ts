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

  switch (freq) {
    case 'DAILY':
      return count ? `Daily for ${count} occurrences` : until ? `Daily until ${formatUntil(until)}` : 'Daily';
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
        return count
          ? `Every ${days.join(', ')} for ${count} occurrences`
          : until
            ? `Every ${days.join(', ')} until ${formatUntil(until)}`
            : `Every ${days.join(', ')}`;
      } else {
        return count ? `Weekly for ${count} occurrences` : until ? `Weekly until ${formatUntil(until)}` : 'Weekly';
      }
    case 'MONTHLY':
      return count ? `Monthly for ${count} occurrences` : until ? `Monthly until ${formatUntil(until)}` : 'Monthly';
    case 'YEARLY':
      return count ? `Yearly for ${count} occurrences` : until ? `Yearly until ${formatUntil(until)}` : 'Yearly';
    default:
      // If frequency is not recognized, return the cleaned rule,
      // as it might be a valid but unhandled RRULE part.
      return cleanRrule;
  }
};

const formatUntil = (until: string): string => {
  try {
    const datePart = until.substring(0, 8);
    const year = parseInt(datePart.substring(0, 4));
    const month = parseInt(datePart.substring(4, 6)) - 1;
    const day = parseInt(datePart.substring(6, 8));
    const untilDate = new Date(year, month, day);

    return new Intl.DateTimeFormat(navigator.language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(untilDate);
  } catch (error) {
    console.error("Error formatting UNTIL date:", until, error);
    return until;
  }
};
