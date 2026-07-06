import xss from "xss";

const options: xss.IFilterXSSOptions = {
  whiteList: {},
  stripIgnoreTag: true,
  stripIgnoreTagBody: ["script", "style"],
};

/**
 * Strip all HTML/XSS from a user-supplied string.
 * Returns null/undefined unchanged (no-op for empty fields).
 */
export function sanitize(value: string): string;
export function sanitize(value: string | null | undefined): string | null | undefined;
export function sanitize(value: string | null | undefined): string | null | undefined {
  if (value === null || value === undefined) return value;
  return xss(value.trim(), options);
}
