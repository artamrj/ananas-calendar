export const formatRrule = (rrule: string | undefined): string | undefined => {
  if (!rrule) {
    return undefined;
  }

  const parts = rrule.split(';').reduce((acc, part) => {
    const [key, value] = part.split('=');
    if (key && value) {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, string>);

  const freq = parts['FREQ'];
  const byday = parts['BYDAY'];
  const count = parts['COUNT'];

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
      return rrule; // Return original if frequency is not recognized
  }

  if (count) {
    humanReadable += ` for ${count} occurrences`;
  }

  return humanReadable;
};