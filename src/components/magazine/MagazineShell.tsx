import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { trackEvent } from "@/analytics/Analytics";
import { MAGAZINE_TOPICS } from "@/content/magazineOperating";
import "@/styles/magazine-world.css";
import "@/styles/magazine-world-polish.css";
import "@/styles/magazine-reader-polish.css";
import "@/styles/magazine-gold-02.css";
import "@/styles/magazine-gold-02-fixes.css";
import "@/styles/magazine-live-round-01.css";
import "@/styles/magazine-live-round-02.css";
import "@/styles/magazine-mobile-round-03.css";
import "@/styles/magazine-live-round-04.css";
import "@/styles/magazine-live-round-05.css";
import "@/styles/magazine-public-launch.css";

type MagazineTheme = "light" | "dark";
const THEME_KEY = "4planet-magazine-theme-v2";

function initialTheme(): MagazineTheme {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return "light";
}

function storySlugFromPath(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] !== "magazine" || parts.length !== 2) return "";
  if (["about", "sources", "corrections", "privacy", "search", "saved", "archive", "atlas"].includes(parts[1])) return "";
  return parts[1];
}

export function MagazineShell({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<MagazineTheme>(initialTheme);

  useEffect(() => { window.localStorage.setItem(THEME_KEY, theme); }, [theme]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest("a") : null;
      if (!(target instanceof HTMLAnchorElement)) return;
      const href = target.getAttribute("href") || "";
      const storySlug = storySlugFromPath(window.location.pathname);
      if (target.classList.contains("mag-source-item")) {
        let sourceHost = "unknown";
        try { sourceHost = new URL(target.href).hostname; } catch { /* bounded fallback */ }
        trackEvent("source_open", { story_slug: storySlug, source_host: sourceHost, source_label: (target.textContent || "").trim().slice(0, 120) });
      }
      if (target.classList.contains("mag-related-editorial-card") || target.classList.contains("mag-next-story")) {
        const destination = href.split("/").filter(Boolean).at(-1) || "unknown";
        trackEvent("related_story_open", { story_slug: storySlug, destination_story_slug: destination });
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <div className="mag-world" data-mag-theme={theme}>
      <a className="mag-skip-link" href="#magazine-content">SKIP TO CONTENT</a>
      <header className="mag-world-header">
        <div className="mag-world-parent-row">
          <a className="mag-world-parent" href="https://4planet.org/" rel="home">4PLANET_</a>
          <span>FOR A LIVING PLANET / EDITORIAL</span>
          <div className="mag-world-utility">
            <Link to="/magazine/search" aria-label="Search 4PLANET Magazine">SEARCH</Link>
            <Link to="/magazine/saved" aria-label="Saved and recent reading">SAVED</Link>
            <button className="mag-theme-toggle" type="button" aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`} aria-pressed={theme === "dark"} onClick={() => setTheme((current) => current === "light" ? "dark" : "light")}>
              <span aria-hidden>{theme === "light" ? "DARK" : "LIGHT"}</span><i aria-hidden />
            </button>
          </div>
        </div>

        <div className="mag-world-masthead-row">
          <Link className="mag-world-masthead" to="/magazine" aria-label="4PLANET Magazine home">
            <span className="mag-world-masthead-word">4PLANET</span><span className="mag-world-masthead-word">MAGAZINE</span>
          </Link>
          <p>Nature · people · engineering · culture · what works</p>
        </div>

        <nav className="mag-world-primary-nav" aria-label="Magazine primary navigation">
          <Link to="/magazine">LATEST</Link>
          <Link to="/magazine?lane=LIFE">LIFE</Link>
          <Link to="/magazine?lane=PLANET">PLANET</Link>
          <Link to="/magazine?topic=INNOVATION">INNOVATION</Link>
          <Link to="/magazine?lane=PEOPLE">PEOPLE</Link>
          <Link to="/magazine?lane=CULTURE">CULTURE</Link>
          <Link to="/magazine?lane=HUMAN">IDEAS</Link>
          <Link to="/magazine#topics">TOPICS +</Link>
        </nav>
      </header>

      <div id="magazine-content">{children}</div>

      <footer className="mag-world-footer">
        <div className="mag-world-footer-statement">
          <span>4PLANET MAGAZINE</span>
          <h2>Stories for people who want the future to work.</h2>
          <p>Independent-minded editorial work about the living world, the people measuring it, and the ideas being built around it.</p>
        </div>
        <div className="mag-world-footer-grid">
          <div>
            <p>READ</p><Link to="/magazine">Latest</Link><Link to="/magazine/search">Search</Link><Link to="/magazine/saved">Saved / recent</Link><Link to="/magazine/archive">Archive</Link>
          </div>
          <div>
            <p>TOPICS</p>{MAGAZINE_TOPICS.slice(0, 6).map((topic) => <Link key={topic.id} to={`/magazine/topics/${topic.id.toLowerCase()}`}>{topic.label}</Link>)}
          </div>
          <div>
            <p>EDITORIAL</p><Link to="/magazine/about">About</Link><Link to="/magazine/sources">Sources & method</Link><Link to="/magazine/corrections">Corrections</Link><Link to="/magazine/privacy">Privacy</Link><a href="/rss.xml">RSS</a>
          </div>
          <div>
            <p>DISCOVER</p><Link to="/magazine/atlas">4PLANET Atlas</Link><Link to="/magazine/series/from-the-field">From the Field</Link><Link to="/magazine/series/the-living-world">The Living World</Link><Link to="/magazine/series/what-works">What Works</Link>
          </div>
        </div>
        <div className="mag-world-footer-bottom"><span>4PLANET_ FOR A LIVING PLANET</span><span>Sources, uncertainty and corrections belong in the product.</span></div>
      </footer>
    </div>
  );
}
