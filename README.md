# Welcome to your Dyad app

## Cloudflare deployment

1. Build the static assets with `pnpm run build` (outputs to `dist/`).
2. Deploy with `npx wrangler deploy` (Wrangler reads `wrangler.jsonc` and uploads `dist/`).

The default `wrangler.jsonc` config uses the `ananas-calendar` worker name, today’s compatibility date, and points the assets directory to `./dist`. Adjust those values if you need a different worker name or build output path.
