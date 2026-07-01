---
name: setTimeout 32-bit overflow
description: setTimeout silently clamps to 1ms for delays >2.1B ms (>24.8 days), causing infinite tight loops — use node-cron instead
---

## Rule
Never use `setTimeout` for delays exceeding ~24 days (~2,147,483,647 ms). Node.js internally uses a signed 32-bit integer for timer durations; any larger value is silently clamped to **1 ms**, causing the callback to fire immediately and re-schedule in an infinite tight loop.

**Why:** `monthly-export.ts` used `setTimeout(tick, msUntilFirstOfNextMonth())` which returned ~2.6B ms (≈30 days). Node clamped it to 1ms → `tick()` fired instantly, logged "SMTP not configured", rescheduled → thousands of log lines per second, 100% CPU spin.

**How to apply:** Any scheduler for intervals longer than ~24 days must use `node-cron` (already a project dependency). Monthly export now uses cron expression `"5 0 1 * *"` (00:05 on 1st of every month). Watch for `TimeoutOverflowWarning` in API logs as the canary for this bug.
