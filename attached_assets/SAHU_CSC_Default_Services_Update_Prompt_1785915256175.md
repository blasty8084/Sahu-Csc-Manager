# Replit Agent 4 Prompt — Update Default Services List

## Overview
Update the default services in this project with the exact list below.
These are the services offered at SAHU CSC centre in Odisha.
Replace all existing default services — keep all user/admin custom services.

---

## New Default Services (13 total)

| # | Service | Category | Sub-types |
|---|---|---|---|
| 1 | Income Certificate | Government | None |
| 2 | Caste Certificate | Government | None |
| 3 | Resident Certificate | Government | None |
| 4 | Form Filling | Government | None |
| 5 | Mobile Recharge | Recharge | None |
| 6 | Photo Print | Print | None |
| 7 | Document Print | Print | None |
| 8 | PAN Card | Government | e-PAN, Physical |
| 9 | Xerox | Print | B/W, Colour |
| 10 | Scanning | Print | None |
| 11 | Ayushman Card | Government | None |

---

## 1. Update Seed File

Find `artifacts/api-server/src/scripts/seed.ts` or
`artifacts/api-server/src/db/seed/services.ts` and replace default
services with:

```typescript
const defaultServices = [
  {
    name: 'Income Certificate',
    nameHi: 'आय प्रमाण पत्र',
    nameOr: 'ଆୟ ପ୍ରମାଣ ପତ୍ର',
    category: 'government',
    icon: 'file-text',
    color: '#3B82F6',
    parentService: null,
  },
  {
    name: 'Caste Certificate',
    nameHi: 'जाति प्रमाण पत्र',
    nameOr: 'ଜାତି ପ୍ରମାଣ ପତ୍ର',
    category: 'government',
    icon: 'shield',
    color: '#8B5CF6',
    parentService: null,
  },
  {
    name: 'Resident Certificate',
    nameHi: 'निवास प्रमाण पत्र',
    nameOr: 'ବାସିନ୍ଦା ପ୍ରମାଣ ପତ୍ର',
    category: 'government',
    icon: 'home',
    color: '#10B981',
    parentService: null,
  },
  {
    name: 'Form Filling',
    nameHi: 'फॉर्म भरना',
    nameOr: 'ଫର୍ମ ପୂରଣ',
    category: 'government',
    icon: 'clipboard',
    color: '#F59E0B',
    parentService: null,
  },
  {
    name: 'Mobile Recharge',
    nameHi: 'मोबाइल रिचार्ज',
    nameOr: 'ମୋବାଇଲ ରିଚାର୍ଜ',
    category: 'recharge',
    icon: 'smartphone',
    color: '#F97316',
    parentService: null,
  },
  {
    name: 'Photo Print',
    nameHi: 'फोटो प्रिंट',
    nameOr: 'ଫଟୋ ପ୍ରିଣ୍ଟ',
    category: 'print',
    icon: 'image',
    color: '#EC4899',
    parentService: null,
  },
  {
    name: 'Document Print',
    nameHi: 'दस्तावेज़ प्रिंट',
    nameOr: 'ଡକ୍ୟୁମେଣ୍ଟ ପ୍ରିଣ୍ଟ',
    category: 'print',
    icon: 'printer',
    color: '#6366F1',
    parentService: null,
  },
  {
    name: 'PAN Card — e-PAN',
    nameHi: 'पैन कार्ड — ई-पैन',
    nameOr: 'ପାନ କାର୍ଡ — ଇ-ପାନ',
    category: 'government',
    icon: 'credit-card',
    color: '#0B1340',
    parentService: 'PAN Card',
  },
  {
    name: 'PAN Card — Physical',
    nameHi: 'पैन कार्ड — फिजिकल',
    nameOr: 'ପାନ କାର୍ଡ — ଫିଜିକାଲ',
    category: 'government',
    icon: 'credit-card',
    color: '#0B1340',
    parentService: 'PAN Card',
  },
  {
    name: 'Xerox — B/W',
    nameHi: 'ज़ेरॉक्स — श्वेत श्याम',
    nameOr: 'ଜେରକ୍ସ — ଧଳା କଳା',
    category: 'print',
    icon: 'copy',
    color: '#6B7280',
    parentService: 'Xerox',
  },
  {
    name: 'Xerox — Colour',
    nameHi: 'ज़ेरॉक्स — रंगीन',
    nameOr: 'ଜେରକ୍ସ — ରଙ୍ଗୀନ',
    category: 'print',
    icon: 'copy',
    color: '#EF4444',
    parentService: 'Xerox',
  },
  {
    name: 'Scanning',
    nameHi: 'स्कैनिंग',
    nameOr: 'ସ୍କ୍ୟାନିଂ',
    category: 'print',
    icon: 'scan',
    color: '#14B8A6',
    parentService: null,
  },
  {
    name: 'Ayushman Card',
    nameHi: 'आयुष्मान कार्ड',
    nameOr: 'ଆୟୁଷ୍ମାନ କାର୍ଡ',
    category: 'government',
    icon: 'heart-pulse',
    color: '#22C55E',
    parentService: null,
  },
];
```

---

## 2. Database Schema Update

If `services` table missing these columns — add and show before migration:

```typescript
nameHi:        text('name_hi'),
nameOr:        text('name_or'),
parentService: text('parent_service'),
```

---

## 3. DB Update Script

Write a script that:
- Deletes all existing DEFAULT services only
- Inserts 13 new services above
- Never deletes custom services added by admin/users

```typescript
// Safe delete — only default services
await db.delete(services)
  .where(eq(services.isDefault, true));

// Insert new defaults
await db.insert(services)
  .values(defaultServices.map(s => ({ ...s, isDefault: true })));
```

---

## 4. Frontend — Service Display

In services list/catalog component:
- Show `nameHi` or `nameOr` based on selected language (i18n)
- Group sub-types under parent:
  ```
  PAN Card
  ├── e-PAN
  └── Physical

  Xerox
  ├── B/W
  └── Colour
  ```
- Show correct lucide-react icon for each service
- Show color dot/badge per service

---

## 5. New Entry Form — Service Dropdown

Group services by category in dropdown:

```
── Government ──────────────────
  Income Certificate
  Caste Certificate
  Resident Certificate
  Form Filling
  PAN Card → e-PAN
  PAN Card → Physical
  Ayushman Card

── Recharge ────────────────────
  Mobile Recharge

── Print & Scan ────────────────
  Photo Print
  Document Print
  Xerox → B/W
  Xerox → Colour
  Scanning
```

---

## 6. Dashboard Quick Actions

Make sure new services appear correctly in:
- Quick Actions section
- Top Services Today section
- With correct icons and colors

---

## 7. Reports & Analytics

- Group by category (Government, Recharge, Print & Scan)
- Show sub-type breakdown for PAN Card and Xerox
- Show transaction count + revenue per service

---

## Icons Reference (lucide-react)

| Service | Icon |
|---|---|
| Income Certificate | `file-text` |
| Caste Certificate | `shield` |
| Resident Certificate | `home` |
| Form Filling | `clipboard` |
| Mobile Recharge | `smartphone` |
| Photo Print | `image` |
| Document Print | `printer` |
| PAN Card | `credit-card` |
| Xerox | `copy` |
| Scanning | `scan` |
| Ayushman Card | `heart-pulse` |

---

## Do Not Change

- Any existing transaction data
- Any existing user data
- AePS service (separate module — not in this list)
- Any UI design or branding colors (`#0B1340`, `#F97316`)
- Any existing API response shapes
- Any custom services added by admin

---

*SAHU CSC Manager | blasty8084 | August 2026*
