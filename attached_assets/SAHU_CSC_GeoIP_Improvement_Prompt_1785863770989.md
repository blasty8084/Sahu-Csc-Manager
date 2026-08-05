# Replit Agent 4 Prompt — GeoIP Improve & Upgrade

## Overview
Improve the existing GeoIP implementation in this project.
The current `geo-block.ts` and `geoip-updater.ts` are working — do not break them.
Only add the improvements listed below.

---

## Rules — Never Break These

- Do not change `geo-block.ts` India-only blocking logic
- Do not change `ALLOW_NON_INDIA` override behavior
- Do not change `geoip-updater.ts` cron schedule (Sunday 03:00)
- Keep `step: 30` TOTP rule untouched
- Show schema changes before any migration
- Do not change any UI design or branding colors

---

## 1. New Location Login Alert

In `artifacts/api-server/src/routes/auth/login.ts`, after successful
authentication, compare current login location with user's last known
location. If city or region changed — send security email alert:

```typescript
const geo = geoip.lookup(clientIp);
if (geo && user.lastLoginCity && geo.city !== user.lastLoginCity) {
  await mailer.send({
    to: user.email,
    subject: 'New login from different location — SAHU CSC',
    template: 'new-location-alert',
    data: {
      city: geo.city,
      region: geo.region,
      country: geo.country,
      ip: clientIp,
      time: new Date().toISOString(),
      device: parseDevice(req.headers['user-agent']),
    }
  });
}

// Save current location after every login
await db.update(usersTable).set({
  lastLoginCity:   geo?.city ?? null,
  lastLoginRegion: geo?.region ?? null,
  lastLoginIp:     clientIp,
  lastLoginAt:     new Date(),
}).where(eq(usersTable.id, userId));
```

Add to Drizzle schema (show before migration):
```typescript
lastLoginCity:   text('last_login_city'),
lastLoginRegion: text('last_login_region'),
lastLoginIp:     text('last_login_ip'),
lastLoginAt:     timestamp('last_login_at'),
```

---

## 2. Audit Log — Add Location to Every Event

Update `auditLog()` in `lib/auth/utils.ts` to accept optional geo param:

```typescript
// Current:
auditLog(userId, event, description, ip)

// Updated:
auditLog(userId, event, description, ip, geo?: {
  city?:     string;
  region?:   string;
  country?:  string;
  timezone?: string;
})
```

Update all existing `auditLog()` calls in login, register, 2FA routes
to pass `geoip.lookup(clientIp)` as the geo parameter.

Add to audit log table if not already present:
```typescript
geoCity:   text('geo_city'),
geoRegion: text('geo_region'),
```

---

## 3. Improve `/api/geo` Endpoint

Update or create `GET /api/geo` to return enriched location data:

```typescript
// Response:
{
  ip:           string,
  country:      string | null,
  region:       string | null,
  city:         string | null,
  timezone:     string | null,
  isIndia:      boolean,
  isOdisha:     boolean,      // region === 'OR'
  isBlocked:    boolean,      // would this IP be geo-blocked?
  geoAvailable: boolean,      // false if IP not in MaxMind DB
}
```

This endpoint is already in EXEMPT_PREFIXES — works from anywhere.

---

## 4. Frontend — Show Location in Profile

In `artifacts/sahu-csc/src/pages/profile.tsx` or Security section,
call `GET /api/geo` on mount and display:

```
📍 Your location: Bhubaneswar, Odisha, India
Last login: [date] from [city], [region]
```

If `isOdisha` is false but `isIndia` is true — show info badge:
```
ℹ️ Accessing from outside Odisha
```

---

## 5. Region-aware Rate Limiting

Apply different rate limits based on detected region:

```typescript
function getRegionRateLimit(ip: string) {
  const geo = geoip.lookup(ip);
  if (geo?.region === 'OR') return 200;  // Odisha — genuine operators
  if (geo?.country === 'IN') return 100; // Other India
  return 30;                              // Unknown/other
}
```

Apply to general API routes only.
Auth routes already have their own strict limits — do not touch those.

---

## 6. MaxMind License Key — Startup Warning

In `geoip-updater.ts`, add warning if key is missing:

```typescript
if (!process.env.MAXMIND_LICENSE_KEY) {
  logger.warn(
    'MAXMIND_LICENSE_KEY not set — GeoIP database will not auto-update. ' +
    'Get a free key at maxmind.com and add it to Render environment variables.'
  );
}
```

Add to `.env.example`:
```
# Optional — get free key at maxmind.com
# Without this, GeoIP DB stays on bundled snapshot (may drift stale)
MAXMIND_LICENSE_KEY=
```

---

## 7. New Location Email Template

Create `artifacts/api-server/src/lib/mailer/templates/new-location-alert.ts`:

```
Subject: "New login detected from a different location — SAHU CSC"

Body:
- "We detected a new login to your SAHU CSC account from a new location"
- Location:  {city}, {region}, {country}
- Time:      {timestamp IST}
- Device:    {browser} on {OS}
- IP:        {ip}
- "If this was you, no action needed."
- "If this was NOT you, please change your password immediately."
- CTA Button: "Change Password Now" → forgot-password page

Branding:
- Header background: navy #0B1340
- CTA button: orange #F97316
- Footer note in 3 languages: English + Hindi + Odia
```

---

## 8. Admin Dashboard — Location Stats API

Add `GET /api/admin/geo-stats` (admin only):

```typescript
// Response:
{
  totalLogins: number,
  byRegion: [
    { region: 'OR', name: 'Odisha',      count: 45, percentage: 78 },
    { region: 'MH', name: 'Maharashtra', count: 5,  percentage: 9  },
  ],
  byCity: [
    { city: 'Bargarh',   count: 23 },
    { city: 'Sambalpur', count: 18 },
  ],
  outsideOdisha: number,
  outsideIndia:  number,  // should always be 0 if geo-block working
}
```

Pull data from audit log `geoRegion` and `geoCity` columns.

---

## Files to Modify

| File | Change |
|---|---|
| `routes/auth/login.ts` | Location compare + email alert |
| `lib/auth/utils.ts` | auditLog geo param |
| `routes/auth/register.ts` | Pass geo to auditLog |
| `routes/auth/2fa*.ts` | Pass geo to auditLog |
| `routes/geo.ts` | Enrich /api/geo response |
| `lib/geoip-updater.ts` | Add missing key warning |
| `lib/mailer/templates/` | New location alert template |
| `routes/admin/geo-stats.ts` | New admin stats endpoint |
| `pages/profile.tsx` | Show location in UI |
| `.env.example` | Add MAXMIND_LICENSE_KEY |
| `db/schema.ts` | New columns (show before migration) |

---

## New Replit/Render Secret

| Key | Value | Where |
|---|---|---|
| `MAXMIND_LICENSE_KEY` | Free key from maxmind.com | Optional |

---

*SAHU CSC Manager | blasty8084 | August 2026*
