# Desktop Forms V2 — Full-Screen Split Layout

**Version:** 2.0  
**Date:** 2026-06-20  
**Scope:** All 5 desktop entry forms (Ledger, Udhari Add Customer, Udhari Entry, AePS Withdrawal, AePS Deposit)

---

## What Changed

### V1 (old) — Slide-in Panel
- `position: fixed; right: 0; top: 0; height: 100vh; width: 460–560px`
- Semi-transparent backdrop over the page content
- Navy header + saffron stripe + scrollable body + sticky footer

### V2 (new) — Full-Screen Split Layout
- `position: fixed; inset: 0` — takes the entire viewport
- **Left panel** (380px, dark gradient) — contextual info and stats
- **Right panel** (`flex: 1`, white/light gray) — form fields, sticky footer
- No backdrop needed — the form IS the full screen

---

## Design Language

### Left Info Panel (380px)
| Element | Style |
|---------|-------|
| Background | Dark gradient, color varies by form type |
| Decorative circles | `position: absolute`, subtle transparency |
| SAHU CSC logo badge | 36×36px, rounded-11, white or brand gradient |
| Feature icon | 64×64px rounded-20, translucent white border |
| Title | 24–26px, font-weight 900, white |
| Subtitle | 13px, `rgba(255,255,255,0.55–0.65)` |
| Stat cards | `rgba(255,255,255,0.08–0.12)` bg, 14px padding, border `rgba(255,255,255,0.08–0.20)` |

### Right Form Panel (flex: 1)
| Element | Style |
|---------|-------|
| Background | `#f8fafc` (light gray) |
| Top bar | `#fff`, `border-bottom: 1px solid #f1f5f9`, 18–20px vertical padding, 40px horizontal |
| Title | 18px, font-weight 800, navy `#0b2c60` |
| Subtitle | 12px, `#94a3b8` |
| Type toggle (in top bar) | `#f1f5f9` pill container, colored active state, 4px gap |
| Close button | 38×38px, `border-radius: 12`, `#e2e8f0` border |
| Scrollable body | `padding: 32px 40px`, `max-width: 560–640px` |
| Field labels | 11px, font-weight 700, `#475569`, uppercase, `letter-spacing: 0.08em` |
| Field inputs | Height 50px, `border-radius: 14`, `border: 1.5px solid #e2e8f0`, `box-shadow: 0 1px 4px rgba(11,44,96,0.06)` |
| Amount hero block | Colored light bg + 2px colored border, `border-radius: 20`, icon badge 48×48 |
| Amount input | `font-size: 38px`, font-weight 900, color = accent, no border |
| Footer | `#fff`, `border-top: 1px solid #f1f5f9`, `padding: 20px 40px` |
| Cancel button | Height 50, `padding: 0 28px`, gray |
| Primary button | `flex: 1`, height 50, gradient, `box-shadow` |

---

## Per-Form Specifics

### Ledger Entry (`ledger.tsx`)
- **Left gradient:** Navy `#0b2c60 → #0f3872 → #1a4a9e`
- **Left stats:** Running Balance (saffron), Total Credits (green), Total Debits (red)
- **Left icon:** `TrendingUp` (credit) or `TrendingDown` (debit)
- **Top bar toggle:** Credit (+) / Debit (−) pill tabs
- **Form fields:** Amount hero → Customer + Date grid → Service select → Note textarea → Balance preview card

### Udhari Add Customer (`udhari.tsx`)
- **Left gradient:** Saffron/orange `#7c2d12 → #c2410c → #f97316`
- **Left info:** "After adding customer" — 4 feature steps with arrow icons
- **Left icon:** `User`
- **Form fields:** Name hero (featured box with orange border) → Mobile (numeric, monospace) → Address/Notes textarea → Info card (green "Starting Balance: ₹0.00")

### Udhari Entry — You Gave / You Got (`udhari-customer.tsx`)
- **Left gradient:** Gave = orange `#7c2d12 → #ea580c`, Got = green `#064e3b → #059669`
- **Left content:** Customer card (initials avatar + name + mobile) → Title + description → Current balance box → Post-entry balance preview (appears once amount > 0)
- **Top bar toggle:** You Gave (orange) / You Got (green) pill tabs
- **Form fields:** Amount hero → Date → Note textarea

### AePS Withdrawal (`aeps.tsx` — `txType === "withdrawal"`)
- **Left gradient:** Red `#7f1d1d → #b91c1c → #e11d48`
- **Left content:** Transaction icon + step title (changes per step) + description → Today's session balance card (current + opening + "After withdrawal" preview) → NPCI security badge
- **Top bar toggle:** Withdrawal / Deposit pill tabs (form step only)
- **3 steps:** Form → Confirm → Success (all rendered in the same right panel)

### AePS Deposit (`aeps.tsx` — `txType === "deposit"`)
- **Left gradient:** Green `#064e3b → #047857 → #10b981`
- **Left content:** Same as withdrawal but green-tinted
- **Form fields:** Amount hero + quick-pick buttons → Customer + Aadhaar grid (with 12-dot progress bar) → Bank select + Account No → Note

---

## Architecture Pattern

All 5 forms follow the same conditional render pattern:

```tsx
// Mobile: Dialog (untouched)
if (isMobile) return <Dialog ...>...</Dialog>;

// Desktop: V2 Full-screen split layout
return (
  <>
    {/* Clickable backdrop (closes form) */}
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 49, ... }} />

    {/* Split container */}
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex" }}>
      {/* Left info panel — 380px fixed width */}
      <div style={{ width: 380, flexShrink: 0, background: "...", ... }}>
        {/* Logo, icon, title, description, stats */}
      </div>

      {/* Right form panel — flex: 1 */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top bar: title + toggle + close */}
        <div style={{ background: "#fff", borderBottom: "1px solid #f1f5f9", ... }}>...</div>

        {/* Scrollable form body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px" }}>...</div>

        {/* Sticky footer: Cancel + Primary action */}
        <div style={{ background: "#fff", borderTop: "1px solid #f1f5f9", ... }}>...</div>
      </div>
    </div>
  </>
);
```

---

## Mobile Behavior (unchanged)

Mobile forms still use shadcn/ui `<Dialog>` components:
- Full-height `DialogContent` with `overflow-y-auto`
- Compact header with gradient + icon + customer chip
- Same form fields in more compact vertical layout
- Cancel + Primary action buttons at the bottom

Mobile breakpoint: `useIsMobile()` hook (Tailwind `md` = 768px).

---

## z-Index Layers

| Layer | z-index | Element |
|-------|---------|---------|
| Page content | 0–40 | Normal page |
| Backdrop | 49 | `position: fixed; inset: 0` blur overlay |
| Split form | 50 | The full-screen layout container |

---

## Files Modified

| File | Change |
|------|--------|
| `artifacts/sahu-csc/src/pages/ledger.tsx` | Replaced `{!isMobile && showForm && <slidein>}` with V2 split layout |
| `artifacts/sahu-csc/src/pages/udhari.tsx` | Replaced desktop `AddCustomerDialog` panel with V2 split layout |
| `artifacts/sahu-csc/src/pages/udhari-customer.tsx` | Replaced desktop `EntryFormDialog` panel with V2 split layout |
| `artifacts/sahu-csc/src/pages/aeps.tsx` | Replaced IIFE desktop panel (3-step) with V2 split layout |

---

## Key Architecture Decisions

- **`position: fixed; inset: 0` for the outer container** — not `width: 560px; right: 0`. This gives the full viewport and enables the two-column split.
- **Left panel is `flexShrink: 0` at 380px** — it never shrinks. Right panel is `flex: 1` and fills remaining space.
- **Right panel uses `overflow: hidden` + inner scroll** — the top bar and footer are sticky; only the form body scrolls. Achieved via `flex-direction: column` + `overflowY: auto` on the inner body div.
- **`max-width` on form content** — the form fields cap at 560–640px inside the right panel, preventing fields from stretching to full width on large monitors.
- **Type toggle moved to top bar** — freeing form body space and giving the toggle a more prominent, always-visible position.
- **AePS uses an IIFE** — variables like `isWd`, `accent`, `accentColor`, `isFormValid` are computed inside `{!isMobile && showTxDialog && (() => { ... return (<>...</>); })()}`. This pattern is preserved in V2.
- **Backdrop `onClick` closes the form** — clicking the visible area outside the left panel closes it (the backdrop sits below the split layout, z=49, and covers the full viewport).
- **No `willChange: transform`** — per the existing architecture decision. GPU compositing is left to Framer Motion internally.
