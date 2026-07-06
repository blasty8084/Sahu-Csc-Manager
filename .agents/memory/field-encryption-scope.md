---
name: Field-level encryption scope and key management
description: How to decide which fields to encrypt at rest and how to manage the encryption key without user-provided secrets
---

## Scope decision

When adding application-level encryption at rest, do not blindly encrypt every PII column. Check how each field is queried first:

- Fields matched via `ILIKE '%...%'` / other substring or fuzzy search **must stay plaintext** (or use a dedicated searchable-encryption scheme, which is a much bigger lift). Standard AES ciphertext does not preserve substring relationships, so encrypting a searched column silently breaks search.
- Fields used for exact-match lookups (e.g. login by email/username) also need to stay plaintext unless a deterministic encryption scheme is used everywhere that field is compared.
- Free-text fields that are only ever displayed, never filtered/searched (address, bio, notes, etc.) are the safe, high-value targets for encryption.

**Why:** encrypting a searched field is the kind of mistake that looks fine until a user reports search "stopped working" — much harder to debug after the fact than deciding scope up front.

**How to apply:** grep for `ilike`/`like`/`.where(eq(...))` on a column before adding it to an encryption pass.

## Key management without requesting a secret

For an encryption key that is purely internal to the app (not a third-party credential), it's reasonable to auto-generate it in code and persist it in a settings/config table rather than asking the user to paste in a value via `requestEnvVar` — the user has no way to generate a cryptographically secure key themselves anyway.

Pattern (same one already used for VAPID push keys in this app):
1. Check for an optional override via an environment secret (for advanced/production deployments).
2. If not set, check a persistent store (e.g. a `settings` key-value table) for a previously generated key.
3. If neither exists, generate a random key, persist it, and use it going forward.

**Why:** avoids blocking on user input for something they can't meaningfully provide, while still allowing power users to override it. Must persist (not regenerate per boot) or previously-encrypted data becomes unreadable after a restart.
