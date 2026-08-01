import { useState } from "react";
import { Delete, Clock } from "lucide-react";

// Digits entered: [H1, H2, M1, M2] — 4 slots
// Display: HH:MM
// Cursor advances automatically; backspace removes last
// Shows period toggle (AM/PM)

export function NumpadEntry() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("02:00");
  const [digits, setDigits] = useState<number[]>([]);
  const [period, setPeriod] = useState<"AM" | "PM">("AM");

  function openPicker() {
    const [h24, m] = value.split(":").map(Number);
    const p: "AM" | "PM" = h24 < 12 ? "AM" : "PM";
    const h12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;
    // Pre-fill digits
    const hStr = String(h12).padStart(2, "0");
    const mStr = String(m).padStart(2, "0");
    setDigits([+hStr[0], +hStr[1], +mStr[0], +mStr[1]]);
    setPeriod(p);
    setOpen(true);
  }

  function pressDigit(d: number) {
    setDigits(prev => {
      if (prev.length >= 4) return prev;
      const next = [...prev, d];
      // Validate hour first digit: max 1 (12h)
      if (next.length === 1 && d > 1) return prev; // reject >1 as first digit
      if (next.length === 2) {
        const h = next[0] * 10 + next[1];
        if (h < 1 || h > 12) return prev;
      }
      if (next.length === 3 && d > 5) return prev; // minute tens max 5
      return next;
    });
  }

  function backspace() {
    setDigits(prev => prev.slice(0, -1));
  }

  function handleSet() {
    if (digits.length < 4) return;
    const h12 = digits[0] * 10 + digits[1];
    const m = digits[2] * 10 + digits[3];
    const h24 = period === "AM" ? (h12 === 12 ? 0 : h12) : (h12 === 12 ? 12 : h12 + 12);
    setValue(`${String(h24).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    setOpen(false);
  }

  // Display string: fill from left, dash for unfilled
  function getDisplay() {
    const h1 = digits[0] !== undefined ? digits[0] : "–";
    const h2 = digits[1] !== undefined ? digits[1] : "–";
    const m1 = digits[2] !== undefined ? digits[2] : "–";
    const m2 = digits[3] !== undefined ? digits[3] : "–";
    return { h1, h2, m1, m2 };
  }

  const [h24raw, mraw] = value.split(":").map(Number);
  const p = h24raw < 12 ? "AM" : "PM";
  const h12 = h24raw === 0 ? 12 : h24raw > 12 ? h24raw - 12 : h24raw;
  const displayTime = `${String(h12).padStart(2,"0")}:${String(mraw).padStart(2,"0")} ${p}`;

  const NUMPAD = [[1,2,3],[4,5,6],[7,8,9],[null,0,"del"]] as const;
  const { h1, h2, m1, m2 } = getDisplay();
  const ready = digits.length === 4;
  const cursor = digits.length; // 0..4

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#f8fafc" }}>
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
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="w-full max-w-sm bg-white rounded-t-3xl shadow-2xl overflow-hidden">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-slate-200" />
            </div>

            {/* Header */}
            <div className="px-6 pt-2 pb-5">
              <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-4">Enter Time</p>

              {/* Digit display */}
              <div className="flex items-center justify-center gap-2">
                {/* Hours */}
                <div className="flex gap-1.5">
                  {[0, 1].map(i => (
                    <div
                      key={i}
                      className="w-14 h-16 rounded-xl flex items-center justify-center text-3xl font-black tabular-nums transition-all"
                      style={{
                        background: cursor === i ? "#fff7ed" : "#f8fafc",
                        border: cursor === i ? "2px solid #f97316" : "2px solid #e2e8f0",
                        color: digits[i] !== undefined ? "#0f172a" : "#cbd5e1",
                      }}
                    >
                      {i === 0 ? h1 : h2}
                    </div>
                  ))}
                </div>

                <span className="text-3xl font-black text-slate-300 mb-1">:</span>

                {/* Minutes */}
                <div className="flex gap-1.5">
                  {[2, 3].map(i => (
                    <div
                      key={i}
                      className="w-14 h-16 rounded-xl flex items-center justify-center text-3xl font-black tabular-nums transition-all"
                      style={{
                        background: cursor === i ? "#fff7ed" : "#f8fafc",
                        border: cursor === i ? "2px solid #f97316" : "2px solid #e2e8f0",
                        color: digits[i] !== undefined ? "#0f172a" : "#cbd5e1",
                      }}
                    >
                      {i === 2 ? m1 : m2}
                    </div>
                  ))}
                </div>

                {/* AM/PM */}
                <div className="flex flex-col gap-1.5 ml-1">
                  {(["AM","PM"] as const).map(pp => (
                    <button
                      key={pp}
                      onClick={() => setPeriod(pp)}
                      className="w-12 h-[30px] rounded-lg text-xs font-bold transition-all"
                      style={{
                        background: period === pp ? "#0f172a" : "#f1f5f9",
                        color: period === pp ? "white" : "#94a3b8",
                      }}
                    >{pp}</button>
                  ))}
                </div>
              </div>

              <p className="text-center text-xs text-slate-400 mt-3">
                {cursor < 2 ? "Enter hours (01–12)" : cursor < 4 ? "Enter minutes (00–59)" : "Ready to confirm"}
              </p>
            </div>

            {/* Numpad */}
            <div className="px-4 pb-4 grid grid-cols-3 gap-2">
              {NUMPAD.flat().map((k, i) => {
                if (k === null) return <div key={i} />;
                if (k === "del") return (
                  <button
                    key={i}
                    onClick={backspace}
                    disabled={digits.length === 0}
                    className="h-14 rounded-2xl flex items-center justify-center text-slate-500 active:scale-95 transition-all disabled:opacity-30"
                    style={{ background: "#f1f5f9" }}
                  >
                    <Delete size={20} />
                  </button>
                );
                return (
                  <button
                    key={i}
                    onClick={() => pressDigit(k)}
                    disabled={digits.length >= 4}
                    className="h-14 rounded-2xl text-xl font-semibold text-slate-800 active:scale-95 transition-all disabled:opacity-40 hover:bg-slate-100"
                    style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0" }}
                  >
                    {k}
                  </button>
                );
              })}
            </div>

            {/* Actions */}
            <div className="px-4 pb-6 flex gap-3">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSet}
                disabled={!ready}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-40"
                style={{ background: ready ? "#0f172a" : "#94a3b8", color: "white" }}
              >
                Set Time
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
