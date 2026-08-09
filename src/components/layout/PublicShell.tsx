import { type ReactNode, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { T, DOMAIN_ACCENT } from "@/styles/tokens";
import { Mark } from "@/components/ui";
import { ProductSwitcher } from "@/product/ProductSwitcher";
import { img } from "@/content/imageRegistry";
import type { DomainKey } from "@/types/content";

const ORDER: DomainKey[] = ["OCE4N_", "E4RTH_", "S4PIENS_", "4CULTURE_"];
const dslug = (k: string) => k.replace("_", "").toLowerCase();
const stripU = (k: string) => k.replace(/_$/, "");

const LOCKED_MISSIONS: Record<DomainKey, [string, string][]> = {
  OCE4N_: [["CLE4N_", "/missions/cle4n"], ["WH4LES_", "/missions/wh4les"], ["COR4L_", "/missions/cor4l"], ["RE:WILD_ MARINE", "/missions/rewild-marine"]],
  E4RTH_: [["CLIM4TE_", "/missions/clim4te"], ["AM4ZONIA_", "/missions/am4zonia"], ["SPECIES_", "/missions/species"], ["RE:WILD_ LAND", "/missions/rewild-land"]],
  S4PIENS_: [["FOOD_", "/missions/food"], ["EN4RGY_", "/missions/en4rgy"], ["CIRCULAR CITY_", "/missions/circular-city"], ["F4SHION_", "/missions/f4shion"]],
  "4CULTURE_": [["M4GAZINE_", "/missions/m4gazine"], ["4FILM_", "/missions/4film"], ["4RT_", "/missions/4rt"], ["4PLAY_", "/missions/4play"]],
};

const MISSION_DOMAIN: Record<string, DomainKey> = Object.fromEntries(
  ORDER.flatMap((dk) => LOCKED_MISSIONS[dk].map(([, path]) => [path.split("/").pop()!, dk])),
) as Record<string, DomainKey>;

type Cat = { key: string; to: string; kind: "list" | "missions"; items?: [string, string][] };
const MENU: Cat[] = [
  { key: "EXPLORE_", to: "/", kind: "list", items: [["4PLANET", "/"], ["ATLAS", "/atlas"], ["SPECIES", "/species"], ["LIVING SYSTEMS", "/living-systems"], ["IMPACT", "/impact"]] },
  { key: "DOMAINS_", to: "/domains", kind: "list", items: ORDER.map((k, i) => [`0${i + 1}_ ${stripU(k)}`, "/domains/" + dslug(k)]) },
  { key: "MISSIONS_", to: "/missions", kind: "missions" },
  { key: "PARTICIPATE_", to: "/join", kind: "list", items: [["Join 4PLANET", "/join"], ["4People", "/people"], ["4Brands", "/brands"], ["4Partners", "/partners"], ["4Funders", "/funders"]] },
  { key: "4CULTURE_", to: "/domains/4culture", kind: "list", items: [["M4GAZINE_", "/missions/m4gazine"], ["4FILM_", "/missions/4film"], ["4RT_", "/missions/4rt"], ["4PLAY_", "/missions/4play"]] },
  { key: "4PLANET_", to: "/about", kind: "list", items: [["The Story", "/about#story"], ["The System", "/about#system"], ["Proof & Reports", "/reports"], ["The Road Ahead", "/about#road"]] },
];

function contextFor(pathname: string): { dk: DomainKey; accent: string } | null {
  const dm = pathname.match(/^\/domains\/([^/]+)/);
  if (dm) {
    const dk = ORDER.find((k) => dslug(k) === dm[1]);
    if (dk) return { dk, accent: DOMAIN_ACCENT[dk] };
  }
  const mm = pathname.match(/^\/missions\/([^/]+)/);
  if (mm && MISSION_DOMAIN[mm[1]]) {
    const dk = MISSION_DOMAIN[mm[1]];
    return { dk, accent: DOMAIN_ACCENT[dk] };
  }
  return null;
}

function MenuItems({ c, onMobile, onClose }: { c: Cat; onMobile: boolean; onClose: () => void }) {
  const fs = onMobile ? "clamp(16px,4.6vw,20px)" : "clamp(17px,2vw,21px)";
  if (c.kind === "list") return (
    <div style={{ display: "grid", gap: 2 }}>
      {c.items!.map(([label, to]) => <Link key={label + to} to={to} onClick={onClose} className="link menu-link" style={{ fontSize: fs, color: T.ink, padding: "10px 0" }}>{label}</Link>)}
    </div>
  );
  return (
    <div style={{ display: "grid", gridTemplateColumns: onMobile ? "1fr" : "1fr 1fr", gap: onMobile ? "18px 0" : "22px 34px" }}>
      {ORDER.map((dk) => (
        <div key={dk}>
          <Link to={"/domains/" + dslug(dk)} onClick={onClose} className="mono" style={{ fontSize: 12, color: DOMAIN_ACCENT[dk], letterSpacing: ".08em" }}>{stripU(dk)}</Link>
          <div style={{ display: "grid", gap: 2, marginTop: 8 }}>
            {LOCKED_MISSIONS[dk].map(([name, to]) => <Link key={name} to={to} onClick={onClose} className="link menu-link" style={{ fontSize: onMobile ? "clamp(15px,4vw,18px)" : "clamp(15px,1.6vw,18px)", color: T.ink, padding: "7px 0", fontWeight: 500 }}>{name}</Link>)}
          </div>
        </div>
      ))}
    </div>
  );
}

function MenuPlane({ onClose }: { onClose: () => void }) {
  const [active, setActive] = useState(MENU[0].key);
  const [mobile, setMobile] = useState<string | null>(MENU[0].key);
  const cat = MENU.find((c) => c.key === active) ?? MENU[0];
  return (
    <div className="menu-plane" style={{ position: "fixed", inset: 0, zIndex: 49, background: "#fff", overflowY: "auto" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "clamp(86px,10vw,118px) clamp(20px,5vw,72px) 50px" }}>
        <div className="menu-desktop" style={{ display: "grid", gridTemplateColumns: ".82fr 1.18fr", gap: "clamp(32px,6vw,86px)" }}>
          <nav aria-label="Primary">
            {MENU.map((c) => <Link key={c.key} to={c.to} onClick={onClose} onMouseEnter={() => setActive(c.key)} onFocus={() => setActive(c.key)} style={{ display: "block", textDecoration: "none", padding: "9px 0", color: active === c.key ? T.blue : T.ink, fontFamily: T.display, fontWeight: 500, fontSize: "clamp(28px,3.7vw,45px)", letterSpacing: "-.035em" }}>{stripU(c.key)}</Link>)}
          </nav>
          <div style={{ paddingTop: 12 }}><MenuItems c={cat} onMobile={false} onClose={onClose} /></div>
        </div>

        <div className="menu-mobile">
          {MENU.map((c) => {
            const isOpen = mobile === c.key;
            return <div key={c.key} style={{ borderTop: `1px solid ${T.line}` }}><button type="button" onClick={() => setMobile(isOpen ? null : c.key)} aria-expanded={isOpen} style={{ width: "100%", display: "flex", justifyContent: "space-between", background: "none", border: 0, padding: "17px 0", color: isOpen ? T.blue : T.ink, fontFamily: T.display, fontSize: "clamp(27px,8vw,40px)", letterSpacing: "-.035em", cursor: "pointer" }}><span>{stripU(c.key)}</span><span>{isOpen ? "–" : "+"}</span></button>{isOpen && <div style={{ paddingBottom: 20 }}><Link to={c.to} onClick={onClose} className="mono" style={{ display: "inline-block", color: T.blue, fontSize: 10.5, letterSpacing: ".1em", marginBottom: 10 }}>VIEW ALL →</Link><MenuItems c={c} onMobile onClose={onClose} /></div>}</div>;
          })}
        </div>

        <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginTop: 38, paddingTop: 18, borderTop: `1px solid ${T.line}` }}>
          <Link to="/living-systems" onClick={onClose} style={{ fontSize: 13, color: T.blue, textDecoration: "none" }}>Living Systems →</Link>
          <Link to="/atlas" onClick={onClose} style={{ fontSize: 13, color: T.blue, textDecoration: "none" }}>ATLAS →</Link>
          <Link to="/place/oslofjorden" onClick={onClose} style={{ fontSize: 13, color: T.blue, textDecoration: "none" }}>Oslofjorden prototype →</Link>
        </div>
      </div>
    </div>
  );
}

function Header() {
  const { pathname } = useLocation();
  const ctx = contextFor(pathname);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastY = useRef(0);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { setOpen(false); setVisible(true); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    if (open) { window.addEventListener("keydown", onKey); closeRef.current?.focus(); }
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [open]);
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 18);
      const delta = y - lastY.current;
      if (Math.abs(delta) > 8) setVisible(delta < 0 || y < 80 || open);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [open]);

  const darkHero = pathname === "/domains" || pathname.startsWith("/domains/");
  const overDark = darkHero && !scrolled && !open;
  const accent = ctx?.accent ?? T.blue;
  const fg = overDark ? "#fff" : T.ink;
  const bg = scrolled && !open ? "rgba(255,255,255,.98)" : "transparent";

  return (
    <>
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, background: bg, transform: visible || open ? "translateY(0)" : "translateY(-100%)", transition: "transform .22s ease, background-color .18s ease", borderBottom: scrolled && !open ? `1px solid ${T.line}` : "1px solid transparent" }}>
        <div style={{ height: 64, padding: "0 clamp(18px,3vw,44px)", display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center" }}>
          <div style={{ justifySelf: "start", display: "inline-flex", alignItems: "center", gap: 7 }}><Link to="/" aria-label="4Planet home"><Mark size={16} color={open ? T.ink : fg} accent={accent} /></Link>{!open && <ProductSwitcher dark={overDark} />}</div>
          <button ref={closeRef} type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen((v) => !v)} style={{ justifySelf: "center", background: "transparent", border: 0, color: open ? T.ink : fg, fontSize: 12.5, letterSpacing: ".09em", cursor: "pointer" }}>{open ? "CLOSE" : "MENU"}</button>
          <Link to="/join" style={{ justifySelf: "end", display: "inline-flex", alignItems: "center", minHeight: 36, padding: "0 13px", border: `1px solid ${overDark ? "rgba(255,255,255,.75)" : T.ink}`, color: overDark ? "#fff" : T.ink, background: overDark ? "rgba(0,0,0,.14)" : "#fff", textDecoration: "none", fontSize: 11.5, letterSpacing: ".08em" }}>JOIN 4PLANET</Link>
        </div>
      </header>
      {open && <><div onClick={() => setOpen(false)} aria-hidden style={{ position: "fixed", inset: 0, zIndex: 48, background: "#fff" }} /><MenuPlane onClose={() => setOpen(false)} /></>}
      <style>{`.menu-mobile{display:none}@media(max-width:760px){.menu-desktop{display:none!important}.menu-mobile{display:block}}@media(prefers-reduced-motion:reduce){header{transition:none!important}}`}</style>
    </>
  );
}

function footerAccent(pathname: string) {
  return contextFor(pathname)?.accent ?? T.blue;
}

function Footer() {
  const { pathname } = useLocation();
  const acc = footerAccent(pathname);
  const planet = img("footerPlanet");
  const cols: [string, [string, string][]][] = [
    ["EXPLORE", [["ATLAS", "/atlas"], ["SPECIES", "/species"], ["Living Systems", "/living-systems"], ["Missions", "/missions"]]],
    ["ACT", [["IMPACT", "/impact"], ["Proof & Reports", "/reports"], ["Join 4PLANET", "/join"]]],
    ["4PLANET", [["About", "/about"], ["Stories", "/stories"], ["Privacy", "/privacy"]]],
  ];
  return (
    <footer style={{ position: "relative", minHeight: "clamp(560px,82vh,820px)", background: "#000", color: "#fff", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <picture>{planet.srcMobile && <source media="(max-width:640px)" srcSet={planet.srcMobile} />}<img src={planet.src} alt={planet.alt} loading="lazy" decoding="async" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: planet.objectPosition }} /></picture>
      <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(0,0,0,.04),rgba(0,0,0,.9))" }} />
      <div style={{ position: "relative", zIndex: 2, maxWidth: 1320, margin: "0 auto", width: "100%", padding: "clamp(70px,10vw,140px) clamp(20px,5vw,72px) 36px" }}>
        <div style={{ width: 88, height: 4, background: acc, marginBottom: 24 }} />
        <div style={{ fontFamily: T.display, fontWeight: 500, fontSize: "clamp(40px,6vw,76px)", letterSpacing: "-.05em", lineHeight: .95 }}>For a Living Planet.</div>
        <p style={{ maxWidth: 620, color: "rgba(255,255,255,.82)", fontSize: "clamp(15px,1.4vw,18px)", lineHeight: 1.55, marginTop: 18 }}>See the living planet. Understand relationships. Follow what matters. Act with evidence. Return to what happened next.</p>
        <div className="foot-grid" style={{ display: "grid", gridTemplateColumns: "1.25fr 1fr 1fr 1fr", gap: "clamp(28px,5vw,64px)", marginTop: "clamp(46px,6vw,80px)" }}>
          <div><Mark size={20} color="#fff" accent={acc} /><div className="mono" style={{ marginTop: 14, color: acc, fontSize: 10.5, letterSpacing: ".08em" }}>4PLANET_ / PUBLIC PROTOTYPE</div></div>
          {cols.map(([head, items]) => <nav key={head} style={{ display: "grid", alignContent: "start", gap: 11 }}><span className="mono" style={{ fontSize: 10, letterSpacing: ".12em", color: acc }}>{head}</span>{items.map(([name, to]) => <Link key={name} to={to} style={{ color: "rgba(255,255,255,.82)", textDecoration: "none", fontSize: 14 }}>{name}</Link>)}</nav>)}
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,.18)", marginTop: 50, paddingTop: 18, display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}><span className="mono" style={{ fontSize: 10.5, color: "rgba(255,255,255,.62)" }}>4PLANET_ — FOR A LIVING PLANET.</span><span className="mono" style={{ fontSize: 10.5, color: "rgba(255,255,255,.62)" }}>SOURCE / MATURITY / LIMITATIONS SHOULD REMAIN VISIBLE</span></div>
      </div>
      <style>{`@media(max-width:780px){.foot-grid{grid-template-columns:1fr 1fr!important}}@media(max-width:520px){.foot-grid{grid-template-columns:1fr!important}}`}</style>
    </footer>
  );
}

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <>
      <a href="#main-content" className="skip-to-main">SKIP TO MAIN CONTENT</a>
      <Header />
      <div aria-hidden style={{ height: 64 }} />
      <main id="main-content" tabIndex={-1}>{children}</main>
      <Footer />
      <style>{`.skip-to-main{position:fixed;top:8px;left:8px;z-index:1000;padding:10px 14px;background:#fff;color:#0a0a0a;border:2px solid #2e2eff;font-family:${T.mono};font-size:12px;letter-spacing:.08em;text-decoration:none;transform:translateY(-160%);transition:transform .15s ease}.skip-to-main:focus{transform:translateY(0)}`}</style>
    </>
  );
}
