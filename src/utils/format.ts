const NF = new Intl.NumberFormat("en-US");
export const fmt = (n: number) => NF.format(Math.round(n));
export function money(n: number, cur = "NOK"): string {
  const a = Math.abs(n);
  const sign = n < 0 ? "−" : "";
  if (a >= 1e6) return `${sign}${cur} ${(a / 1e6).toFixed(a % 1e6 === 0 ? 0 : 1)}M`;
  if (a >= 1e3) return `${sign}${cur} ${(a / 1e3).toFixed(0)}k`;
  return `${sign}${cur} ${fmt(a)}`;
}
export const pct = (a: number, b: number) => (b ? Math.min(100, Math.round((a / b) * 100)) : 0);
export function sum<T>(arr: T[], key?: keyof T): number {
  return arr.reduce((acc, x) => acc + (key ? Number(x[key]) : Number(x)), 0);
}
export const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 28) || "mission";
