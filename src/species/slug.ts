export function canonicalTaxonSlug(canonicalName: string): string {
  return canonicalName
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[×✕]/g, "x")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function scientificNameFromCanonicalSlug(slug: string): string {
  const tokens = slug
    .trim()
    .toLowerCase()
    .split("-")
    .filter(Boolean);
  if (!tokens.length) return "";
  return [tokens[0][0]?.toUpperCase() + tokens[0].slice(1), ...tokens.slice(1)].join(" ");
}

export function canonicalSpeciesPath(canonicalName: string): string {
  return `/species/${canonicalTaxonSlug(canonicalName)}`;
}
