import { useState, useRef } from "react";
import { Clock } from "lucide-react";

// ── helpers ────────────────────────────────────────────────────────────────────
function to12(h24: number): { h: number; period: "AM" | "PM" } {
  const period: "AM" | "PM" = h24 < 12 ? "AM" : "PM";
  const h = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;
  return { h, period };
}
function to24(h12: number, period: "AM" | "PM"): number {
  if (period === "AM") return h12 === 12 ? 0 : h12;
  return h12 === 12 ? 12 : h12 + 12;
}

// ── DrumColumn ─────────────────────────────────────────────────────────────────
const ITEM_H = 48;

function DrumColumn({
  items,
  selectedIndex,
  onChange,
}: {
  items: string[];
  selectedIndex: number;
  onChange: (idx: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);
  const dragStartIdx = useRef<number>(selectedIndex);
  const isDragging = useRef(false);

  function onPointerDown(e: React.PointerEvent) {
    isDragging.current = false;
    dragStartY.current = e.clientY;
    dragStartIdx.current = selectedIndex;
    containerRef.current?.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (dragStartY.current === null) return;
    const delta = e.clientY - dragStartY.current;
    if (Math.abs(delta) > 3) isDragging.current = true;
    const shifted = Math.round(-delta / ITEM_H);
    const next = Math.max(0, Math.min(items.length - 1, dragStartIdx.current + shifted));
    if (next !== selectedIndex) onChange(next);
  }
  function onPointerUp(e: React.PointerEvent) {
    dragStartY.current = null;
    containerRef.current?.releasePointerCapture(e.pointerId);
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[144px] overflow-hidden select-none touch-none cursor-grab active:cursor-grabbing rounded-xl"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* scrolling strip */}
      <div
        className="flex flex-col w-full transition-transform duration-200 ease-out"
        style={{ transform: `translateY(${ITEM_H - selectedIndex * ITEM_H}px)` }}
      >
        {items.map((item, idx) => (
          <div
            key={idx}
            onClick={() => { if (!isDragging.current) onChange(idx); }}
            className={`flex items-center justify-center h-[48px] transition-all duration-200 ${
              idx === selectedIndex
                ? "text-gray-900 font-bold text-2xl tracking-tight"
                : Math.abs(idx - selectedIndex) === 1
                ? "text-gray-400 font-medium text-lg"
                : "text-gray-300 font-medium text-base opacity-40"
            }`}
          >
            {item}
          </div>
        ))}
      </div>

      {/* selection band */}
      <div className="absolute inset-y-[48px] left-1 right-1 border-y-2 border-indigo-100/80 bg-indigo-50/40 pointer-events-none rounded-lg" />
      {/* top fade */}
      <div className="absolute top-0 left-0 right-0 h-[48px] bg-gradient-to-b from-white via-white/80 to-transparent pointer-events-none" />
      {/* bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-[48px] bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
    </div>
  );
}

// ── ClockTimePicker ────────────────────────────────────────────────────────────
interface ClockTimePickerProps {
  value: string; // "HH:MM" 24-hour
  onChange: (value: string) => void;
}

const HOURS   = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));
const PERIODS = ["AM", "PM"];

export function ClockTimePicker({ value, onChange }: ClockTimePickerProps) {
  const [open, setOpen] = useState(false);

  // Derive initial drum indices from the 24h value
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

  function openPicker() {
    // Sync drum positions to the current value each time the picker opens
    const { hourIdx: h, minIdx: m, periodIdx: p } = indicesFrom(value);
    setHourIdx(h);
    setMinIdx(m);
    setPeriodIdx(p);
    setOpen(true);
  }

  function handleSet() {
    const h24 = to24(Number(HOURS[hourIdx]), PERIODS[periodIdx] as "AM" | "PM");
    onChange(`${String(h24).padStart(2, "0")}:${MINUTES[minIdx]}`);
    setOpen(false);
  }

  function handleClear() {
    onChange("00:00");
    setOpen(false);
  }

  // Friendly display on the trigger button
  const [h24raw, mraw] = value.split(":").map(Number);
  const display = value
    ? `${String(h24raw).padStart(2, "0")}:${String(mraw).padStart(2, "0")}`
    : "--:--";

  return (
    <>
      {/* ── Trigger ── */}
      <button
        type="button"
        onClick={openPicker}
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

      {/* ── Dialog ── */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="w-full max-w-[390px] mx-4 mb-4 sm:mb-0 bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">

            {/* header */}
            <div className="px-6 py-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shadow-sm">
                <Clock className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 tracking-tight">Select Time</h2>
                <p className="text-sm text-gray-500 font-medium">Schedule backup</p>
              </div>
            </div>

            {/* drums */}
            <div className="px-6 py-6 bg-slate-50/50 flex flex-col items-center border-y border-gray-100">
              <div className="flex items-center justify-center bg-white rounded-[24px] shadow-sm border border-gray-100 p-3 w-full">
                <div className="flex-1 max-w-[80px]">
                  <DrumColumn items={HOURS}   selectedIndex={hourIdx}   onChange={setHourIdx}   />
                </div>
                <div className="text-3xl font-bold text-gray-300 px-1 flex flex-col justify-center h-[144px]">:</div>
                <div className="flex-1 max-w-[80px]">
                  <DrumColumn items={MINUTES} selectedIndex={minIdx}    onChange={setMinIdx}    />
                </div>
                <div className="w-3" />
                <div className="flex-1 max-w-[80px]">
                  <DrumColumn items={PERIODS} selectedIndex={periodIdx} onChange={setPeriodIdx} />
                </div>
              </div>
            </div>

            {/* actions */}
            <div className="px-5 py-5 bg-white flex items-center justify-between gap-2">
              <button
                onClick={handleClear}
                className="px-4 py-3.5 text-sm font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all active:scale-95"
              >
                Clear
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setOpen(false)}
                  className="px-5 py-3.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSet}
                  className="px-7 py-3.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-600/20 active:scale-95"
                >
                  Set Time
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
