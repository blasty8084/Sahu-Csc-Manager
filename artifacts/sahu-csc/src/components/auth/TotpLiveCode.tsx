import { useState, useEffect } from "react";

interface Props {
  /** Full API path, e.g. "/api/auth/2fa/totp-code-pending" */
  apiPath: string;
}

export function TotpLiveCode({ apiPath }: Props) {
  const [code, setCode]           = useState<string | null>(null);
  const [remaining, setRemaining] = useState(30);
  const [step, setStep]           = useState(30); // read from server; default matches standard 30 s

  useEffect(() => {
    let expiryTimer: ReturnType<typeof setTimeout>;
    let ticker:      ReturnType<typeof setInterval>;
    let alive = true;

    const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

    const load = async () => {
      try {
        const resp = await fetch(`${base}${apiPath}`, { credentials: "include" });
        if (!resp.ok || !alive) return;
        const json: { code: string; remaining: number; step?: number } = await resp.json();
        const serverStep = json.step ?? 30;
        setCode(json.code);
        setRemaining(json.remaining);
        setStep(serverStep);
        clearInterval(ticker);
        ticker = setInterval(() => setRemaining(r => Math.max(0, r - 1)), 1000);
        // Re-fetch the moment the current window expires
        expiryTimer = setTimeout(load, json.remaining * 1000);
      } catch { /* network error — keep showing last code */ }
    };

    load();
    return () => {
      alive = false;
      clearTimeout(expiryTimer);
      clearInterval(ticker);
    };
  }, [apiPath]);

  const pct   = step > 0 ? remaining / step : 0;
  const r     = 22;
  const circ  = 2 * Math.PI * r;
  const color = pct > 0.6 ? "#10b981" : pct > 0.3 ? "#f97316" : "#ef4444";
  const d1    = code ? code.slice(0, 3) : "• • •";
  const d2    = code ? code.slice(3)    : "• • •";

  return (
    <div className="rounded-2xl border-2 border-blue-100 bg-gradient-to-b from-blue-50 to-white p-5 flex flex-col items-center gap-3">
      <p className="text-[11px] font-bold text-blue-500 uppercase tracking-widest">
        Your verification code
      </p>

      <div className="flex items-center gap-5">
        {/* Big digits */}
        <div
          className="font-mono font-black text-gray-900 select-all leading-none"
          style={{ fontSize: "2.6rem", letterSpacing: "0.16em" }}
        >
          {d1}&thinsp;{d2}
        </div>

        {/* Countdown ring */}
        <svg width="56" height="56" viewBox="0 0 56 56" className="flex-shrink-0">
          <circle cx="28" cy="28" r={r} fill="none" stroke="#e5e7eb" strokeWidth="5" />
          <circle
            cx="28" cy="28" r={r} fill="none"
            stroke={color} strokeWidth="5" strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - pct)}
            transform="rotate(-90 28 28)"
            style={{ transition: "stroke-dashoffset 1s linear, stroke 0.4s" }}
          />
          <text
            x="28" y="33" textAnchor="middle"
            fontSize="12" fontWeight="900" fill={color}
          >
            {remaining}
          </text>
        </svg>
      </div>

      <p className="text-[11px] text-blue-400 text-center">
        Auto-refreshes every {step} s · valid for {remaining}s
      </p>
    </div>
  );
}
