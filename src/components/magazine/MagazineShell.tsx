import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import "@/styles/magazine-world-shell.css";

type MagazineTheme = "light" | "dark";
const THEME_KEY = "4planet-magazine-theme-v2";

function getInitialTheme(): MagazineTheme {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(THEME_KEY);
  return stored === "dark" ? "dark" : "light";
}

export function MagazineShell({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<MagazineTheme>(getInitialTheme);

  useEffect(() => {
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  return (
    <div className="mag-world-shell" data-mag-theme={theme}>
      <header className="mag-world-shell__header">
        <div className="mag-world-shell__utility">
          <Link className="mag-world-shell__parent" to="/">4PLANET_</Link>
          <span>FOR A LIVING PLANET / EDITORIAL</span>
          <button
            className="mag-world-shell__theme"
            type="button"
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            aria-pressed={theme === "dark"}
            onClick={() => setTheme((current) => (current === "light" ? "dark" : "light"))}
          >
            {theme === "light" ? "DARK" : "LIGHT"}
          </button>
        </div>

        <div className="mag-world-shell__masthead">
          <Link to="/magazine" aria-label="4PLANET Magazine home">
            <span>4PLANET</span>
            <strong>MAGAZINE</strong>
          </Link>
          <p>Nature · people · engineering · culture · what works</p>
        </div>

        <nav className="mag-world-shell__nav" aria-label="Magazine primary navigation">
          <Link to="/magazine">LATEST</Link>
          <Link to="/magazine#lane-life">LIFE</Link>
          <Link to="/magazine#lane-planet">PLANET</Link>
          <Link to="/magazine#lane-human">HUMAN</Link>
          <Link to="/magazine#lane-solutions">SOLUTIONS</Link>
          <Link to="/magazine#lane-people">PEOPLE</Link>
          <Link to="/magazine#lane-culture">CULTURE</Link>
        </nav>
      </header>

      {children}

      <footer className="mag-world-shell__footer">
        <div>
          <span>4PLANET MAGAZINE</span>
          <h2>Stories for people who want the future to work.</h2>
          <p>Sources, uncertainty and corrections belong in the product.</p>
        </div>
        <nav aria-label="Magazine footer navigation">
          <Link to="/magazine">Latest</Link>
          <Link to="/magazine/about">About</Link>
          <Link to="/magazine/sources">Sources & method</Link>
          <Link to="/magazine/corrections">Corrections</Link>
        </nav>
      </footer>
    </div>
  );
}
