---
name: Login and Register page mobile design pattern
description: Mobile auth pages use h-screen + compact navy header + slide-up white card; specific design rules for login and register.
---

All mobile auth pages (`login.tsx`, `register.tsx`, `forgot-password.tsx`) share the same layout shell:

```
<div className="h-screen flex flex-col overflow-hidden" style={{ background: "#0B1340" }}>
  {/* Compact navy header — flex-shrink-0 */}
  <div className="flex-shrink-0 pt-6 px-6 pb-4 flex flex-col items-center text-center">
    <LoginLogo size={52} />
    <h1>SAHU <span orange>CSC</span></h1>
    <p className="text-white/50 text-xs">…subtitle…</p>
  </div>
  {/* White card — flex-1, slides up via framer-motion */}
  <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} className="flex-1 bg-white rounded-t-3xl ...">
    <div className="flex-1 overflow-y-auto px-6 pt-5 pb-6">…form content…</div>
  </motion.div>
</div>
```

**login.tsx mobile specifics:**
- "Forgot Password?" link uses navy `#0b2c60` (not orange `#F97316`)
- After the form: "or" divider → dashed blue "Register here →" card (links to `/register`, background `#eff6ff`, border `#bfdbfe`)
- After the register card: "🔒 Trusted. Secure. Reliable." footer in `text-gray-400`

**register.tsx mobile specifics:**
- Back arrow (`ArrowLeft`) in the top-left of the header, styled as a frosted pill button (`rgba(255,255,255,0.15)`)
- Card heading: "Create your account / Join SAHU CSC and get started"
- After `<RegisterForm />`: navy security badge (`#e8eef8` background, `#0b2c60` Shield icon)
- "Login here →" link in navy `#0b2c60`

**Why:** Using `h-screen overflow-hidden` (not `min-h-screen`) keeps all content inside the viewport with no page-level scroll on short screens. The `flex-1 overflow-y-auto` inner div handles scroll if the form overflows.

**How to apply:** Any new auth-flow page (e.g. email verification, 2FA) should follow this exact shell. Do not use `min-h-screen` on mobile auth pages.
