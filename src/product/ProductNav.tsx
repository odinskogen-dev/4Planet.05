import { Link, useLocation } from "react-router-dom";

export type ProductKey = "4PLANET" | "ATLAS" | "SPECIES" | "IMPACT";

const PRODUCTS: Array<{ key: ProductKey; label: string; path: string }> = [
  { key: "4PLANET", label: "4PLANET", path: "/story" },
  { key: "ATLAS", label: "ATLAS", path: "/atlas" },
  { key: "SPECIES", label: "SPECIES", path: "/species" },
  { key: "IMPACT", label: "IMPACT", path: "/impact" },
];

const CONTEXT_KEYS = ["entity", "journey", "record"] as const;

export function contextHref(path: string, currentSearch = "", overrides: Record<string, string | null> = {}) {
  const current = new URLSearchParams(currentSearch);
  const next = new URLSearchParams();
  CONTEXT_KEYS.forEach((key) => {
    const value = key in overrides ? overrides[key] : current.get(key);
    if (value) next.set(key, value);
  });
  Object.entries(overrides).forEach(([key, value]) => {
    if (!CONTEXT_KEYS.includes(key as (typeof CONTEXT_KEYS)[number]) && value) next.set(key, value);
  });
  const query = next.toString();
  return query ? `${path}?${query}` : path;
}

function activeProduct(pathname: string): ProductKey {
  if (pathname === "/" || pathname.startsWith("/atlas")) return "ATLAS";
  if (pathname.startsWith("/species")) return "SPECIES";
  if (pathname.startsWith("/impact")) return "IMPACT";
  return "4PLANET";
}

export function ProductNav() {
  const location = useLocation();
  const active = activeProduct(location.pathname);
  const hasContext = CONTEXT_KEYS.some((key) => new URLSearchParams(location.search).has(key));

  return (
    <nav className={`product-nav product-nav--${active.toLowerCase()}`} aria-label="4PLANET product navigation">
      <div className="product-nav__links">
        {PRODUCTS.map((product) => (
          <Link
            key={product.key}
            to={contextHref(product.path, location.search)}
            aria-current={active === product.key ? "page" : undefined}
            className={active === product.key ? "is-active" : ""}
          >
            {product.label}<span aria-hidden>_</span>
          </Link>
        ))}
      </div>
      {hasContext && <span className="product-nav__context">CONTEXT PRESERVED</span>}
    </nav>
  );
}
