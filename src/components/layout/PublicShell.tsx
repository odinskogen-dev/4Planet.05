import { type ReactNode, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { T, DOMAIN_ACCENT } from "@/styles/tokens";
import { Mark } from "@/components/ui";
import { content } from "@/content/contentRepository";
import { img } from "@/content/imageRegistry";
import type { DomainKey } from "@/types/content";

const ORDER: DomainKey[] = ["OCE4N_", "E4RTH_", "S4PIENS_", "4CULTURE_"];
const strip = (s: string) => s.replace(/_$/, "");
const dslug = (s: string) => s.replace("_", "").toLowerCase();
const mono: React.CSSProperties = { fontFamily: T.mono, fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase" };
const display: React.CSSProperties = { fontFamily: T.display, fontWeight: 500, letterSpacing: "-.035em" };

type PanelKey = "EXPLORE" | "DOMAINS" | "MISSIONS" | "CULTURE" | "ABOUT";

const TOP: { key: PanelKey; to: string }[] = [
  { key: "EXPLORE", to: "/" },
  { key: "DOMAINS", to: "/domains" },
  { key: "MISSIONS", to: "/missions" },
  { key: "CULTURE", to: "/domains/4culture" },
  { key: "ABOUT", to: "/about" },
];

const LENSES = [
  ["ATLAS", "SEE THE PLANET", "/atlas"],
  ["SPECIES", "MEET LIFE", "/species"],
  ["LIVING SYSTEMS", "UNDERSTAND CONNECTIONS", "/living-systems"],
  ["IMPACT", "FIND A WAY TO HELP", "/impact"],
] as const;

const ABOUT = [
  ["THE STORY", "Why 4PLANET exists.", "/about#story"],
  ["THE SYSTEM", "How the public product family fits together.", "/about#system"],
  ["THE FOUNDER", "Odin Oddekalv and the origin of the work.", "/about#founder"],
  ["THE ROAD AHEAD", "What has to become true next.", "/about#road"],
] as const;

const CULTURE = [
  ["M4GAZINE", "Editorial", "/magazine"],
  ["4FILM", "Film", "/missions/4film"],
  ["4RT", "Art", "/missions/4rt"],
  ["4PLAY", "Play", "/missions/4play"],
] as const;

function PanelLink({ title, line, to, accent = T.blue, onSelect }: { title: string; line: string; to: string; accent?: string; onSelect: () => void }) {
  return (
    <Link to={to} onClick={onSelect} className="nav-panel-link">
      <span aria-hidden className="nav-panel-link__bar" style={{ background: accent }} />
      <span>
        <strong style={{ ...display, display: "block", fontSize: "clamp(18px,1.6vw,24px)", color: T.ink }}>{title}</strong>
        <span style={{ display: "block", marginTop: 6, fontSize: 12.5, lineHeight: 1.45, color: T.dim }}>{line}</span>
      </span>
      <span aria-hidden style={{ ...mono, color: accent }}>→</span>
    </Link>
  );
}

function DomainColumn({ dk, onSelect, showMissions = true }: { dk: DomainKey; onSelect: () => void; showMissions?: boolean }) {
  const accent = DOMAIN_ACCENT[dk];
  const missions = content.getMissionsByDomain(dk);
  return (
    <div className="nav-domain-col">
      <Link to={`/domains/${dslug(dk)}`} onClick={onSelect} className="nav-domain-head" style={{ color: accent }}>
        <span style={{ ...display, fontSize: "clamp(22px,2vw,31px)" }}>{strip(dk)}</span>
        <span aria-hidden style={{ ...mono }}>→</span>
      </Link>
      {showMissions && (
        <div style={{ display: "grid", marginTop: 14 }}>
          {missions.map((m) => (
            <Link key={m.slug} to={`/missions/${m.slug}`} onClick={onSelect} className="nav-mission-link">
              <span aria-hidden style={{ width: 5, height: 5, background: accent, flex: "0 0 auto" }} />
              {strip(m.name)}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function DesktopPanel({ panel, onClose }: { panel: PanelKey; onClose: () => void }) {
  return (
    <div className="nav-panel" role="region" aria-label={`${panel} navigation`} onMouseLeave={onClose}>
      <div className="nav-panel__inner">
        <div className="nav-panel__rail">
          <div style={{ ...mono, color: T.blue }}>{panel}_</div>
          <p style={{ marginTop: 14, maxWidth: 220, fontSize: 13.5, lineHeight: 1.5, color: T.dim }}>
            {panel === "EXPLORE" && "Change lens without losing the planet."}
            {panel === "DOMAINS" && "Four operational worlds. One living planet."}
            {panel === "MISSIONS" && "Sixteen first-wave entry points for action."}
            {panel === "CULTURE" && "Editorial, film, art and play as distribution for planetary understanding."}
            {panel === "ABOUT" && "Story, architecture, founder and the work ahead."}
          </p>
        </div>

        {panel === "EXPLORE" && (
          <div className="nav-panel-grid nav-panel-grid--2">
            {LENSES.map(([title, line, to]) => <PanelLink key={title} title={title} line={line} to={to} onSelect={onClose} />)}
          </div>
        )}
        {panel === "DOMAINS" && (
          <div className="nav-panel-grid nav-panel-grid--4">
            {ORDER.map((dk) => <DomainColumn key={dk} dk={dk} onSelect={onClose} showMissions={false} />)}
          </div>
        )}
        {panel === "MISSIONS" && (
          <div className="nav-panel-grid nav-panel-grid--4">
            {ORDER.map((dk) => <DomainColumn key={dk} dk={dk} onSelect={onClose} />)}
          </div>
        )}
        {panel === "CULTURE" && (
          <div className="nav-panel-grid nav-panel-grid--2">
            {CULTURE.map(([title, line, to]) => <PanelLink key={title} title={title} line={line} to={to} accent={DOMAIN_ACCENT["4CULTURE_"]} onSelect={onClose} />)}
          </div>
        )}
        {panel === "ABOUT" && (
          <div className="nav-panel-grid nav-panel-grid--2">
            {ABOUT.map(([title, line, to]) => <PanelLink key={title} title={title} line={line} to={to} onSelect={onClose} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function MobileMenu({ onClose }: { onClose: () => void }) {
  return (
    <div className="mobile-nav" role="dialog" aria-modal="true" aria-label="4PLANET navigation">
      <div className="mobile-nav__inner">
        <div style={{ ...mono, color: T.blue }}>EXPLORE_</div>
        <div className="mobile-nav__lenses">
          {LENSES.map(([title, line, to]) => <PanelLink key={title} title={title} line={line} to={to} onSelect={onClose} />)}
        </div>

        <div style={{ ...mono, color: T.blue, marginTop: 44 }}>DOMAINS + MISSIONS_</div>
        <div style={{ display: "grid", gap: 34, marginTop: 22 }}>
          {ORDER.map((dk) => <DomainColumn key={dk} dk={dk} onSelect={onClose} />)}
        </div>

        <div style={{ ...mono, color: T.blue, marginTop: 44 }}>ABOUT_</div>
        <div className="mobile-nav__about">
          {ABOUT.map(([title, , to]) => <Link key={title} to={to} onClick={onClose}>{title}</Link>)}
        </div>
      </div>
    </div>
  );
}

function topIsDark(pathname: string) {
  if (pathname === "/" || pathname === "/about") return true;
  if (pathname === "/atlas" || pathname === "/impact" || pathname.startsWith("/impact/")) return true;
  if (pathname.startsWith("/domains/") || pathname.startsWith("/missions/")) return true;
  if (pathname === "/domains" || pathname.startsWith("/species/") || pathname.startsWith("/ecosystems/")) return true;
  return false;
}

function Header() {
  const { pathname } = useLocation();
  const [panel, setPanel] = useState<PanelKey | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const explicitlyOpenedPanel = useRef<PanelKey | null>(null);

  const closeDesktopPanel = () => {
    explicitlyOpenedPanel.current = null;
    setPanel(null);
  };

  const previewDesktopPanel = (key: PanelKey) => {
    if (explicitlyOpenedPanel.current !== key) explicitlyOpenedPanel.current = null;
    setPanel(key);
  };

  const toggleDesktopPanel = (key: PanelKey) => {
    if (explicitlyOpenedPanel.current === key && panel === key) {
      closeDesktopPanel();
      return;
    }
    explicitlyOpenedPanel.current = key;
    setPanel(key);
  };

  useEffect(() => {
    explicitlyOpenedPanel.current = null;
    setPanel(null);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        explicitlyOpenedPanel.current = null;
        setPanel(null);
        setMobileOpen(false);
        menuButton.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    let lastY = window.scrollY;
    let down = 0;
    let up = 0;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 18);
      const dy = y - lastY;
      lastY = y;
      if (reduce || panel || mobileOpen || y < 96) {
        setHidden(false);
        down = 0;
        up = 0;
        return;
      }
      if (dy > 0) {
        down += dy;
        up = 0;
        if (down > 74) setHidden(true);
      } else if (dy < 0) {
        up -= dy;
        down = 0;
        if (up > 14) setHidden(false);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [panel, mobileOpen, pathname]);

  useEffect(() => {
    const seg = pathname.split("/").filter(Boolean);
    const cap = (s: string) => s.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
    document.title = seg.length ? `${seg.map(cap).join(" · ")} — 4PLANET_` : "4PLANET_ — For a Living Planet";
  }, [pathname]);

  const menuMode = Boolean(panel || mobileOpen);
  const dark = topIsDark(pathname) && !scrolled && !menuMode;
  const detachedDark = topIsDark(pathname) && scrolled && !menuMode;
  const fg = menuMode ? T.ink : dark || detachedDark ? "#fff" : T.ink;
  const bg = menuMode ? "#fff" : scrolled ? (detachedDark ? "rgba(5,5,7,.9)" : "rgba(255,255,255,.9)") : "transparent";

  return (
    <>
      <a href="#main-content" className="skip-link">SKIP TO CONTENT</a>
      <header className="public-header" style={{ transform: hidden ? "translateY(-110%)" : "translateY(0)", color: fg, background: bg, backdropFilter: scrolled && !menuMode ? "blur(14px) saturate(1.1)" : "none", WebkitBackdropFilter: scrolled && !menuMode ? "blur(14px) saturate(1.1)" : "none" }}>
        <div className="public-header__bar">
          <Link to="/" className="public-brand" style={{ color: fg }} aria-label="4PLANET home">4PLANET_</Link>

          <nav className="public-header__desktop" aria-label="Primary navigation" onMouseLeave={closeDesktopPanel}>
            {TOP.map((item) => (
              <button
                key={item.key}
                type="button"
                className="public-header__nav-button"
                aria-expanded={panel === item.key}
                onMouseEnter={() => previewDesktopPanel(item.key)}
                onFocus={() => previewDesktopPanel(item.key)}
                onClick={() => toggleDesktopPanel(item.key)}
                style={{ color: panel === item.key ? T.blue : fg }}
              >
                {item.key}
              </button>
            ))}
          </nav>

          <div className="public-header__actions">
            <Link to="/join" className="public-header__join" style={{ color: fg }}>JOIN 4PLANET</Link>
            <button ref={menuButton} type="button" className="public-header__menu" aria-expanded={mobileOpen} aria-label={mobileOpen ? "Close menu" : "Open menu"} onClick={() => setMobileOpen((v) => !v)} style={{ color: fg }}>
              {mobileOpen ? "CLOSE" : "MENU"}
            </button>
          </div>
        </div>
        {panel && <DesktopPanel panel={panel} onClose={closeDesktopPanel} />}
      </header>
      {mobileOpen && <MobileMenu onClose={() => setMobileOpen(false)} />}
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
    ["EXPLORE", [["Enter the living world", "/domains"], ["Missions", "/missions"], ["Impact", "/impact"], ["4Culture", "/domains/4culture"]]],
    ["PARTICIPATE", [["4People", "/join"], ["4Brands", "/brands"], ["4Partners", "/partners"], ["4Funders", "/funders"]]],
    ["4PLANET", [["The Story", "/about"], ["Living Systems", "/living-systems"], ["Proof & Reports", "/reports"], ["Join 4Planet", "/join"]]],
  ];
  return (
    <footer style={{ position: "relative", minHeight: "clamp(600px,86vh,880px)", background: "#000", color: "#fff", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <picture>
        <source media="(max-width: 640px)" srcSet={img("footerPlanet").srcMobile} />
        <img src={img("footerPlanet").src} alt={img("footerPlanet").alt} loading="lazy" decoding="async" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 50%" }} />
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
              <span className="mono" style={{ fontSize: 10.5, letterSpacing: ".14em", color: acc }}>{head}</span>
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
  const bleedTop = topIsDark(pathname);
  return (
    <>
      <Header />
      {!bleedTop && <div aria-hidden style={{ height: 64 }} />}
      <main id="main-content" tabIndex={-1}>{children}</main>
      <Footer />
      <style>{`
        .skip-link{position:fixed;left:16px;top:8px;z-index:1000;transform:translateY(-180%);background:#fff;color:#080808;padding:10px 14px;font:11px ${T.mono};letter-spacing:.12em;text-decoration:none}
        .skip-link:focus{transform:translateY(0)}
        .public-header{position:fixed;z-index:90;top:0;left:0;right:0;border:0;transition:transform .24s cubic-bezier(.4,0,.2,1),background-color .22s ease,color .22s ease;padding-top:env(safe-area-inset-top,0px)}
        .public-header__bar{height:64px;padding:0 clamp(18px,4vw,56px);display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:28px}
        .public-brand{font-family:${T.display};font-size:18px;font-weight:650;letter-spacing:-.02em;text-decoration:none;white-space:nowrap}
        .public-header__desktop{display:flex;align-items:center;justify-content:center;height:100%;gap:clamp(12px,2.2vw,34px)}
        .public-header__nav-button{appearance:none;border:0;background:transparent;font-family:${T.mono};font-size:10.5px;letter-spacing:.12em;padding:22px 2px;cursor:pointer;transition:color .16s ease}
        .public-header__nav-button:focus-visible,.public-header__join:focus-visible,.public-header__menu:focus-visible,.public-brand:focus-visible{outline:3px solid currentColor;outline-offset:4px}
        .public-header__actions{display:flex;align-items:center;gap:14px}
        .public-header__join{font-family:${T.mono};font-size:10px;letter-spacing:.12em;border:0;padding:8px 2px;text-decoration:none;white-space:nowrap}
        .public-header__join:hover{text-decoration:underline;text-underline-offset:5px}
        .public-header__menu{display:none;appearance:none;border:0;background:transparent;font-family:${T.mono};font-size:10.5px;letter-spacing:.12em;padding:12px 0;cursor:pointer}
        .nav-panel{position:absolute;top:calc(64px + env(safe-area-inset-top,0px));left:0;right:0;background:#fff;color:${T.ink};border-top:1px solid ${T.line};border-bottom:1px solid ${T.lineStrong};box-shadow:0 18px 42px rgba(0,0,0,.08)}
        .nav-panel__inner{max-width:1440px;margin:0 auto;padding:clamp(28px,3.5vw,48px) clamp(20px,4vw,56px) clamp(34px,4vw,54px);display:grid;grid-template-columns:minmax(160px,.24fr) minmax(0,1fr);gap:clamp(30px,5vw,80px)}
        .nav-panel-grid{display:grid;gap:1px;background:${T.line};border:1px solid ${T.line}}
        .nav-panel-grid--2{grid-template-columns:repeat(2,minmax(0,1fr))}
        .nav-panel-grid--4{grid-template-columns:repeat(4,minmax(0,1fr));background:transparent;border:0;gap:clamp(20px,3vw,42px)}
        .nav-panel-link{position:relative;display:grid;grid-template-columns:4px 1fr auto;gap:16px;align-items:start;background:#fff;padding:20px;text-decoration:none;color:${T.ink};min-height:112px}
        .nav-panel-link__bar{width:4px;height:100%}
        .nav-panel-link:hover strong{color:${T.blue}!important}.nav-panel-link:focus-visible{outline:3px solid ${T.blue};outline-offset:-3px}
        .nav-domain-col{min-width:0}
        .nav-domain-head{display:flex;align-items:baseline;justify-content:space-between;gap:10px;text-decoration:none;border-top:3px solid currentColor;padding-top:12px}
        .nav-domain-head:focus-visible,.nav-mission-link:focus-visible{outline:3px solid currentColor;outline-offset:4px}
        .nav-mission-link{display:flex;align-items:center;gap:9px;padding:7px 0;color:${T.ink};font-size:13px;line-height:1.32;text-decoration:none}
        .nav-mission-link:hover{text-decoration:underline;text-underline-offset:3px}
        .mobile-nav{display:none;position:fixed;z-index:80;inset:0;background:#fff;color:${T.ink};overflow:auto;padding-top:calc(64px + env(safe-area-inset-top,0px))}
        .mobile-nav__inner{padding:36px 20px 80px}
        .mobile-nav__lenses{display:grid;gap:1px;background:${T.line};border:1px solid ${T.line};margin-top:18px}
        .mobile-nav__about{display:grid;margin-top:14px;border-top:1px solid ${T.line}}
        .mobile-nav__about a{padding:14px 0;border-bottom:1px solid ${T.line};font-family:${T.display};font-size:22px;color:${T.ink};text-decoration:none}
        @media(max-width:920px){.public-header__desktop,.public-header__join{display:none}.public-header__bar{grid-template-columns:1fr auto}.public-header__menu{display:block}.nav-panel{display:none}.mobile-nav{display:block}}
        @media(max-width:560px){.nav-panel-link{grid-template-columns:3px 1fr auto;padding:17px 14px}}
        @media(prefers-reduced-motion:reduce){.public-header{transition:none}.nav-panel-link *{transition:none!important}}
      `}</style>
    </>
  );
}
