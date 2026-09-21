import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { contextHref, type ProductKey } from "@/product/ProductNav";

/**
 * PRD-PQ02 — Four-square Product Switcher.
 * Replaces the floating product rail. Quiet, discoverable, accessible.
 * Fixed order 4PLANET · ATLAS · SPECIES · IMPACT; active square #2E2EFF.
 * Governing spec: Product Switcher & Shared Shell Specification v1.0.
 */

type Product = { key: ProductKey; label: string; descriptor: string; path: string; index: number };

const PRODUCTS: Product[] = [
  { key: "4PLANET", label: "4PLANET", descriptor: "The public universe", path: "/", index: 0 },
  { key: "ATLAS", label: "ATLAS", descriptor: "Explore the living planet", path: "/atlas", index: 1 },
  { key: "SPECIES", label: "SPECIES", descriptor: "Understand life", path: "/species", index: 2 },
  { key: "IMPACT", label: "IMPACT", descriptor: "Join credible action", path: "/impact", index: 3 },
];

function activeProduct(pathname: string): ProductKey {
  if (pathname.startsWith("/atlas")) return "ATLAS";
  if (pathname.startsWith("/species")) return "SPECIES";
  if (pathname.startsWith("/impact")) return "IMPACT";
  return "4PLANET";
}

/** The four-square mark. `activeIndex` fills one square with brand blue. */
function FourSquare({ activeIndex, dark, size = 22 }: { activeIndex: number; dark?: boolean; size?: number }) {
  const gap = size >= 20 ? 3 : 2;
  const cell = (size - gap) / 2;
  const line = dark ? "rgba(255,255,255,.85)" : "rgba(8,8,8,1)";
  return (
    <span aria-hidden style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap, width: size, height: size }}>
      {[0, 1, 2, 3].map((i) => (
        <span key={i} style={{ width: cell, height: cell, boxSizing: "border-box",
          background: i === activeIndex ? "#2E2EFF" : "transparent",
          border: `1.4px solid ${i === activeIndex ? "#2E2EFF" : line}` }} />
      ))}
    </span>
  );
}

export function ProductSwitcher({ dark = false }: { dark?: boolean }) {
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
        style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 44, height: 44,
          background: "transparent", border: "none", cursor: "pointer", padding: 0, color: fg }}
      >
        <FourSquare activeIndex={activeIdx} dark={dark} />
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
              <span style={{ fontFamily: "var(--font-mono, 'Fragment Mono', monospace)", fontSize: 10.5, letterSpacing: ".16em", textTransform: "uppercase", color: descColor }}>Switch product</span>
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
                    color: fg, borderBottom: p.index < 3 ? `1px solid ${panelLine}` : "none",
                    background: isActive ? (dark ? "rgba(46,46,255,.14)" : "rgba(46,46,255,.04)") : "transparent" }}
                >
                  <span style={{ fontFamily: "'Fragment Mono', monospace", fontSize: 11, color: descColor, width: 22, flex: "none" }}>0{p.index + 1}</span>
                  <span style={{ flex: 1 }}>
                    <span style={{ display: "block", fontFamily: "'Instrument Sans', 'DM Sans', sans-serif", fontWeight: 600, fontSize: 18, letterSpacing: "-.01em", color: isActive ? "#2E2EFF" : fg }}>{p.label}</span>
                    <span style={{ display: "block", fontSize: 13, color: descColor, marginTop: 2 }}>{p.descriptor}</span>
                  </span>
                  <FourSquare activeIndex={p.index} dark={dark} size={16} />
                </Link>
              );
            })}
            <div style={{ padding: "12px 18px", fontFamily: "'Fragment Mono', monospace", fontSize: 10.5, letterSpacing: ".04em", color: descColor }}>
              PUBLIC PREVIEW · <Link to="/about#system" onClick={() => setOpen(false)} style={{ color: "#2E2EFF", textDecoration: "none" }}>limitations &amp; sources</Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
