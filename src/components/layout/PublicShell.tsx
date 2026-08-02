import { type ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Mark } from "@/components/ui";
import { ProductSwitcher } from "@/product/ProductSwitcher";
import { T, DOMAIN_ACCENT } from "@/styles/tokens";
import {
  DOMAIN_ORDER,
  DOMAINS,
  displayName,
  domainSlug,
  getMission,
  getMissionsByDomain,
} from "@/content/narrativeContract";

const navGroups = [
  ["EXPLORE", [["DOMAINS", "/domains"], ["MISSIONS", "/missions"], ["ATLAS", "/atlas"], ["SPECIES", "/species"]]],
  ["PARTICIPATE", [["4PEOPLE", "/people"], ["4BRANDS", "/brands"], ["4PARTNERS", "/partners"], ["4FUNDERS", "/funders"]]],
  ["4PLANET", [["IMPACT", "/impact"], ["IMPACT LAB", "/impact/lab"], ["STORIES", "/stories"], ["ABOUT", "/about"]]],
] as const;

function currentAccent(pathname: string): string {
  const domainMatch = pathname.match(/^\/domains\/([^/]+)/);
  if (domainMatch) {
    const key = DOMAIN_ORDER.find((item) => domainSlug(item) === domainMatch[1]);
    if (key) return DOMAIN_ACCENT[key];
  }
  const missionMatch = pathname.match(/^\/missions\/([^/]+)/);
  if (missionMatch) {
    const mission = getMission(missionMatch[1]);
    if (mission) return DOMAIN_ACCENT[mission.domain];
  }
  return T.blue;
}

function Header() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const accent = currentAccent(pathname);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header style={{ position: "fixed", inset: "0 0 auto", zIndex: 80, height: 64, background: "rgba(255,255,255,.94)", borderBottom: `1px solid ${T.line}`, backdropFilter: "blur(18px)" }}>
        <div style={{ height: "100%", padding: "0 clamp(18px,3vw,44px)", display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center" }}>
          <div style={{ justifySelf: "start", display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Link to="/" aria-label="4PLANET home"><Mark size={16} color={T.ink} accent={accent} /></Link>
            <ProductSwitcher />
          </div>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="public-menu"
            onClick={() => setOpen((value) => !value)}
            style={{ justifySelf: "center", border: 0, background: "transparent", color: T.ink, cursor: "pointer", fontFamily: T.mono, fontSize: 11, letterSpacing: ".14em" }}
          >
            {open ? "CLOSE" : "MENU"}
          </button>
          <Link to="/people" style={{ justifySelf: "end", color: T.ink, textDecoration: "none", fontFamily: T.mono, fontSize: 11, letterSpacing: ".12em", borderBottom: `2px solid ${accent}`, paddingBottom: 5 }}>
            JOIN 4_
          </Link>
        </div>
      </header>

      {open && (
        <div id="public-menu" role="dialog" aria-modal="true" aria-label="4PLANET menu" style={{ position: "fixed", inset: 64 + "px 0 0", zIndex: 79, background: "#fff", overflowY: "auto" }}>
          <div style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(44px,7vw,92px) clamp(20px,5vw,72px)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "clamp(28px,5vw,72px)" }} className="shell-nav-grid">
              {navGroups.map(([heading, items]) => (
                <nav key={heading} aria-label={heading}>
                  <div style={{ fontFamily: T.mono, fontSize: 10.5, letterSpacing: ".14em", color: accent, marginBottom: 15 }}>{heading}</div>
                  <div style={{ display: "grid", borderTop: `1px solid ${T.line}` }}>
                    {items.map(([label, to]) => (
                      <Link key={label} to={to} style={{ color: T.ink, textDecoration: "none", padding: "14px 0", borderBottom: `1px solid ${T.line}`, fontSize: "clamp(18px,2vw,25px)", fontWeight: 500 }}>{label}</Link>
                    ))}
                  </div>
                </nav>
              ))}
            </div>

            <div style={{ marginTop: "clamp(42px,6vw,78px)", borderTop: `1px solid ${T.ink}`, paddingTop: 24 }}>
              <div style={{ fontFamily: T.mono, fontSize: 10.5, letterSpacing: ".14em", color: accent }}>FOUR DOMAINS / SIXTEEN MISSIONS</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: "clamp(24px,4vw,54px)", marginTop: 28 }} className="shell-mission-grid">
                {DOMAIN_ORDER.map((key) => (
                  <div key={key}>
                    <Link to={`/domains/${domainSlug(key)}`} style={{ color: DOMAIN_ACCENT[key], textDecoration: "none", fontFamily: T.display, fontWeight: 500, fontSize: "clamp(24px,2.7vw,36px)", letterSpacing: "-.035em" }}>
                      {displayName(DOMAINS[key].name)}
                    </Link>
                    <div style={{ display: "grid", marginTop: 12 }}>
                      {getMissionsByDomain(key).map((mission) => (
                        <Link key={mission.slug} to={`/missions/${mission.slug}`} style={{ color: T.ink, textDecoration: "none", padding: "8px 0", fontSize: 15, borderBottom: `1px solid ${T.line}` }}>
                          {displayName(mission.name)}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <style>{`@media(max-width:820px){.shell-nav-grid{grid-template-columns:1fr!important}.shell-mission-grid{grid-template-columns:1fr 1fr!important}}@media(max-width:520px){.shell-mission-grid{grid-template-columns:1fr!important}}`}</style>
          </div>
        </div>
      )}
    </>
  );
}

function Footer() {
  const { pathname } = useLocation();
  const accent = currentAccent(pathname);
  return (
    <footer style={{ background: T.ink, color: "#fff" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(70px,9vw,126px) clamp(20px,5vw,72px) 34px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.2fr) minmax(280px,.8fr)", gap: "clamp(40px,8vw,120px)" }} className="shell-footer-grid">
          <div>
            <Mark size={20} color="#fff" accent={accent} />
            <h2 style={{ margin: "30px 0 0", fontFamily: T.display, fontWeight: 500, letterSpacing: "-.04em", fontSize: "clamp(42px,6vw,84px)", lineHeight: .92 }}>For a Living Planet.</h2>
            <p style={{ margin: "24px 0 0", color: "rgba(255,255,255,.68)", fontSize: 16, lineHeight: 1.65, maxWidth: 600 }}>Understand the living planet. Make impact easy. Prove what happened.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
            <nav style={{ display: "grid", alignContent: "start", gap: 12 }}>
              <span style={{ fontFamily: T.mono, fontSize: 10.5, letterSpacing: ".14em", color: accent }}>EXPLORE</span>
              <Link to="/domains" style={{ color: "#fff", textDecoration: "none" }}>Domains</Link>
              <Link to="/missions" style={{ color: "#fff", textDecoration: "none" }}>Missions</Link>
              <Link to="/atlas" style={{ color: "#fff", textDecoration: "none" }}>Atlas</Link>
              <Link to="/species" style={{ color: "#fff", textDecoration: "none" }}>Species</Link>
            </nav>
            <nav style={{ display: "grid", alignContent: "start", gap: 12 }}>
              <span style={{ fontFamily: T.mono, fontSize: 10.5, letterSpacing: ".14em", color: accent }}>4PLANET</span>
              <Link to="/impact" style={{ color: "#fff", textDecoration: "none" }}>Impact</Link>
              <Link to="/stories" style={{ color: "#fff", textDecoration: "none" }}>Stories</Link>
              <Link to="/about" style={{ color: "#fff", textDecoration: "none" }}>About</Link>
              <Link to="/privacy" style={{ color: "#fff", textDecoration: "none" }}>Privacy</Link>
            </nav>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 18, flexWrap: "wrap", borderTop: "1px solid rgba(255,255,255,.18)", marginTop: 64, paddingTop: 22 }}>
          <span style={{ fontFamily: T.mono, fontSize: 10.5, letterSpacing: ".1em", color: "rgba(255,255,255,.62)" }}>4PLANET_ / PUBLIC PREVIEW</span>
          <span style={{ fontFamily: T.mono, fontSize: 10.5, letterSpacing: ".1em", color: "rgba(255,255,255,.62)" }}>STATUS AND CLAIMS ARE PART OF THE PRODUCT.</span>
        </div>
        <style>{`@media(max-width:760px){.shell-footer-grid{grid-template-columns:1fr!important}}`}</style>
      </div>
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
      <style>{`.skip-to-main{position:fixed;top:8px;left:8px;z-index:1000;padding:10px 14px;background:#fff;color:#0a0a0a;border:2px solid ${T.blue};font-family:${T.mono};font-size:12px;letter-spacing:.08em;text-decoration:none;transform:translateY(-160%);transition:transform .15s ease}.skip-to-main:focus{transform:translateY(0)}`}</style>
    </>
  );
}
