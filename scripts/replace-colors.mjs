/**
 * replace-colors.mjs  (v2 — fixed rgba regex escaping)
 * Replaces hardcoded hex + rgba color literals in TSX/TS files with
 * CSS variable references defined in index.css.
 *
 * Scope: artifacts/sahu-csc/src/components/ and src/pages/
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

// Helper: build rgba regex — alphaStr is a raw regex fragment (NO extra escaping)
// e.g. rgba(249, 115, 22, r("0\\.3(?:0)?"))  →  /rgba\(\s*249\s*,\s*115\s*,\s*22\s*,\s*0\.3(?:0)?\s*\)/g
function rgba(r, g, b, alphaRe) {
  return new RegExp(
    `rgba\\(\\s*${r}\\s*,\\s*${g}\\s*,\\s*${b}\\s*,\\s*${alphaRe}\\s*\\)`,
    "g"
  );
}

// ── Hex color rules ────────────────────────────────────────────────────────────
// Applied against the whole file source; hex values almost exclusively appear
// inside quoted strings or Tailwind arbitrary values in TSX.
const HEX_RULES = [
  // Navy scale (longest/most-specific first)
  [/#0[Bb]1340/g,    "var(--brand-navy)"],
  [/#080[Ff]2[Ee]/g, "var(--brand-navy-900)"],
  [/#0[Bb]2[Cc]60/g, "var(--brand-navy-800)"],
  [/#0[Ff]1[Ff]4[Aa]/g, "var(--brand-navy-750)"],
  [/#0[Ff]3872/g,    "var(--brand-navy-700)"],
  [/#1[Aa]2560/g,    "var(--brand-navy-650)"],
  [/#1[Ee]2[Dd]6[Bb]/g, "var(--brand-navy-650)"],
  [/#1[Aa]4[Aa]9[Ee]/g, "var(--brand-navy-600)"],
  [/#1[Ee]40[Aa][Ff]/g, "var(--brand-navy-500)"],

  // Orange / saffron
  [/#[Ff]97316/g,    "var(--brand-orange)"],
  [/#[Ff][Ff]9933/g, "var(--brand-orange-400)"],
  [/#[Cc]2410[Cc]/g, "var(--brand-orange-700)"],
  [/#[Ee][Aa]580[Cc]/g, "var(--brand-orange-600)"],
  [/#[Ff][Bb]923[Cc]/g, "var(--brand-orange-400)"],
  [/#[Ff][Bb][Bb][Ff]24/g, "var(--brand-orange-300)"],

  // Slate / neutral
  [/#[Ff]8[Ff][Aa][Ff][Cc]/g, "var(--color-slate-50)"],
  [/#[Ff][Aa][Ff][Bb][Ff][Ff]/g, "var(--color-slate-50)"],
  [/#[Ff]1[Ff]5[Ff]9/g, "var(--color-slate-100)"],
  [/#[Ee]2[Ee]8[Ff]0/g, "var(--color-slate-200)"],
  [/#[Cc][Bb][Dd]5[Ee]1/g, "var(--color-slate-300)"],
  [/#94[Aa]3[Bb]8/g, "var(--color-slate-400)"],
  [/#[Cc]4[Cc]9[Dd]4/g, "var(--color-slate-400)"],
  [/#64748[Bb]/g,    "var(--color-slate-500)"],
  [/#475569/g,       "var(--color-slate-600)"],
  [/#334155/g,       "var(--color-slate-700)"],
  [/#1[Ee]293[Bb]/g, "var(--color-slate-800)"],

  // Success / emerald
  [/#059669/g,       "var(--color-success)"],
  [/#10[Bb]981/g,    "var(--color-success-light)"],
  [/#22[Cc]55[Ee]/g, "var(--color-success-soft)"],
  [/#16[Aa]34[Aa]/g, "var(--color-success-dim)"],
  [/#34[Dd]399/g,    "var(--color-success-glow)"],
  [/#138808/g,       "var(--color-success-dim)"],
  [/#[Dd][Cc][Ff][Cc][Ee]7/g, "var(--color-success-bg)"],

  // Error / rose / red
  [/#[Ee]11[Dd]48/g,  "var(--color-error)"],
  [/#[Ff]43[Ff]5[Ee]/g, "var(--color-error-soft)"],
  [/#[Ee][Ff]4444/g,  "var(--color-error-std)"],
  [/#[Dd][Cc]2626/g,  "var(--color-error-dim)"],
  [/#[Bb][Ee]123[Cc]/g, "var(--color-error-dark)"],
  [/#[Bb]91[Cc]1[Cc]/g, "var(--color-error-deep)"],
  [/#[Ff][Ee][Ee]2[Ee]2/g, "var(--color-error-bg)"],
  [/#[Ff][Ff][Ff]1[Ff]2/g, "var(--color-error-bg-sm)"],

  // Warning / amber
  [/#[Dd]97706/g,    "var(--color-warning)"],
  [/#92400[Ee]/g,    "var(--color-warning-dark)"],
  [/#7[Cc]4[Aa]00/g, "var(--color-warning-dark)"],
  [/#[Ff][Ee][Ff]3[Cc]7/g, "var(--color-warning-bg)"],
  [/#[Aa]16207/g,    "var(--color-warning-text)"],

  // Violet / indigo / blue / sky
  [/#7[Cc]3[Aa][Ee][Dd]/g,  "var(--color-violet)"],
  [/#8[Bb]5[Cc][Ff]6/g,     "var(--color-violet-sm)"],
  [/#4[Ff]46[Ee]5/g,        "var(--color-indigo)"],
  [/#0369[Aa]1/g,            "var(--color-sky)"],  // sky-700
  [/#0891[Bb]2/g,            "var(--color-sky)"],
  [/#3[Bb]82[Ff]6/g,         "var(--color-blue)"],
  [/#2563[Ee][Bb]/g,         "var(--color-blue-600)"],
  [/#1[Dd]4[Ee][Dd]8/g,      "var(--color-blue-700)"],

  // Surfaces
  [/#[Ff][Aa][Ff][Aa][Ff][Aa]/g, "var(--surface-card-near-white)"],
  [/#[Ee][Ff][Ff]6[Ff][Ff]/g,   "var(--surface-toast-blue)"],
  [/#[Dd][Bb][Ee][Aa][Ff][Ee]/g, "var(--surface-blue-tint)"],
  [/#[Bb][Ff][Dd][Bb][Ff][Ee]/g, "var(--surface-blue-tint-sm)"],
  [/#[Ee][Ee][Ff]0[Ff][Ff]/g,   "var(--surface-permission-bg)"],
  [/#[Ee]8[Ee][Ee][Ff]8/g,       "var(--surface-blue-tint)"],  // #e8eef8 — blue-50 variant

  // Gray (Tailwind gray scale, different from slate)
  [/#[Ee]5[Ee]7[Ee][Bb]/g,  "var(--color-gray-200)"],
  [/#[Dd]1[Dd]5[Dd][Bb]/g,  "var(--color-gray-300)"],
  [/#9[Cc][Aa]3[Aa][Ff]/g,  "var(--color-gray-400)"],

  // Orange warm-tone UI (rejection panels, warning surfaces)
  [/#[Ff][Ee][Dd]7[Aa][Aa]/g,  "var(--color-orange-200)"],
  [/#[Ff][Ff][Ff]7[Ee][Dd]/g,  "var(--surface-warn-bg)"],
  [/#[Ff][Ff][Dd][Dd]5/g,      "var(--surface-warn-bg)"],      // #fffdd5 variant
  [/#9[Aa]3412/g,               "var(--color-orange-800)"],
  [/#7[Cc]2[Dd]12/g,            "var(--color-orange-900)"],
  [/#[Bb]45309/g,               "var(--color-amber-700)"],
  [/#[Ff][Ff][Ee][Dd][Dd]5/g,  "var(--surface-warn-bg)"],

  // Rose / red extended
  [/#[Ff][Ee][Cc][Dd][Dd]3/g, "var(--color-rose-200)"],
  [/#[Ff][Cc][Aa]5[Aa]5/g,    "var(--color-rose-300)"],
  [/#[Ff][Dd][Aa]4[Aa][Ff]/g, "var(--color-rose-300)"],       // fda4af
  [/#[Ff][Bb]7185/g,          "var(--color-error-soft)"],
  [/#9[Ff]1239/g,              "var(--color-rose-800)"],
  [/#991[Bb]1[Bb]/g,           "var(--color-red-800)"],

  // Success extended
  [/#[Dd]1[Ff][Aa][Ee]5/g,  "var(--color-success-bg-light)"],
  [/#[Aa]7[Ff]3[Dd]0/g,      "var(--color-success-glow)"],    // #a7f3d0

  // Violet
  [/#6366[Ff]1/g,   "var(--color-violet-sm)"],  // indigo-500 close to violet-sm
  [/#[Ee][Dd][Ee]9[Ff][Ee]/g, "var(--surface-permission-bg)"], // ede9fe violet-100
];

// ── rgba() rules — alphaRe is a raw regex fragment (dot already escaped as \.) ─
// Orange family (249,115,22) — high → low opacity
const RGBA_RULES = [
  [rgba(249, 115, 22, "0\\.7(?:0)?"),  "var(--brand-orange-glow)"],
  [rgba(249, 115, 22, "0\\.4(?:0)?"),  "var(--brand-orange-glow)"],
  [rgba(249, 115, 22, "0\\.35"),       "var(--brand-orange-tint-soft)"],
  [rgba(249, 115, 22, "0\\.3(?:0)?"),  "var(--brand-orange-border)"],
  [rgba(249, 115, 22, "0\\.25"),       "var(--brand-orange-tint-md)"],
  [rgba(249, 115, 22, "0\\.2(?:0)?"),  "var(--brand-orange-tint-md)"],
  [rgba(249, 115, 22, "0\\.22"),       "var(--brand-orange-tint-md)"],
  [rgba(249, 115, 22, "0\\.15"),       "var(--brand-orange-tint-sm)"],
  [rgba(249, 115, 22, "0\\.12"),       "var(--brand-orange-tint-sm)"],
  [rgba(249, 115, 22, "0\\.10"),       "var(--brand-orange-tint-xs)"],
  [rgba(249, 115, 22, "0\\.09"),       "var(--brand-orange-tint-xs)"],
  [rgba(249, 115, 22, "0\\.08"),       "var(--brand-orange-tint-xs)"],

  // Orange remaining alphas
  [rgba(249, 115, 22, "0\\.18"),       "var(--brand-orange-tint-18)"],
  [rgba(249, 115, 22, "0\\.1(?:0)?"),  "var(--brand-orange-tint-xs)"],
  [rgba(249, 115, 22, "0\\.07"),       "var(--brand-orange-tint-07)"],

  // Navy family (11,44,96) — high → low
  [rgba(11, 44, 96, "0\\.40"),         "var(--brand-navy-shadow)"],
  [rgba(11, 44, 96, "0\\.3(?:0)?"),    "var(--brand-navy-shadow-md)"],
  [rgba(11, 44, 96, "0\\.28"),         "var(--brand-navy-shadow)"],
  [rgba(11, 44, 96, "0\\.25"),         "var(--brand-navy-shadow-sm)"],
  [rgba(11, 44, 96, "0\\.22"),         "var(--brand-navy-shadow-sm)"],
  [rgba(11, 44, 96, "0\\.18"),         "var(--brand-navy-border-md)"],
  [rgba(11, 44, 96, "0\\.15"),         "var(--brand-navy-border-md)"],
  [rgba(11, 44, 96, "0\\.14"),         "var(--brand-navy-border-md)"],
  [rgba(11, 44, 96, "0\\.12"),         "var(--brand-navy-border)"],
  [rgba(11, 44, 96, "0\\.1(?:0)?"),    "var(--brand-navy-tint-md)"],
  [rgba(11, 44, 96, "0\\.09"),         "var(--brand-navy-tint-md)"],
  [rgba(11, 44, 96, "0\\.08"),         "var(--brand-navy-tint-md)"],
  [rgba(11, 44, 96, "0\\.07"),         "var(--brand-navy-tint-md)"],
  [rgba(11, 44, 96, "0\\.06"),         "var(--brand-navy-tint-md)"],
  [rgba(11, 44, 96, "0\\.05"),         "var(--brand-navy-tint-sm)"],
  [rgba(11, 44, 96, "0\\.04"),         "var(--brand-navy-tint-sm)"],
  [rgba(11, 44, 96, "0\\.03"),         "var(--brand-navy-tint-sm)"],
  [rgba(11, 44, 96, "0\\.025"),        "var(--brand-navy-tint-xs)"],

  // White overlays (255,255,255) — low opacity only; high-opacity text-on-dark left as-is
  [rgba(255, 255, 255, "0\\.3(?:0)?"), "var(--brand-white-30)"],
  [rgba(255, 255, 255, "0\\.28"),      "var(--brand-white-30)"],
  [rgba(255, 255, 255, "0\\.25"),      "var(--brand-white-25)"],
  [rgba(255, 255, 255, "0\\.2(?:0)?"), "var(--brand-white-border)"],
  [rgba(255, 255, 255, "0\\.18"),      "var(--brand-white-high)"],
  [rgba(255, 255, 255, "0\\.15"),      "var(--brand-white-mid)"],
  [rgba(255, 255, 255, "0\\.12"),      "var(--brand-white-mid)"],
  [rgba(255, 255, 255, "0\\.1(?:0)?"), "var(--brand-white-low)"],
  [rgba(255, 255, 255, "0\\.08"),      "var(--brand-white-low)"],
  [rgba(255, 255, 255, "0\\.07"),      "var(--brand-white-glass)"],
  [rgba(255, 255, 255, "0\\.06"),      "var(--brand-white-glass)"],
  [rgba(255, 255, 255, "0\\.05"),      "var(--brand-white-low)"],

  // Black overlays (0,0,0)
  [rgba(0, 0, 0, "0\\.55"),            "var(--brand-black-overlay)"],
  [rgba(0, 0, 0, "0\\.50"),            "var(--brand-black-overlay)"],
  [rgba(0, 0, 0, "0\\.40"),            "var(--brand-black-overlay)"],
  [rgba(0, 0, 0, "0\\.25"),            "var(--brand-navy-shadow-sm)"],
  [rgba(0, 0, 0, "0\\.15"),            "var(--brand-navy-tint-md)"],
  [rgba(0, 0, 0, "0\\.12"),            "var(--brand-navy-border)"],

  // Amber / warning (245,158,11) and (217,119,6) and (251,191,36)
  [rgba(245, 158, 11, "0\\.2(?:0)?"),  "var(--color-warning-border)"],
  [rgba(245, 158, 11, "0\\.07"),       "var(--color-warning-tint)"],
  [rgba(217, 119, 6, "0\\.12"),        "var(--color-warning-tint)"],
  [rgba(251, 191, 36, "0\\.4(?:0)?"),  "var(--color-warning-amber-glow)"],

  // Success tints (16,185,129) and (34,197,94) and (5,150,105) and (22,163,74)
  [rgba(16, 185, 129, "0\\.35"),       "color-mix(in srgb, var(--color-success) 35%, transparent)"],
  [rgba(16, 185, 129, "0\\.3(?:0)?"),  "color-mix(in srgb, var(--color-success) 30%, transparent)"],
  [rgba(16, 185, 129, "0\\.15"),       "var(--color-success-bg)"],
  [rgba(16, 185, 129, "0\\.12"),       "var(--color-success-bg)"],
  [rgba(16, 185, 129, "0\\.1(?:0)?"),  "var(--color-success-bg)"],
  [rgba(16, 185, 129, "0\\.05"),       "var(--color-success-bg)"],
  [rgba(34, 197, 94,  "0\\.35"),       "color-mix(in srgb, var(--color-success) 35%, transparent)"],
  [rgba(34, 197, 94,  "0\\.3(?:0)?"),  "color-mix(in srgb, var(--color-success) 30%, transparent)"],
  [rgba(34, 197, 94,  "0\\.1(?:0)?"),  "var(--color-success-bg)"],
  [rgba(34, 197, 94,  "0\\.04"),       "var(--color-success-bg)"],
  [rgba(5,  150, 105, "0\\.35"),       "color-mix(in srgb, var(--color-success) 35%, transparent)"],
  [rgba(22, 163, 74,  "0\\.04"),       "var(--color-success-bg)"],

  // Error tints (244,63,94) and (225,29,72)
  [rgba(244, 63, 94, "0\\.3(?:0)?"),   "color-mix(in srgb, var(--color-error) 30%, transparent)"],
  [rgba(244, 63, 94, "0\\.12"),        "var(--color-error-bg)"],
  [rgba(244, 63, 94, "0\\.1(?:0)?"),   "var(--color-error-bg)"],
  [rgba(244, 63, 94, "0\\.08"),        "var(--color-error-bg)"],
  [rgba(244, 63, 94, "0\\.07"),        "var(--color-error-bg)"],
  [rgba(244, 63, 94, "0\\.04"),        "var(--color-error-bg)"],
  [rgba(225, 29, 72, "0\\.08"),        "var(--color-error-bg)"],
  [rgba(251, 146, 60, "0\\.03"),       "var(--brand-orange-tint-07)"],

  // Navy 0.35 (slightly above shadow-md)
  [rgba(11, 44, 96, "0\\.35"),         "var(--brand-navy-shadow)"],

  // Orange 0.06 (near tint-07)
  [rgba(249, 115, 22, "0\\.06"),       "var(--brand-orange-tint-07)"],

  // Success tints — remaining alphas
  [rgba(16, 185, 129, "0\\.25"),       "color-mix(in srgb, var(--color-success) 25%, transparent)"],
  [rgba(16, 185, 129, "0\\.18"),       "var(--color-success-bg)"],
  [rgba(16, 185, 129, "0\\.08"),       "var(--color-success-bg)"],
  [rgba(16, 185, 129, "0\\.07"),       "var(--color-success-bg)"],
  [rgba(16, 185, 129, "0\\.04"),       "var(--color-success-bg)"],
  [rgba(5,  150, 105, "0\\.08"),       "var(--color-success-bg)"],
  [rgba(34, 197, 94,  "0\\.2(?:0)?"),  "var(--color-success-bg)"],
  [rgba(34, 197, 94,  "0\\.18"),       "var(--color-success-bg)"],

  // Error remaining
  [rgba(220, 38, 38, "0\\.1(?:0)?"),   "var(--color-error-bg)"],

  // Amber remaining
  [rgba(251, 191, 36, "0\\.18"),       "var(--color-warning-tint)"],
];

// ── File walker ────────────────────────────────────────────────────────────────
function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) { walk(full, out); continue; }
    const ext = extname(entry);
    if (ext === ".tsx" || ext === ".ts") out.push(full);
  }
  return out;
}

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const SRC  = join(ROOT, "artifacts/sahu-csc/src");
const files = [join(SRC, "components"), join(SRC, "pages")].flatMap(d => walk(d));

let changedCount = 0;

for (const file of files) {
  let src = readFileSync(file, "utf8");
  const original = src;

  // rgba rules first (before hex, to avoid partial matches on color numbers)
  for (const [re, token] of RGBA_RULES) {
    src = src.replace(re, token);
  }

  // Hex rules
  for (const [re, token] of HEX_RULES) {
    src = src.replace(re, token);
  }

  if (src !== original) {
    writeFileSync(file, src, "utf8");
    changedCount++;
    console.log(`  ✓ ${file.replace(ROOT + "/", "")}`);
  }
}

console.log(`\nDone: ${changedCount} files modified.`);
