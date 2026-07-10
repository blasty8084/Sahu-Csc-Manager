// Barrel re-export — call sites import from "routes/udhari" unchanged.
// Split by concern:
//   udhari/customers.ts  — customer CRUD + summary + recalcBalance
//   udhari/entries.ts    — entry CRUD (gives/gets) per customer
export { default } from "./udhari/index";
