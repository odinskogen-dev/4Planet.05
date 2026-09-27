export function fourPlanetReturnUrl(location: {
  origin?: string;
  pathname?: string;
  search?: string;
} = {}) {
  const path = `${location.pathname || "/"}${location.search || ""}`;
  const origin = location.origin || "https://4planet.org";
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}
