// ─── Device fingerprint ────────────────────────────────────────────────────
// A stable, client-computed identifier for "this browser on this device",
// used by the backend to recognise known vs. new devices for single-device
// login enforcement and 2FA challenge decisions. Not a security boundary by
// itself — it's a UX signal; the server is the source of truth for sessions.
//
// Built from UA + language + screen + timezone, hashed with SHA-256, then
// cached in localStorage so it stays stable across page reloads and login
// attempts on the same browser (clearing site data resets it, which is
// expected — that's a "new device" from the server's point of view too).

const STORAGE_KEY = "sahu-device-fp";

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function computeFingerprint(): Promise<string> {
  const parts = [
    navigator.userAgent,
    navigator.language,
    String(screen.width),
    String(screen.height),
    String(screen.colorDepth),
    Intl.DateTimeFormat().resolvedOptions().timeZone ?? "",
  ];
  return sha256Hex(parts.join("|"));
}

let cached: string | null = null;

/** Returns a stable per-device fingerprint, computing + caching it on first use. */
export async function getDeviceFingerprint(): Promise<string> {
  if (cached) return cached;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      cached = stored;
      return stored;
    }
  } catch { /* localStorage unavailable (private mode, etc.) — fall through */ }

  let fp: string;
  try {
    fp = await computeFingerprint();
  } catch {
    // SubtleCrypto unavailable (very old browser / non-HTTPS context) —
    // fall back to a random-but-stable-per-session id so the flow still works.
    fp = `fallback-${Math.random().toString(36).slice(2)}${Date.now()}`;
  }

  try { localStorage.setItem(STORAGE_KEY, fp); } catch { /* ignore */ }
  cached = fp;
  return fp;
}
