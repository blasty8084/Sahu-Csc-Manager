import { useState, useRef, useEffect, forwardRef } from "react";
import { User } from "lucide-react";

interface AutocompleteInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "onSelect"> {
  value: string;
  onChange: (val: string) => void;
  suggestions: string[];
  onSelect?: (val: string) => void;
}

export const AutocompleteInput = forwardRef<HTMLInputElement, AutocompleteInputProps>(
  function AutocompleteInput(
    { value, onChange, suggestions, onSelect, style, className, onBlur, onFocus, onKeyDown, ...rest },
    ref
  ) {
    const [open, setOpen] = useState(false);
    const [activeIdx, setActiveIdx] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);

    const q = value.toLowerCase();
    const filtered =
      q.length === 0
        ? suggestions.slice(0, 8)
        : suggestions.filter((s) => s.toLowerCase().includes(q)).slice(0, 8);
    const showDropdown = open && filtered.length > 0;

    useEffect(() => {
      const handler = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setOpen(false);
          setActiveIdx(-1);
        }
      };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }, []);

    const select = (name: string) => {
      onChange(name);
      onSelect?.(name);
      setOpen(false);
      setActiveIdx(-1);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (showDropdown) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setActiveIdx((i) => Math.min(i + 1, filtered.length - 1));
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setActiveIdx((i) => Math.max(i - 1, -1));
          return;
        }
        if (e.key === "Enter" && activeIdx >= 0) {
          e.preventDefault();
          select(filtered[activeIdx]);
          return;
        }
        if (e.key === "Escape") {
          setOpen(false);
          setActiveIdx(-1);
          return;
        }
      }
      onKeyDown?.(e);
    };

    return (
      <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
        <input
          ref={ref}
          value={value}
          onChange={(e) => { onChange(e.target.value); setOpen(true); setActiveIdx(-1); }}
          onFocus={(e) => { setOpen(true); (onFocus as React.FocusEventHandler<HTMLInputElement>)?.(e); }}
          onBlur={(e) => { (onBlur as React.FocusEventHandler<HTMLInputElement>)?.(e); }}
          onKeyDown={handleKeyDown}
          style={style}
          className={className}
          autoComplete="off"
          {...rest}
        />
        {showDropdown && (
          <div
            style={{
              position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 200,
              background: "#fff", borderRadius: 14,
              border: "1.5px solid rgba(11,44,96,0.12)",
              boxShadow: "0 8px 28px rgba(11,44,96,0.14)",
              overflow: "hidden",
            }}
          >
            {filtered.map((name, i) => (
              <button
                key={name}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); select(name); }}
                style={{
                  width: "100%", padding: "9px 14px", border: "none",
                  background: i === activeIdx ? "rgba(11,44,96,0.06)" : "transparent",
                  textAlign: "left", cursor: "pointer", fontSize: 13,
                  fontWeight: i === activeIdx ? 700 : 500, color: "#0b2c60",
                  display: "flex", alignItems: "center", gap: 9,
                  borderBottom: i < filtered.length - 1 ? "1px solid rgba(11,44,96,0.05)" : "none",
                  transition: "background 0.1s",
                }}
                onMouseEnter={() => setActiveIdx(i)}
                onMouseLeave={() => setActiveIdx(-1)}
              >
                <User size={12} color="#94a3b8" style={{ flexShrink: 0 }} />
                <span>{name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
);
