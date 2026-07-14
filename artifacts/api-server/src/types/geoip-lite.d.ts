// geoip-lite ships no TypeScript declarations. This project doesn't take
// @types/geoip-lite as a dependency, so provide a minimal shim covering the
// subset of the API actually used (geo-block.ts, health.ts, geoip-updater.ts).
declare module "geoip-lite" {
  export interface Lookup {
    range: [number, number];
    country: string;
    region: string;
    eu: "0" | "1";
    timezone: string;
    city: string;
    ll: [number, number];
    metro: number;
    area: number;
  }

  export function lookup(ip: string): Lookup | null;
  export function pretty(ip: string | number): string;
  export function reloadData(cb?: (err?: Error) => void): void;
  export function reloadDataSync(): void;
  export function startWatchingDataUpdate(): void;
  export function stopWatchingDataUpdate(): void;
}
