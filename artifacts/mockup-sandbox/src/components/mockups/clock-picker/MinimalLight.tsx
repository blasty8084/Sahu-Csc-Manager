import React, { useState } from 'react';

export function MinimalLight() {
  const [mode, setMode] = useState<'hours' | 'minutes'>('hours');
  const [hour, setHour] = useState(10);
  const [minute, setMinute] = useState(30);
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');

  const selectedValue = mode === 'hours' ? hour : minute;
  const rotation = mode === 'hours' 
    ? (selectedValue * 30) 
    : (selectedValue * 6);

  const radius = 100;

  const handleHourSelect = (value: number) => {
    setHour(value);
    setTimeout(() => setMode('minutes'), 350);
  };

  const handleMinuteSelect = (value: number) => {
    setMinute(value);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-900 py-10">
      {/* Mobile Device Container */}
      <div className="w-[390px] h-[844px] bg-[#E2E8F0] relative overflow-hidden font-sans shadow-2xl rounded-[44px] flex flex-col justify-end ring-[12px] ring-neutral-950">
        
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" />

        {/* Bottom Sheet */}
        <div className="relative bg-white w-full rounded-t-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] px-8 pb-10 pt-6 flex flex-col mt-auto animate-in slide-in-from-bottom-full duration-500 ease-out">
          
          {/* Drag Handle */}
          <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-10" />

          {/* Time Display */}
          <div className="flex justify-center items-center mb-8">
            <button 
              onClick={() => setMode('hours')}
              className={`text-[80px] leading-none font-semibold tracking-tighter transition-colors ${mode === 'hours' ? 'text-slate-800' : 'text-slate-300 hover:text-slate-400'}`}
            >
              {hour}
            </button>
            <span className="text-[72px] leading-none font-light text-slate-300 mx-2 -translate-y-2">:</span>
            <button 
              onClick={() => setMode('minutes')}
              className={`text-[80px] leading-none font-semibold tracking-tighter transition-colors ${mode === 'minutes' ? 'text-slate-800' : 'text-slate-300 hover:text-slate-400'}`}
            >
              {minute.toString().padStart(2, '0')}
            </button>
          </div>

          {/* AM/PM Toggle */}
          <div className="flex justify-center mb-10">
            <div className="bg-slate-100 p-1 rounded-full flex shadow-inner">
              <button 
                onClick={() => setPeriod('AM')}
                className={`px-7 py-2.5 rounded-full text-[15px] font-semibold transition-all duration-200 ${period === 'AM' ? 'bg-white text-violet-600 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}`}
              >
                AM
              </button>
              <button 
                onClick={() => setPeriod('PM')}
                className={`px-7 py-2.5 rounded-full text-[15px] font-semibold transition-all duration-200 ${period === 'PM' ? 'bg-white text-violet-600 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}`}
              >
                PM
              </button>
            </div>
          </div>

          {/* Clock Face */}
          <div className="relative w-64 h-64 mx-auto mb-6">
            <svg className="w-full h-full" viewBox="0 0 256 256">
              {/* Outer Circle */}
              <circle cx="128" cy="128" r="128" fill="#F5F3FF" />
              
              {/* Visual Dots */}
              {Array.from({ length: 12 }).map((_, i) => {
                const value = i === 0 ? 12 : i;
                const dotAngle = (i * 30 - 90) * (Math.PI / 180);
                const x = 128 + radius * Math.cos(dotAngle);
                const y = 128 + radius * Math.sin(dotAngle);
                
                let isSelected = false;
                if (mode === 'hours') {
                  isSelected = hour === value;
                } else {
                  isSelected = minute === (i * 5 === 60 ? 0 : i * 5);
                }

                return (
                  !isSelected && <circle key={`dot-${i}`} cx={x} cy={y} r="2.5" fill="#C4B5FD" className="pointer-events-none" />
                );
              })}

              {/* Hand & Indicator */}
              <g className="transition-transform duration-300 ease-out" style={{ transform: `rotate(${rotation}deg)`, transformOrigin: '128px 128px' }}>
                <line x1="128" y1="128" x2="128" y2={128 - radius} stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="128" cy={128 - radius} r="24" fill="#8B5CF6" fillOpacity="0.12" />
                <circle cx="128" cy={128 - radius} r="9" fill="#8B5CF6" />
                <circle cx="128" cy={128 - radius} r="3" fill="#FFFFFF" />
              </g>

              {/* Center dot */}
              <circle cx="128" cy="128" r="4.5" fill="#8B5CF6" />
              <circle cx="128" cy="128" r="1.5" fill="#FFFFFF" />

              {/* Interactive Hitboxes */}
              {Array.from({ length: mode === 'hours' ? 12 : 60 }).map((_, i) => {
                const value = mode === 'hours' ? (i === 0 ? 12 : i) : i;
                const dotAngle = (value * (mode === 'hours' ? 30 : 6) - 90) * (Math.PI / 180);
                const x = 128 + radius * Math.cos(dotAngle);
                const y = 128 + radius * Math.sin(dotAngle);

                return (
                  <circle
                    key={`hit-${i}`}
                    cx={x}
                    cy={y}
                    r={mode === 'hours' ? 24 : 10}
                    fill="transparent"
                    className="cursor-pointer hover:fill-black/5 transition-colors"
                    onClick={() => mode === 'hours' ? handleHourSelect(value) : handleMinuteSelect(value)}
                  />
                );
              })}
            </svg>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between mt-8">
            <button className="text-slate-400 font-medium text-[16px] hover:text-slate-600 transition-colors px-2">
              Clear
            </button>
            <div className="flex space-x-3">
              <button className="px-6 py-3.5 rounded-[20px] border-2 border-slate-100 text-slate-600 font-semibold text-[16px] hover:bg-slate-50 hover:border-slate-200 transition-colors">
                Cancel
              </button>
              <button className="px-8 py-3.5 rounded-[20px] bg-violet-500 text-white font-semibold text-[16px] shadow-[0_8px_16px_-6px_rgba(139,92,246,0.4)] hover:bg-violet-600 hover:shadow-[0_8px_20px_-6px_rgba(139,92,246,0.5)] transition-all active:scale-95">
                Set Time
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
