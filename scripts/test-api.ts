#!/usr/bin/env tsx
/**
 * SAHU CSC — API Health Test Suite
 * Orchestrates all test suites. Add new suite imports here as the script grows.
 * Usage:  PORT=8080 npx tsx scripts/test-api.ts
 *
 * Run a single suite directly:
 *   PORT=8080 npx tsx scripts/test-auth.ts
 */

import { BASE, BOLD, CYAN, GREEN, RED, RESET, fail, printSummary, waitForServer } from "./test-utils.js";
import { runPublicTests, runAuthProtectionTests, runLoginInvalidTests, runAdminTests, runOperatorTests } from "./test-auth.js";

async function main() {
  console.log(`\n${BOLD}SAHU CSC — API Health Test Suite${RESET}`);
  console.log(`Target: ${CYAN}${BASE}${RESET}\n`);

  process.stdout.write("  Waiting for API server...");
  const ready = await waitForServer();
  if (!ready) {
    process.stdout.write(` ${RED}timeout${RESET}\n`);
    fail("API server did not become ready within 15 s");
    printSummary();
    process.exit(1);
  }
  process.stdout.write(` ${GREEN}ready${RESET}\n`);

  await runPublicTests();
  await runAuthProtectionTests();
  await runLoginInvalidTests();
  await runAdminTests();
  await runOperatorTests();
  // Add further suites here: await runLedgerTests(), etc.

  printSummary();
}

main().catch(err => {
  console.error(`${RED}Unexpected error:${RESET}`, err);
  process.exit(1);
});
