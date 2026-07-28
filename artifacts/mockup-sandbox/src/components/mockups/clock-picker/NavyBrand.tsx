import React, { useState } from 'react';
import { X } from 'lucide-react';

export function NavyBrand() {
  const [mode, setMode] = useState<'hour' | 'minute'>('hour');
  const [hour, setHour] = useState(10);
  const [minute, setMinute] = useState(30);
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');
  const [isDragging, setIsDragging] = useState(false);

  const radius = 105;

  const updateTimeFromEvent = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - 140; 
    const y = e.clientY - rect.top - 140;
    
    let angle = Math.atan2(y, x) * 180 / Math.PI + 90;
    if (angle < 0) angle += 360;

    if (mode === 'hour') {
      let h = Math.round(angle / 30);
      if (h === 0) h = 12;
      setHour(h);
    } else {
      let m = Math.round(angle / 6);
      if (m === 60) m = 0;
      setMinute(m);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    updateTimeFromEvent(e);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      updateTimeFromEvent(e);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      if (mode === 'hour') {
        setTimeout(() => setMode('minute'), 300);
      }
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }
  };

  const hourNumbers = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const minuteNumbers = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
  const numbers = mode === 'hour' ? hourNumbers : minuteNumbers;

  const handAngle = mode === 'hour' ? (hour % 12) * 30 : minute * 6;

  return (
    <div className="w-[390px] h-[844px] bg-slate-900 flex flex-col justify-end items-center font-sans overflow-hidden shadow-2xl relative">
      
      {/* Backdrop overlay */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />

      {/* Bottom Sheet */}
      <div className="w-full bg-slate-50 rounded-t-[32px] overflow-hidden flex flex-col shadow-2xl relative z-10 animate-in slide-in-from-bottom-full duration-300">
        
        {/* Header Strip */}
        <div className="bg-[#1a2b4b] pt-8 pb-10 px-6 flex flex-col items-center relative shadow-lg z-10 rounded-b-[32px]">
          <div className="w-12 h-1.5 bg-white/20 rounded-full absolute top-3 left-1/2 -translate-x-1/2" />
          
          <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
            <X size={20} />
          </button>

          <span className="text-white/60 text-xs font-semibold mb-2 tracking-[0.2em] uppercase mt-2">Select Time</span>
          
          <div className="flex items-baseline gap-2 mt-1">
             <button 
               onClick={() => setMode('hour')}
               className={`text-7xl font-light tracking-tight transition-colors outline-none ${mode === 'hour' ? 'text-white' : 'text-white/40 hover:text-white/60'}`}
             >
               {hour}
             </button>
             <span className="text-5xl font-light text-white/40 relative -top-3">:</span>
             <button 
               onClick={() => setMode('minute')}
               className={`text-7xl font-light tracking-tight transition-colors outline-none ${mode === 'minute' ? 'text-white' : 'text-white/40 hover:text-white/60'}`}
             >
               {minute.toString().padStart(2, '0')}
             </button>
          </div>

          <div className="mt-6 flex bg-[#0f1a2e] rounded-full p-1.5 shadow-inner border border-white/5">
            <button 
              onClick={() => setPeriod('AM')}
              className={`px-8 py-2.5 text-sm font-bold rounded-full transition-all outline-none ${period === 'AM' ? 'bg-[#e87c2e] text-white shadow-lg shadow-[#e87c2e]/20' : 'text-white/40 hover:text-white/70'}`}
            >
              AM
            </button>
            <button 
              onClick={() => setPeriod('PM')}
              className={`px-8 py-2.5 text-sm font-bold rounded-full transition-all outline-none ${period === 'PM' ? 'bg-[#e87c2e] text-white shadow-lg shadow-[#e87c2e]/20' : 'text-white/40 hover:text-white/70'}`}
            >
              PM
            </button>
          </div>
        </div>

        {/* Clock Area */}
        <div className="py-10 flex justify-center items-center relative -mt-4 z-0">
          <div 
            className="w-[280px] h-[280px] rounded-full bg-[#1a2b4b] relative shadow-[0_8px_32px_rgba(26,43,75,0.15),inset_0_4px_16px_rgba(0,0,0,0.5)] flex items-center justify-center border-[6px] border-white touch-none cursor-pointer select-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            {/* Ticks */}
            {Array.from({ length: 60 }).map((_, i) => {
              const isFive = i % 5 === 0;
              const tickAngle = i * 6;
              const isSelectedTick = mode === 'minute' && minute === i;
              return (
                <div
                  key={`tick-${i}`}
                  className="absolute left-1/2 top-1/2 pointer-events-none transition-colors duration-200"
                  style={{
                    width: isFive ? '2px' : '1px',
                    height: isFive ? '8px' : '4px',
                    backgroundColor: isSelectedTick ? '#e87c2e' : (isFive ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)'),
                    transform: `translate(-50%, -50%) rotate(${tickAngle}deg) translateY(-124px)`
                  }}
                />
              )
            })}

            {/* Center dot */}
            <div className="w-3.5 h-3.5 rounded-full bg-[#e87c2e] absolute z-30 shadow-[0_0_12px_rgba(232,124,46,0.8)] border-[3px] border-[#1a2b4b]"></div>
            
            {/* Hand */}
            <div 
              className="absolute w-[2px] bg-[#e87c2e] bottom-1/2 origin-bottom shadow-[0_0_8px_#e87c2e] z-10 pointer-events-none" 
              style={{ 
                height: `${radius}px`,
                transform: `translateX(-50%) rotate(${handAngle}deg)` 
              }}
            >
              <div className="w-10 h-10 rounded-full bg-[#e87c2e]/10 absolute -top-5 left-1/2 -translate-x-1/2 backdrop-blur-[1px]"></div>
              <div className="w-10 h-10 rounded-full border-[2px] border-[#e87c2e] absolute -top-5 left-1/2 -translate-x-1/2 shadow-[0_0_10px_rgba(232,124,46,0.4),inset_0_0_10px_rgba(232,124,46,0.2)] bg-transparent"></div>
            </div>

            {/* Numbers */}
            {numbers.map(v => {
              const isSelected = mode === 'hour' ? hour === v : minute === v;
              const angle = mode === 'hour' ? (v % 12) * 30 : v * 6;
              return (
                <div 
                  key={`num-${v}`}
                  className={`absolute w-10 h-10 flex items-center justify-center rounded-full text-base z-20 pointer-events-none transition-colors duration-200 ${
                    isSelected 
                      ? 'text-white font-bold' 
                      : 'text-slate-300/80 font-medium'
                  }`}
                  style={{
                    left: `calc(50% + ${Math.sin(angle * Math.PI / 180) * radius}px)`,
                    top: `calc(50% - ${Math.cos(angle * Math.PI / 180) * radius}px)`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  {mode === 'minute' && v === 0 ? '00' : v}
                </div>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-5 flex justify-between items-center bg-white border-t border-slate-200/60 pb-8 rounded-b-[32px]">
          <button 
            onClick={() => { setHour(12); setMinute(0); setPeriod('AM'); setMode('hour'); }}
            className="text-slate-500 font-semibold px-4 py-3 hover:bg-slate-100 rounded-xl transition-colors text-sm"
          >
            Clear
          </button>
          <div className="flex gap-3">
            <button className="text-slate-500 font-semibold px-4 py-3 hover:bg-slate-100 rounded-xl transition-colors text-sm">
              Cancel
            </button>
            <button className="bg-[#1a2b4b] hover:bg-[#121f38] text-white font-semibold px-8 py-3 rounded-xl shadow-lg shadow-[#1a2b4b]/20 transition-all active:scale-95 text-sm">
              Set
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
