// Barrel re-export — all call sites import from "lib/auth" without changes.
// Internals are split by concern:
//   lib/auth/utils.ts       — password hashing, device parsing, IP, audit log
//   lib/auth/middleware.ts  — Express middleware (requireAuth, requireRole, requirePermission)
export * from "./auth/utils";
export * from "./auth/middleware";
