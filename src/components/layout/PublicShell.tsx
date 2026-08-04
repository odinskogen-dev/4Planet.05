import { type ReactNode, useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { T, DOMAIN_ACCENT, DOMAIN_BASE, DOMAIN_DESC, DARK_MISSIONS } from "@/styles/tokens";
import { Mark } from "@/components/ui";
import { ProductSwitcher } from "@/product/ProductSwitcher";
import { TechnicalGridField } from "@/components/TechnicalGridField";
import { content } from "@/content/contentRepository";
import { img } from "@/content/imageRegistry";
import type { DomainKey } from "@/types/content";

const ORDER: DomainKey[] = ["OCE4N_", "E4RTH_", "S4PIENS_", "4CULTURE_"];
const dslug = (k: string) => k.replace("_", "").toLowerCase();
const LS_URL = "https://4p-living-systems-v1-4-1.pages.dev/";
const ATLAS_URL = "https://4planet-atlas-mobile.pages.dev/";

type Cat = { key: string; to?: string; kind: "list" | "missions"; items?: [string, string][] };
const stripU = (k: string) => k.replace(/_$/, "");
const MENU: Cat[] = [
  { key: "4_", to: "/people", kind: "list", items: [["4People", "/people"], ["4Brands", "/brands"], ["4Partners", "/partners"], ["4Funders", "/funders"]] },
  { key: "DOMAINS_", to: "/domains", kind: "list", items: ORDER.map((k, i) => [`0${i + 1}_ ${stripU(k)}`, "/domains/" + dslug(k)] as [string, string]) },
  { key: "MISSIONS_", to: "/missions", kind: "missions" },
  { key: "IMPACT_", to: "/impact", kind: "list", items: [["IMPACT HOME", "/impact"], ["IMPACT LAB", "/impact/lab"], ["TREE TEST JOURNEY", "/impact/lab/tree"], ["PLASTIC TEST JOURNEY", "/impact/lab/plastic"], ["PROOF & REPORTS", "/reports"]] },
  { key: "4CULTURE_", to: "/domains/4culture", kind: "list", items: [["4PLAY", "/culture/play"], ["4FILM", "/culture/film"], ["4TELIER", "/culture/telier"], ["M4GAZINE", "/stories"]] },
  { key: "4PLANET_", to: "/about", kind: "list", items: [["The Story", "/about#story"], ["The System", "/about#system"], ["The Founder", "/about#founder"], ["The Road Ahead", "/about#road"]] },
];

function useDomainContext() {
  const { pathname } = useLocation();
  const dm = pathname.match(/^\/domains\/([^/]+)$/);
  if (dm) { const dk = ORDER.find((k) => dslug(k) === dm[1]); if (dk) return { dk, base: DOMAIN_BASE[dk], accent: DOMAIN_ACCENT[dk] }; }
  const mm = pathname.match(/^\/missions\/([^/]+)$/);
  if (mm) { for (const dk of ORDER) { if (content.getMissionsByDomain(dk).some((x) => x.slug === mm[1])) return { dk, base: DOMAIN_BASE[dk], accent: DOMAIN_ACCENT[dk] }; } }
  return null;
}

function MenuItems({ c, onMobile, onClose }: { c: Cat; onMobile: boolean; onClose: () => void }) {
  const fs = onMobile ? "clamp(16px,4.6vw,20px)" : "clamp(17px,2vw,21px)";
  if (c.kind === "list") return (
    <div style={{ display: "grid", gap: 2 }}>
      {c.key === "4_" && <div className="mono" style={{ fontSize: 10.5, letterSpacing: ".14em", color: T.faint, paddingBottom: 6 }}>WAYS TO PARTICIPATE</div>}
      {c.items!.map(([label, to]) => {
        const ext = to.startsWith("http");
        return ext
          ? <a key={label} href={to} target="_blank" rel="noopener noreferrer" className="link" style={{ fontSize: fs, color: T.ink, padding: "11px 0" }}>{label} ↗</a>
          : <Link key={label + to} to={to} onClick={onClose} className="link menu-link" style={{ fontSize: fs, color: T.ink, padding: "11px 0" }}>{label}</Link>;
      })}
    </div>
  );
  return (
    <div style={{ display: "grid", gridTemplateColumns: onMobile ? "1fr" : "1fr 1fr", gap: onMobile ? "16px 0" : "18px 32px" }}>
      {ORDER.map((dk) => (
        <div key={dk}>
          <Link to={"/domains/" + dslug(dk)} onClick={onClose} className="mono" style={{ fontSize: 12.5, color: DOMAIN_ACCENT[dk], letterSpacing: ".08em" }}>{stripU(dk)}</Link>
          <div style={{ display: "grid", gap: 2, marginTop: 8 }}>
            {content.getMissionsByDomain(dk).map((m) => (
              <Link key={m.slug} to={"/missions/" + m.slug} onClick={onClose} className="link menu-link" style={{ fontSize: onMobile ? "clamp(15px,4vw,18px)" : "clamp(15px,1.7vw,18px)", color: T.ink, padding: "7px 0", fontWeight: 500 }}>{stripU(m.name)}</Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function MenuPlane({ onClose }: { onClose: () => void }) {
  const [active, setActive] = useState<string>(MENU[1].key);
  const [openCat, setOpenCat] = useState<string | null>(MENU[1].key);
  const cat = MENU.find((c) => c.key === active)!;
  return (
    <div className="menu-plane" style={{ position: "fixed", inset: 0, zIndex: 49, background: "#fff", overflowY: "auto" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "clamp(80px,9vw,104px) clamp(20px,5vw,72px) clamp(40px,8vw,72px)" }}>
        <div className="menu-desktop" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(24px,5vw,72px)" }}>
          <div role="menu" aria-label="Primary">
            {MENU.map((c) => (
              <Link key={c.key} to={c.to || "/"} role="menuitem" onClick={onClose} onMouseEnter={() => setActive(c.key)} onFocus={() => setActive(c.key)} className="menu-cat"
                style={{ display: "block", width: "100%", textAlign: "left", textDecoration: "none", padding: "10px 0", color: active === c.key ? T.blue : T.ink, fontWeight: 500, fontSize: "clamp(28px,3.8vw,44px)", letterSpacing: "-.03em" }}>{stripU(c.key)}</Link>
            ))}
          </div>
          <div style={{ paddingTop: 14 }}><MenuItems c={cat} onMobile={false} onClose={onClose} /></div>
        </div>

        <div className="menu-mobile">
          {MENU.map((c) => {
            const isOpen = openCat === c.key;
            return (
              <div key={c.key} style={{ borderTop: `1px solid ${T.line}` }}>
                <button onClick={() => setOpenCat(isOpen ? null : c.key)} aria-expanded={isOpen} className="menu-cat"
                  style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center", textAlign: "left", background: "transparent", border: "none", cursor: "pointer", padding: "18px 0", color: isOpen ? T.blue : T.ink, fontWeight: 500, fontSize: "clamp(28px,8vw,40px)", letterSpacing: "-.03em" }}>
                  <span>{stripU(c.key)}</span><span aria-hidden style={{ fontSize: 24, lineHeight: 1, color: isOpen ? T.blue : T.ink }}>{isOpen ? "–" : "+"}</span>
                </button>
                {isOpen && (
                  <div style={{ paddingBottom: 20 }}>
                    {c.to && <Link to={c.to} onClick={onClose} className="link mono" style={{ display: "inline-block", fontSize: 12, color: T.blue, letterSpacing: ".08em", paddingBottom: 12 }}>VIEW ALL →</Link>}
                    <MenuItems c={c} onMobile onClose={onClose} />
                  </div>
                )}
              </div>
            );
          })}
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginTop: 24, paddingTop: 20, borderTop: `1px solid ${T.line}` }}>
            <a href={LS_URL} target="_blank" rel="noopener noreferrer" className="link" style={{ fontSize: 13, color: T.blue, fontWeight: 500 }}>4Planet Living Systems ↗</a>
            <Link to="/atlas" onClick={onClose} className="link" style={{ fontSize: 13, color: T.blue, fontWeight: 500 }}>4Planet Atlas →</Link>
            <Link to="/" onClick={onClose} className="link" style={{ fontSize: 13, color: T.blue, fontWeight: 500 }}>Open Earth →</Link>
          </div>
        </div>

        <div className="menu-desktop" style={{ display: "flex", gap: 22, flexWrap: "wrap", marginTop: 40, paddingTop: 20, borderTop: `1px solid ${T.line}` }}>
          <a href={LS_URL} target="_blank" rel="noopener noreferrer" className="link" style={{ fontSize: 13, color: T.blue, fontWeight: 500 }}>4Planet Living Systems ↗</a>
          <Link to="/atlas" onClick={onClose} className="link" style={{ fontSize: 13, color: T.blue, fontWeight: 500 }}>4Planet Atlas →</Link>
          <Link to="/" onClick={onClose} className="link" style={{ fontSize: 13, color: T.blue, fontWeight: 500 }}>Open Earth →</Link>
        </div>
      </div>
    </div>
  );
}

function Header() {
  const { pathname } = useLocation();
  const ctx = useDomainContext();
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    if (open) { window.addEventListener("keydown", onKey); closeRef.current?.focus(); }
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [open]);
  const [scrolled, setScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  // WS-A: one transparent header that hides on downward scroll and returns on
  // upward scroll. No blur, frosted glass or background panel is ever added.
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      setPastHero(y > window.innerHeight * 0.82);
      const dy = y - lastY.current;
      if (y < 80 || dy < -6) setHidden(false);
      else if (dy > 6 && y > 120) setHidden(true);
      lastY.current = y;
    };
    lastY.current = window.scrollY;
    onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, [pathname]);

  const heroPage = !!ctx;
  const missionSlug = pathname.startsWith("/missions/") ? pathname.split("/")[2] : "";
  const darkWorld = pathname === "/domains" || pathname.startsWith("/domains/") || DARK_MISSIONS.has(missionSlug);
  const overHero = (darkWorld || (heroPage && !pastHero)) && !open;
  const accent = ctx ? ctx.accent : T.blue;
  const fg = overHero ? "#fff" : T.ink;
  const outline = scrolled && !open;

  return (
    <>
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, background: "transparent", transform: hidden && !open ? "translateY(-100%)" : "translateY(0)", transition: "transform .32s cubic-bezier(.2,.7,.2,1)", paddingTop: "env(safe-area-inset-top,0px)" }}>
        <div style={{ width: "100%", height: 64, padding: "0 clamp(18px,3vw,44px)", display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center" }}>
          <div style={{ justifySelf: "start", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Link to="/" aria-label="4Planet home"><Mark size={16} color={open ? T.ink : fg} accent={accent} /></Link>
            {!open && <ProductSwitcher dark={overHero} />}
          </div>

          <button aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} ref={closeRef}
            onClick={() => setOpen((v) => !v)}
            className="menu-trigger"
            style={{ justifySelf: "center", display: "inline-flex", alignItems: "center", gap: 10, background: "transparent", border: "none", cursor: "pointer", color: open ? T.ink : fg, fontWeight: 500, fontSize: 13, letterSpacing: ".08em" }}>
            {open ? "CLOSE" : "MENU"}
          </button>

          <Link to="/people" style={{ justifySelf: "end", display: "inline-flex", alignItems: "center", height: 38, padding: "0 15px", fontSize: 13, fontWeight: 500, letterSpacing: ".08em",
            background: "transparent", color: open ? T.ink : fg,
            border: `1px solid ${outline ? (overHero ? "rgba(255,255,255,.72)" : T.ink) : "transparent"}`,
            transition: "border-color .25s ease, color .25s ease", whiteSpace: "nowrap" }}>JOIN 4PLANET</Link>
        </div>
      </header>
      {open && (<><div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 48, background: "#fff" }} aria-hidden /><MenuPlane onClose={() => setOpen(false)} /></>)}
      <style>{`.menu-mobile{display:none}@media(max-width:760px){.menu-desktop{display:none!important}.menu-mobile{display:block}}`}</style>
    </>
  );
}

function footerCtx(pathname: string): { acc: string; label: string } {
  const dm = pathname.match(/^\/domains\/([^/]+)$/);
  if (dm) { const dk = ORDER.find((k) => dslug(k) === dm[1]); if (dk) return { acc: DOMAIN_ACCENT[dk], label: dk }; }
  const mm = pathname.match(/^\/missions\/([^/]+)$/);
  if (mm) { for (const dk of ORDER) { if (content.getMissionsByDomain(dk).some((x) => x.slug === mm[1])) return { acc: DOMAIN_ACCENT[dk], label: dk }; } }
  const im = pathname.match(/^\/impact\/([^/]+)$/);
  if (im) {
    const map: Record<string, DomainKey> = { "tree-unit": "E4RTH_", "ocean-waste": "OCE4N_", "amazon-square": "E4RTH_", "habitat-recovery": "E4RTH_" };
    const dk = map[im[1]]; if (dk) return { acc: DOMAIN_ACCENT[dk], label: dk };
  }
  return { acc: T.blue, label: "" };
}

function Footer() {
  const { pathname } = useLocation();
  const { acc } = footerCtx(pathname);
  const cols: [string, [string, string][]][] = [
    ["EXPLORE", [["Enter the living world", "/domains"], ["Missions", "/missions"], ["Impact", "/impact"], ["4Culture", "/stories"]]],
    ["PARTICIPATE", [["4People", "/people"], ["4Brands", "/brands"], ["4Partners", "/partners"], ["4Funders", "/funders"]]],
    ["4PLANET", [["The Story", "/about"], ["Living Systems", "/living-systems"], ["Proof & Reports", "/reports"], ["Join 4Planet", "/people"]]],
  ];
  return (
    <footer style={{ position: "relative", minHeight: "clamp(600px,86vh,880px)", background: "#000", color: "#fff", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <picture>
        <source media="(max-width: 640px)" srcSet={img("footerPlanet").srcMobile} />
        <img src={img("footerPlanet").src} alt={img("footerPlanet").alt} loading="lazy" decoding="async"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 50%" }} />
      </picture>
      <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,.06) 0%, rgba(0,0,0,.10) 34%, rgba(0,0,0,.52) 60%, rgba(0,0,0,.82) 82%, rgba(0,0,0,.90) 100%)" }} />
      <div aria-hidden style={{ position: "absolute", top: 0, left: 0, width: 96, height: 4, background: acc, zIndex: 3 }} />

      <div style={{ position: "relative", zIndex: 2, maxWidth: 1320, margin: "0 auto", width: "100%", padding: "clamp(64px,10vw,140px) clamp(20px,5vw,72px) clamp(28px,4vw,44px)" }}>
        <div style={{ fontFamily: T.display, fontWeight: 500, color: "#fff", fontSize: "clamp(30px,5vw,64px)", letterSpacing: "-.04em", lineHeight: .98, maxWidth: 820 }}>For a Living Planet.</div>
        <div style={{ marginTop: 18, maxWidth: 640 }}>
          <p style={{ color: "rgba(255,255,255,.9)", fontSize: "clamp(15px,1.4vw,19px)", lineHeight: 1.5 }}>One planet. One connected living system.</p>
          <p style={{ color: "rgba(255,255,255,.9)", fontSize: "clamp(15px,1.4vw,19px)", lineHeight: 1.5 }}>The work has only just begun.</p>
          <p className="mono" style={{ color: acc, fontSize: 12.5, letterSpacing: ".04em", marginTop: 14 }}>Cause there is no Planet B.</p>
        </div>

        <div className="foot-grid" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: "clamp(28px,4vw,56px)", alignItems: "start", marginTop: "clamp(44px,6vw,84px)" }}>
          <div>
            <Mark size={20} color="#fff" accent={acc} />
            <p style={{ fontSize: 14, color: "rgba(255,255,255,.82)", marginTop: 16, maxWidth: 260, lineHeight: 1.55 }}>For a living planet. One connected system, made easier to understand, support and follow.</p>
          </div>
          {cols.map(([head, items]) => (
            <nav key={head} style={{ display: "grid", gap: 12 }}>
              <span className="mono" style={{ fontSize: 10.5, letterSpacing: ".14em", color: acc, opacity: 1 }}>{head}</span>
              {items.map(([t, to]) => <Link key={t + to} to={to} className="foot-link" style={{ fontSize: 14.5, color: "rgba(255,255,255,.82)", textDecoration: "none", width: "fit-content" }}>{t}</Link>)}
            </nav>
          ))}
        </div>

        <div style={{ borderTop: `1px solid rgba(255,255,255,.16)`, marginTop: "clamp(40px,5vw,64px)", paddingTop: 22, display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <span className="mono" style={{ fontSize: 11.5, color: "rgba(255,255,255,.7)" }}>4PLANET_ — FOR A LIVING PLANET.</span>
          <Link to="/privacy" className="foot-link mono" style={{ fontSize: 11, color: "rgba(255,255,255,.7)", textDecoration: "none" }}>PRIVACY</Link>
        </div>
      </div>
    </footer>
  );
}

export function PublicShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const darkWorld = pathname === "/domains" || pathname.startsWith("/domains/");
  const heroPage = !!useDomainContext() || darkWorld;
  return (
    <>
      <a href="#main-content" className="skip-to-main">SKIP TO MAIN CONTENT</a>
      <Header />
      {!heroPage && <div aria-hidden style={{ height: 64 }} />}
      <main id="main-content" tabIndex={-1}>{children}</main>
      <Footer />
      <style>{`.skip-to-main{position:fixed;top:8px;left:8px;z-index:1000;padding:10px 14px;background:#fff;color:#0a0a0a;border:2px solid #2e2eff;font-family:${T.mono};font-size:12px;letter-spacing:.08em;text-decoration:none;transform:translateY(-160%);transition:transform .15s ease}.skip-to-main:focus{transform:translateY(0)}`}</style>
    </>
  );
}
