import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";

const ABOUT_REMAP = new Map([
  ["/about#story", "/about/story"],
  ["/about#system", "/about/system"],
  ["/about#founder", "/about/founder"],
]);

type Hosts = {
  main: HTMLElement | null;
};

function RouteCTA({ pathname }: { pathname: string }) {
  if (pathname === "/domains/s4piens") {
    return (
      <section className="completion-route-cta completion-route-cta--sapiens" aria-label="Continue into S4PIENS">
        <div className="completion-route-cta__inner">
          <div className="completion-kicker">S4PIENS_ · HUMAN SYSTEMS</div>
          <h2>The human side of the living planet has a deeper home.</h2>
          <p>Continue into S4PIENS for the dedicated human-systems experience, beginning with food.</p>
          <a href="https://s4piens.com" target="_blank" rel="noopener noreferrer" className="completion-cta-button">ENTER S4PIENS.COM ↗</a>
        </div>
      </section>
    );
  }

  if (pathname === "/missions/food") {
    return (
      <section className="completion-route-cta completion-route-cta--food" aria-label="Continue the FOOD journey">
        <div className="completion-route-cta__inner">
          <div className="completion-kicker">FOOD_ · GO DEEPER</div>
          <h2>Don’t stop at the mission page.</h2>
          <p>Enter the dedicated FOOD journey, or try the current 4FOOD capture prototype while the deeper Choice experience remains in development.</p>
          <div className="completion-cta-actions">
            <a href="https://s4piens.com/food" target="_blank" rel="noopener noreferrer" className="completion-cta-button">OPEN FOOD JOURNEY ↗</a>
            <Link to="/food/lens" className="completion-cta-button completion-cta-button--outline">TRY 4FOOD PROTOTYPE →</Link>
          </div>
        </div>
      </section>
    );
  }

  if (pathname === "/missions/wh4les" || pathname === "/species/orca") {
    return (
      <section className="completion-route-cta completion-route-cta--whales" aria-label="Continue into the Orca Journey">
        <div className="completion-route-cta__inner">
          <div className="completion-kicker">WH4LES_ · IMMERSIVE JOURNEY</div>
          <h2>Enter the living ocean through one life.</h2>
          <p>Meet the species first in a clean spatial intelligence room, or follow the wider journey through prey, place, pressure, evidence and possible response.</p>
          <div className="completion-cta-actions">
            <Link to="/species/orca/lume" className="completion-cta-button">ENTER LUME ROOM →</Link>
            <a href="/journey/orca/" className="completion-cta-button completion-cta-button--outline">FOLLOW ORCA JOURNEY →</a>
          </div>
        </div>
      </section>
    );
  }

  if (pathname === "/missions/am4zonia" || pathname === "/species/jaguar") {
    return (
      <section className="completion-route-cta completion-route-cta--jaguar" aria-label="Continue into the Jaguar Journey">
        <div className="completion-route-cta__inner">
          <div className="completion-kicker">AM4ZONIA_ · IMMERSIVE JOURNEY</div>
          <h2>Enter the rainforest through one life.</h2>
          <p>Meet the Jaguar, then move through its living web, Amazonia context, pressures, evidence and possible response.</p>
          <a href="/journey/jaguar/" className="completion-cta-button">ENTER JAGUAR JOURNEY →</a>
        </div>
      </section>
    );
  }

  return null;
}

export function PublicCompletionBridge() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [hosts, setHosts] = useState<Hosts>({ main: null });

  useEffect(() => {
    const darkAbout = pathname === "/about/story" || pathname === "/about/founder";
    document.body.classList.toggle("completion-dark-about", darkAbout);

    const syncTop = () => {
      document.body.classList.toggle("completion-dark-about-top", darkAbout && window.scrollY < 24);
    };
    syncTop();
    window.addEventListener("scroll", syncTop, { passive: true });

    return () => {
      document.body.classList.remove("completion-dark-about");
      document.body.classList.remove("completion-dark-about-top");
      window.removeEventListener("scroll", syncTop);
    };
  }, [pathname]);

  useEffect(() => {
    const sync = () => {
      for (const [from, to] of ABOUT_REMAP) {
        document.querySelectorAll<HTMLAnchorElement>(`a[href="${from}"]`).forEach((anchor) => {
          anchor.dataset.completionRoute = to;
          anchor.setAttribute("href", to);
        });
      }

      const next: Hosts = {
        main: document.querySelector<HTMLElement>("main#main-content"),
      };
      setHosts((current) => current.main === next.main ? current : next);
    };

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest<HTMLAnchorElement>("a[data-completion-route]");
      const to = anchor?.dataset.completionRoute;
      if (!to) return;
      event.preventDefault();
      navigate(to);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [navigate]);

  return (
    <>
      {hosts.main && createPortal(<RouteCTA pathname={pathname} />, hosts.main)}
      <style>{`
        body.completion-dark-about-top .public-header{background:transparent!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
        body.completion-dark-about-top .public-brand,
        body.completion-dark-about-top .public-header__nav-button,
        body.completion-dark-about-top .public-header__join,
        body.completion-dark-about-top .public-header__menu{color:#fff!important}
        body.completion-dark-about-top .public-header + div[aria-hidden]{display:none!important}
      `}</style>
    </>
  );
}
