const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";
const MAX_PROMPT_LENGTH = 12000;
const MODEL_NAME_PATTERN = /^(mistral|open-mistral|pixtral)-[a-z0-9.-]+$/i;

interface ProxyRequestBody {
  prompt?: string;
  model?: string;
  responseFormat?: {
    type: "json_object";
  };
}

interface MistralApiErrorResponse {
  message?: string;
}

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed." }, 405);
  }

  const apiKey = process.env.MISTRAL_API_KEY?.trim();
  if (!apiKey) {
    return json({ error: "Server is missing MISTRAL_API_KEY." }, 500);
  }

  let body: ProxyRequestBody;

  try {
    body = (await request.json()) as ProxyRequestBody;
  } catch {
    return json({ error: "Request body must be valid JSON." }, 400);
  }

  if (!body.prompt?.trim()) {
    return json({ error: "Missing prompt." }, 400);
  }

  if (body.prompt.length > MAX_PROMPT_LENGTH) {
    return json({ error: `Prompt is too long. Maximum length is ${MAX_PROMPT_LENGTH} characters.` }, 400);
  }

  if (!body.model?.trim()) {
    return json({ error: "Missing model." }, 400);
  }

  if (!MODEL_NAME_PATTERN.test(body.model.trim())) {
    return json({ error: "Unsupported model name." }, 400);
  }

  const upstreamResponse = await fetch(MISTRAL_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: body.model,
      messages: [{ role: "user", content: body.prompt }],
      temperature: 0.2,
      ...(body.responseFormat ? { response_format: body.responseFormat } : {}),
    }),
  });

  if (!upstreamResponse.ok) {
    const errorPayload = (await upstreamResponse
      .json()
      .catch(() => ({}))) as MistralApiErrorResponse;

    return json(
      {
        error:
          errorPayload.message ||
          `Mistral API request failed with status ${upstreamResponse.status}.`,
      },
      upstreamResponse.status,
    );
  }

  return new Response(await upstreamResponse.text(), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
