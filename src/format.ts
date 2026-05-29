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

export function escapeHtml(s: string): string {
  return (s + "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!));
}

export function todayString(): string {
  const d = new Date();
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
}
