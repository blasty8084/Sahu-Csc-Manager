---
name: Shared health probing
description: Prevents duplicate browser health requests from repeated hook instances and lazy-loaded chunks.
---

Network-status hooks are used across many dashboard and PWA components. A module-local singleton is not sufficient because Vite can place separate copies of the hook in lazy chunks. The probe state and timer must be stored on `globalThis` so every chunk shares one browser-level `/api/health` probe.

**Why:** Multiple independent hook timers produced bursts of identical HEAD health requests in the browser Network panel, creating unnecessary API traffic and making the server appear to be spamming health checks.

**How to apply:** Keep the shared probe interval at 30 seconds, deduplicate in-flight requests, and treat Replit/platform health probes separately from app-owned polling.