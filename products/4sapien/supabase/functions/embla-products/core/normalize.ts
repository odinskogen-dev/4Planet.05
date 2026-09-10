export function norm(v: unknown) {
  return String(v || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("nb-NO")
    .replace(/[^a-z0-9æøå]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function tokenSet(v: unknown) {
  return new Set(norm(v).split(" ").filter(Boolean));
}

export function arrText(v: unknown) {
  return Array.isArray(v) ? v.join(" ") : String(v || "");
}

export function norwayRank(p: any) {
  const c = Array.isArray(p?.countries_tags) ? p.countries_tags.join(" ").toLowerCase() : "";
  return c.includes("norway") || c.includes("norge") ? 1 : 0;
}
