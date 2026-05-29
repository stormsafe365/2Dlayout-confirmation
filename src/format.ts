export const clamp = (v: number, a: number, b: number) =>
  Math.max(a, Math.min(b, v));

export const round = (v: number, step: number) =>
  Math.round(v / step) * step;

/** Render a length in feet as feet'-inches" ("12'", "12'6\""). */
export function ft(v: number): string {
  const f = Math.floor(v + 1e-6);
  let i = Math.round((v - f) * 12);
  let ff = f;
  if (i === 12) {
    ff++;
    i = 0;
  }
  return i === 0 ? `${ff}'` : `${ff}'${i}"`;
}

/** One inch in feet. Used for snap precision. */
export const INCH = 1 / 12;

/**
 * Parse a length string in feet/inches notation to a decimal-feet number.
 * Accepts:  `2'3"`  `2' 3"`  `2'3`  `2'`  `27"`  `2.25`  `27`
 * Plain numbers are treated as feet.
 * Returns NaN if it can't parse.
 */
export function parseFt(input: string): number {
  const s = (input || "").trim();
  if (!s) return NaN;
  // 2'3" or 2'3 or 2' 3
  let m = s.match(/^(-?\d+(?:\.\d+)?)\s*'\s*(\d+(?:\.\d+)?)\s*"?$/);
  if (m) return +m[1] + +m[2] / 12;
  // 2'
  m = s.match(/^(-?\d+(?:\.\d+)?)\s*'$/);
  if (m) return +m[1];
  // 27" (inches only)
  m = s.match(/^(\d+(?:\.\d+)?)\s*"$/);
  if (m) return +m[1] / 12;
  // 2.25 or 27 — treat as feet
  m = s.match(/^(-?\d+(?:\.\d+)?)$/);
  if (m) return +m[1];
  return NaN;
}

export function escapeHtml(s: string): string {
  return (s + "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!));
}

export function todayString(): string {
  const d = new Date();
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
}
