# Replit Agent 4 --- Security Features Implementation

## Objective

Implement three security and UX features:

1.  First-time login permission flow
2.  2FA authentication (OTP + TOTP)
3.  Single-device login enforcement with 2FA on new device login

> **Constraints**
>
> -   No UI branding changes
> -   No business logic changes outside these features
> -   Show database schema changes before running migrations

------------------------------------------------------------------------

# Feature 1 --- First Login Permission Flow

After user logs in successfully for the very first time
(`users.first_login_completed = false`), display a fullscreen permission
overlay before redirecting to the dashboard.

## Database Change

``` sql
ALTER TABLE users
ADD COLUMN first_login_completed BOOLEAN DEFAULT false;
```

## Flow

### Step 1 --- Notifications (Required)

-   Icon: 🔔
-   Title: Notifications Allow Karein
-   Description: Transaction alerts aur payment reminders ke liye
-   Button: Allow
-   Action: `Notification.requestPermission()`
-   Cannot skip

### Step 2 --- File Access (Required)

-   Icon: 📁
-   Title: File Access Allow Karein
-   Description: Receipts download karne ke liye storage access zaruri
    hai
-   Button: Allow
-   Trigger file picker/download prompt
-   Cannot skip

After both permission requests finish (granted or denied):

``` ts
await api.patch('/users/first-login-completed');
```

Set:

``` text
first_login_completed = true
```

Never show again.

------------------------------------------------------------------------

# Feature 2 --- Two Factor Authentication

Supports:

-   OTP (SMS/Email)
-   TOTP (Google Authenticator/Authy)

## Database Changes

``` sql
ALTER TABLE users
ADD COLUMN two_fa_enabled BOOLEAN DEFAULT false,
ADD COLUMN two_fa_method VARCHAR(10) DEFAULT 'otp',
ADD COLUMN totp_secret TEXT,
ADD COLUMN two_fa_verified_at TIMESTAMP;
```

## OTP Login Flow

Password Verified

↓

Generate 6-digit OTP

↓

Store hashed OTP

↓

Send SMS/Email

↓

User enters OTP

↓

Verify

↓

Create Session

↓

Dashboard

OTP lifetime:

-   10 minutes

## TOTP Setup

Install:

``` bash
pnpm --filter @workspace/api-server add otplib qrcode

pnpm --filter @workspace/api-server add -D @types/qrcode
```

Setup Steps

1.  Generate Secret
2.  Generate QR Code
3.  Scan using Authenticator App
4.  Enter verification code
5.  Encrypt secret using AES-256-GCM
6.  Store in database

Verification:

``` ts
authenticator.verify({
    token:userCode,
    secret:storedSecret
})
```

### Backup Codes

Generate:

-   8 codes

Store:

-   bcrypt hash only

## API

    POST /api/auth/2fa/setup-totp
    POST /api/auth/2fa/verify-totp
    POST /api/auth/2fa/verify-otp
    POST /api/auth/2fa/disable
    GET  /api/auth/2fa/status

------------------------------------------------------------------------

# Feature 3 --- Single Device Login

## New Table

``` sql
CREATE TABLE device_sessions (
 id SERIAL PRIMARY KEY,
 user_id INTEGER REFERENCES users(id),
 session_id TEXT NOT NULL,
 device_name TEXT,
 device_fingerprint TEXT,
 ip_address TEXT,
 last_active TIMESTAMP DEFAULT NOW(),
 is_trusted BOOLEAN DEFAULT false,
 created_at TIMESTAMP DEFAULT NOW()
);
```

## Device Fingerprint

``` ts
const fingerprint = await crypto.subtle.digest(
'SHA-256',
new TextEncoder().encode([
navigator.userAgent,
navigator.language,
screen.width,
screen.height,
Intl.DateTimeFormat().resolvedOptions().timeZone
].join('|'))
);
```

## Login Flow

Password

↓

Check Device

↓

Known Device

→ Login

New Device

↓

OTP/TOTP

↓

Verify

↓

Invalidate Old Session

↓

Create New Session

↓

Dashboard

## Trusted Device

After successful verification:

    Trust this device for 30 days?

    [Yes]
    [No]

If trusted:

Skip 2FA for 30 days.

## APIs

    GET /api/auth/devices

    DELETE /api/auth/devices/:id

    DELETE /api/auth/devices/all

    POST /api/auth/devices/verify

------------------------------------------------------------------------

# Security Rules

-   Encrypt TOTP secret using AES-256-GCM
-   Hash backup codes with bcrypt
-   Rate limit:
    -   5 attempts / 15 minutes
-   Log failed attempts into security_logs
-   Immediately invalidate old sessions

------------------------------------------------------------------------

# Implementation Order

1.  Show database schema changes
2.  Run migrations
3.  Install otplib + qrcode
4.  First login permission flow
5.  OTP 2FA
6.  TOTP
7.  Device fingerprinting
8.  Single-device enforcement
9.  Security settings UI
10. Device management UI

------------------------------------------------------------------------

# Deliverables

-   Database migrations
-   Backend APIs
-   Authentication middleware updates
-   Security settings UI
-   Device management UI
-   Session enforcement
-   No unrelated UI or business logic changes
