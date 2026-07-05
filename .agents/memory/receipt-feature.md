---
name: Receipt feature architecture
description: How the CSC receipt number generation, QR verification, and PDF export are implemented
---

## Receipt Number Generation
- Format: `CSC-YYYY-NNNN` (e.g. CSC-2026-0001), year from the transaction date field
- Atomic counter via `receipt_counters` table (year PK, last_count INT)
- Drizzle upsert: `INSERT ... ON CONFLICT DO UPDATE SET last_count = last_count + 1 RETURNING last_count`
- This is safe under concurrent inserts in PostgreSQL (no race condition)

## Receipt Token (QR security)
- `receipt_token` is a `crypto.randomUUID()` stored on the ledger row at insert time
- QR code encodes `https://domain/receipts/verify/:token` — non-guessable (UUID v4)
- Sequential receipt numbers are never exposed in the QR URL

## Public Verify Endpoint
- `GET /api/receipts/verify/:token` — no auth required, safe for customer scanning
- Joins with `users` table for operator name, `settings` table for business name
- Returns ONLY: receiptNumber, date, customerName, serviceType, credit, debit, description, createdByName, createdAt, businessName
- Never exposes: balance, createdBy (user ID), other account data

## Schema Changes Applied
- `ALTER TABLE ledger ADD COLUMN IF NOT EXISTS receipt_number TEXT UNIQUE`
- `ALTER TABLE ledger ADD COLUMN IF NOT EXISTS receipt_token TEXT UNIQUE`
- `CREATE TABLE IF NOT EXISTS receipt_counters (year INT PRIMARY KEY, last_count INT NOT NULL DEFAULT 0)`
- drizzle-kit push requires TTY — use raw SQL for non-interactive migrations

## Frontend Stack
- QR code: `react-qr-code` (installed in @workspace/sahu-csc)
- PDF: `html2canvas` + `jspdf` — captures the receipt DOM element, converts to A5 PDF
- Print: Opens `window.open` popup with the receipt HTML, triggers `win.print()`
- Share: Web Share API on mobile, clipboard fallback on desktop
- Public verify page at `/receipts/verify/:token` — no auth, standalone page

## Auth login field
- Login body uses `identifier` (not `username`) — accepts username/email/mobile
- This is the Zod schema field name in `LoginBody` from api-zod

**Why:**
- `receipt_counters` avoids gaps in sequential numbers even under concurrency
- UUID token prevents enumeration attacks (CSC-2026-0001, CSC-2026-0002 would be guessable)
- Client-side PDF keeps backend simple and avoids server memory spikes for large receipts

**How to apply:**
- Any future ledger refactor must preserve `receipt_number` and `receipt_token` generation on POST
- The `receiptToken` field is now part of the `LedgerEntry` OpenAPI schema and generated hooks

## Single-receipt action buttons (admin bulk-export style pages)
- Bulk/preview list endpoints (e.g. `bulk-export/count`) intentionally return a lightweight row shape without `receiptToken`/`description` — not enough to Print/PDF/Share a single receipt.
- Any per-row Print/PDF/Share/WhatsApp button needs a dedicated single-record fetch (e.g. `GET /api/admin/receipts/single/:receiptNumber`) that returns the full row + business settings before opening the shared `ReceiptModal`.
- `ReceiptModal` (`components/receipt-modal.tsx`) supports an `autoAction?: "print"|"download"|"share"|"whatsapp"` prop that fires the corresponding handler ~400ms after opening — reuse this instead of re-implementing html2canvas/print/share logic on each page.
- **Why:** icon-only action buttons with no onClick handlers are an easy silent-failure pattern in this codebase — always check buttons actually have wired handlers, not just correct icons/styling.
