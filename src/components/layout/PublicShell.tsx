import { type ReactNode, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { T, DOMAIN_ACCENT, DOMAIN_BASE, DARK_MISSIONS } from "@/styles/tokens";
import { Mark } from "@/components/ui";
import { ProductSwitcher } from "@/product/ProductSwitcher";
import { content } from "@/content/contentRepository";
import { img } from "@/content/imageRegistry";
import type { DomainKey } from "@/types/content";

const ORDER: DomainKey[] = ["OCE4N_", "E4RTH_", "S4PIENS_", "4CULTURE_"];
const dslug = (k: string) => k.replace("_", "").toLowerCase();
const stripU = (k: string) => k.replace(/_$/, "");
const mono: React.CSSProperties = { fontFamily: T.mono, fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase" };

type Cat = {
  key: string;
  label: string;
  eyebrow: string;
  to: string;
  kind: "list" | "missions";
  items?: [string, string][];
};

const MENU: Cat[] = [
  {
    key: "lenses",
    label: "LENSES",
    eyebrow: "FOUR WAYS INTO THE SAME PLANET",
    to: "/",
    kind: "list",
    items: [["ATLAS", "/atlas"], ["SPECIES", "/species"], ["LIVING SYSTEMS", "/living-systems"], ["IMPACT", "/impact"]],
  },
  { key: "domains", label: "DOMAINS", eyebrow: "THE LIVING WORLD", to: "/domains", kind: "list", items: ORDER.map((k, i) => [`0${i + 1}_ ${stripU(k)}`, "/domains/" + dslug(k)] as [string, string]) },
  { key: "missions", label: "MISSIONS", eyebrow: "WHERE 4PLANET ACTS", to: "/missions", kind: "missions" },
  {
    key: "culture",
    label: "4CULTURE",
    eyebrow: "STORY · IMAGE · FILM · PLAY",
    to: "/domains/4culture",
    kind: "list",
    items: [["M4GAZINE", "/magazine"], ["4FILM", "/missions/4film"], ["4RT", "/missions/4rt"], ["4PLAY", "/missions/4play"]],
  },
  {
    key: "about",
    label: "ABOUT",
    eyebrow: "WHY THIS EXISTS",
    to: "/about",
    kind: "list",
    items: [["THE STORY", "/about/story"], ["THE SYSTEM", "/about/system"], ["THE FOUNDER", "/about/founder"], ["THE ROAD AHEAD", "/about#road"]],
  },
];

function useDomainContext() {
  const { pathname } = useLocation();
  const dm = pathname.match(/^\/domains\/([^/]+)$/);
  if (dm) {
    const dk = ORDER.find((k) => dslug(k) === dm[1]);
    if (dk) return { dk, base: DOMAIN_BASE[dk], accent: DOMAIN_ACCENT[dk] };
  }
  const mm = pathname.match(/^\/missions\/([^/]+)$/);
  if (mm) {
    for (const dk of ORDER) {
      if (content.getMissionsByDomain(dk).some((x) => x.slug === mm[1])) return { dk, base: DOMAIN_BASE[dk], accent: DOMAIN_ACCENT[dk] };
    }
  }
  return null;
}

function MenuItems({ c, onMobile, onClose }: { c: Cat; onMobile: boolean; onClose: () => void }) {
  if (c.kind === "missions") {
    return (
      <div className="menu-missions" style={{ display: "grid", gridTemplateColumns: onMobile ? "1fr" : "repeat(2,minmax(0,1fr))", gap: onMobile ? 24 : "30px 44px" }}>
        {ORDER.map((dk) => (
          <div key={dk}>
            <Link to={"/domains/" + dslug(dk)} onClick={onClose} style={{ ...mono, color: DOMAIN_ACCENT[dk], textDecoration: "none" }}>{stripU(dk)}</Link>
            <div style={{ display: "grid", marginTop: 10 }}>
              {content.getMissionsByDomain(dk).map((m, i) => (
                <Link key={m.slug} to={"/missions/" + m.slug} onClick={onClose} className="menu-detail-link"
                  style={{ display: "grid", gridTemplateColumns: "28px 1fr", gap: 10, padding: "7px 0", color: "rgba(255,255,255,.88)", textDecoration: "none", fontSize: onMobile ? 16 : 15.5 }}>
                  <span style={{ ...mono, color: "rgba(255,255,255,.32)", fontSize: 9.5 }}>{String(i + 1).padStart(2, "0")}</span>
                  <span>{stripU(m.name)}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: "grid", borderTop: "1px solid rgba(255,255,255,.16)" }}>
      {c.items!.map(([label, to], i) => {
        const domain = c.key === "domains" ? ORDER[i] : undefined;
        const colour = domain ? DOMAIN_ACCENT[domain] : "rgba(255,255,255,.92)";
        return (
          <Link key={label + to} to={to} onClick={onClose} className="menu-detail-link"
            style={{ display: "grid", gridTemplateColumns: "36px 1fr auto", gap: 14, alignItems: "center", padding: onMobile ? "16px 0" : "18px 0", borderBottom: "1px solid rgba(255,255,255,.12)", color: colour, textDecoration: "none" }}>
            <span style={{ ...mono, color: domain ? colour : "rgba(255,255,255,.32)" }}>{String(i + 1).padStart(2, "0")}</span>
            <span style={{ fontFamily: T.display, fontWeight: 500, letterSpacing: "-.025em", fontSize: onMobile ? "clamp(21px,6vw,28px)" : "clamp(22px,2.3vw,32px)" }}>{label}</span>
            <span aria-hidden style={{ fontFamily: T.mono, fontSize: 13 }}>→</span>
          </Link>
        );
      })}
    </div>
  );
}

function MenuPlane({ onClose, accent }: { onClose: () => void; accent: string }) {
  const [active, setActive] = useState<string>("domains");
  const [openCat, setOpenCat] = useState<string | null>("domains");
  const cat = MENU.find((c) => c.key === active) ?? MENU[1];

  return (
    <div className="menu-plane" style={{ position: "fixed", inset: 0, zIndex: 49, background: "rgba(5,5,6,.985)", color: "#fff", overflowY: "auto" }}>
      <div style={{ maxWidth: 1360, margin: "0 auto", padding: "clamp(94px,10vw,124px) clamp(20px,5vw,72px) clamp(42px,7vw,76px)" }}>
        <div className="menu-desktop" style={{ display: "grid", gridTemplateColumns: "minmax(260px,.58fr) minmax(0,1fr)", gap: "clamp(48px,8vw,130px)" }}>
          <div>
            <div style={{ ...mono, color: "rgba(255,255,255,.38)", marginBottom: 18 }}>4PLANET_ / NAVIGATION</div>
            <nav aria-label="Primary navigation" style={{ display: "grid" }}>
              {MENU.map((c) => (
                <Link key={c.key} to={c.to} onClick={onClose} onMouseEnter={() => setActive(c.key)} onFocus={() => setActive(c.key)} className="menu-cat"
                  style={{ display: "grid", gridTemplateColumns: "24px 1fr", gap: 14, alignItems: "center", padding: "8px 0", textDecoration: "none", color: active === c.key ? "#fff" : "rgba(255,255,255,.42)", fontFamily: T.display, fontWeight: 500, fontSize: "clamp(28px,3.6vw,50px)", letterSpacing: "-.04em", lineHeight: 1 }}>
                  <span aria-hidden style={{ width: 8, height: 8, borderRadius: "50%", background: active === c.key ? accent : "transparent", border: `1px solid ${active === c.key ? accent : "rgba(255,255,255,.22)"}` }} />
                  <span>{c.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div style={{ paddingTop: 4 }}>
            <div style={{ ...mono, color: accent }}>{cat.eyebrow}</div>
            <div style={{ marginTop: 24 }}><MenuItems c={cat} onMobile={false} onClose={onClose} /></div>
            <Link to={cat.to} onClick={onClose} style={{ ...mono, display: "inline-flex", marginTop: 26, color: "rgba(255,255,255,.56)", textDecoration: "none" }}>VIEW {cat.label} →</Link>
          </div>
        </div>

        <div className="menu-mobile">
          <div style={{ ...mono, color: "rgba(255,255,255,.38)", paddingBottom: 14 }}>4PLANET_ / NAVIGATION</div>
          {MENU.map((c) => {
            const isOpen = openCat === c.key;
            return (
              <div key={c.key} style={{ borderTop: "1px solid rgba(255,255,255,.15)" }}>
                <button type="button" onClick={() => setOpenCat(isOpen ? null : c.key)} aria-expanded={isOpen}
                  style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center", background: "transparent", border: 0, padding: "17px 0", cursor: "pointer", color: isOpen ? "#fff" : "rgba(255,255,255,.72)", fontFamily: T.display, fontWeight: 500, fontSize: "clamp(28px,8vw,40px)", letterSpacing: "-.035em" }}>
                  <span>{c.label}</span><span aria-hidden style={{ ...mono, color: isOpen ? accent : "rgba(255,255,255,.4)" }}>{isOpen ? "−" : "+"}</span>
                </button>
                {isOpen && (
                  <div style={{ padding: "0 0 24px" }}>
                    <div style={{ ...mono, color: accent, marginBottom: 14 }}>{c.eyebrow}</div>
                    <MenuItems c={c} onMobile onClose={onClose} />
                    <Link to={c.to} onClick={onClose} style={{ ...mono, display: "inline-flex", marginTop: 18, color: "rgba(255,255,255,.52)", textDecoration: "none" }}>VIEW ALL →</Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginTop: 48, paddingTop: 22, borderTop: "1px solid rgba(255,255,255,.14)" }}>
          <div style={{ ...mono, color: "rgba(255,255,255,.4)" }}>SEE THE PLANET · MEET LIFE · UNDERSTAND THE SYSTEM · FIND A WAY TO HELP</div>
          <Link to="/join" onClick={onClose} style={{ ...mono, color: accent, textDecoration: "none" }}>JOIN 4PLANET →</Link>
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
  const [scrolled, setScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    if (open) { window.addEventListener("keydown", onKey); closeRef.current?.focus(); }
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [open]);

  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    let lastY = window.scrollY;
    let downAcc = 0;
    let upAcc = 0;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 20);
      setPastHero(y > window.innerHeight * .82);
      const dy = y - lastY;
      lastY = y;
      if (reduce || open || y <= 64) { setHidden(false); downAcc = upAcc = 0; return; }
      if (dy > 0) { downAcc += dy; upAcc = 0; if (downAcc > 90) setHidden(true); }
      if (dy < 0) { upAcc -= dy; downAcc = 0; if (upAcc > 12) setHidden(false); }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, [pathname, open]);

  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal:not(.is-in)"));
    if (reduce || els.length === 0) { els.forEach((el) => el.classList.add("is-in")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: .06 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  useEffect(() => {
    const seg = pathname.split("/").filter(Boolean);
    const cap = (s: string) => s.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
    let title = "4PLANET_ — For a Living Planet";
    if (seg[0]) {
      const top = seg[0] === "living-systems" ? "Living Systems" : seg[0] === "magazine" ? "M4GAZINE" : cap(seg[0]);
      title = `${top}${seg[1] ? " · " + cap(seg[1]) : ""} — 4PLANET_`;
    }
    document.title = title;
  }, [pathname]);

  const missionSlug = pathname.startsWith("/missions/") ? pathname.split("/")[2] : "";
  const heroPage = Boolean(ctx) || pathname === "/" || pathname.startsWith("/species/jaguar") || pathname.startsWith("/about/");
  const darkWorld = pathname === "/" || pathname === "/domains" || pathname.startsWith("/domains/") || pathname === "/impact" || pathname.startsWith("/impact/") || pathname.startsWith("/species/jaguar") || DARK_MISSIONS.has(missionSlug);
  const detached = scrolled && !open && !(heroPage && !pastHero);
  const overHero = !open && (darkWorld || (heroPage && !pastHero)) && !detached;
  const accent = ctx?.accent ?? T.blue;
  const fg = open || overHero ? "#fff" : T.ink;
  const headerBg = open ? "rgba(5,5,6,.985)" : detached ? (darkWorld ? "rgba(7,7,9,.78)" : "rgba(255,255,255,.78)") : "transparent";

  return (
    <>
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, background: headerBg, backdropFilter: detached ? "blur(18px) saturate(1.1)" : "none", WebkitBackdropFilter: detached ? "blur(18px) saturate(1.1)" : "none", borderBottom: detached || open ? `1px solid ${open || darkWorld ? "rgba(255,255,255,.10)" : "rgba(8,8,8,.08)"}` : "1px solid transparent", transform: hidden ? "translateY(-100%)" : "translateY(0)", transition: "transform .28s cubic-bezier(.4,0,.2,1), background-color .25s ease, border-color .25s ease", paddingTop: "env(safe-area-inset-top, 0px)" }}>
        <div style={{ width: "100%", height: 64, padding: "0 clamp(18px,3vw,44px)", display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center" }}>
          <div style={{ justifySelf: "start", display: "inline-flex", alignItems: "center", gap: 7 }}>
            <Link to="/" aria-label="4Planet home"><Mark size={16} color={fg} accent={accent} /></Link>
            {!open && <ProductSwitcher dark={overHero} />}
          </div>

          <button aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} ref={closeRef} onClick={() => setOpen((v) => !v)}
            style={{ justifySelf: "center", display: "inline-flex", alignItems: "center", gap: 9, background: "transparent", border: 0, padding: "10px 14px", cursor: "pointer", color: fg, ...mono }}>
            <span aria-hidden style={{ width: 6, height: 6, borderRadius: "50%", background: open ? accent : "currentColor", opacity: open ? 1 : .66 }} />{open ? "CLOSE" : "MENU"}
          </button>

          <Link to="/join" style={{ justifySelf: "end", color: fg, textDecoration: "none", ...mono, borderBottom: scrolled ? `1px solid ${fg}` : "1px solid transparent", paddingBottom: 3 }}>JOIN</Link>
        </div>
      </header>
      {open && <MenuPlane onClose={() => setOpen(false)} accent={accent} />}
      <style>{`
        .menu-mobile{display:none}
        .menu-cat,.menu-detail-link{transition:color .18s ease,opacity .18s ease,transform .18s ease}
        .menu-detail-link:hover{transform:translateX(5px)}
        .menu-cat:focus-visible,.menu-detail-link:focus-visible{outline:2px solid currentColor;outline-offset:4px}
        @media(max-width:760px){.menu-desktop{display:none!important}.menu-mobile{display:block}}
        @media(prefers-reduced-motion:reduce){.menu-cat,.menu-detail-link{transition:none!important}.menu-detail-link:hover{transform:none}}
      `}</style>
    </>
  );
}

function footerCtx(pathname: string): { acc: string } {
  const dm = pathname.match(/^\/domains\/([^/]+)$/);
  if (dm) { const dk = ORDER.find((k) => dslug(k) === dm[1]); if (dk) return { acc: DOMAIN_ACCENT[dk] }; }
  const mm = pathname.match(/^\/missions\/([^/]+)$/);
  if (mm) { for (const dk of ORDER) if (content.getMissionsByDomain(dk).some((x) => x.slug === mm[1])) return { acc: DOMAIN_ACCENT[dk] }; }
  return { acc: T.blue };
}

function Footer() {
  const { pathname } = useLocation();
  const { acc } = footerCtx(pathname);
  const cols: [string, [string, string][]][] = [
    ["EXPLORE", [["ATLAS", "/atlas"], ["SPECIES", "/species"], ["LIVING SYSTEMS", "/living-systems"], ["IMPACT", "/impact"]]],
    ["WORLDS", [["OCE4N", "/domains/oce4n"], ["E4RTH", "/domains/e4rth"], ["S4PIENS", "/domains/s4piens"], ["4CULTURE", "/domains/4culture"]]],
    ["4PLANET", [["M4GAZINE", "/magazine"], ["ABOUT", "/about"], ["MISSIONS", "/missions"], ["JOIN", "/join"]]],
  ];

  return (
    <footer style={{ position: "relative", minHeight: "clamp(600px,84vh,880px)", background: "#000", color: "#fff", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <picture>
        <source media="(max-width: 640px)" srcSet={img("footerPlanet").srcMobile} />
        <img src={img("footerPlanet").src} alt={img("footerPlanet").alt} loading="lazy" decoding="async" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 50%" }} />
      </picture>
      <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(0,0,0,.02),rgba(0,0,0,.08) 34%,rgba(0,0,0,.58) 65%,rgba(0,0,0,.94) 100%)" }} />
      <div aria-hidden style={{ position: "absolute", top: 0, left: 0, width: 110, height: 4, background: acc, zIndex: 3 }} />

      <div style={{ position: "relative", zIndex: 2, maxWidth: 1320, margin: "0 auto", width: "100%", padding: "clamp(64px,10vw,140px) clamp(20px,5vw,72px) clamp(26px,4vw,42px)" }}>
        <div style={{ ...mono, color: acc }}>4PLANET_ · FOR A LIVING PLANET</div>
        <div style={{ fontFamily: T.display, fontWeight: 500, fontSize: "clamp(38px,6vw,82px)", letterSpacing: "-.045em", lineHeight: .92, maxWidth: "12ch", marginTop: 16 }}>Everything you love is connected.</div>
        <p style={{ color: "rgba(255,255,255,.74)", fontSize: "clamp(15px,1.4vw,19px)", lineHeight: 1.6, maxWidth: 580, marginTop: 24 }}>Explore the planet. Meet life. Understand the systems underneath it. Follow credible ways to help as they become real.</p>

        <div className="foot-grid" style={{ display: "grid", gridTemplateColumns: "1.35fr repeat(3,1fr)", gap: "clamp(28px,4vw,56px)", alignItems: "start", marginTop: "clamp(48px,7vw,86px)" }}>
          <div>
            <Mark size={20} color="#fff" accent={acc} />
            <p style={{ fontSize: 13.5, color: "rgba(255,255,255,.58)", marginTop: 15, maxWidth: 260, lineHeight: 1.55 }}>Living Planet Intelligence, Missions, culture and action from one connected system.</p>
          </div>
          {cols.map(([head, items]) => (
            <nav key={head} style={{ display: "grid", gap: 11 }}>
              <span style={{ ...mono, color: acc }}>{head}</span>
              {items.map(([t, to]) => <Link key={t + to} to={to} className="foot-link" style={{ fontSize: 14, color: "rgba(255,255,255,.78)", textDecoration: "none", width: "fit-content" }}>{t}</Link>)}
            </nav>
          ))}
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,.14)", marginTop: "clamp(38px,5vw,60px)", paddingTop: 20, display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <span style={{ ...mono, color: "rgba(255,255,255,.48)" }}>ONE PLANET · ONE CONNECTED LIVING SYSTEM</span>
          <div style={{ display: "flex", gap: 18 }}><Link to="/about/founder" className="foot-link" style={{ ...mono, color: "rgba(255,255,255,.48)", textDecoration: "none" }}>FOUNDER</Link><Link to="/privacy" className="foot-link" style={{ ...mono, color: "rgba(255,255,255,.48)", textDecoration: "none" }}>PRIVACY</Link></div>
        </div>
      </div>
      <style>{`@media(max-width:820px){.foot-grid{grid-template-columns:1fr 1fr!important}.foot-grid>div:first-child{grid-column:1/-1}}`}</style>
    </footer>
  );
}

export function PublicShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const darkWorld = pathname === "/" || pathname === "/domains" || pathname.startsWith("/domains/") || pathname === "/impact" || pathname.startsWith("/impact/");
  const heroPage = Boolean(useDomainContext()) || darkWorld || pathname.startsWith("/about/");
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) { setEntered(true); return; }
    setEntered(false);
    const r = requestAnimationFrame(() => requestAnimationFrame(() => setEntered(true)));
    return () => cancelAnimationFrame(r);
  }, [pathname]);

  return (
    <>
      <a href="#main-content" className="skip-to-main">SKIP TO MAIN CONTENT</a>
      <Header />
      {!heroPage && <div aria-hidden style={{ height: 64 }} />}
      <main id="main-content" tabIndex={-1} style={{ opacity: entered ? 1 : 0, transition: "opacity .4s ease" }}>{children}</main>
      <Footer />
      <style>{`
        .skip-to-main{position:fixed;top:72px;left:12px;z-index:1000;max-width:calc(100vw - 24px);padding:10px 14px;background:#fff;color:#0a0a0a;border:2px solid #2e2eff;font-family:${T.mono};font-size:12px;letter-spacing:.08em;text-decoration:none;transform:translateY(calc(-100% - 80px));transition:transform .15s ease}
        .skip-to-main:focus{transform:translateY(0)}
        @media(prefers-reduced-motion:reduce){#main-content{transition:none!important}}
      `}</style>
    </>
  );
}
