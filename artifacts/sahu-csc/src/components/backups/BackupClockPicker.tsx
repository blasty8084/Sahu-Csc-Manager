/**
 * BackupClockPicker — 3 visual design variants for the backup schedule time picker.
 * All variants accept a 24-h "HH:MM" value and fire onChange with the same format.
 */

import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function to12h(hhmm: string): { h: number; m: number; ampm: "AM" | "PM" } {
  const [hh, mm] = hhmm.split(":").map(Number);
  return { h: hh % 12 || 12, m: mm, ampm: hh >= 12 ? "PM" : "AM" };
}

function to24h(h: number, m: number, ampm: "AM" | "PM"): string {
  let hh = h % 12;
  if (ampm === "PM") hh += 12;
  return `${String(hh).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

interface ClockPickerProps {
  value: string;        // "HH:MM" 24-h
  onChange: (v: string) => void;
}

// ─── Design 1: Digital Alarm ──────────────────────────────────────────────────
// Dark navy panel, large orange monospace digits, +/- buttons top and bottom.

export function ClockDesign1({ value, onChange }: ClockPickerProps) {
  const { h, m, ampm } = to12h(value);

  const setH = (next: number) => onChange(to24h(mod(next - 1, 12) + 1, m, ampm));
  const setM = (next: number) => onChange(to24h(h, mod(next, 60), ampm));
  const toggleAmpm = () => onChange(to24h(h, m, ampm === "AM" ? "PM" : "AM"));

  const Digit = ({ val, onUp, onDown }: { val: string; onUp: () => void; onDown: () => void }) => (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={onUp}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-[var(--brand-orange)] hover:bg-white/10 transition-colors"
        type="button"
      >
        <ChevronUp size={18} />
      </button>
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl font-black text-[var(--brand-orange)] tracking-tight"
        style={{ fontFamily: "monospace", background: "rgba(255,255,255,0.07)", textShadow: "0 0 18px rgba(249,115,22,0.5)" }}
      >
        {val}
      </div>
      <button
        onClick={onDown}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-[var(--brand-orange)] hover:bg-white/10 transition-colors"
        type="button"
      >
        <ChevronDown size={18} />
      </button>
    </div>
  );

  return (
    <div
      className="rounded-2xl px-5 py-4 flex flex-col items-center gap-3"
      style={{ background: "linear-gradient(160deg, #0b1e45 0%, #0f2460 60%, #122a6e 100%)" }}
    >
      {/* Label */}
      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">Backup Time (IST)</p>

      {/* Digits row */}
      <div className="flex items-center gap-3">
        <Digit
          val={String(h).padStart(2, "0")}
          onUp={() => setH(h === 12 ? 1 : h + 1)}
          onDown={() => setH(h === 1 ? 12 : h - 1)}
        />

        {/* Colon separator */}
        <div className="flex flex-col gap-2 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-orange)] opacity-80" style={{ boxShadow: "0 0 6px rgba(249,115,22,0.7)" }} />
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-orange)] opacity-80" style={{ boxShadow: "0 0 6px rgba(249,115,22,0.7)" }} />
        </div>

        <Digit
          val={String(m).padStart(2, "0")}
          onUp={() => setM(m + 1)}
          onDown={() => setM(m - 1)}
        />

        {/* AM/PM */}
        <button
          onClick={toggleAmpm}
          className="flex flex-col items-center gap-1 ml-1"
          type="button"
        >
          {(["AM", "PM"] as const).map((p) => (
            <span
              key={p}
              className="px-2 py-0.5 rounded-md text-[11px] font-bold transition-all"
              style={
                p === ampm
                  ? { background: "var(--brand-orange)", color: "#fff", boxShadow: "0 0 10px rgba(249,115,22,0.5)" }
                  : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.25)" }
              }
            >
              {p}
            </span>
          ))}
        </button>
      </div>

      {/* Decorative scanline bar */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <p className="text-[9px] text-white/20 font-mono tracking-widest">
        {String(h).padStart(2, "0")}:{String(m).padStart(2, "0")} {ampm} IST
      </p>
    </div>
  );
}

// ─── Design 2: Minimal Segments ───────────────────────────────────────────────
// Light card, two pill boxes (HH · MM) with chevron controls, orange accent.

export function ClockDesign2({ value, onChange }: ClockPickerProps) {
  const { h, m, ampm } = to12h(value);

  const [focus, setFocus] = useState<"h" | "m" | null>(null);

  const setH = (next: number) => onChange(to24h(mod(next - 1, 12) + 1, m, ampm));
  const setM = (next: number) => onChange(to24h(h, mod(next, 60), ampm));
  const toggleAmpm = () => onChange(to24h(h, m, ampm === "AM" ? "PM" : "AM"));

  const Unit = ({
    label, val, id, onUp, onDown,
  }: { label: string; val: string; id: "h" | "m"; onUp: () => void; onDown: () => void }) => {
    const active = focus === id;
    return (
      <div className="flex flex-col items-center gap-1" onFocus={() => setFocus(id)} onBlur={() => setFocus(null)}>
        <button
          type="button"
          onClick={onUp}
          className="w-8 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--brand-navy-800)] hover:text-white text-slate-400"
        >
          <ChevronUp size={16} />
        </button>

        <div
          className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center transition-all duration-150 border-2"
          style={{
            borderColor: active ? "var(--brand-navy-800)" : "#e2e8f0",
            background: active ? "var(--brand-navy-800)" : "#f8fafc",
            boxShadow: active ? "0 4px 16px rgba(11,44,96,0.2)" : "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <span
            className="text-2xl font-black tracking-tight leading-none"
            style={{ color: active ? "#fff" : "var(--brand-navy-800)", fontFamily: "monospace" }}
          >
            {val}
          </span>
          <span className="text-[9px] font-semibold mt-0.5 uppercase tracking-widest" style={{ color: active ? "rgba(255,255,255,0.5)" : "#94a3b8" }}>
            {label}
          </span>
        </div>

        <button
          type="button"
          onClick={onDown}
          className="w-8 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--brand-navy-800)] hover:text-white text-slate-400"
        >
          <ChevronDown size={16} />
        </button>
      </div>
    );
  };

  return (
    <div className="flex items-center justify-center gap-2 py-3">
      <Unit
        label="HR"
        val={String(h).padStart(2, "0")}
        id="h"
        onUp={() => setH(h === 12 ? 1 : h + 1)}
        onDown={() => setH(h === 1 ? 12 : h - 1)}
      />

      <span className="text-2xl font-black text-slate-300 mb-2">:</span>

      <Unit
        label="MIN"
        val={String(m).padStart(2, "0")}
        id="m"
        onUp={() => setM(m + 1)}
        onDown={() => setM(m - 1)}
      />

      {/* AM / PM pill toggle */}
      <div className="flex flex-col gap-1 mb-2 ml-1">
        {(["AM", "PM"] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={toggleAmpm}
            className="px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all"
            style={
              p === ampm
                ? { background: "var(--brand-orange)", color: "#fff", boxShadow: "0 2px 8px rgba(249,115,22,0.35)" }
                : { background: "#f1f5f9", color: "#94a3b8" }
            }
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Design 3: Circular / Watch Face ─────────────────────────────────────────
// Circular dial with gradient ring, large centred time, tap hour/minute to cycle.

export function ClockDesign3({ value, onChange }: ClockPickerProps) {
  const { h, m, ampm } = to12h(value);
  const [editing, setEditing] = useState<"h" | "m">("h");

  const setH = (delta: number) => onChange(to24h(mod(h + delta - 1, 12) + 1, m, ampm));
  const setM = (delta: number) => onChange(to24h(h, mod(m + delta, 60), ampm));
  const toggleAmpm = () => onChange(to24h(h, m, ampm === "AM" ? "PM" : "AM"));

  // Tick mark positions
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * 30 - 90) * (Math.PI / 180);
    const r = 44;
    return { x: 50 + r * Math.cos(angle), y: 50 + r * Math.sin(angle), major: i % 3 === 0 };
  });

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      {/* Circular dial */}
      <div className="relative" style={{ width: 140, height: 140 }}>
        {/* Gradient ring */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
          <defs>
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--brand-navy-800)" />
              <stop offset="60%" stopColor="#1e40af" />
              <stop offset="100%" stopColor="var(--brand-orange)" />
            </linearGradient>
          </defs>
          {/* Outer decorative ring */}
          <circle cx="50" cy="50" r="48" fill="none" stroke="url(#ringGrad)" strokeWidth="2.5" opacity="0.6" />
          {/* Inner fill */}
          <circle cx="50" cy="50" r="44" fill="#f8fafc" />
          {/* Tick marks */}
          {ticks.map((t, i) => (
            <circle key={i} cx={t.x} cy={t.y} r={t.major ? 1.8 : 0.9}
              fill={t.major ? "var(--brand-navy-800)" : "#cbd5e1"} opacity={t.major ? 0.8 : 0.5} />
          ))}
        </svg>

        {/* Centre time display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="flex items-baseline gap-0.5">
            <button
              type="button"
              onClick={() => setEditing("h")}
              className="text-[22px] font-black leading-none transition-colors"
              style={{ fontFamily: "monospace", color: editing === "h" ? "var(--brand-orange)" : "var(--brand-navy-800)" }}
            >
              {String(h).padStart(2, "0")}
            </button>
            <span className="text-[22px] font-black text-slate-300 leading-none" style={{ fontFamily: "monospace" }}>:</span>
            <button
              type="button"
              onClick={() => setEditing("m")}
              className="text-[22px] font-black leading-none transition-colors"
              style={{ fontFamily: "monospace", color: editing === "m" ? "var(--brand-orange)" : "var(--brand-navy-800)" }}
            >
              {String(m).padStart(2, "0")}
            </button>
          </div>
          <button
            type="button"
            onClick={toggleAmpm}
            className="mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
            style={{ background: "var(--brand-orange)", color: "#fff", fontSize: 10 }}
          >
            {ampm}
          </button>
        </div>
      </div>

      {/* +/- controls */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => editing === "h" ? setH(-1) : setM(-1)}
          className="w-9 h-9 rounded-xl border-2 border-slate-200 flex items-center justify-center text-lg font-bold text-slate-500 hover:border-[var(--brand-navy-800)] hover:text-[var(--brand-navy-800)] hover:bg-slate-50 transition-all"
        >
          −
        </button>

        <span className="text-xs text-slate-400 font-medium w-16 text-center">
          {editing === "h" ? "Hour" : "Minute"}
        </span>

        <button
          type="button"
          onClick={() => editing === "h" ? setH(1) : setM(1)}
          className="w-9 h-9 rounded-xl border-2 border-slate-200 flex items-center justify-center text-lg font-bold text-slate-500 hover:border-[var(--brand-orange)] hover:text-[var(--brand-orange)] hover:bg-slate-50 transition-all"
        >
          +
        </button>
      </div>

      <p className="text-[9px] text-slate-400 font-medium uppercase tracking-widest">
        Tap hour or minute · then − / +
      </p>
    </div>
  );
}
