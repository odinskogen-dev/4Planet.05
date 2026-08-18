import { useEffect, useMemo } from "react";
import { fourPlanetChildren, projects, projectionState, recentSystemMoves, roadmap, verifiedAt, type LabProject } from "./labsData";
import "./labs.css";

const mono = "'Fragment Mono', ui-monospace, SFMono-Regular, Menlo, monospace";

function isLabsHost() {
  if (typeof window === "undefined") return false;
  return window.location.hostname.toLowerCase() === "labs.4planet.org";
}

function currentSlug() {
  if (typeof window === "undefined") return "";
  if (isLabsHost()) return window.location.pathname.replace(/^\/+|\/+$/g, "");
  const query = new URLSearchParams(window.location.search).get("project");
  return query?.replace(/^\/+|\/+$/g, "") ?? "";
}

function labHref(slug = "") {
  const clean = slug.replace(/^\/+|\/+$/g, "");
  if (isLabsHost()) return clean ? `/${clean}` : "/";
  return clean ? `/labs?project=${encodeURIComponent(clean)}` : "/labs";
}

function GridRails() {
  return (
    <div className="labs-rails" aria-hidden="true">
      {Array.from({ length: 13 }, (_, index) => <span key={index} />)}
    </div>
  );
}

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

function StatusPill({ children }: { children: React.ReactNode }) {
  return <span className="labs-status">{children}</span>;
}

function ShellHeader({ back }: { back?: string }) {
  return (
    <header className="labs-header">
      <a className="labs-brand" href={labHref(back ?? "")}>4PLANET_</a>
      <div className="labs-header-center">LABS / HUMAN PROJECT OS</div>
      <div className="labs-header-state">PUBLIC DEVELOPMENT</div>
    </header>
  );
}

function Freshness() {
  return (
    <div className="labs-freshness" role="note">
      <span>DATA STATE</span>
      <strong>{projectionState}</strong>
      <span>VERIFIED {verifiedAt}</span>
    </div>
  );
}

function ProjectLink({ project, index }: { project: LabProject; index: number }) {
  return (
    <a className="labs-project-row" href={labHref(project.slug)}>
      <span className="labs-project-index">{String(index + 1).padStart(2, "0")}</span>
      <span className="labs-project-main">
        <span className="labs-project-eyebrow">{project.eyebrow}</span>
        <strong>{project.title}</strong>
      </span>
      <span className="labs-project-status"><StatusPill>{project.state}</StatusPill>{project.priority}</span>
      <span className="labs-project-summary">{project.summary}</span>
      <span className="labs-project-arrow">→</span>
    </a>
  );
}

function PortfolioView() {
  const topLevel = projects.filter((project) => !project.parent && !project.slug.includes("/"));

  return (
    <>
      <ShellHeader />
      <main className="labs-page">
        <GridRails />
        <section className="labs-hero labs-grid-section">
          <div className="labs-kicker">ONE CORE / MANY PROJECTS / ONE RECOVERABLE SYSTEM</div>
          <h1>LABS</h1>
          <div className="labs-hero-note">
            <span>01</span>
            <p>4PLANET’s public development workshop and human entry into the project universe. Build, inspect, learn, promote or kill — without creating another source of truth.</p>
          </div>
        </section>

        <Freshness />

        <section className="labs-section-head">
          <span>PROJECT UNIVERSE</span>
          <span>{String(topLevel.length).padStart(2, "0")} REGISTERED VIEWS</span>
        </section>

        <section className="labs-project-list" aria-label="LABS projects">
          {topLevel.map((project, index) => <ProjectLink key={project.slug} project={project} index={index} />)}
        </section>

        <section className="labs-system-note labs-grid-section">
          <div>
            <span className="labs-label">OPERATING PRINCIPLE</span>
            <h2>THE UI IS A VIEW.<br />BRAIN IS THE AUTHORITY.</h2>
          </div>
          <div className="labs-note-copy">
            <p>Project pages use one repeatable grammar: purpose, current truth, roadmap, work, evidence, economics/capital summary, dependencies, learning and next gate.</p>
            <p>Until the safe projection adapter is verified, this interface is an explicitly dated read-only BRAIN projection — not a live database.</p>
          </div>
        </section>
      </main>
      <LabsFooter />
    </>
  );
}

function FourPlanetOverview({ project }: { project: LabProject }) {
  return (
    <>
      <ShellHeader />
      <main className="labs-page">
        <GridRails />
        <ProjectHero project={project} number="P00" />
        <Freshness />

        <section className="labs-section-head">
          <span>PROJECT SYSTEM</span>
          <span>SELECT A COMPONENT</span>
        </section>
        <section className="labs-component-grid">
          {fourPlanetChildren.map((child, index) => (
            <a className="labs-component" href={labHref(child.slug)} key={child.slug}>
              <span>{String(index + 1).padStart(2, "0")} / {child.eyebrow}</span>
              <strong>{child.title}</strong>
              <p>{child.summary}</p>
              <div><StatusPill>{child.state}</StatusPill><span>OPEN →</span></div>
            </a>
          ))}
        </section>

        <section className="labs-section-head">
          <span>CURRENT OPERATING MAP</span>
          <span>RECIPIENT-SAFE VIEW</span>
        </section>
        <section className="labs-operating-map">
          {[
            ["PRODUCT", "ACTIVE", "ONE INTERFACE + ATLAS + SPECIES + LIVING SYSTEMS + IMPACT"],
            ["TRUTH", "P0", "CANONICAL IDENTITY / CLAIM / SOURCE / QUALITY CONVERGENCE"],
            ["PROOF", "ACTIVE", "JAGUAR + ORCA PRODUCT GOLD / FOOD ORGANISATION GOLD"],
            ["USERS + SCIENCE", "NEXT", "REAL SESSIONS / EXPERT CHALLENGE / CORRECTION"],
            ["CAPITAL", "ACTIVE", "FIRST MONEY + DIVERSIFIED RUNWAY CONVERSION"],
            ["DELIVERY", "ACTIVE", "FIRST QUALIFIED OPERATOR + FINANCED PILOT PATH"],
            ["BRAIN", "CONTINUOUS", "RECOVERY / LEARNING / CONTROL OF CONTROL"],
          ].map(([label, state, text]) => (
            <div className="labs-operating-row" key={label}>
              <span>{label}</span><StatusPill>{state}</StatusPill><strong>{text}</strong>
            </div>
          ))}
        </section>

        <section className="labs-section-head">
          <span>ROADMAP</span>
          <span>EVIDENCE-GATED / NOT DATE THEATRE</span>
        </section>
        <section className="labs-roadmap">
          {roadmap.map((item, index) => (
            <article key={item.label}>
              <span>{String(index + 1).padStart(2, "0")} / {item.label}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </section>

        <section className="labs-section-head">
          <span>SYSTEM FEED</span>
          <span>LATEST CONTROL MOVES IN THIS PROJECTION</span>
        </section>
        <section className="labs-feed">
          {recentSystemMoves.map(([id, move, state]) => (
            <div key={id}><span>{id}</span><strong>{move}</strong><StatusPill>{state}</StatusPill></div>
          ))}
        </section>

        <section className="labs-private-boundary labs-grid-section">
          <span className="labs-label">PUBLIC / PRIVATE BOUNDARY</span>
          <h2>NOT EVERYTHING IN BRAIN BELONGS ON THE WEB.</h2>
          <p>Detailed Founder finance, sensitive capital intelligence, secrets and protected records are deliberately excluded from public LABS. A deeper Founder view requires an authenticated projection with a verified field allowlist.</p>
        </section>
      </main>
      <LabsFooter />
    </>
  );
}

function ProjectHero({ project, number = "LAB" }: { project: LabProject; number?: string }) {
  return (
    <section className="labs-project-hero labs-grid-section">
      <div className="labs-kicker">{number} / {project.eyebrow}</div>
      <div className="labs-title-line">
        <h1>{project.title}</h1>
        <div className="labs-title-state"><StatusPill>{project.state}</StatusPill><span>{project.priority}</span></div>
      </div>
      <p className="labs-project-intro">{project.summary}</p>
    </section>
  );
}

function ProjectDetail({ project }: { project: LabProject }) {
  const back = project.parent === "4planet" ? "4planet" : "";
  return (
    <>
      <ShellHeader back={back} />
      <main className="labs-page">
        <GridRails />
        <ProjectHero project={project} />
        <Freshness />

        <section className="labs-detail-grid">
          <DetailCell index="01" label="WHY THIS EXISTS" text={project.why} />
          <DetailCell index="02" label="CURRENT TRUTH" text={project.now} />
          <DetailCell index="03" label="NEXT GATE" text={project.next} />
          <DetailCell index="04" label="EVIDENCE / AUTHORITY" text={project.evidence} />
          <DetailCell index="05" label="OWNER" text={project.owner} />
          <DetailCell index="06" label="TRUTH LOCATION" text={project.authority} />
        </section>

        <section className="labs-project-actions labs-grid-section">
          <div>
            <span className="labs-label">PROJECT ROUTE</span>
            <strong>{`labs.4planet.org/${project.slug}`}</strong>
          </div>
          <div className="labs-action-links">
            <a href={labHref(back)}>← {project.parent === "4planet" ? "4PLANET OVERVIEW" : "ALL LABS"}</a>
            {project.externalUrl && <a href={project.externalUrl} target="_blank" rel="noreferrer">OPEN PUBLIC PRODUCT <Arrow /></a>}
          </div>
        </section>
      </main>
      <LabsFooter />
    </>
  );
}

function DetailCell({ index, label, text }: { index: string; label: string; text: string }) {
  return (
    <article className="labs-detail-cell">
      <div><span>{index}</span><span>{label}</span></div>
      <p>{text}</p>
    </article>
  );
}

function UnknownProject({ slug }: { slug: string }) {
  return (
    <>
      <ShellHeader />
      <main className="labs-page">
        <GridRails />
        <section className="labs-unknown labs-grid-section">
          <span className="labs-label">UNREGISTERED PROJECT VIEW</span>
          <h1>NO CANONICAL<br />PROJECT FOUND.</h1>
          <p>`/{slug}` is not represented as a registered LABS project in this projection. Nothing has been invented to fill the gap.</p>
          <a href={labHref()}>← RETURN TO LABS</a>
        </section>
      </main>
      <LabsFooter />
    </>
  );
}

function LabsFooter() {
  return (
    <footer className="labs-footer">
      <span>4PLANET LABS / NOINDEX / PUBLIC DEVELOPMENT</span>
      <span>ONE CORE · MULTIPLE VIEWS · TRUTHFUL ALWAYS</span>
      <a href="https://4planet.org">4PLANET.ORG <Arrow /></a>
    </footer>
  );
}

export default function LabsOverview() {
  const slug = useMemo(currentSlug, []);
  const project = projects.find((item) => item.slug === slug);

  useEffect(() => {
    const title = !slug ? "4PLANET LABS — Project Universe" : project ? `${project.title} — 4PLANET LABS` : "Unregistered Project — 4PLANET LABS";
    document.title = title;
    let robots = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!robots) {
      robots = document.createElement("meta");
      robots.name = "robots";
      document.head.appendChild(robots);
    }
    const previous = robots.content;
    robots.content = "noindex,nofollow,noarchive";
    return () => { robots!.content = previous; };
  }, [project, slug]);

  if (!slug) return <PortfolioView />;
  if (slug === "4planet" && project) return <FourPlanetOverview project={project} />;
  if (project) return <ProjectDetail project={project} />;
  return <UnknownProject slug={slug} />;
}

void mono;
