import { useState, useMemo } from "react";
import { Sheet, SheetContent, SheetPortal, SheetOverlay } from "@/components/ui/sheet";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import {
  Search, Check, ChevronDown,
  FileText, Shield, Home, Clipboard, Smartphone, Image, Printer,
  CreditCard, Copy, Scan, HeartPulse, Briefcase, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Icon map ──────────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
  "file-text": FileText,
  "shield": Shield,
  "home": Home,
  "clipboard": Clipboard,
  "smartphone": Smartphone,
  "image": Image,
  "printer": Printer,
  "credit-card": CreditCard,
  "copy": Copy,
  "scan": Scan,
  "heart-pulse": HeartPulse,
};

const CATEGORY_META: Record<string, { label: string; emoji: string; order: number }> = {
  government: { label: "Government", emoji: "🏛️", order: 0 },
  recharge:   { label: "Recharge",   emoji: "📱", order: 1 },
  print:      { label: "Print & Scan", emoji: "🖨️", order: 2 },
};
const DEFAULT_COLOR = "#6B7280";

// ── Trigger button ────────────────────────────────────────────────────
interface TriggerProps {
  value: string;
  services?: any[];
  onClick: () => void;
  placeholder?: string;
  accentColor?: string;
}

export function ServicePickerTrigger({ value, services, onClick, placeholder = "Select service type", accentColor }: TriggerProps) {
  const selected = services?.find((s: any) => s.name === value);
  const IconComp = selected?.icon ? (ICON_MAP[selected.icon] ?? Briefcase) : Briefcase;
  const color = selected?.color ?? DEFAULT_COLOR;

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 text-left"
      style={{
        height: 48,
        borderRadius: 14,
        border: `1.5px solid ${value ? color + "60" : "var(--color-slate-200)"}`,
        background: value ? `${color}08` : "var(--surface-card-near-white, #fff)",
        padding: "0 14px",
        cursor: "pointer",
        transition: "all 0.15s",
        boxShadow: value ? `0 0 0 2px ${color}20` : "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      {value && selected ? (
        <>
          {/* Colored icon badge */}
          <span
            style={{
              width: 30, height: 30, borderRadius: 9,
              background: color,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              boxShadow: `0 3px 8px ${color}40`,
            }}
          >
            <IconComp size={15} color="#fff" strokeWidth={2} />
          </span>
          <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: "var(--brand-navy-800, #0b1340)" }}>
            {value}
          </span>
        </>
      ) : (
        <>
          <span style={{
            width: 30, height: 30, borderRadius: 9,
            background: "var(--color-slate-100, #f1f5f9)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Briefcase size={14} color="var(--color-slate-400, #94a3b8)" />
          </span>
          <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: "var(--color-slate-400, #94a3b8)" }}>
            {placeholder}
          </span>
        </>
      )}
      <ChevronDown size={16} color={value ? color : "var(--color-slate-400)"} style={{ flexShrink: 0 }} />
    </button>
  );
}

// ── Bottom-sheet picker ───────────────────────────────────────────────
interface ServicePickerSheetProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  value: string;
  onChange: (v: string) => void;
  services?: any[];
  serviceTypes?: string[];
}

export function ServicePickerSheet({ open, onOpenChange, value, onChange, services, serviceTypes }: ServicePickerSheetProps) {
  const [search, setSearch] = useState("");

  // Build grouped structure
  const grouped = useMemo(() => {
    // Use full service objects if available, otherwise build stubs from serviceTypes
    const list: any[] = services?.length
      ? services
      : (serviceTypes ?? []).map(name => ({ name, category: "other" }));

    const filtered = search.trim()
      ? list.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
      : list;

    const groups: Record<string, any[]> = {};
    for (const s of filtered) {
      const cat = s.category ?? "other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(s);
    }

    const catKeys = Object.keys(groups).sort((a, b) => {
      const oa = CATEGORY_META[a]?.order ?? 99;
      const ob = CATEGORY_META[b]?.order ?? 99;
      return oa - ob;
    });

    return { groups, catKeys };
  }, [services, serviceTypes, search]);

  const handleSelect = (name: string) => {
    onChange(name);
    onOpenChange(false);
    setSearch("");
  };

  return (
    <Sheet open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setSearch(""); }}>
      <SheetPortal>
        <SheetOverlay />
        <SheetPrimitive.Content
          className={cn(
            "fixed inset-x-0 bottom-0 z-50",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
            "data-[state=open]:duration-300 data-[state=closed]:duration-200"
          )}
          style={{
            background: "#fff",
            borderRadius: "24px 24px 0 0",
            boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
            maxHeight: "82vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Drag handle */}
          <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: "#e2e8f0" }} />
          </div>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 20px 12px" }}>
            <span style={{ fontSize: 17, fontWeight: 900, color: "#0b1340" }}>Select Service</span>
            <SheetPrimitive.Close
              style={{
                width: 32, height: 32, borderRadius: 10, border: "none", cursor: "pointer",
                background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <X size={16} color="#64748b" />
            </SheetPrimitive.Close>
          </div>

          {/* Search */}
          <div style={{ padding: "0 16px 12px", flexShrink: 0 }}>
            <div style={{ position: "relative" }}>
              <Search size={15} color="#94a3b8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search services…"
                autoComplete="off"
                style={{
                  width: "100%", height: 42, paddingLeft: 36, paddingRight: 12,
                  borderRadius: 12, border: "1.5px solid #e2e8f0",
                  fontSize: 14, outline: "none", boxSizing: "border-box",
                  background: "#f8fafc", color: "#0b1340", fontWeight: 500,
                }}
              />
            </div>
          </div>

          {/* Service list — scrollable */}
          <div style={{ overflowY: "auto", flex: 1, paddingBottom: 24 }}>
            {grouped.catKeys.length === 0 && (
              <div style={{ textAlign: "center", padding: "32px 20px", color: "#94a3b8", fontSize: 14 }}>
                No services found
              </div>
            )}

            {grouped.catKeys.map(cat => {
              const meta = CATEGORY_META[cat];
              return (
                <div key={cat}>
                  {/* Category header */}
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "14px 20px 6px",
                  }}>
                    {meta && (
                      <span style={{ fontSize: 15 }}>{meta.emoji}</span>
                    )}
                    <span style={{
                      fontSize: 11, fontWeight: 800, letterSpacing: "0.08em",
                      textTransform: "uppercase", color: "#64748b",
                    }}>
                      {meta?.label ?? cat}
                    </span>
                    <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
                  </div>

                  {/* Service rows */}
                  {grouped.groups[cat].map((s: any) => {
                    const IconComp = s.icon ? (ICON_MAP[s.icon] ?? Briefcase) : Briefcase;
                    const color = s.color ?? DEFAULT_COLOR;
                    const isSelected = value === s.name;

                    return (
                      <button
                        key={s.name}
                        type="button"
                        onClick={() => handleSelect(s.name)}
                        style={{
                          width: "100%", display: "flex", alignItems: "center", gap: 14,
                          padding: "11px 20px",
                          border: "none", background: isSelected ? `${color}12` : "transparent",
                          cursor: "pointer", textAlign: "left",
                          borderLeft: isSelected ? `3px solid ${color}` : "3px solid transparent",
                          transition: "all 0.1s",
                        }}
                      >
                        {/* Icon badge */}
                        <span style={{
                          width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                          background: color,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          boxShadow: `0 4px 12px ${color}35`,
                        }}>
                          <IconComp size={18} color="#fff" strokeWidth={2} />
                        </span>

                        {/* Name + sub-label */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{
                            fontSize: 14, fontWeight: isSelected ? 800 : 600,
                            color: isSelected ? color : "#0b1340",
                            margin: 0, lineHeight: 1.3,
                          }}>
                            {s.name}
                          </p>
                          {s.parentService && (
                            <p style={{ fontSize: 11, color: "#94a3b8", margin: 0, marginTop: 1 }}>
                              Under {s.parentService}
                            </p>
                          )}
                        </div>

                        {/* Check */}
                        {isSelected && (
                          <span style={{
                            width: 22, height: 22, borderRadius: 7, background: color,
                            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                          }}>
                            <Check size={13} color="#fff" strokeWidth={3} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}

            {/* Other option */}
            {(!search || "other".includes(search.toLowerCase())) && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 20px 6px" }}>
                  <span style={{ fontSize: 15 }}>📋</span>
                  <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b" }}>Other</span>
                  <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
                </div>
                <button
                  type="button"
                  onClick={() => handleSelect("Other")}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 14,
                    padding: "11px 20px", border: "none",
                    background: value === "Other" ? "#6B728012" : "transparent",
                    cursor: "pointer", textAlign: "left",
                    borderLeft: value === "Other" ? "3px solid #6B7280" : "3px solid transparent",
                    transition: "all 0.1s",
                  }}
                >
                  <span style={{
                    width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                    background: "#6B7280",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 4px 12px #6B728035",
                  }}>
                    <Briefcase size={18} color="#fff" strokeWidth={2} />
                  </span>
                  <span style={{ fontSize: 14, fontWeight: value === "Other" ? 800 : 600, color: value === "Other" ? "#6B7280" : "#0b1340" }}>
                    Other
                  </span>
                  {value === "Other" && (
                    <span style={{ width: 22, height: 22, borderRadius: 7, background: "#6B7280", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Check size={13} color="#fff" strokeWidth={3} />
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
        </SheetPrimitive.Content>
      </SheetPortal>
    </Sheet>
  );
}

// ── Combined controlled component ─────────────────────────────────────
// Drop-in replacement for the Select in the mobile entry form
export function MobileServicePicker({
  value,
  onChange,
  services,
  serviceTypes,
  accentColor,
}: {
  value: string;
  onChange: (v: string) => void;
  services?: any[];
  serviceTypes?: string[];
  accentColor?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <ServicePickerTrigger
        value={value}
        services={services}
        onClick={() => setOpen(true)}
        accentColor={accentColor}
      />
      <ServicePickerSheet
        open={open}
        onOpenChange={setOpen}
        value={value}
        onChange={onChange}
        services={services}
        serviceTypes={serviceTypes}
      />
    </>
  );
}
