export const getCurrentContext = (locale?: string, timeZone?: string): string => {
  const userTimeZone = timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const now = new Date();

  const dayOfMonth = now.getUTCDate().toString().padStart(2, "0");
  const monthNumber = (now.getUTCMonth() + 1).toString().padStart(2, "0");
  const monthName = now.toLocaleString("en-US", { month: "long", timeZone: userTimeZone });
  const year = now.getUTCFullYear();
  const dayOfWeek = now.toLocaleString("en-US", { weekday: "long", timeZone: userTimeZone });
  const currentTime = now.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: userTimeZone,
  });

  return `Current Date: ${year}-${monthNumber}-${dayOfMonth} (Year ${year}, Month ${monthName}, Day ${dayOfMonth}), Day of Week: ${dayOfWeek}, Current Time: ${currentTime}, Time Zone: ${userTimeZone}.`;
};
