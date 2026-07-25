---
name: serve.mjs API proxy
description: The production static-file server must proxy /api/* to the API server on port 8080 — without it, API calls return index.html as a string causing runtime crashes.
---

## Rule
`artifacts/sahu-csc/scripts/serve.mjs` must forward `/api/*` (and `/socket.io/*`) requests to `http://127.0.0.1:8080` using Node's built-in `http.request`.

**Why:** `sirv` with `single: true` serves `index.html` as the SPA fallback for any unmatched route, including `/api/*`. Without a proxy, every API call receives the HTML shell. `inferResponseType` sees `text/html` → returns the body as a string → React Query stores the HTML string as `data` → calling `.map()` on a string throws `TypeError: O?.map is not a function`.

**How to apply:** Any time `serve.mjs` is modified or the serve script is regenerated, confirm the `/api/` proxy block is present. The Vite dev server already proxies via `vite.config.ts`; only the production serve script needed fixing.

## Pattern used
```js
import { createServer, request as httpRequest } from "node:http";
// ...
if (req.url.startsWith("/api/") || req.url.startsWith("/socket.io/")) {
  // proxy to http://127.0.0.1:${apiPort}
}
```
No extra packages — pure Node built-ins only.
