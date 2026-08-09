import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { contextHref, type ProductKey } from "@/product/ProductNav";

type Product = { key: ProductKey; label: string; job: string; path: string; index: number };

const PRODUCTS: Product[] = [
  { key: "4PLANET", label: "4PLANET", job: "The public front door", path: "/", index: 0 },
  { key: "ATLAS", label: "ATLAS", job: "See places, data and signals", path: "/atlas", index: 1 },
  { key: "SPECIES", label: "SPECIES", job: "Begin with life", path: "/species", index: 2 },
  { key: "IMPACT", label: "IMPACT", job: "Act with evidence and proof", path: "/impact", index: 3 },
];

function activeProduct(pathname: string): ProductKey {
  if (pathname.startsWith("/atlas")) return "ATLAS";
  if (pathname.startsWith("/species")) return "SPECIES";
  if (pathname.startsWith("/impact")) return "IMPACT";
  return "4PLANET";
}

function FamilyRail({ activeIndex, dark = false }: { activeIndex: number; dark?: boolean }) {
  const line = dark ? "rgba(255,255,255,.42)" : "rgba(10,10,10,.28)";
  return (
    <span aria-hidden style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
      {PRODUCTS.map((p) => <span key={p.key} style={{ width: p.index === activeIndex ? 14 : 7, height: 2, background: p.index === activeIndex ? "#2E2EFF" : line, transition: "width .2s ease" }} />)}
    </span>
  );
}

export function ProductSwitcher({ dark = false }: { dark?: boolean }) {
  const location = useLocation();
  const active = activeProduct(location.pathname);
  const activeProductItem = PRODUCTS.find((p) => p.key === active)!;
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setOpen(false); }, [location.pathname, location.search]);
  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>("a[href]")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); setOpen(false); triggerRef.current?.focus(); return; }
      if (e.key !== "Tab" || !panelRef.current) return;
      const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled])'));
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = useCallback(() => { setOpen(false); triggerRef.current?.focus(); }, []);
  const fg = dark ? "#fff" : "#0A0A0A";
  const panelBg = dark ? "#0A0A0A" : "#fff";
  const panelLine = dark ? "rgba(255,255,255,.2)" : "rgba(10,10,10,.18)";
  const dim = dark ? "rgba(255,255,255,.64)" : "rgba(10,10,10,.58)";

  return (
    <div style={{ position: "relative", display: "inline-flex" }}>
      <button ref={triggerRef} type="button" onClick={() => setOpen((v) => !v)} aria-haspopup="dialog" aria-expanded={open} aria-controls="product-switcher-panel" aria-label={`Switch product. Current product ${active}`}
        style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 44, background: "transparent", border: "none", color: fg, cursor: "pointer", padding: "0 4px" }}>
        <span style={{ fontFamily: "'Fragment Mono',ui-monospace,monospace", fontSize: 9.5, letterSpacing: ".08em" }}>4P / 0{activeProductItem.index + 1}</span>
        <FamilyRail activeIndex={activeProductItem.index} dark={dark} />
      </button>

      {open && (
        <>
          <div onClick={close} aria-hidden style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(0,0,0,.28)" }} />
          <div ref={panelRef} id="product-switcher-panel" role="dialog" aria-modal="true" aria-label="4Planet product family"
            style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 61, width: 370, maxWidth: "calc(100vw - 32px)", background: panelBg, color: fg, border: `1px solid ${panelLine}`, boxShadow: "0 24px 70px rgba(0,0,0,.18)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", padding: "14px 17px", borderBottom: `1px solid ${panelLine}` }}>
              <div><div style={{ fontFamily: "'Fragment Mono',monospace", fontSize: 9.5, letterSpacing: ".12em", color: dim }}>ONE INTERFACE / PRODUCT FAMILY</div><div style={{ fontSize: 12.5, marginTop: 4, color: dim }}>Different jobs. Shared context.</div></div>
              <button type="button" onClick={close} aria-label="Close product switcher" style={{ background: "transparent", border: "none", color: dim, cursor: "pointer", fontSize: 12 }}>ESC ✕</button>
            </div>
            {PRODUCTS.map((p) => {
              const isActive = p.key === active;
              return (
                <Link key={p.key} to={contextHref(p.path, location.search)} aria-current={isActive ? "page" : undefined} onClick={() => setOpen(false)}
                  style={{ display: "grid", gridTemplateColumns: "32px 1fr auto", gap: 10, alignItems: "center", padding: "15px 17px", textDecoration: "none", color: fg, borderBottom: p.index < 3 ? `1px solid ${panelLine}` : "none", background: isActive ? (dark ? "rgba(46,46,255,.14)" : "rgba(46,46,255,.045)") : "transparent" }}>
                  <span style={{ fontFamily: "'Fragment Mono',monospace", fontSize: 10, color: dim }}>0{p.index + 1}</span>
                  <span><span style={{ display: "block", fontFamily: "'Instrument Sans','DM Sans',sans-serif", fontWeight: 600, fontSize: 19, letterSpacing: "-.025em", color: isActive ? "#2E2EFF" : fg }}>{p.label}</span><span style={{ display: "block", fontSize: 12.5, color: dim, marginTop: 2 }}>{p.job}</span></span>
                  <FamilyRail activeIndex={p.index} dark={dark} />
                </Link>
              );
            })}
            <div style={{ padding: "11px 17px", borderTop: `1px solid ${panelLine}`, fontFamily: "'Fragment Mono',monospace", fontSize: 9.5, letterSpacing: ".06em", color: dim }}>
              PUBLIC PROTOTYPE CANDIDATE · SOURCE + LIMITATIONS REMAIN VISIBLE
            </div>
          </div>
        </>
      )}
    </div>
  );
}
