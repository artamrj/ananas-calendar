const readEnv = (key: string): string | undefined => {
  const value = import.meta.env[key];

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

export const env = {
  defaultAiModel: readEnv("VITE_DEFAULT_AI_MODULE") ?? "mistral-small-2409",
};
