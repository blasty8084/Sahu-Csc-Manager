import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build as esbuild } from "esbuild";
import esbuildPluginPino from "esbuild-plugin-pino";

// esbuild-plugin-pino calls require() internally — polyfill for ESM context.
globalThis.require = createRequire(import.meta.url);

const artifactDir = path.dirname(fileURLToPath(import.meta.url));

await esbuild({
  entryPoints: [
    path.resolve(artifactDir, "src/index.ts"),
  ],
  platform: "node",
  bundle: true,
  format: "esm",
  outdir: path.resolve(artifactDir, "dist"),
  outExtension: { ".js": ".mjs" },
  external: [
    // Native / platform binaries
    "@swc/core",
    "cpu-features",
    "hiredis",
    "kerberos",
    "leveldown",
    "pdfkit",
    "sharp",
    "snappy",
    "usb",
    // Optional pnpm-excluded platform packages
    "fsevents",
  ],
  sourcemap: "linked",
  plugins: [
    esbuildPluginPino({ transports: ["pino-pretty"] }),
  ],
  banner: {
    js: `import { createRequire as __bannerCrReq } from 'node:module';
import __bannerPath from 'node:path';
import __bannerUrl from 'node:url';

globalThis.require = __bannerCrReq(import.meta.url);
globalThis.__filename = __bannerUrl.fileURLToPath(import.meta.url);
globalThis.__dirname = __bannerPath.dirname(globalThis.__filename);
`,
  },
});

console.log("⚡ worker-server build complete");
