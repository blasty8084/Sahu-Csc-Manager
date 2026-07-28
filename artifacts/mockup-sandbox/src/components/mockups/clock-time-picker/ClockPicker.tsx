import { useState, useRef, useCallback } from "react";

const NAVY = "#1a2560";
const ORANGE = "#f97316";

function polarToXY(angleDeg: number, r: number, cx: number, cy: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function hourToAngle(h: number) {
  return ((h % 12) / 12) * 360;
}

function minuteToAngle(m: number) {
  return (m / 60) * 360;
}

type Mode = "hour" | "minute";

export function ClockPicker() {
  const [hour, setHour] = useState(2);
  const [minute, setMinute] = useState(0);
  const [ampm, setAmpm] = useState<"AM" | "PM">("AM");
  const [mode, setMode] = useState<Mode>("hour");
  const svgRef = useRef<SVGSVGElement>(null);

  const CX = 150, CY = 150, R = 130, TICK_R = 110;

  const handleSvgClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const scaleX = 300 / rect.width;
      const scaleY = 300 / rect.height;
      const x = (e.clientX - rect.left) * scaleX - CX;
      const y = (e.clientY - rect.top) * scaleY - CY;
      let angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
      if (angle < 0) angle += 360;

      if (mode === "hour") {
        const h = Math.round(angle / 30) % 12 || 12;
        setHour(h);
        setTimeout(() => setMode("minute"), 200);
      } else {
        const m = Math.round(angle / 6) % 60;
        setMinute(m);
      }
    },
    [mode]
  );

  const handAngle = mode === "hour" ? hourToAngle(hour) : minuteToAngle(minute);
  const { x: thumbX, y: thumbY } = polarToXY(handAngle, TICK_R, CX, CY);

  const hourLabels = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const minLabels = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  const displayHour = String(hour).padStart(2, "0");
  const displayMin = String(minute).padStart(2, "0");

  return (
    <div className="min-h-screen bg-zinc-200 flex items-center justify-center p-4">
      {/* Card */}
      <div
        className="w-[340px] rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: "#3a3a3a" }}
      >
        {/* ── Time display header ── */}
        <div
          className="px-6 pt-6 pb-4 flex items-center justify-between"
          style={{ background: "#2d2d2d" }}
        >
          {/* Big time */}
          <div className="flex items-end gap-1">
            <button
              onClick={() => setMode("hour")}
              className="text-[52px] font-thin leading-none transition-opacity"
              style={{
                color: mode === "hour" ? "#ffffff" : "rgba(255,255,255,0.4)",
                fontFamily: "'Roboto', sans-serif",
                letterSpacing: "-2px",
              }}
            >
              {displayHour}
            </button>
            <span
              className="text-[52px] font-thin leading-none"
              style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Roboto', sans-serif" }}
            >
              :
            </span>
            <button
              onClick={() => setMode("minute")}
              className="text-[52px] font-thin leading-none transition-opacity"
              style={{
                color: mode === "minute" ? "#ffffff" : "rgba(255,255,255,0.4)",
                fontFamily: "'Roboto', sans-serif",
                letterSpacing: "-2px",
              }}
            >
              {displayMin}
            </button>
          </div>

          {/* AM / PM */}
          <div className="flex flex-col gap-1 ml-3">
            {(["AM", "PM"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setAmpm(p)}
                className="text-sm font-semibold transition-all px-1"
                style={{
                  color: ampm === p ? "#ffffff" : "rgba(255,255,255,0.35)",
                  fontFamily: "'Roboto', sans-serif",
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* ── Clock face ── */}
        <div className="px-5 pt-4 pb-2 flex items-center justify-center" style={{ background: "#3a3a3a" }}>
          <svg
            ref={svgRef}
            viewBox="0 0 300 300"
            className="w-full max-w-[280px] cursor-pointer select-none"
            onClick={handleSvgClick}
          >
            {/* Outer circle */}
            <circle cx={CX} cy={CY} r={R} fill="#4a4a4a" />

            {/* Center dot */}
            <circle cx={CX} cy={CY} r={4} fill="rgba(147,197,253,0.8)" />

            {/* Hand line */}
            <line
              x1={CX}
              y1={CY}
              x2={thumbX}
              y2={thumbY}
              stroke="rgba(147,197,253,0.7)"
              strokeWidth={2}
              strokeLinecap="round"
            />

            {/* Thumb circle */}
            <circle
              cx={thumbX}
              cy={thumbY}
              r={20}
              fill={NAVY}
              style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))" }}
            />

            {/* Hour / minute labels */}
            {hourLabels.map((h, i) => {
              const angle = (i / 12) * 360;
              const { x, y } = polarToXY(angle, TICK_R, CX, CY);
              const isActive =
                mode === "hour"
                  ? h === (hour % 12 || 12)
                  : false;
              return (
                <text
                  key={`h${h}`}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={mode === "hour" ? 16 : 13}
                  fontFamily="'Roboto', sans-serif"
                  fontWeight="400"
                  fill={isActive ? "#ffffff" : "rgba(255,255,255,0.85)"}
                  style={{ pointerEvents: "none" }}
                >
                  {mode === "hour" ? h : String(minLabels[i]).padStart(2, "0")}
                </text>
              );
            })}

            {/* Active label on thumb */}
            <text
              x={thumbX}
              y={thumbY}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={15}
              fontFamily="'Roboto', sans-serif"
              fontWeight="500"
              fill="#ffffff"
              style={{ pointerEvents: "none" }}
            >
              {mode === "hour"
                ? hour % 12 || 12
                : String(minute).padStart(2, "0")}
            </text>
          </svg>
        </div>

        {/* ── Actions ── */}
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{ background: "#3a3a3a" }}
        >
          {/* Keyboard icon */}
          <button
            className="w-10 h-10 flex items-center justify-center rounded-full transition-colors hover:bg-white/10"
            title="Type time"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="6" width="20" height="13" rx="2" />
              <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8" />
            </svg>
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={() => { setHour(2); setMinute(0); setAmpm("AM"); setMode("hour"); }}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-white/10"
              style={{ color: "rgba(255,255,255,0.7)", fontFamily: "'Roboto', sans-serif" }}
            >
              Clear
            </button>
            <button
              className="px-4 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-white/10"
              style={{ color: "rgba(255,255,255,0.7)", fontFamily: "'Roboto', sans-serif" }}
            >
              Cancel
            </button>
            <button
              className="px-5 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
              style={{
                background: NAVY,
                color: "#ffffff",
                fontFamily: "'Roboto', sans-serif",
              }}
            >
              Set
            </button>
          </div>
        </div>

        {/* ── Save Schedule button (context) ── */}
        <div className="px-4 pb-5" style={{ background: "#3a3a3a" }}>
          <button
            className="w-full py-3 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: NAVY }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            Save Schedule
          </button>
        </div>
      </div>
    </div>
  );
}
