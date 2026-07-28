import { useState, useRef, useEffect } from "react";
import { Clock } from "lucide-react";

interface ClockTimePickerProps {
  value: string; // "HH:MM" 24h
  onChange: (value: string) => void;
}

function to12(h24: number): { h: number; period: "AM" | "PM" } {
  const period: "AM" | "PM" = h24 < 12 ? "AM" : "PM";
  const h = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;
  return { h, period };
}

function to24(h12: number, period: "AM" | "PM"): number {
  if (period === "AM") return h12 === 12 ? 0 : h12;
  return h12 === 12 ? 12 : h12 + 12;
}

export function ClockTimePicker({ value, onChange }: ClockTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"hour" | "minute">("hour");

  const [h24, m] = value.split(":").map(Number);
  const { h: initH, period: initPeriod } = to12(h24 || 0);

  const [hour, setHour] = useState(initH || 12);
  const [minute, setMinute] = useState(m || 0);
  const [period, setPeriod] = useState<"AM" | "PM">(initPeriod);

  // Sync state when value changes externally
  useEffect(() => {
    const [h, mn] = value.split(":").map(Number);
    const { h: h12, period: p } = to12(h || 0);
    setHour(h12);
    setMinute(mn || 0);
    setPeriod(p);
  }, [value]);

  function openPicker() {
    setMode("hour");
    setOpen(true);
  }

  function handleSet() {
    const h = to24(hour, period);
    onChange(`${String(h).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
    setOpen(false);
  }

  function handleClear() {
    onChange("00:00");
    setOpen(false);
  }

  // Clock face interactions
  const clockRef = useRef<SVGSVGElement>(null);

  function angleFromEvent(e: React.PointerEvent | React.TouchEvent) {
    const svg = clockRef.current;
    if (!svg) return 0;
    const rect = svg.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let clientX: number, clientY: number;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    const angle = Math.atan2(clientY - cy, clientX - cx) * (180 / Math.PI) + 90;
    return ((angle % 360) + 360) % 360;
  }

  function pickFromAngle(angle: number) {
    if (mode === "hour") {
      const h = Math.round(angle / 30) % 12 || 12;
      setHour(h);
    } else {
      const mn = Math.round(angle / 6) % 60;
      setMinute(mn);
    }
  }

  const isDragging = useRef(false);

  function onPointerDown(e: React.PointerEvent) {
    isDragging.current = true;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pickFromAngle(angleFromEvent(e));
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!isDragging.current) return;
    pickFromAngle(angleFromEvent(e));
  }
  function onPointerUp(e: React.PointerEvent) {
    if (!isDragging.current) return;
    isDragging.current = false;
    pickFromAngle(angleFromEvent(e));
    if (mode === "hour") setMode("minute");
  }

  // Clock geometry
  const SIZE = 240;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const R = 95;

  const handAngle =
    mode === "hour"
      ? ((hour % 12) / 12) * 360 - 90
      : (minute / 60) * 360 - 90;

  const handRad = (handAngle * Math.PI) / 180;
  const handX = CX + R * 0.78 * Math.cos(handRad);
  const handY = CY + R * 0.78 * Math.sin(handRad);

  const ticks = mode === "hour"
    ? Array.from({ length: 12 }, (_, i) => i + 1)
    : Array.from({ length: 12 }, (_, i) => i * 5);

  const displayHour = String(hour).padStart(2, "0");
  const displayMin = String(minute).padStart(2, "0");
  const displayValue = value
    ? `${String(h24).padStart(2, "0")}:${String(m).padStart(2, "0")}`
    : "--:--";

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={openPicker}
        className="w-full flex items-center gap-2.5 px-3 py-2 border border-slate-200 dark:border-zinc-600 rounded-lg bg-slate-50 dark:bg-zinc-700 hover:bg-white dark:hover:bg-zinc-600 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand-navy-800)]/30"
      >
        <Clock size={15} className="text-[var(--brand-navy-800)] dark:text-blue-300 shrink-0" />
        <span className="text-sm font-mono font-semibold text-slate-700 dark:text-zinc-100 tracking-wide">
          {displayValue}
        </span>
        <span className="ml-auto text-[10px] font-medium text-slate-400 dark:text-zinc-400 uppercase tracking-wider">
          24h
        </span>
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{ background: "rgba(0,0,0,0.55)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="w-full max-w-xs mx-4 mb-4 sm:mb-0 rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: "linear-gradient(160deg, #0f1f3d 0%, #1a2e52 100%)" }}>

            {/* Time display */}
            <div className="px-6 pt-5 pb-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-blue-300/60 mb-2">
                Select time
              </p>
              <div className="flex items-baseline gap-1">
                <button
                  onClick={() => setMode("hour")}
                  className={`text-5xl font-bold tabular-nums tracking-tight transition-colors rounded px-1 -mx-1 ${
                    mode === "hour"
                      ? "text-white"
                      : "text-blue-300/50 hover:text-blue-200/70"
                  }`}
                >
                  {displayHour}
                </button>
                <span className="text-4xl font-bold text-white/40 select-none">:</span>
                <button
                  onClick={() => setMode("minute")}
                  className={`text-5xl font-bold tabular-nums tracking-tight transition-colors rounded px-1 -mx-1 ${
                    mode === "minute"
                      ? "text-white"
                      : "text-blue-300/50 hover:text-blue-200/70"
                  }`}
                >
                  {displayMin}
                </button>

                {/* AM/PM */}
                <div className="ml-3 flex flex-col gap-1">
                  {(["AM", "PM"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPeriod(p)}
                      className={`text-xs font-bold px-2 py-0.5 rounded transition-colors ${
                        period === p
                          ? "bg-[var(--brand-orange)] text-white"
                          : "text-blue-200/50 hover:text-blue-200/80"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mode indicator */}
              <div className="flex gap-3 mt-3">
                {(["hour", "minute"] as const).map((md) => (
                  <button
                    key={md}
                    onClick={() => setMode(md)}
                    className={`text-[10px] font-semibold uppercase tracking-wider pb-1 border-b-2 transition-colors ${
                      mode === md
                        ? "border-[var(--brand-orange)] text-white"
                        : "border-transparent text-blue-300/40 hover:text-blue-300/60"
                    }`}
                  >
                    {md}
                  </button>
                ))}
              </div>
            </div>

            {/* Clock face */}
            <div className="flex justify-center px-4 pb-3">
              <div
                className="rounded-full"
                style={{
                  background: "radial-gradient(circle, #162444 60%, #0d1a33 100%)",
                  padding: 4,
                  boxShadow: "inset 0 2px 12px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)",
                }}
              >
                <svg
                  ref={clockRef}
                  width={SIZE}
                  height={SIZE}
                  viewBox={`0 0 ${SIZE} ${SIZE}`}
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  style={{ touchAction: "none", cursor: "pointer", borderRadius: "50%", display: "block" }}
                >
                  {/* Clock ring */}
                  <circle cx={CX} cy={CY} r={R + 6} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

                  {/* Tick marks */}
                  {Array.from({ length: 60 }, (_, i) => {
                    const a = (i / 60) * 2 * Math.PI - Math.PI / 2;
                    const isMajor = i % 5 === 0;
                    const r1 = R - (isMajor ? 10 : 5);
                    const r2 = R - 2;
                    return (
                      <line
                        key={i}
                        x1={CX + r1 * Math.cos(a)} y1={CY + r1 * Math.sin(a)}
                        x2={CX + r2 * Math.cos(a)} y2={CY + r2 * Math.sin(a)}
                        stroke={isMajor ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.07)"}
                        strokeWidth={isMajor ? 1.5 : 1}
                      />
                    );
                  })}

                  {/* Hour/minute labels */}
                  {ticks.map((val, i) => {
                    const a = ((i + 1) / 12) * 2 * Math.PI - Math.PI / 2;
                    const lr = R - 22;
                    const tx = CX + lr * Math.cos(a);
                    const ty = CY + lr * Math.sin(a);
                    const isSelected =
                      mode === "hour" ? val === hour : val === minute;
                    return (
                      <text
                        key={val}
                        x={tx}
                        y={ty}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={isSelected ? 13 : 11}
                        fontWeight={isSelected ? "700" : "500"}
                        fill={isSelected ? "#fff" : "rgba(255,255,255,0.45)"}
                      >
                        {String(val).padStart(2, "0")}
                      </text>
                    );
                  })}

                  {/* Hand */}
                  <line
                    x1={CX}
                    y1={CY}
                    x2={handX}
                    y2={handY}
                    stroke="var(--brand-orange)"
                    strokeWidth={2}
                    strokeLinecap="round"
                  />

                  {/* Center dot */}
                  <circle cx={CX} cy={CY} r={4} fill="var(--brand-orange)" />

                  {/* Selection circle */}
                  <circle
                    cx={handX}
                    cy={handY}
                    r={14}
                    fill="var(--brand-orange)"
                    opacity={0.9}
                  />
                </svg>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between px-5 pb-5 pt-1 gap-2">
              <button
                onClick={handleClear}
                className="text-xs font-semibold text-blue-300/60 hover:text-blue-200 transition-colors px-2 py-1.5"
              >
                Clear
              </button>
              <div className="flex gap-2 ml-auto">
                <button
                  onClick={() => setOpen(false)}
                  className="text-xs font-semibold text-blue-200/70 hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSet}
                  className="text-xs font-bold text-white px-4 py-1.5 rounded-lg transition-colors"
                  style={{ background: "var(--brand-navy-800)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#0a2456")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "var(--brand-navy-800)")}
                >
                  Set
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
