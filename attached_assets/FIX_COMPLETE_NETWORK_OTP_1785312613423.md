# Fix: Network Error + OTP Not Working (Vercel + Render)

## Root Cause Analysis

Teen problems ek saath hain:

1. **Vercel proxy cookies strip karta hai** — `/api/*` rewrites mein `Set-Cookie` headers browser tak nahi pahunchte
2. **`sameSite: "strict"`** — cross-origin cookies block hoti hain
3. **Frontend `BASE_URL` sirf `/` return karta hai** — API calls same-domain jaati hain (Vercel proxy through) instead of directly Render pe

**Solution**: Frontend ko directly Render API se baat karni chahiye — Vercel proxy bypass karke. Isse cookies properly set hongi aur CORS sahi kaam karega.

---

## Fix 1 — `artifacts/api-server/src/app.ts`

### 1a — sameSite fix karo

**Dhundo**:
```javascript
sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
```

**Replace karo**:
```javascript
sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
```

---

## Fix 2 — `artifacts/sahu-csc/src/lib/api-base.ts` (NEW FILE)

Yeh file banao — ek central jagah jo production mein Render URL return kare:

```typescript
/**
 * Returns the API base URL for fetch calls.
 * - Production (Vercel): direct Render URL to avoid proxy cookie stripping
 * - Development (Replit): empty string so Vite proxy handles /api/*
 */
export function getApiBase(): string {
  // VITE_API_URL set hai toh directly use karo (production)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, "");
  }
  // Dev: Vite proxy handles /api/* → localhost:8080
  return import.meta.env.BASE_URL?.replace(/\/+$/, "") ?? "";
}
```

---

## Fix 3 — Vercel Dashboard mein Environment Variable

Vercel → Project → **Settings** → **Environment Variables** → Add:

```
VITE_API_URL = https://sahu-csc-api.onrender.com
```

> **Important**: `VITE_` prefix zaroori hai — Vite sirf `VITE_` variables frontend mein expose karta hai.

---

## Fix 4 — Frontend files mein `getApiBase()` use karo

Har jagah `import.meta.env.BASE_URL?.replace(/\/$/, "") ?? ""` hai — replace karo `getApiBase()` se.

### Files list (in-code search: `import.meta.env.BASE_URL`):

**`artifacts/sahu-csc/src/hooks/use-auth.tsx`**

Dhundo:
```typescript
const apiBase = () => import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
```
Replace karo:
```typescript
import { getApiBase } from "@/lib/api-base";
const apiBase = () => getApiBase();
```

**`artifacts/sahu-csc/src/components/auth/loginTypes.ts`**

Dhundo:
```typescript
const BASE = () => import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
```
Replace karo:
```typescript
import { getApiBase } from "@/lib/api-base";
const BASE = () => getApiBase();
```

**`artifacts/sahu-csc/src/components/auth/RegisterForm.tsx`**

Dhundo:
```typescript
const base = () => import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
```
Replace karo:
```typescript
import { getApiBase } from "@/lib/api-base";
const base = () => getApiBase();
```

**`artifacts/sahu-csc/src/components/auth/registerTypes.ts`**

Dhundo:
```typescript
const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
```
Replace karo:
```typescript
import { getApiBase } from "@/lib/api-base";
const base = getApiBase();
```

**`artifacts/sahu-csc/src/components/auth/RejectedPanel.tsx`**

Dhundo:
```typescript
const base = (import.meta as any).env?.BASE_URL?.replace(/\/$/, "") ?? "";
```
Replace karo:
```typescript
import { getApiBase } from "@/lib/api-base";
const base = getApiBase();
```

**`artifacts/sahu-csc/src/components/auth/TotpLiveCode.tsx`**

Dhundo:
```typescript
const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
```
Replace karo:
```typescript
import { getApiBase } from "@/lib/api-base";
const base = getApiBase();
```

**`artifacts/sahu-csc/src/components/users/AdminSessionsTab.tsx`** (2 jagah)

Dono instances replace karo:
```typescript
const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
```
→
```typescript
import { getApiBase } from "@/lib/api-base";
const base = getApiBase();
```

**`artifacts/sahu-csc/src/components/language-switcher.tsx`**
**`artifacts/sahu-csc/src/components/profile/utils.ts`**
**`artifacts/sahu-csc/src/components/profile/RegistrationControlSection.tsx`**
**`artifacts/sahu-csc/src/components/sessions/SessionCard.tsx`**
**`artifacts/sahu-csc/src/hooks/use-registration-status.ts`**
**`artifacts/sahu-csc/src/components/PermissionCard/PermissionCard.tsx`**

Sab mein same pattern replace karo — `import.meta.env.BASE_URL?.replace(/\/$/, "") ?? ""` → `getApiBase()` with import.

**`artifacts/sahu-csc/src/components/broadcast/broadcastTypes.ts`**

Dhundo:
```typescript
export const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
```
Replace karo:
```typescript
import { getApiBase } from "@/lib/api-base";
export const BASE = getApiBase();
```

**`artifacts/sahu-csc/src/hooks/useReports.ts`**

Dhundo:
```typescript
export const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
```
Replace karo:
```typescript
import { getApiBase } from "@/lib/api-base";
export const BASE = getApiBase();
```

**Receipt modals** (`receipt-modal.tsx`, `aeps-receipt-modal.tsx`, `udhari-receipt-modal.tsx`):

Dhundo:
```typescript
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
```
Replace karo:
```typescript
import { getApiBase } from "@/lib/api-base";
const basePath = getApiBase();
```

---

## Fix 5 — `artifacts/sahu-csc/vercel.json` Update

`vercel.json` se `/api/*` rewrite **hatao** — ab frontend directly Render pe jaayega:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        { "key": "Cache-Control", "value": "no-cache" },
        { "key": "Service-Worker-Allowed", "value": "/" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/(.*).html",
      "headers": [
        { "key": "Cache-Control", "value": "no-store, no-cache, must-revalidate" }
      ]
    }
  ]
}
```

---

## Fix 6 — Render Environment: CORS_ORIGIN Update

Render → `sahu-csc-api` → **Environment** → `CORS_ORIGIN` update karo dono Vercel domains ke saath:

```
CORS_ORIGIN = https://sahu-csc-manager-sahu-csc.vercel.app,https://sahucsc.dpdns.org
```

---

## Build & Deploy

```bash
# Build verify karo
pnpm --filter @workspace/api-server run build
pnpm --filter @workspace/sahu-csc run build

# GitHub push karo
git add .
git commit -m "Fix: direct Render API calls, sameSite=none, CORS domains"
git push origin main
```

Phir:
1. Vercel auto-deploy → `VITE_API_URL` set karo Vercel dashboard mein
2. Render auto-deploy → `CORS_ORIGIN` dono domains ke saath

---

## Verification

1. Browser mein app open karo (`sahucsc.dpdns.org` ya Vercel URL)
2. Login karo → 2FA → Email OTP choose karo
3. ✅ Network error nahi aana chahiye
4. ✅ Gmail mein OTP aana chahiye
5. Browser DevTools → Network tab → `/api/auth/login` request check karo — URL `https://sahu-csc-api.onrender.com/api/auth/login` hona chahiye (Vercel proxy nahi)

---

## What NOT to Do

- `vercel.json` mein `/api/*` rewrite wapas mat daalo
- `secure: true` cookie flag mat hatao
- Dev mein `VITE_API_URL` set mat karo — Vite proxy dev ke liye use hoga
- `sameSite: "lax"` production mein mat rakho
