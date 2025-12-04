// This is a basic Cloudflare Worker script to serve static assets.
// It's designed to work with the `[site]` configuration in wrangler.toml.

// The `__STATIC_CONTENT` binding is automatically provided by Wrangler
// when you use the `[site]` configuration.
import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

addEventListener('fetch', event => {
  event.respondWith(handleEvent(event));
});

async function handleEvent(event) {
  try {
    return await getAssetFromKV(event);
  } catch (e) {
    // If the asset is not found, try serving index.html for client-side routing.
    // This is common for single-page applications (SPAs) like React apps,
    // where the client-side router handles different paths.
    try {
      const url = new URL(event.request.url);
      url.pathname = '/index.html';
      return await getAssetFromKV(new Request(url.toString()));
    } catch (e) {
      return new Response('Not Found', { status: 404 });
    }
  }
}