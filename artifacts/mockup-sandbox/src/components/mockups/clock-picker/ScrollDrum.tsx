import React, { useState, useRef } from 'react';
import { Clock } from 'lucide-react';

export function ScrollDrum() {
  const [hourIdx, setHourIdx] = useState(9); // Default: 10
  const [minIdx, setMinIdx] = useState(6); // Default: 30
  const [periodIdx, setPeriodIdx] = useState(0); // Default: AM

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));
  const periods = ['AM', 'PM'];

  return (
    <div className="w-full min-h-screen bg-gray-950/20 flex flex-col items-center justify-center p-4 font-sans">
      {/* Mobile container constraint */}
      <div className="w-full max-w-[390px] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col relative mx-auto">
        
        {/* Header */}
        <div className="px-6 py-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shadow-sm">
            <Clock className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 tracking-tight">Select Time</h2>
            <p className="text-sm text-gray-500 font-medium">Schedule appointment</p>
          </div>
        </div>

        {/* Picker Content */}
        <div className="px-6 py-8 bg-slate-50/50 flex flex-col items-center border-y border-gray-50">
          <div className="flex items-center justify-center bg-white rounded-[24px] shadow-sm border border-gray-100 p-3 relative w-full">
             
             <div className="flex-1 max-w-[80px]">
               <DrumColumn items={hours} selectedIndex={hourIdx} onChange={setHourIdx} />
             </div>
             
             <div className="text-3xl font-bold text-gray-300 px-1 pb-1 flex flex-col justify-center h-[132px] mb-2 animate-pulse">
               :
             </div>
             
             <div className="flex-1 max-w-[80px]">
               <DrumColumn items={minutes} selectedIndex={minIdx} onChange={setMinIdx} />
             </div>
             
             <div className="w-4" />
             
             <div className="flex-1 max-w-[80px]">
               <DrumColumn items={periods} selectedIndex={periodIdx} onChange={setPeriodIdx} />
             </div>
             
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-5 bg-white flex items-center justify-between gap-2">
          <button className="px-4 py-3.5 text-sm font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all active:scale-95">
            Clear
          </button>
          <div className="flex gap-2">
            <button className="px-5 py-3.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-all active:scale-95">
              Cancel
            </button>
            <button className="px-7 py-3.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-600/20 active:scale-95">
              Set Time
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DrumColumn({ items, selectedIndex, onChange }: { items: string[], selectedIndex: number, onChange: (idx: number) => void }) {
  const ITEM_HEIGHT = 48; // 48px height per item
  const containerRef = useRef<HTMLDivElement>(null);
  
  const dragStartY = useRef<number | null>(null);
  const dragStartIdx = useRef<number>(selectedIndex);
  const isDragging = useRef<boolean>(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = false;
    dragStartY.current = e.clientY;
    dragStartIdx.current = selectedIndex;
    if (containerRef.current) {
      containerRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragStartY.current === null) return;
    
    const deltaY = e.clientY - dragStartY.current;
    if (Math.abs(deltaY) > 3) {
      isDragging.current = true;
    }

    const itemsScrolled = Math.round(-deltaY / ITEM_HEIGHT);
    let newIdx = dragStartIdx.current + itemsScrolled;
    
    newIdx = Math.max(0, Math.min(items.length - 1, newIdx));
    if (newIdx !== selectedIndex) {
      onChange(newIdx);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    dragStartY.current = null;
    if (containerRef.current) {
      containerRef.current.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[144px] overflow-hidden select-none touch-none cursor-grab active:cursor-grabbing rounded-xl"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Items wrapper */}
      <div 
        className="absolute w-full transition-transform duration-200 ease-out"
        style={{ transform: `translateY(${ITEM_HEIGHT - selectedIndex * ITEM_HEIGHT}px)` }}
      >
        {items.map((item, idx) => (
          <div 
            key={idx}
            onClick={() => {
              if (!isDragging.current) onChange(idx);
            }}
            className={`flex items-center justify-center h-[48px] transition-all duration-200 ${
              idx === selectedIndex 
                ? 'text-gray-900 font-bold text-2xl tracking-tight' 
                : Math.abs(idx - selectedIndex) === 1 
                  ? 'text-gray-400 font-medium text-lg'
                  : 'text-gray-300 font-medium text-base opacity-40'
            }`}
          >
            {item}
          </div>
        ))}
      </div>
      
      {/* Selection Highlight Band */}
      <div className="absolute inset-y-[48px] left-1 right-1 border-y-2 border-indigo-100/80 bg-indigo-50/40 pointer-events-none rounded-lg" />
      
      {/* Top Gradient Fade */}
      <div className="absolute top-0 left-0 right-0 h-[48px] bg-gradient-to-b from-white via-white/80 to-transparent pointer-events-none" />
      
      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-[48px] bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
    </div>
  );
}
