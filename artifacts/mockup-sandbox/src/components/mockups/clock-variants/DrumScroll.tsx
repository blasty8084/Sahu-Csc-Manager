import { useState, useRef } from "react";
import { Clock, Check, X } from "lucide-react";

const ITEM_H = 52;
const HOURS   = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));
const PERIODS = ["AM", "PM"];

function to12(h24: number) {
  const period: "AM" | "PM" = h24 < 12 ? "AM" : "PM";
  const h = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;
  return { h, period };
}
function to24(h12: number, period: "AM" | "PM") {
  if (period === "AM") return h12 === 12 ? 0 : h12;
  return h12 === 12 ? 12 : h12 + 12;
}

function DrumColumn({ items, selectedIndex, onChange, accent = false }: {
  items: string[]; selectedIndex: number; onChange: (i: number) => void; accent?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);
  const dragStartIdx = useRef(selectedIndex);
  const isDragging = useRef(false);

  function onPointerDown(e: React.PointerEvent) {
    isDragging.current = false;
    dragStartY.current = e.clientY;
    dragStartIdx.current = selectedIndex;
    containerRef.current?.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (dragStartY.current === null) return;
    if (Math.abs(e.clientY - dragStartY.current) > 3) isDragging.current = true;
    const shifted = Math.round(-(e.clientY - dragStartY.current) / ITEM_H);
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
      className="relative h-[156px] overflow-hidden select-none touch-none cursor-grab active:cursor-grabbing"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div
        className="flex flex-col w-full transition-transform duration-200 ease-out"
        style={{ transform: `translateY(${ITEM_H - selectedIndex * ITEM_H}px)` }}
      >
        {items.map((item, idx) => {
          const dist = Math.abs(idx - selectedIndex);
          return (
            <div
              key={idx}
              onClick={() => { if (!isDragging.current) onChange(idx); }}
              className="flex items-center justify-center"
              style={{ height: ITEM_H }}
            >
              <span style={{
                fontSize: dist === 0 ? 32 : dist === 1 ? 22 : 16,
                fontWeight: dist === 0 ? 700 : 400,
                color: dist === 0 ? (accent ? "#f97316" : "#0f172a") : dist === 1 ? "#94a3b8" : "#cbd5e1",
                transition: "all 200ms ease",
                letterSpacing: dist === 0 ? "-0.02em" : "0",
                fontFamily: "'Inter', sans-serif",
              }}>{item}</span>
            </div>
          );
        })}
      </div>
      {/* selection band */}
      <div className="absolute pointer-events-none" style={{
        top: ITEM_H, height: ITEM_H, left: 0, right: 0,
        borderTop: "1.5px solid #e2e8f0",
        borderBottom: "1.5px solid #e2e8f0",
        background: "rgba(248,250,252,0.8)",
      }} />
      {/* fades */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{ height: ITEM_H, background: "linear-gradient(to bottom, white 30%, rgba(255,255,255,0))" }} />
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: ITEM_H, background: "linear-gradient(to top, white 30%, rgba(255,255,255,0))" }} />
    </div>
  );
}

export function DrumScroll() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("02:00");
  const [hourIdx, setHourIdx] = useState(1);   // "02"
  const [minIdx, setMinIdx] = useState(0);     // "00"
  const [periodIdx, setPeriodIdx] = useState(0); // AM

  function openPicker() {
    const [h24, m] = value.split(":").map(Number);
    const { h, period } = to12(h24 || 0);
    setHourIdx(Math.max(0, HOURS.indexOf(String(h).padStart(2, "0"))));
    setMinIdx(Math.max(0, MINUTES.indexOf(String(Math.round((m || 0) / 5) * 5).padStart(2, "0"))));
    setPeriodIdx(period === "AM" ? 0 : 1);
    setOpen(true);
  }

  function handleSet() {
    const h24 = to24(Number(HOURS[hourIdx]), PERIODS[periodIdx] as "AM" | "PM");
    setValue(`${String(h24).padStart(2, "0")}:${MINUTES[minIdx]}`);
    setOpen(false);
  }

  const [h24raw, mraw] = value.split(":").map(Number);
  const { h: displayH, period: displayP } = to12(h24raw || 0);
  const displayTime = `${String(displayH).padStart(2, "0")}:${String(mraw).padStart(2, "0")} ${displayP}`;

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      {/* Trigger card */}
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

      {/* Bottom sheet dialog */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="w-full max-w-sm mb-0 bg-white rounded-t-3xl shadow-2xl overflow-hidden">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-slate-200" />
            </div>

            {/* Header */}
            <div className="px-6 pt-3 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Select Time</h2>
                <p className="text-sm text-slate-400 mt-0.5">Drag to scroll · Tap to select</p>
              </div>
              <div className="text-3xl font-bold text-slate-900 font-mono tabular-nums">
                {HOURS[hourIdx]}:{MINUTES[minIdx]}
                <span className="text-lg ml-1 text-orange-500">{PERIODS[periodIdx]}</span>
              </div>
            </div>

            {/* Drums */}
            <div className="px-4 pb-2">
              <div className="flex items-center bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
                <div className="flex-1"><DrumColumn items={HOURS} selectedIndex={hourIdx} onChange={setHourIdx} /></div>
                <div className="text-2xl font-black text-slate-300 px-1 pb-1">:</div>
                <div className="flex-1"><DrumColumn items={MINUTES} selectedIndex={minIdx} onChange={setMinIdx} /></div>
                <div className="w-px h-24 bg-slate-200 mx-1" />
                <div className="w-20"><DrumColumn items={PERIODS} selectedIndex={periodIdx} onChange={setPeriodIdx} accent /></div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-4 py-4 flex gap-3">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
              >
                <X size={16} /> Cancel
              </button>
              <button
                onClick={handleSet}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm text-white transition-colors"
                style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)" }}
              >
                <Check size={16} /> Set Time
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
