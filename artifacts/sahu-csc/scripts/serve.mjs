// Production static-file server for the built SPA.
//
// Why not plain `sirv-cli`: its --maxage/--immutable flags apply to every
// file uniformly, including index.html served via SPA fallback. That would
// let browsers/CDNs cache index.html for a year, so users could keep
// loading a stale HTML shell (and therefore stale asset hashes) after a
// deploy. Vite's hashed filenames (assets/*-[hash].js) are safe to cache
// forever; index.html (and any other unhashed file) must always revalidate.
import sirv from "sirv";
import { createServer, request as httpRequest } from "node:http";

const port = Number(process.env.PORT ?? 5000);
const apiPort = Number(process.env.API_PORT ?? 8080);
const dir = new URL("../dist/public", import.meta.url).pathname;

const assets = sirv(dir, {
  etag: true,
  gzip: true,
  brotli: true,
  single: true,
  setHeaders(res, pathname) {
    // `pathname` is always the *request* path, even when sirv's SPA
    // fallback silently serves index.html for it (e.g. a deep-linked
    // client route like /server-health) — so we can't rely on it ending
    // in ".html" to detect the shell. Anything that isn't a real static
    // asset under /assets (or an explicitly-named file) is the SPA shell.
    const isShell =
      pathname === "/" ||
      pathname.endsWith(".html") ||
      pathname.endsWith("sw.js") ||
      pathname.endsWith("sw.mjs") ||
      !/\.[a-zA-Z0-9]+$/.test(pathname); // no file extension => client route
    if (isShell) {
      // HTML shell and the service worker itself must always be
      // revalidated so users pick up new deploys promptly.
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
      res.setHeader("Pragma", "no-cache");
    } else if (/-[a-zA-Z0-9_-]{6,}\.(js|css|woff2?|png|jpg|jpeg|svg|webp|ico)$/.test(pathname)) {
      // Content-hashed build assets never change under the same URL.
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    } else {
      // Unhashed static files (manifest.json, robots.txt, etc.) — short
      // cache so updates propagate without needing a cache-buster.
      res.setHeader("Cache-Control", "public, max-age=300");
    }
  },
});

// Proxy /__mockup/* to the mockup sandbox dev server (port 5173).
const mockupPort = 5173;
function proxyToMockup(req, res) {
  const options = {
    hostname: "127.0.0.1",
    port: mockupPort,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: `127.0.0.1:${mockupPort}` },
  };
  const proxy = httpRequest(options, (apiRes) => {
    res.writeHead(apiRes.statusCode, apiRes.headers);
    apiRes.pipe(res, { end: true });
  });
  proxy.on("error", (err) => {
    if (!res.headersSent) res.writeHead(502, { "Content-Type": "text/plain" });
    res.end(`Mockup sandbox unavailable: ${err.message}`);
  });
  req.pipe(proxy, { end: true });
}

// Proxy /api/* and /socket.io/* requests to the API server on apiPort.
function proxyToApi(req, res) {
  const options = {
    hostname: "127.0.0.1",
    port: apiPort,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: `127.0.0.1:${apiPort}` },
  };

  const proxy = httpRequest(options, (apiRes) => {
    res.writeHead(apiRes.statusCode, apiRes.headers);
    apiRes.pipe(res, { end: true });
  });

  proxy.on("error", (err) => {
    console.error(`[proxy] API request failed: ${err.message}`);
    if (!res.headersSent) {
      res.writeHead(502, { "Content-Type": "application/json" });
    }
    res.end(JSON.stringify({ error: "API server unavailable" }));
  });

  req.pipe(proxy, { end: true });
}

createServer((req, res) => {
  // Forward API and WebSocket upgrade paths to the API server.
  if (req.url.startsWith("/api/") || req.url.startsWith("/socket.io/")) {
    return proxyToApi(req, res);
  }

  // Forward mockup sandbox requests to the vite dev server.
  if (req.url.startsWith("/__mockup")) {
    return proxyToMockup(req, res);
  }

  // Everything else: serve static files with SPA fallback.
  assets(req, res, () => {
    res.statusCode = 404;
    res.end("Not found");
  });
}).listen(port, "0.0.0.0", () => {
  console.log(`serve: listening on http://0.0.0.0:${port}`);
  console.log(`serve: proxying /api/* → http://127.0.0.1:${apiPort}`);
});
