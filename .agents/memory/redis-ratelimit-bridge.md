---
name: Redis rate-limit bridge
description: rate-limit-redis sendCommand must use Upstash REST fetch, not the @upstash/redis client — which has no sendCommand method.
---

# Redis rate-limit bridge (Upstash + rate-limit-redis)

## Rule
`rate-limit-redis` requires a `sendCommand(command, ...args)` function. `@upstash/redis` is an HTTP client and does **not** expose `sendCommand`. The correct bridge is a direct `fetch` to the Upstash REST API.

```typescript
sendCommand: async (...args: string[]): Promise<unknown> => {
  const res = await fetch(UPSTASH_REDIS_REST_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  });
  const json = (await res.json()) as { result: unknown; error?: string };
  if (json.error) throw new Error(`Upstash error: ${json.error}`);
  return json.result;
},
```

**Why:** Upstash REST API accepts `POST <url>` with body `["COMMAND", ...args]` and returns `{ result: ... }`. This works for every Redis command that rate-limit-redis uses (EVAL, EVALSHA, EXPIRE, PEXPIRE, GET, SET).

**How to apply:** Any time `rate-limit-redis` is used with `@upstash/redis` credentials (REST URL + token), use this fetch bridge. Do NOT pass the `@upstash/redis` client object directly.
