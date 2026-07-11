import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    // No globals — every test file imports from "vitest" explicitly.
    globals: false,
  },
});
