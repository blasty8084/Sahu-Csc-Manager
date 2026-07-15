# Replit Agent 4 Prompt — Permission Card Component

## Overview
Create a permission request card component that exactly matches the reference
image. Show this card as a modal overlay after first successful login
(when `first_login_completed = false`).

**Component path:** `src/components/PermissionCard/PermissionCard.tsx`

---

## Step 1 UI — "Permissions Required" Card

```
Layout: centered modal overlay (semi-transparent dark backdrop)
Card: white, rounded-2xl, shadow-xl, padding 24px, max-width 360px

Top:
- Purple shield checkmark icon in circular purple-tinted bg
  centered, -mt-8 (floating above card)
- Title: "Permissions Required" (bold, large, centered)
- Subtitle: "To provide you the best experience,
  allow the following permissions." (grey, small, centered)
- X close button (top-right corner, grey)
```

### Permission Rows (inside rounded bordered box):

```
┌─────────────────────────────────────┐
│ [Green bg icon] Location            │
│ 📍 Needed to check nearby services  │
│ and availability.          [Allow]  │
├─────────────────────────────────────┤
│ [Blue bg icon]  Notifications       │
│ 🔔 Get important updates and        │
│ transaction alerts.        [Allow]  │
└─────────────────────────────────────┘
```

Each row:
- Left: colored square icon bg (Location=green, Notifications=blue/purple)
- Middle: permission name (bold) + description (grey, small)
- Right: "Allow" button (outlined, rounded, navy border+text)
- Divider line between rows

### Footer:
```
- 🔒 "Your data is safe and secure with us." (grey, small, centered)
- "Continue" button (full width, purple/navy gradient,
   white text, rounded-xl, shield icon left)
- "Skip for now" text link (grey, small, centered, below button)
```

---

## Step 2 UI — "Setting up Permissions" Card

Triggered when user taps "Continue" — same card updates in place:

```
Title:    "Setting up Permissions"
Subtitle: "Please allow the following permissions to continue."
```

### Permission rows update dynamically:

| Permission | After Allow tapped |
|---|---|
| Location | Green ✅ checkmark + "Allowed" text (green) |
| Notifications | Blue spinning circle + "Requesting..." text (blue) |

After all granted:
- "Continue" button becomes active/dark (was greyed out during requesting)
- Footer text: "We only use permissions to improve your experience."

After Continue tapped:
- Mark `first_login_completed = true` in DB
- Dismiss modal → show dashboard

---

## Permission Request Logic

```typescript
// Step 1: User taps "Allow" on Location row
const locationResult = await new Promise((resolve) => {
  navigator.geolocation.getCurrentPosition(
    () => resolve('granted'),
    () => resolve('denied')
  );
});
setLocationStatus(locationResult); // shows ✅ Allowed

// Step 2: User taps "Allow" on Notifications row
const notifResult = await Notification.requestPermission();
setNotifStatus(notifResult); // shows ✅ Allowed or ❌ Denied

// Save results
localStorage.setItem('perm_location', locationResult);
localStorage.setItem('perm_notifications', notifResult);

// Enable Continue button only after both attempted
setCanContinue(true);
```

---

## Permission Row Status States

| State | UI |
|---|---|
| Default | "Allow" outlined button |
| Requesting | Blue spinner + "Requesting..." |
| Granted | Green ✅ + "Allowed" text |
| Denied | Red ❌ + "Denied" text |

---

## Exact Colors (match reference image)

| Element | Color |
|---|---|
| Shield icon bg | `#EEF0FF` (light purple) |
| Shield icon | `#4F46E5` (indigo) |
| Location icon bg | `#DCFCE7` (light green) |
| Location icon | `#16A34A` (green) |
| Notification icon bg | `#EEF0FF` (light purple) |
| Notification icon | `#4F46E5` (indigo/blue) |
| Allow button border | `#1E293B` (navy) |
| Allow button text | `#1E293B` (navy) |
| Continue button | `#4F46E5` (indigo gradient) |
| Allowed text | `#16A34A` (green) |
| Requesting text | `#4F46E5` (indigo) |
| Skip text | `#6B7280` (grey) |

---

## When to Show

```typescript
// After login success, before dashboard render:
const user = await getCurrentUser();
if (!user.first_login_completed) {
  showPermissionCard(); // show modal
} else {
  redirectToDashboard(); // skip
}
```

---

## Database Change

```sql
ALTER TABLE users
ADD COLUMN first_login_completed BOOLEAN DEFAULT false;
```

---

## API Endpoint

```
PATCH /api/users/first-login-completed
→ sets first_login_completed = true
→ called after user taps final Continue
```

---

## Component State Machine

```
IDLE
  ↓ (login success + first_login_completed = false)
SHOW_STEP_1
  ↓ (user taps Continue)
SHOW_STEP_2
  ↓ (requesting location)
LOCATION_REQUESTING
  ↓ (granted or denied)
LOCATION_DONE
  ↓ (requesting notifications)
NOTIFICATION_REQUESTING
  ↓ (granted or denied)
ALL_DONE (Continue button enabled)
  ↓ (user taps Continue)
API_CALL (PATCH first-login-completed)
  ↓ (success)
DISMISS → DASHBOARD
```

---

## Rules

- Never show again after `first_login_completed = true`
- If user taps X or "Skip for now" → still mark `first_login_completed = true`
- Both permissions requested one by one (not simultaneously)
- Continue button disabled until both permissions attempted
  (granted OR denied — either is acceptable)
- iOS Safari: skip Notifications step silently
  (Notification API not supported in browser on iOS)
- Do not change any existing UI, branding, API contracts, or auth flow

---

## File Structure

```
src/
└── components/
    └── PermissionCard/
        ├── PermissionCard.tsx      ← Main component
        ├── PermissionRow.tsx       ← Single permission row
        ├── usePermissions.ts       ← Permission request logic hook
        └── index.ts                ← Export
```

---

*SAHU CSC Manager | blasty8084 | July 2026*
