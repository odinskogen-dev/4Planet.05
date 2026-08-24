import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";

const TAKE_PART = [
  ["4PEOPLE", "For people who want a clearer way to understand and help.", "/people"],
  ["4BRANDS", "For brands ready to build credible environmental action.", "/brands"],
  ["4PARTNERS", "For organisations doing real work in the field, science and solutions.", "/partners"],
  ["4FUNDERS", "For funders helping build durable public infrastructure for action.", "/funders"],
] as const;

const ABOUT_REMAP = new Map([
  ["/about#story", "/about/story"],
  ["/about#system", "/about/system"],
  ["/about#founder", "/about/founder"],
]);

type Hosts = {
  desktop: HTMLElement | null;
  mobile: HTMLElement | null;
  main: HTMLElement | null;
};

function TakePartLinks({ mobile = false }: { mobile?: boolean }) {
  return (
    <div className={mobile ? "completion-takepart-mobile" : "completion-takepart-menu"}>
      {mobile && <div className="completion-kicker">TAKE PART_</div>}
      <div className="completion-takepart-list">
        {TAKE_PART.map(([title, line, to]) => (
          <Link key={title} to={to} className="completion-takepart-link">
            <span>
              <strong>{title}</strong>
              <small>{line}</small>
            </span>
            <b aria-hidden>→</b>
          </Link>
        ))}
      </div>
    </div>
  );
}

function DesktopTakePart() {
  return (
    <div className="completion-takepart-nav">
      <button type="button" className="public-header__nav-button completion-takepart-button" aria-haspopup="true">
        TAKE PART
      </button>
      <TakePartLinks />
    </div>
  );
}

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

  if (pathname === "/missions/wh4les") {
    return (
      <section className="completion-route-cta completion-route-cta--whales" aria-label="Continue into the Orca Journey">
        <div className="completion-route-cta__inner">
          <div className="completion-kicker">WH4LES_ · IMMERSIVE JOURNEY</div>
          <h2>Enter the living ocean through one life.</h2>
          <p>Follow the Orca through prey, place, pressure, evidence and possible response — including the Bay of Biscay survey context.</p>
          <a href="/journey/orca/" className="completion-cta-button">ENTER ORCA JOURNEY →</a>
        </div>
      </section>
    );
  }

  return null;
}

export function PublicCompletionBridge() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [hosts, setHosts] = useState<Hosts>({ desktop: null, mobile: null, main: null });

  useEffect(() => {
    const darkAbout = pathname === "/about/story" || pathname === "/about/founder";
    document.body.classList.toggle("completion-dark-about", darkAbout);
    return () => document.body.classList.remove("completion-dark-about");
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
        desktop: document.querySelector<HTMLElement>(".public-header__desktop"),
        mobile: document.querySelector<HTMLElement>(".mobile-nav__inner"),
        main: document.querySelector<HTMLElement>("main#main-content"),
      };
      setHosts((current) => current.desktop === next.desktop && current.mobile === next.mobile && current.main === next.main ? current : next);
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
      {hosts.desktop && createPortal(<DesktopTakePart />, hosts.desktop)}
      {hosts.mobile && createPortal(<TakePartLinks mobile />, hosts.mobile)}
      {hosts.main && createPortal(<RouteCTA pathname={pathname} />, hosts.main)}
    </>
  );
}
