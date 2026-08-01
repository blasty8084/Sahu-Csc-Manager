import { useState, useRef, useEffect, useCallback } from "react";
import { Clock, Check, X } from "lucide-react";

// ── helpers ───────────────────────────────────────────────────────────────────
function to12(h24: number): { h: number; period: "AM" | "PM" } {
  const period: "AM" | "PM" = h24 < 12 ? "AM" : "PM";
  const h = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;
  return { h, period };
}
function to24(h12: number, period: "AM" | "PM"): number {
  if (period === "AM") return h12 === 12 ? 0 : h12;
  return h12 === 12 ? 12 : h12 + 12;
}

// Detects mobile viewport (< 768px). Uses a ref so it never re-renders mid-open.
function useMobile(): boolean {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

// ── Shared trigger button ─────────────────────────────────────────────────────
const HOURS   = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));
const PERIODS: ("AM" | "PM")[] = ["AM", "PM"];
const DRUM_H = 52;

// ═══════════════════════════════════════════════════════════════════════════════
// DESKTOP — Drum Scroll Picker
// ═══════════════════════════════════════════════════════════════════════════════

function DrumColumn({
  items,
  selectedIndex,
  onChange,
  accent = false,
}: {
  items: string[];
  selectedIndex: number;
  onChange: (i: number) => void;
  accent?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const startY       = useRef<number | null>(null);
  const startIdx     = useRef(selectedIndex);
  const didDrag      = useRef(false);

  function onPointerDown(e: React.PointerEvent) {
    didDrag.current = false;
    startY.current  = e.clientY;
    startIdx.current = selectedIndex;
    containerRef.current?.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (startY.current === null) return;
    const delta = e.clientY - startY.current;
    if (Math.abs(delta) > 3) didDrag.current = true;
    const shifted = Math.round(-delta / DRUM_H);
    const next = Math.max(0, Math.min(items.length - 1, startIdx.current + shifted));
    if (next !== selectedIndex) onChange(next);
  }
  function onPointerUp(e: React.PointerEvent) {
    startY.current = null;
    containerRef.current?.releasePointerCapture(e.pointerId);
  }

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden select-none touch-none cursor-grab active:cursor-grabbing"
      style={{ height: DRUM_H * 3 }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* scrolling strip */}
      <div
        className="flex flex-col w-full transition-transform duration-200 ease-out"
        style={{ transform: `translateY(${DRUM_H - selectedIndex * DRUM_H}px)` }}
      >
        {items.map((item, idx) => {
          const dist = Math.abs(idx - selectedIndex);
          return (
            <div
              key={idx}
              onClick={() => { if (!didDrag.current) onChange(idx); }}
              className="flex items-center justify-center"
              style={{ height: DRUM_H }}
            >
              <span style={{
                fontSize:     dist === 0 ? 30 : dist === 1 ? 20 : 15,
                fontWeight:   dist === 0 ? 700 : 400,
                color:        dist === 0 ? (accent ? "#f97316" : "#0f172a") : dist === 1 ? "#94a3b8" : "#cbd5e1",
                letterSpacing: dist === 0 ? "-0.02em" : "0",
                transition:   "all 200ms ease",
              }}>
                {item}
              </span>
            </div>
          );
        })}
      </div>
      {/* selection band */}
      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          top: DRUM_H, height: DRUM_H,
          borderTop: "1.5px solid #e2e8f0",
          borderBottom: "1.5px solid #e2e8f0",
          background: "rgba(248,250,252,0.85)",
        }}
      />
      {/* top fade */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{ height: DRUM_H, background: "linear-gradient(to bottom, white 20%, rgba(255,255,255,0))" }}
      />
      {/* bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: DRUM_H, background: "linear-gradient(to top, white 20%, rgba(255,255,255,0))" }}
      />
    </div>
  );
}

function DrumScrollSheet({
  value, onConfirm, onCancel,
}: { value: string; onConfirm: (v: string) => void; onCancel: () => void }) {
  function indicesFrom(v: string) {
    const [h24, m] = v.split(":").map(Number);
    const { h, period } = to12(h24 || 0);
    return {
      hourIdx:   Math.max(0, HOURS.indexOf(String(h).padStart(2, "0"))),
      minIdx:    Math.max(0, MINUTES.indexOf(String(Math.round((m || 0) / 5) * 5).padStart(2, "0"))),
      periodIdx: period === "AM" ? 0 : 1,
    };
  }

  const init = indicesFrom(value);
  const [hourIdx,   setHourIdx]   = useState(init.hourIdx);
  const [minIdx,    setMinIdx]    = useState(init.minIdx);
  const [periodIdx, setPeriodIdx] = useState(init.periodIdx);

  function handleConfirm() {
    const h24 = to24(Number(HOURS[hourIdx]), PERIODS[periodIdx]);
    onConfirm(`${String(h24).padStart(2, "0")}:${MINUTES[minIdx]}`);
  }

  return (
    /* centered modal on desktop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="w-full max-w-sm mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden">

        {/* header */}
        <div className="px-6 pt-5 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Select Time</h2>
            <p className="text-sm text-slate-400 mt-0.5">Drag to scroll · Tap to select</p>
          </div>
          <div className="text-3xl font-bold text-slate-900 font-mono tabular-nums">
            {HOURS[hourIdx]}:{MINUTES[minIdx]}
            <span className="text-lg ml-1 text-orange-500">{PERIODS[periodIdx]}</span>
          </div>
        </div>

        {/* drums */}
        <div className="px-4 pb-3">
          <div className="flex items-center bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
            <div className="flex-1 min-w-0">
              <DrumColumn items={HOURS}   selectedIndex={hourIdx}   onChange={setHourIdx} />
            </div>
            <div className="text-2xl font-black text-slate-300 px-1 shrink-0">:</div>
            <div className="flex-1 min-w-0">
              <DrumColumn items={MINUTES} selectedIndex={minIdx}    onChange={setMinIdx} />
            </div>
            <div className="w-px self-stretch bg-slate-200 mx-1 shrink-0" />
            <div className="w-[72px] shrink-0">
              <DrumColumn items={PERIODS} selectedIndex={periodIdx} onChange={setPeriodIdx} accent />
            </div>
          </div>
        </div>

        {/* actions */}
        <div className="px-4 pb-5 pt-2 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
          >
            <X size={15} /> Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm text-white transition-colors"
            style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)" }}
          >
            <Check size={15} /> Set Time
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MOBILE — Analog Dial Picker (improved circular touch)
// ═══════════════════════════════════════════════════════════════════════════════

type DialMode = "hour" | "minute";

const HOUR_LABELS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MIN_LABELS  = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

/** Converts a pointer coordinate to a clock value.
 *  Works from ANY position on the face — just reads the angle from center.
 *  steps=12 → hour (0–11, caller converts 0→12), steps=60 → minute. */
function angleToClockValue(
  rect: DOMRect,
  clientX: number,
  clientY: number,
  steps: number,
): number {
  const cx = rect.left + rect.width  / 2;
  const cy = rect.top  + rect.height / 2;
  // atan2 gives angle from positive-x axis, CCW positive
  const raw = Math.atan2(clientY - cy, clientX - cx);
  // Rotate so 0° = top (12 o'clock), increasing clockwise
  let deg = (raw * 180) / Math.PI + 90;
  if (deg < 0) deg += 360;
  return Math.round((deg / 360) * steps) % steps;
}

function DialFace({
  mode, hour, minute, onHourChange, onMinuteChange,
}: {
  mode: DialMode;
  hour: number;    // 1–12
  minute: number;  // 0–59
  onHourChange:   (h: number) => void;
  onMinuteChange: (m: number) => void;
}) {
  const svgRef    = useRef<SVGSVGElement>(null);
  const active    = useRef(false);   // replaces useState(dragging) — sync, no async gap
  const autoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Viewbox is 300×300; SVG fills container width via width="100%"
  const VB   = 300;
  const R    = VB / 2;          // 150
  const HAND = R * 0.63;        // ~95 — radius of number ring & hand tip
  const DOT  = 20;              // touch dot radius

  // Hand endpoint
  const handAngle = mode === "hour"
    ? ((hour % 12) / 12)   * 360 - 90
    : (minute      / 60)   * 360 - 90;
  const handRad = (handAngle * Math.PI) / 180;
  const hx = R + HAND * Math.cos(handRad);
  const hy = R + HAND * Math.sin(handRad);

  const labels    = mode === "hour" ? HOUR_LABELS : MIN_LABELS;
  const selectedV = mode === "hour" ? hour        : minute;

  // ── pointer handlers ──────────────────────────────────────────────────────
  const readAngle = useCallback((e: React.PointerEvent | PointerEvent) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    if (mode === "hour") {
      const raw = angleToClockValue(rect, e.clientX, e.clientY, 12);
      onHourChange(raw === 0 ? 12 : raw);
    } else {
      const raw = angleToClockValue(rect, e.clientX, e.clientY, 60);
      onMinuteChange(raw);
    }
  }, [mode, onHourChange, onMinuteChange]);

  function onPointerDown(e: React.PointerEvent) {
    active.current = true;
    (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);
    readAngle(e);
    // Cancel any pending auto-advance when user starts a new gesture
    if (autoTimer.current) { clearTimeout(autoTimer.current); autoTimer.current = null; }
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!active.current) return;
    readAngle(e);
  }

  function onPointerUp(e: React.PointerEvent) {
    if (!active.current) return;
    active.current = false;
    (e.currentTarget as SVGSVGElement).releasePointerCapture(e.pointerId);
    // Auto-advance hour → minute after user lifts finger
    if (mode === "hour") {
      autoTimer.current = setTimeout(() => {
        onMinuteChange(minute); // keep current minute, just switch mode
        // We signal mode change via a special sentinel so the parent can switch
        onHourChange(-1);       // sentinel: "advance to minute"
      }, 350);
    }
  }

  // Cleanup timer on unmount
  useEffect(() => () => { if (autoTimer.current) clearTimeout(autoTimer.current); }, []);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VB} ${VB}`}
      width="100%"
      style={{ touchAction: "none", userSelect: "none", cursor: "pointer", display: "block" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={(e) => { active.current = false; (e.currentTarget as SVGSVGElement).releasePointerCapture(e.pointerId); }}
    >
      {/* Face background */}
      <circle cx={R} cy={R} r={R - 6} fill="white" stroke="#f1f5f9" strokeWidth="2" />

      {/* Hand line */}
      <line
        x1={R} y1={R} x2={hx} y2={hy}
        stroke="#1e3a5f" strokeWidth="3" strokeLinecap="round"
      />

      {/* Center pivot dot */}
      <circle cx={R} cy={R} r={6} fill="#1e3a5f" />

      {/* Tip dot (touch target indicator) */}
      <circle cx={hx} cy={hy} r={DOT} fill="#f97316" opacity="0.15" />
      <circle cx={hx} cy={hy} r={DOT - 6} fill="#f97316" />

      {/* Number labels */}
      {labels.map((label, i) => {
        const angle  = (i / 12) * 360 - 90;
        const rad    = (angle * Math.PI) / 180;
        const lx     = R + HAND * Math.cos(rad);
        const ly     = R + HAND * Math.sin(rad);
        const isSel  = mode === "hour"
          ? label === selectedV
          : label === (Math.round(selectedV / 5) * 5) % 60;
        return (
          <text
            key={label}
            x={lx} y={ly}
            textAnchor="middle"
            dominantBaseline="central"
            fill={isSel ? "white" : "#334155"}
            fontSize={isSel ? 16 : 14}
            fontWeight={isSel ? 700 : 400}
            fontFamily="Inter, system-ui, sans-serif"
            style={{ pointerEvents: "none" }}
          >
            {mode === "minute" ? String(label).padStart(2, "0") : label}
          </text>
        );
      })}

      {/* Minute tick marks (subtle) */}
      {mode === "minute" && Array.from({ length: 60 }, (_, i) => {
        if (i % 5 === 0) return null;
        const a = (i / 60) * 360 - 90;
        const r = (a * Math.PI) / 180;
        const TICK_IN  = R - 18;
        const TICK_OUT = R - 10;
        return (
          <line
            key={i}
            x1={R + TICK_IN  * Math.cos(r)} y1={R + TICK_IN  * Math.sin(r)}
            x2={R + TICK_OUT * Math.cos(r)} y2={R + TICK_OUT * Math.sin(r)}
            stroke="#e2e8f0" strokeWidth="1.5"
          />
        );
      })}
    </svg>
  );
}

function AnalogDialSheet({
  value, onConfirm, onCancel,
}: { value: string; onConfirm: (v: string) => void; onCancel: () => void }) {
  const [h24Init, mInit] = value.split(":").map(Number);
  const { h: hInit, period: pInit } = to12(h24Init || 0);

  const [mode,   setMode]   = useState<DialMode>("hour");
  const [hour,   setHour]   = useState(hInit);
  const [minute, setMinute] = useState(mInit || 0);
  const [period, setPeriod] = useState<"AM" | "PM">(pInit);

  // Sentinel -1 from DialFace means "advance to minute"
  function handleHourChange(h: number) {
    if (h === -1) { setMode("minute"); return; }
    setHour(h);
  }

  function handleConfirm() {
    const h24 = to24(hour, period);
    onConfirm(`${String(h24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
  }

  return (
    /* bottom sheet on mobile */
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.55)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="w-full max-w-sm bg-white rounded-t-3xl shadow-2xl overflow-hidden">

        {/* drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        {/* header — dark navy bar with live time display */}
        <div className="px-5 pt-3 pb-4" style={{ background: "#0f172a" }}>
          <p className="text-slate-400 text-[10px] uppercase tracking-widest font-semibold mb-2">
            {mode === "hour" ? "Tap or drag to set hour" : "Tap or drag to set minute"}
          </p>
          <div className="flex items-center gap-0.5">
            {/* hour tab */}
            <button
              onClick={() => setMode("hour")}
              className="text-5xl font-black tabular-nums px-2 py-1 rounded-xl transition-all"
              style={{ color: mode === "hour" ? "#f97316" : "rgba(255,255,255,0.85)" }}
            >
              {String(hour).padStart(2, "0")}
            </button>
            <span className="text-5xl font-black" style={{ color: "rgba(255,255,255,0.25)" }}>:</span>
            {/* minute tab */}
            <button
              onClick={() => setMode("minute")}
              className="text-5xl font-black tabular-nums px-2 py-1 rounded-xl transition-all"
              style={{ color: mode === "minute" ? "#f97316" : "rgba(255,255,255,0.85)" }}
            >
              {String(minute).padStart(2, "0")}
            </button>
            {/* AM/PM toggle */}
            <div className="ml-auto flex flex-col gap-1">
              {PERIODS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className="w-12 h-[26px] rounded-lg text-xs font-bold transition-all"
                  style={{
                    background: period === p ? "#f97316" : "rgba(255,255,255,0.08)",
                    color:      period === p ? "white"   : "#64748b",
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* clock face — fills container, max 300px */}
        <div className="px-4 py-3 bg-slate-50">
          <div style={{ maxWidth: 300, margin: "0 auto" }}>
            <DialFace
              mode={mode}
              hour={hour}
              minute={minute}
              onHourChange={handleHourChange}
              onMinuteChange={setMinute}
            />
          </div>
        </div>

        {/* mode indicator dots */}
        <div className="flex justify-center gap-2 pb-2">
          {(["hour", "minute"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className="w-2 h-2 rounded-full transition-all"
              style={{ background: mode === m ? "#f97316" : "#e2e8f0" }}
            />
          ))}
        </div>

        {/* actions */}
        <div className="px-4 pb-6 pt-1 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-3.5 rounded-xl font-bold text-sm text-white transition-colors"
            style={{ background: "#f97316" }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Public export — same props as before
// ═══════════════════════════════════════════════════════════════════════════════

interface ClockTimePickerProps {
  value: string;   // "HH:MM" 24-hour
  onChange: (value: string) => void;
}

export function ClockTimePicker({ value, onChange }: ClockTimePickerProps) {
  const [open, setOpen] = useState(false);
  const isMobile = useMobile();

  // Friendly 24h display on the trigger
  const [h24, m] = value.split(":").map(Number);
  const display = `${String(h24 ?? 0).padStart(2, "0")}:${String(m ?? 0).padStart(2, "0")}`;

  function handleConfirm(v: string) {
    onChange(v);
    setOpen(false);
  }

  return (
    <>
      {/* ── Trigger (unchanged appearance) ── */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-2.5 px-3 py-2 border border-slate-200 dark:border-zinc-600 rounded-lg bg-slate-50 dark:bg-zinc-700 hover:bg-white dark:hover:bg-zinc-600 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand-navy-800)]/30"
      >
        <Clock size={15} className="text-indigo-500 shrink-0" />
        <span className="text-sm font-mono font-semibold text-slate-700 dark:text-zinc-100 tracking-wide">
          {display}
        </span>
        <span className="ml-auto text-[10px] font-medium text-slate-400 dark:text-zinc-400 uppercase tracking-wider">
          24h
        </span>
      </button>

      {/* ── Picker sheet (conditional on screen size) ── */}
      {open && (
        isMobile
          ? <AnalogDialSheet value={value} onConfirm={handleConfirm} onCancel={() => setOpen(false)} />
          : <DrumScrollSheet value={value} onConfirm={handleConfirm} onCancel={() => setOpen(false)} />
      )}
    </>
  );
}
