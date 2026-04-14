import { defineConfig, loadEnv } from "vite";
import dyadComponentTagger from "@dyad-sh/react-vite-component-tagger";
import react from "@vitejs/plugin-react-swc";
import path from "path";

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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      dyadComponentTagger(),
      react(),
      {
        name: "local-mistral-proxy",
        configureServer(server) {
          server.middlewares.use("/api/mistral", async (req, res) => {
            if (req.method !== "POST") {
              res.statusCode = 405;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Method not allowed." }));
              return;
            }

            const apiKey = env.MISTRAL_API_KEY?.trim();

            if (!apiKey) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({
                  error:
                    "Local dev server is missing MISTRAL_API_KEY.",
                }),
              );
              return;
            }

            const chunks: Buffer[] = [];
            for await (const chunk of req) {
              chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
            }

            let body: ProxyRequestBody;
            try {
              body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
            } catch {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Request body must be valid JSON." }));
              return;
            }

            if (!body.prompt?.trim()) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Missing prompt." }));
              return;
            }

            if (body.prompt.length > MAX_PROMPT_LENGTH) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: `Prompt is too long. Maximum length is ${MAX_PROMPT_LENGTH} characters.` }));
              return;
            }

            if (!body.model?.trim()) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Missing model." }));
              return;
            }

            if (!MODEL_NAME_PATTERN.test(body.model.trim())) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Unsupported model name." }));
              return;
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
                ...(body.responseFormat
                  ? { response_format: body.responseFormat }
                  : {}),
              }),
            });

            res.statusCode = upstreamResponse.status;
            res.setHeader("Content-Type", "application/json");
            res.end(await upstreamResponse.text());
          });
        },
      },
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    test: {
      environment: "jsdom",
      globals: true,
      include: ["tests/**/*.{test,spec}.{ts,tsx}"],
      setupFiles: "./tests/setup.ts",
    },
  };
});
