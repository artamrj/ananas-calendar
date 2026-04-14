import { defineConfig, loadEnv } from "vite";
import dyadComponentTagger from "@dyad-sh/react-vite-component-tagger";
import react from "@vitejs/plugin-react-swc";
import path from "path";

const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";

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

            const apiKey =
              env.MISTRAL_API_KEY?.trim() || env.VITE_MISTRAL_API_KEY?.trim();

            if (!apiKey) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({
                  error:
                    "Local dev server is missing MISTRAL_API_KEY. Rename VITE_MISTRAL_API_KEY to MISTRAL_API_KEY in .env.local.",
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

            if (!body.model?.trim()) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Missing model." }));
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
  };
});
