/**
 * S4PIENS — Human Systems Atlas. Same SPA, same ATLAS engine, same source and
 * entity contracts as 4PLANET / 4NATION. Shares the 4NATION interface primitives
 * (ui.tsx, nation.css) with the S4PIENS accent (#FF4D22).
 * Host-root on s4piens.com; /human-systems on 4planet.org.
 */
import { lazy, Suspense, useEffect, useState } from "react";
import { Link, Route, Routes } from "react-router-dom";
import { identityAccountUrl, identityLoginUrl } from "@/identity/identityClient";
import { SourceDrawerProvider } from "@/nation/ui";
import { useSignedIn, type Theme } from "@/nation/NationApp";
import S4Home from "./S4Home";
import "@/nation/nation.css";
import "./s4piens.css";

const SystemPage = lazy(() => import("./SystemPage"));
const ObjectPage = lazy(() => import("./ObjectPage"));

export const isS4Host = () => {
  if (typeof window === "undefined") return false;
  const h = window.location.hostname.toLowerCase();
  return h === "s4piens.com" || h === "www.s4piens.com" || h === "4planet-s4piens.pages.dev" || h.endsWith(".4planet-s4piens.pages.dev");
};
export const s4Base = () => (isS4Host() ? "" : "/human-systems");
export const systemHref = (slug: string) => `${s4Base()}/system/${slug}`;
export const nationOrigin = () => (isS4Host() ? "https://4nation.org" : "/4nation");
export const atlasHome = () => (isS4Host() ? "https://4planetatlas.com/atlas" : "/atlas");

const THEMES: Theme[] = ["light", "dark", "paper"];
const LABEL: Record<Theme, string> = { light: "Light", dark: "Dark", paper: "Paper" };
const read = (k: string) => { try { return window.localStorage.getItem(k); } catch { return null; } };
const write = (k: string, v: string) => { try { window.localStorage.setItem(k, v); } catch { /* storage unavailable */ } };

function Header({ theme, setTheme }: { theme: Theme; setTheme: (t: Theme) => void }) {
  const signedIn = useSignedIn();
  const [menu, setMenu] = useState(false);
  const idHref = signedIn ? identityAccountUrl(window.location.href) : identityLoginUrl(window.location.href);
  return (
    <header className="n-header">
      <Link to={s4Base() || "/"} className="n-wordmark s-wordmark" aria-label="S4PIENS home">S4PIENS<span>HUMAN SYSTEMS</span></Link>
      <nav className="n-header__nav s-header__nav" aria-label="Systems">
        <Link to={`${s4Base()}/object/bread`}>Follow one thing</Link>
        <Link to={systemHref("food")}>Food</Link>
        <Link to={systemHref("energy-and-industry")}>Energy & industry</Link>
        <a href={atlasHome()}>Atlas ↗</a>
        <a href={nationOrigin()}>4NATION ↗</a>
        <a href="https://4planet.org/">4PLANET ↗</a>
      </nav>
      <div className="n-header__tools">
        <div className="n-theme" role="radiogroup" aria-label="Display">
          {THEMES.map((t) => <button key={t} role="radio" aria-checked={theme === t} title={LABEL[t]} aria-label={LABEL[t]} onClick={() => setTheme(t)} className={"n-theme__opt n-theme__opt--" + t} />)}
        </div>
        <a className="n-header__id" href={idHref}>{signedIn ? "Account" : "Sign in"}</a>
        <button className="n-icon-btn n-header__menu-btn s-menu-btn" aria-expanded={menu} aria-label="Menu" onClick={() => setMenu((m) => !m)}>
          <svg viewBox="0 0 16 16" aria-hidden><path d="M2 5h12M2 11h12" /></svg>
        </button>
      </div>
      {menu && (
        <div className="n-menu" onClick={() => setMenu(false)}>
          <Link to={`${s4Base()}/object/bread`}>Follow one thing</Link>
          <Link to={systemHref("food")}>Food</Link>
          <Link to={systemHref("energy-and-industry")}>Energy & industry</Link>
          <a href={atlasHome()}>Full ATLAS ↗</a>
          <a href={nationOrigin()}>4NATION — countries ↗</a>
          <a href="https://4planet.org/">4PLANET ↗</a>
          <a href={idHref}>{signedIn ? "4PLANET ID · Account" : "Sign in with 4PLANET ID"}</a>
        </div>
      )}
    </header>
  );
}

export function S4Footer() {
  return (
    <footer className="n-footer">
      <div className="n-footer__brand">
        <span className="n-wordmark s-wordmark">S4PIENS<span>HUMAN SYSTEMS</span></span>
        <p>How the systems that feed, power and build human life work — where they touch the living world, what goes wrong, and what people are building to change it. Explanations are labelled as 4PLANET context; figures carry their source and year.</p>
      </div>
      <nav aria-label="Footer">
        <a href="https://4planet.org/">4PLANET ↗</a>
        <a href={atlasHome()}>ATLAS ↗</a>
        <a href={nationOrigin()}>4NATION ↗</a>
        <a href="https://id.4planet.org/">4PLANET ID ↗</a>
      </nav>
      <p className="n-footer__src n-mono">DATA: CLIMATE TRACE (CC BY 4.0) · NASA GIBS AND UNESCO IN ATLAS · NATURAL EARTH (PUBLIC DOMAIN) · 4PLANET SHARED LIVING-SYSTEMS REGISTRY</p>
    </footer>
  );
}

export default function S4App() {
  const [theme, setThemeState] = useState<Theme>(() => {
    const t = read("s4piens.theme") as Theme | null;
    if (t && THEMES.includes(t)) return t;
    return typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const setTheme = (t: Theme) => { setThemeState(t); write("s4piens.theme", t); };
  useEffect(() => {
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#08080A" : theme === "paper" ? "#FFFFFF" : "#ECEDEF");
  }, [theme]);
  return (
    <div className="n-app s-app" data-ntheme={theme}>
      <SourceDrawerProvider>
        <Header theme={theme} setTheme={setTheme} />
        <Suspense fallback={<main className="n-loading" role="status">Loading…</main>}>
          <Routes>
            <Route index element={<S4Home />} />
            <Route path="system/:slug" element={<SystemPage theme={theme} />} />
            <Route path="object/:slug" element={<ObjectPage />} />
            <Route path="*" element={<S4Home />} />
          </Routes>
        </Suspense>
      </SourceDrawerProvider>
    </div>
  );
}
