# SAHU CSC — CDN Setup Guide (documentation only, not yet provisioned)

**Status:** Not implemented. This is a setup guide for whoever provisions the CDN — it requires an external account/DNS change outside this codebase, so it is documented here rather than auto-configured by the agent.

## 1. Current static asset serving (as of v3.5.4)

- **Single origin, single deployment.** The app is a Replit VM deployment (`deploymentTarget = "vm"` in `.replit`) with exactly one externally-exposed port: local `5000` → external `:80` (see `[[ports]]` in `.replit`). The API server (port `8080`) is internal-only — the frontend's own server proxies `/api/*` to it in dev (Vite) and both processes share the same public domain in production (`scripts/start-prod.sh` starts both; only port 5000 is externally routed).
- **Static files are served by `artifacts/sahu-csc/scripts/serve.mjs`**, a thin wrapper around the `sirv` package, from `artifacts/sahu-csc/dist/public/` (the Vite build output). There is no separate object-storage bucket or static-asset domain — everything is served directly from this one container.
- **Backblaze B2 is not the static-asset CDN.** The optional B2 integration stores profile avatars and database-backup copies only; the SPA shell, JavaScript, CSS, and public assets continue to come from the Replit origin.
- **Cache headers are already correct and must not be re-derived by the CDN:**
  | Asset type | Match | Header |
  |---|---|---|
  | Content-hashed build assets | `*-<hash>.{js,css,woff2,png,jpg,jpeg,svg,webp,ico}` under `/assets/` | `Cache-Control: public, max-age=31536000, immutable` |
  | SPA shell / client routes / service worker | `/`, `*.html`, `sw.js`, `sw.mjs`, any path with no file extension (deep-linked client route) | `Cache-Control: no-store, no-cache, must-revalidate` + `Pragma: no-cache` |
  | Unhashed static files | anything else (e.g. `manifest.json`, `robots.txt`) | `Cache-Control: public, max-age=300` |

  These headers are set in `serve.mjs` and already do the right thing (long-lived immutable caching for hashed assets, always-revalidate for the shell). A CDN sitting in front of this origin only needs to **respect/pass through** `Cache-Control`, not override it with its own page-rule TTLs.

## 2. Recommended CDN: Cloudflare (proxy in front of the existing domain)

Since there is a single public origin and correct origin headers already, the simplest and lowest-risk setup is Cloudflare's reverse proxy in front of the Replit deployment domain — no code changes, no asset-path rewrite, no risk of broken references.

### Steps

1. **Point DNS at Cloudflare** — if using a custom domain, add it to Cloudflare and set the DNS record's proxy status to "Proxied" (orange cloud). If staying on the default `*.replit.app` domain, use Cloudflare's "CNAME setup" / partial (sub-domain) hosting mode, since the root Replit domain isn't delegable.
2. **SSL/TLS mode: Full (strict)** — the origin (Replit deployment) already terminates HTTPS, so Cloudflare should re-encrypt to the origin, not downgrade to HTTP.
3. **Cache mode: "Standard" / respect origin headers — do NOT set a Cache Everything page rule.** Cloudflare's default behavior is to honor the origin's `Cache-Control` for static file extensions already (js/css/png/etc.), which matches what `serve.mjs` sends. Do not add a blanket "Cache Everything" or "Edge Cache TTL override" rule — that would cache the SPA shell (which explicitly asks not to be cached) and serve stale HTML/API responses after a deploy.
4. **Bypass cache for `/api/*`** — add a page rule (or a Cache Rule in the newer dashboard) for `example.com/api/*` with **Cache Level: Bypass**. The API is dynamic/session-based (auth, ledger, etc.) and must never be edge-cached.
5. **Respect the shell's no-store header** — no extra config needed beyond step 3; Cloudflare will not cache a response whose origin sends `Cache-Control: no-store`.

### Cache-purge on deploy

Because every build asset filename is content-hashed (`*-<hash>.js`), a new deploy produces new filenames — old cached copies at the CDN edge are simply never requested again, and the always-revalidated SPA shell picks up the new filenames immediately. **No manual purge step is required** for a normal deploy. The only case that would need a manual "Purge Everything" in the Cloudflare dashboard is if an *unhashed* static file (e.g. `manifest.json`, `robots.txt`) changes and can't wait out its 5-minute `max-age`.

## 3. What NOT to do

- Do not move static assets to a separate CDN-prefixed URL (e.g. `cdn.example.com/assets/...`) unless there's a specific reason to split origins — for a single-VM deployment this adds complexity (CORS, asset-path rewriting in `vite.config.ts`'s `base`) for no real benefit over a transparent reverse-proxy CDN.
- Do not let the CDN set its own TTL/cache rules that override origin headers — the app has already tuned these per-asset-type (see table above); a blanket CDN cache policy would either under-cache hashed assets or (worse) over-cache the SPA shell / API.

## 4. Verifying after setup

1. Load the app's public domain and open the browser Network tab.
2. Confirm the response headers for a hashed asset (e.g. `/assets/index-<hash>.js`) show `cf-cache-status: HIT` (after a warm request) and the same `Cache-Control: public, max-age=31536000, immutable` as the origin.
3. Confirm `/` (the SPA shell) shows `cf-cache-status: DYNAMIC` or `BYPASS` and `Cache-Control: no-store`.
4. Confirm `/api/*` requests show `cf-cache-status: BYPASS` (or the header is absent) — never `HIT`.
5. Log in and click through the app — visual output and behavior must be identical to accessing the origin directly.
