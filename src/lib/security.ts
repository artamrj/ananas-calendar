const SAFE_URL_PROTOCOLS = new Set(["http:", "https:"]);
const MODEL_NAME_PATTERN = /^(mistral|open-mistral|pixtral)-[a-z0-9.-]+$/i;
const RRULE_PATTERN = /^[A-Z0-9=;,:-]+$/;

export const MAX_PROMPT_LENGTH = 12000;

export const isSafeUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return SAFE_URL_PROTOCOLS.has(url.protocol);
  } catch {
    return false;
  }
};

export const sanitizeRrule = (value: string): string => {
  const normalized = value
    .trim()
    .replace(/^RRULE:/i, "")
    .replace(/[\r\n]+/g, "");

  if (!normalized) {
    return "";
  }

  return RRULE_PATTERN.test(normalized) ? normalized : "";
};

export const isAllowedModelName = (value: string): boolean =>
  MODEL_NAME_PATTERN.test(value.trim());
