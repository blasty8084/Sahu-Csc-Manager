import { useState, useRef, useCallback } from "react";
import { Clock } from "lucide-react";

type Mode = "hour" | "minute";

function polarToAngle(cx: number, cy: number, x: number, y: number) {
  return Math.atan2(y - cy, x - cx);
}

function AngleToClock(angle: number, steps: number) {
  // convert trig angle (0=right, CCW positive) to clock position (0=top, CW positive)
  let deg = (angle * 180) / Math.PI;
  deg = 90 - deg; // rotate so 0 is at top
  if (deg < 0) deg += 360;
  return Math.round((deg / 360) * steps) % steps;
}

const HOUR_LABELS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MIN_LABELS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

function ClockFace({ mode, hour, minute, onHourChange, onMinuteChange }: {
  mode: Mode; hour: number; minute: number;
  onHourChange: (h: number) => void; onMinuteChange: (m: number) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const SIZE = 260;
  const R = SIZE / 2;
  const HAND_R = 96;
  const DOT_R = 32;

  const getCenter = () => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { cx: R, cy: R };
    return { cx: rect.width / 2, cy: rect.height / 2 };
  };

  const handlePointer = useCallback((clientX: number, clientY: number) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const angle = polarToAngle(cx, cy, x, y);
    if (mode === "hour") {
      const h = AngleToClock(angle, 12);
      onHourChange(h === 0 ? 12 : h);
    } else {
      const m = AngleToClock(angle, 60);
      onMinuteChange(m);
    }
  }, [mode, onHourChange, onMinuteChange]);

  const [dragging, setDragging] = useState(false);

  function onPointerDown(e: React.PointerEvent) {
    setDragging(true);
    (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);
    handlePointer(e.clientX, e.clientY);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    handlePointer(e.clientX, e.clientY);
  }
  function onPointerUp(e: React.PointerEvent) {
    setDragging(false);
    (e.currentTarget as SVGSVGElement).releasePointerCapture(e.pointerId);
  }

  // Hand angle
  const handAngle = mode === "hour"
    ? ((hour % 12) / 12) * 360 - 90
    : (minute / 60) * 360 - 90;
  const handRad = (handAngle * Math.PI) / 180;
  const hx = R + HAND_R * Math.cos(handRad);
  const hy = R + HAND_R * Math.sin(handRad);

  // Labels
  const labels = mode === "hour" ? HOUR_LABELS : MIN_LABELS;
  const selectedVal = mode === "hour" ? hour : minute;

  return (
    <svg
      ref={svgRef}
      width={SIZE} height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="cursor-pointer touch-none select-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* Outer ring */}
      <circle cx={R} cy={R} r={R - 4} fill="white" stroke="#f1f5f9" strokeWidth="2" />

      {/* Center dot */}
      <circle cx={R} cy={R} r={5} fill="#1e3a5f" />

      {/* Hand */}
      <line x1={R} y1={R} x2={hx} y2={hy} stroke="#1e3a5f" strokeWidth="2.5" strokeLinecap="round" />

      {/* Selected dot */}
      <circle cx={hx} cy={hy} r={DOT_R / 2} fill="#f97316" />

      {/* Labels */}
      {labels.map((label, i) => {
        const angle = (i / 12) * 360 - 90;
        const rad = (angle * Math.PI) / 180;
        const lx = R + (HAND_R) * Math.cos(rad);
        const ly = R + (HAND_R) * Math.sin(rad);
        const isSelected = label === selectedVal || (mode === "minute" && label === Math.round(selectedVal / 5) * 5 % 60);
        return (
          <text
            key={label}
            x={lx} y={ly}
            textAnchor="middle" dominantBaseline="central"
            fill={isSelected ? "white" : "#334155"}
            fontSize={isSelected ? 15 : 14}
            fontWeight={isSelected ? 700 : 400}
            fontFamily="Inter, sans-serif"
            style={{ pointerEvents: "none" }}
          >
            {mode === "minute" ? String(label).padStart(2, "0") : label}
          </text>
        );
      })}
    </svg>
  );
}

export function AnalogDial() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("14:30");
  const [mode, setMode] = useState<Mode>("hour");
  const [hour, setHour] = useState(2);  // 12h
  const [minute, setMinute] = useState(30);
  const [period, setPeriod] = useState<"AM" | "PM">("PM");

  function openPicker() {
    const [h24, m] = value.split(":").map(Number);
    const p: "AM" | "PM" = h24 < 12 ? "AM" : "PM";
    const h12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;
    setHour(h12); setMinute(m); setPeriod(p);
    setMode("hour");
    setOpen(true);
  }

  function handleHourChange(h: number) {
    setHour(h);
    setTimeout(() => setMode("minute"), 300);
  }

  function handleSet() {
    const h24 = period === "AM" ? (hour === 12 ? 0 : hour) : (hour === 12 ? 12 : hour + 12);
    setValue(`${String(h24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
    setOpen(false);
  }

  const [h24raw, mraw] = value.split(":").map(Number);
  const p = h24raw < 12 ? "AM" : "PM";
  const h12 = h24raw === 0 ? 12 : h24raw > 12 ? h24raw - 12 : h24raw;
  const displayTime = `${String(h12).padStart(2,"0")}:${String(mraw).padStart(2,"0")} ${p}`;

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#f0f4f8" }}>
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-3">Backup Time</p>
          <button
            onClick={openPicker}
            className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
              <Clock size={16} className="text-orange-500" />
            </div>
            <span className="font-semibold text-slate-800 text-lg font-mono">{displayTime}</span>
            <span className="ml-auto text-xs text-slate-400">tap to change</span>
          </button>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: "rgba(0,0,0,0.55)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="w-full max-w-sm bg-white rounded-t-3xl shadow-2xl overflow-hidden">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-slate-200" />
            </div>

            {/* Time display + mode tabs */}
            <div className="px-6 pt-2 pb-4" style={{ background: "#0f172a" }}>
              <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold mb-3">
                {mode === "hour" ? "Select Hour" : "Select Minute"}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setMode("hour")}
                  className="text-5xl font-black tabular-nums transition-colors rounded-lg px-2 py-1"
                  style={{ color: mode === "hour" ? "#f97316" : "white" }}
                >
                  {String(hour).padStart(2, "0")}
                </button>
                <span className="text-5xl font-black text-slate-600">:</span>
                <button
                  onClick={() => setMode("minute")}
                  className="text-5xl font-black tabular-nums transition-colors rounded-lg px-2 py-1"
                  style={{ color: mode === "minute" ? "#f97316" : "white" }}
                >
                  {String(minute).padStart(2, "0")}
                </button>
                <div className="ml-3 flex flex-col gap-1">
                  {(["AM","PM"] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setPeriod(p)}
                      className="px-2 py-1 rounded-md text-sm font-bold transition-all"
                      style={{
                        background: period === p ? "#f97316" : "transparent",
                        color: period === p ? "white" : "#94a3b8",
                      }}
                    >{p}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Clock face */}
            <div className="flex justify-center py-4 bg-white">
              <ClockFace
                mode={mode} hour={hour} minute={minute}
                onHourChange={handleHourChange}
                onMinuteChange={setMinute}
              />
            </div>

            {/* Actions */}
            <div className="px-4 pb-5 flex gap-3">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSet}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm text-white transition-colors"
                style={{ background: "#f97316" }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
