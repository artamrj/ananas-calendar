import { env } from "@/lib/env";

const API_PROXY_URL = "/api/mistral";

interface ResponseFormat {
  type: "json_object";
}

interface MistralCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

interface ProxyRequestBody {
  prompt: string;
  model: string;
  responseFormat?: ResponseFormat;
}

interface ApiErrorResponse {
  error?: string;
  message?: string;
}

const readErrorMessage = async (response: Response): Promise<string> => {
  const fallbackMessage = `Request failed with status ${response.status}.`;

  try {
    const payload = (await response.json()) as ApiErrorResponse;
    return payload.error || payload.message || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
};

const parseCompletionContent = async (response: Response): Promise<string> => {
  const data = (await response.json()) as MistralCompletionResponse;
  const content = data.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("AI response did not contain any message content.");
  }

  return content;
};

const callProxyApi = async (
  prompt: string,
  model: string,
  responseFormat?: ResponseFormat,
): Promise<string> => {
  const response = await fetch(API_PROXY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      model,
      responseFormat,
    } satisfies ProxyRequestBody),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return parseCompletionContent(response);
};

export const resolveAiModel = (model?: string): string => {
  const candidate = model?.trim();
  return candidate || env.defaultAiModel;
};

export const getAiConfigurationStatus = () => ({
  hasProxy: true,
});

export const callAi = async (
  prompt: string,
  model?: string,
  responseFormat?: ResponseFormat,
): Promise<string> => {
  const resolvedModel = resolveAiModel(model);
  return callProxyApi(prompt, resolvedModel, responseFormat);
};
