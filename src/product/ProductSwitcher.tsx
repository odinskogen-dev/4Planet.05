import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { contextHref, type ProductKey } from "@/product/ProductNav";

/**
 * PRD-PQ02 — Four-square Product Switcher.
 * Replaces the floating product rail. Quiet, discoverable, accessible.
 * Fixed order 4PLANET · ATLAS · SPECIES · IMPACT; active node in the contextual accent.
 * Governing spec: Product Switcher & Shared Shell Specification v1.0.
 */

type Product = { key: ProductKey; label: string; descriptor: string; path: string; index: number };

const PRODUCTS: Product[] = [
  { key: "4PLANET", label: "4PLANET", descriptor: "The public universe", path: "/", index: 0 },
  { key: "ATLAS", label: "ATLAS", descriptor: "Explore the living planet", path: "/atlas", index: 1 },
  { key: "SPECIES", label: "SPECIES", descriptor: "Meet life on Earth", path: "/species", index: 2 },
  { key: "LIVING SYSTEMS", label: "LIVING SYSTEMS", descriptor: "Understand the relationships", path: "/living-systems", index: 3 },
  { key: "IMPACT", label: "IMPACT", descriptor: "Join credible action", path: "/impact", index: 4 },
];

function activeProduct(pathname: string): ProductKey {
  if (pathname.startsWith("/atlas")) return "ATLAS";
  if (pathname.startsWith("/species")) return "SPECIES";
  if (pathname.startsWith("/living-systems")) return "LIVING SYSTEMS";
  if (pathname.startsWith("/impact")) return "IMPACT";
  return "4PLANET";
}

/**
 * WS-A — Product Switcher, two founder-review options.
 * OPTION A: a refined family mark — four nodes on a quiet baseline that reads as a
 *   product-family relationship, not a generic app grid; the active node carries
 *   the contextual accent.
 * OPTION B: a typographic product-family trigger — "4·" wordmark with the active
 *   product initial, subtle and editorial.
 * Neither repeats the same icon inside every panel row.
 */
type SwitcherVariant = "A" | "B";

function FamilyMark({ activeIndex, dark, accent = "#2E2EFF", size = 20 }: { activeIndex: number; dark?: boolean; accent?: string; size?: number }) {
  const idle = dark ? "rgba(255,255,255,.5)" : "rgba(8,8,8,.4)";
  const r = Math.max(2, Math.round(size * 0.1));
  // Five nodes on a quiet ring — a product-family relationship, not an app grid.
  const n = 5;
  const pts = Array.from({ length: n }, (_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return { x: 50 + 32 * Math.cos(a), y: 50 + 32 * Math.sin(a) };
  });
  const ring = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ") + " Z";
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 100 100" style={{ display: "block" }}>
      <path d={ring} fill="none" stroke={idle} strokeWidth={2.5} strokeOpacity={0.45} strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={i === activeIndex ? r * 1.5 : r}
          fill={i === activeIndex ? accent : idle} />
      ))}
    </svg>
  );
}

function TypeMark({ activeLabel, dark, accent = "#2E2EFF" }: { activeLabel: string; dark?: boolean; accent?: string }) {
  const fg = dark ? "#fff" : "#080808";
  return (
    <span aria-hidden style={{ display: "inline-flex", alignItems: "baseline", gap: 3, fontFamily: "'Instrument Sans','DM Sans',sans-serif", fontWeight: 600, letterSpacing: "-.02em", lineHeight: 1 }}>
      <span style={{ fontSize: 17, color: fg }}>4</span>
      <span style={{ width: 4, height: 4, borderRadius: "50%", background: accent, alignSelf: "center" }} />
      <span style={{ fontSize: 11, fontFamily: "'Fragment Mono',monospace", letterSpacing: ".1em", color: dark ? "rgba(255,255,255,.7)" : "rgba(8,8,8,.6)" }}>{activeLabel}</span>
    </span>
  );
}

export function ProductSwitcher({ dark = false, accent = "#2E2EFF", variant = "A" }: { dark?: boolean; accent?: string; variant?: SwitcherVariant }) {
  const location = useLocation();
  const active = activeProduct(location.pathname);
  const activeIdx = PRODUCTS.find((p) => p.key === active)!.index;
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setOpen(false); }, [location.pathname, location.search]);

  useEffect(() => {
    if (!open) return;
    const firstLink = panelRef.current?.querySelector<HTMLElement>("a[href]");
    firstLink?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); setOpen(false); triggerRef.current?.focus(); return; }
      if (e.key === "Tab" && panelRef.current) {
        const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled])'));
        if (items.length === 0) return;
        const first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = useCallback(() => { setOpen(false); triggerRef.current?.focus(); }, []);

  const fg = dark ? "#fff" : "#080808";
  const panelBg = dark ? "#0A0F26" : "#fff";
  const panelLine = dark ? "rgba(255,255,255,.22)" : "rgba(8,8,8,.16)";
  const descColor = dark ? "rgba(255,255,255,.66)" : "rgba(8,8,8,.62)";

  return (
    <div style={{ position: "relative", display: "inline-flex" }}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="product-switcher-panel"
        aria-label={`Switch product, current product ${active}`}
        className="product-switcher__trigger"
        style={{ display: "inline-flex", alignItems: "center", justifyContent: "flex-start", gap: 8, minWidth: 44, height: 44,
          background: "transparent", border: "none", cursor: "pointer", padding: 0, color: fg }}
      >
        {variant === "B"
          ? <TypeMark activeLabel={active} dark={dark} accent={accent} />
          : <FamilyMark activeIndex={activeIdx} dark={dark} accent={accent} />}
        {/* Discoverability: current product is legible as a label, not only an abstract mark. */}
        <span className="ps-current" aria-hidden style={{ display: "inline-flex", alignItems: "center", gap: 5,
          fontFamily: "'Fragment Mono', monospace", fontSize: 11.5, letterSpacing: ".1em", color: dark ? "rgba(255,255,255,.82)" : "rgba(8,8,8,.72)" }}>
          {active}
          <svg width="9" height="6" viewBox="0 0 9 6" style={{ display: "block", opacity: .8 }} aria-hidden>
            <path d="M1 1l3.5 3.5L8 1" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {open && (
        <>
          <div onClick={close} aria-hidden
            style={{ position: "fixed", inset: 0, zIndex: 60, background: dark ? "rgba(0,0,0,.42)" : "rgba(8,8,8,.28)" }} />
          <div
            ref={panelRef}
            id="product-switcher-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Switch product"
            className="product-switcher__panel"
            style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 61, width: 340, maxWidth: "calc(100vw - 32px)",
              background: panelBg, border: `1px solid ${panelLine}`,
              boxShadow: dark ? "0 24px 60px rgba(0,0,0,.5)" : "0 24px 60px rgba(8,8,8,.18)" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: `1px solid ${panelLine}` }}>
              <span style={{ fontFamily: "var(--font-mono, 'Fragment Mono', monospace)", fontSize: 10.5, letterSpacing: ".16em", textTransform: "uppercase", color: descColor }}>4PLANET · four products</span>
              <button onClick={close} aria-label="Close product switcher"
                style={{ fontFamily: "'Fragment Mono', monospace", fontSize: 11, background: "none", border: "none", cursor: "pointer", color: descColor }}>ESC ✕</button>
            </div>
            {PRODUCTS.map((p) => {
              const isActive = p.key === active;
              return (
                <Link
                  key={p.key}
                  to={contextHref(p.path, location.search)}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  style={{ display: "flex", gap: 14, alignItems: "center", padding: "14px 18px", textDecoration: "none",
                    color: fg, borderBottom: p.index < 4 ? `1px solid ${panelLine}` : "none",
                    background: isActive ? (dark ? "rgba(255,255,255,.06)" : "rgba(8,8,8,.03)") : "transparent" }}
                >
                  <span style={{ fontFamily: "'Fragment Mono', monospace", fontSize: p.index === 0 ? 8.5 : 11, letterSpacing: ".08em", color: descColor, width: 30, flex: "none" }}>{p.index === 0 ? "HOME" : `0${p.index}`}</span>
                  <span style={{ flex: 1 }}>
                    <span style={{ display: "block", fontFamily: "'Instrument Sans', 'DM Sans', sans-serif", fontWeight: 600, fontSize: 18, letterSpacing: "-.01em", color: isActive ? accent : fg }}>{p.label}</span>
                    <span style={{ display: "block", fontSize: 13, color: descColor, marginTop: 2 }}>{p.descriptor}</span>
                  </span>
                  <span aria-hidden style={{ width: 7, height: 7, borderRadius: "50%", flex: "none",
                    background: isActive ? accent : "transparent", border: isActive ? "none" : `1px solid ${panelLine}` }} />
                </Link>
              );
            })}
            <div style={{ padding: "12px 18px", fontFamily: "'Fragment Mono', monospace", fontSize: 10.5, letterSpacing: ".04em", color: descColor }}>
              PUBLIC PREVIEW · <Link to="/about#system" onClick={() => setOpen(false)} style={{ color: accent, textDecoration: "none" }}>limitations &amp; sources</Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
