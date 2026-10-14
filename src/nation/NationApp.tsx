/**
 * 4NATION — app shell. Same SPA, same engine, same contracts as 4PLANET.
 * On 4nation.org routes are host-root; on 4planet.org they live under /4nation.
 */
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Link, Route, Routes, useNavigate } from "react-router-dom";
import { getIdentityClient, identityAccountUrl, identityLoginUrl } from "@/identity/identityClient";
import { countryByIso, searchCountries, type NationCountry } from "./geo";
import { SourceDrawerProvider } from "./ui";
import NationHome from "./NationHome";
import "./nation.css";

const CountryPage = lazy(() => import("./CountryPage"));
const ComparePage = lazy(() => import("./ComparePage"));
const DecisionsPage = lazy(() => import("@/pages/nation/NationPage"));

export const isNationHost = () => {
  if (typeof window === "undefined") return false;
  const h = window.location.hostname.toLowerCase();
  return h === "4nation.org" || h === "www.4nation.org" || h === "4planet-nation.pages.dev" || h.endsWith(".4planet-nation.pages.dev");
};
export const nationBase = () => (isNationHost() ? "" : "/4nation");
export const countryHref = (c: NationCountry) => `${nationBase()}/country/${c.slug}`;
export const atlasOrigin = () => (isNationHost() ? "https://4planetatlas.com" : "");

/* ── theme ─────────────────────────────────────────────────────────────── */
export type Theme = "light" | "dark" | "paper";
const THEMES: Theme[] = ["light", "dark", "paper"];
const THEME_LABEL: Record<Theme, string> = { light: "Light", dark: "Dark", paper: "Paper" };
const store = {
  get: (k: string) => { try { return window.localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string | null) => { try { v === null ? window.localStorage.removeItem(k) : window.localStorage.setItem(k, v); } catch { /* storage unavailable */ } },
};
function initialTheme(): Theme {
  const saved = store.get("4nation.theme") as Theme | null;
  if (saved && THEMES.includes(saved)) return saved;
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/* ── my country (device-local; account sync is a documented next step) ─ */
export function useMyCountry() {
  const [iso, setIso] = useState<string | null>(() => store.get("4nation.mycountry"));
  useEffect(() => {
    const on = () => setIso(store.get("4nation.mycountry"));
    window.addEventListener("4nation:mycountry", on);
    return () => window.removeEventListener("4nation:mycountry", on);
  }, []);
  const set = (v: string | null) => { store.set("4nation.mycountry", v); window.dispatchEvent(new Event("4nation:mycountry")); };
  return [iso ? countryByIso(iso) ?? null : null, set] as const;
}

export function useSignedIn() {
  const [signedIn, set] = useState(false);
  useEffect(() => {
    let alive = true, unsub = () => {};
    getIdentityClient().then((client) => {
      client.auth.getSession().then(({ data }) => alive && set(Boolean(data.session)));
      const l = client.auth.onAuthStateChange((_e, s) => alive && set(Boolean(s)));
      unsub = () => l.data.subscription.unsubscribe();
    }).catch(() => undefined);
    return () => { alive = false; unsub(); };
  }, []);
  return signedIn;
}

/* ── search ────────────────────────────────────────────────────────────── */
export function CountrySearch({ autoFocus, size = "s", onDone }: { autoFocus?: boolean; size?: "s" | "l"; onDone?: () => void }) {
  const [q, setQ] = useState("");
  const [i, setI] = useState(0);
  const nav = useNavigate();
  const input = useRef<HTMLInputElement>(null);
  const results = useMemo(() => searchCountries(q), [q]);
  useEffect(() => {
    if (size !== "s") return;
    const on = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !/INPUT|TEXTAREA/.test(t.tagName))) { e.preventDefault(); input.current?.focus(); }
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [size]);
  const go = (c: NationCountry) => { setQ(""); onDone?.(); nav(countryHref(c)); };
  return (
    <div className={"n-search n-search--" + size} role="search">
      <svg viewBox="0 0 16 16" aria-hidden className="n-search__icon"><circle cx="7" cy="7" r="5" /><path d="M11 11l3.5 3.5" /></svg>
      <input ref={input} value={q} autoFocus={autoFocus} placeholder={size === "l" ? "Search a country or capital" : "Search countries"}
        aria-label="Search countries" aria-autocomplete="list" aria-controls="n-search-list" aria-expanded={results.length > 0}
        onChange={(e) => { setQ(e.target.value); setI(0); }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") { e.preventDefault(); setI((x) => Math.min(results.length - 1, x + 1)); }
          if (e.key === "ArrowUp") { e.preventDefault(); setI((x) => Math.max(0, x - 1)); }
          if (e.key === "Enter" && results[i]) go(results[i]);
          if (e.key === "Escape") { setQ(""); onDone?.(); }
        }} />
      {size === "s" && !q && <kbd className="n-search__kbd">/</kbd>}
      {results.length > 0 && (
        <ul id="n-search-list" className="n-search__list" role="listbox">
          {results.map((c, k) => (
            <li key={c.iso2} role="option" aria-selected={k === i}>
              <button onMouseEnter={() => setI(k)} onClick={() => go(c)}>
                <span>{c.name}</span><span className="n-mono">{c.capital ? c.capital.toUpperCase() + " · " : ""}{c.iso3}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ── header ────────────────────────────────────────────────────────────── */
function Header({ theme, setTheme }: { theme: Theme; setTheme: (t: Theme) => void }) {
  const signedIn = useSignedIn();
  const [my] = useMyCountry();
  const [menu, setMenu] = useState(false);
  const [searching, setSearching] = useState(false);
  const idHref = signedIn ? identityAccountUrl(window.location.href) : identityLoginUrl(window.location.href);
  return (
    <header className="n-header">
      <Link to={nationBase() || "/"} className="n-wordmark" aria-label="4NATION home">4NATION<span>BETTER NATION</span></Link>
      <div className="n-header__search"><CountrySearch /></div>
      <nav className="n-header__nav" aria-label="4PLANET">
        {my && <Link className="n-header__my" to={countryHref(my)}><i aria-hidden />My country · {my.short}</Link>}
        <a href={(atlasOrigin() || "") + "/atlas"}>Atlas ↗</a>
        <a href="https://4planet.org/">4PLANET ↗</a>
      </nav>
      <div className="n-header__tools">
        <button className="n-icon-btn n-header__search-btn" aria-label="Search countries" onClick={() => setSearching(true)}>
          <svg viewBox="0 0 16 16" aria-hidden><circle cx="7" cy="7" r="5" /><path d="M11 11l3.5 3.5" /></svg>
        </button>
        <div className="n-theme" role="radiogroup" aria-label="Display">
          {THEMES.map((t) => (
            <button key={t} role="radio" aria-checked={theme === t} title={THEME_LABEL[t]} aria-label={THEME_LABEL[t]} onClick={() => setTheme(t)} className={"n-theme__opt n-theme__opt--" + t} />
          ))}
        </div>
        <a className="n-header__id" href={idHref}>{signedIn ? "Account" : "Sign in"}</a>
        <button className="n-icon-btn n-header__menu-btn" aria-expanded={menu} aria-label="Menu" onClick={() => setMenu((m) => !m)}>
          <svg viewBox="0 0 16 16" aria-hidden><path d="M2 5h12M2 11h12" /></svg>
        </button>
      </div>
      {menu && (
        <div className="n-menu" onClick={() => setMenu(false)}>
          {my && <Link to={countryHref(my)}>My country · {my.short}</Link>}
          <a href={(atlasOrigin() || "") + "/atlas"}>Full ATLAS ↗</a>
          <a href="https://4planet.org/">4PLANET ↗</a>
          <Link to={`${nationBase()}/decisions`}>Public decisions</Link>
          <a href={idHref}>{signedIn ? "4PLANET ID · Account" : "Sign in with 4PLANET ID"}</a>
        </div>
      )}
      {searching && (
        <div className="n-search-overlay" role="dialog" aria-label="Search countries" onClick={(e) => { if (e.target === e.currentTarget) setSearching(false); }}>
          <CountrySearch autoFocus size="l" onDone={() => setSearching(false)} />
          <button className="n-link" onClick={() => setSearching(false)}>Close</button>
        </div>
      )}
    </header>
  );
}

export default function NationApp() {
  const [theme, setThemeState] = useState<Theme>(initialTheme);
  const setTheme = (t: Theme) => { setThemeState(t); store.set("4nation.theme", t); };
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    meta?.setAttribute("content", theme === "dark" ? "#000000" : "#FFFFFF");
  }, [theme]);
  return (
    <div className="n-app" data-ntheme={theme}>
      <SourceDrawerProvider>
        <Header theme={theme} setTheme={setTheme} />
        <Suspense fallback={<main className="n-loading" role="status">Loading…</main>}>
          <Routes>
            <Route index element={<NationHome theme={theme} />} />
            <Route path="country/:slug" element={<CountryPage theme={theme} />} />
            <Route path="compare/:pair" element={<ComparePage theme={theme} />} />
            <Route path="decisions/*" element={<div className="n-legacy"><DecisionsPage /></div>} />
            <Route path="*" element={<NationHome theme={theme} />} />
          </Routes>
        </Suspense>
      </SourceDrawerProvider>
    </div>
  );
}
