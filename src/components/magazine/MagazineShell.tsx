import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { MAGAZINE_TOPICS } from "@/content/magazineOperating";
import "@/styles/magazine-world.css";
import "@/styles/magazine-world-polish.css";

type MagazineTheme = "light" | "dark";

function initialTheme(): MagazineTheme {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem("4planet-magazine-theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function MagazineShell({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<MagazineTheme>(initialTheme);

  useEffect(() => {
    window.localStorage.setItem("4planet-magazine-theme", theme);
  }, [theme]);

  return (
    <div className="mag-world" data-mag-theme={theme}>
      <header className="mag-world-header">
        <div className="mag-world-parent-row">
          <Link className="mag-world-parent" to="/">4PLANET_</Link>
          <span>EDITORIAL / LIVING PLANET INTELLIGENCE</span>
          <div className="mag-world-utility">
            <Link to="/magazine/search" aria-label="Search 4PLANET Magazine">SEARCH</Link>
            <Link to="/magazine/saved" aria-label="Saved and recent reading">SAVED</Link>
            <button
              className="mag-theme-toggle"
              type="button"
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              aria-pressed={theme === "dark"}
              onClick={() => setTheme((current) => current === "light" ? "dark" : "light")}
            >
              <span aria-hidden>{theme === "light" ? "DARK" : "LIGHT"}</span>
              <i aria-hidden />
            </button>
          </div>
        </div>

        <div className="mag-world-masthead-row">
          <Link className="mag-world-masthead" to="/magazine" aria-label="4PLANET Magazine home">
            <span>4PLANET</span>
            <strong>MAGAZINE</strong>
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

      {children}

      <footer className="mag-world-footer">
        <div className="mag-world-footer-statement">
          <span>4PLANET MAGAZINE</span>
          <h2>Stories for people who want the future to work.</h2>
          <p>Independent-minded editorial work about the living world, the people measuring it, and the ideas being built around it.</p>
        </div>
        <div className="mag-world-footer-grid">
          <div>
            <p>READ</p>
            <Link to="/magazine">Latest</Link>
            <Link to="/magazine/search">Search</Link>
            <Link to="/magazine/saved">Saved / recent</Link>
            <Link to="/magazine/archive">Archive</Link>
          </div>
          <div>
            <p>TOPICS</p>
            {MAGAZINE_TOPICS.slice(0, 6).map((topic) => <Link key={topic.id} to={`/magazine?topic=${topic.id}`}>{topic.label}</Link>)}
          </div>
          <div>
            <p>EDITORIAL</p>
            <Link to="/magazine/about">About</Link>
            <Link to="/magazine/sources">Sources & method</Link>
            <Link to="/magazine/corrections">Corrections</Link>
            <a href="/rss.xml">RSS</a>
          </div>
          <div>
            <p>GO DEEPER</p>
            <Link to="/atlas">Atlas</Link>
            <Link to="/species">Species</Link>
            <Link to="/living-systems">Living Systems</Link>
            <Link to="/actors">Actors</Link>
          </div>
        </div>
        <div className="mag-world-footer-bottom">
          <span>4PLANET_ FOR A LIVING PLANET</span>
          <span>Sources, uncertainty and corrections belong in the product.</span>
        </div>
      </footer>
    </div>
  );
}
