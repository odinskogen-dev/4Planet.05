import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import {
  childrenOf,
  founderQueue,
  projectBySlug,
  projects,
  projectionState,
  recentSystemMoves,
  universeRoots,
  verifiedAt,
  type LabProject,
} from "./labsData";
import "./labs.css";

type Theme = "dark" | "light";

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

function accentStyle(project: LabProject) {
  return { "--accent": `var(--accent-${project.accent})` } as CSSProperties;
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

function StatusPill({ children }: { children: ReactNode }) {
  return <span className="labs-status">{children}</span>;
}

function ShellHeader({ back, theme, onTheme }: { back?: string; theme: Theme; onTheme: () => void }) {
  return (
    <header className="labs-header">
      <a className="labs-brand" href={labHref(back ?? "")}>4PLANET_</a>
      <div className="labs-header-center">LABS / HUMAN PROJECT OS</div>
      <div className="labs-header-tools">
        <span>PUBLIC DEVELOPMENT</span>
        <button className="labs-theme-toggle" type="button" onClick={onTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
          {theme === "dark" ? "WHITE" : "DARK"}
        </button>
      </div>
    </header>
  );
}

function LabsFooter() {
  return (
    <footer className="labs-footer">
      <span>4PLANET LABS / NOINDEX / PUBLIC DEVELOPMENT</span>
      <span>ONE CORE · MULTIPLE VIEWS · BRAIN REMAINS AUTHORITY</span>
      <a href="https://4planet.org">4PLANET.ORG <Arrow /></a>
    </footer>
  );
}

function Frame({ children, back, theme, onTheme }: { children: ReactNode; back?: string; theme: Theme; onTheme: () => void }) {
  return (
    <div className="labs-shell" data-theme={theme}>
      <ShellHeader back={back} theme={theme} onTheme={onTheme} />
      <main className="labs-page">
        <GridRails />
        {children}
      </main>
      <LabsFooter />
    </div>
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

function ProjectBox({ project, size = "regular" }: { project: LabProject; size?: "regular" | "wide" | "tall" }) {
  return (
    <a className="labs-project-box" data-size={size} href={labHref(project.slug)} style={accentStyle(project)}>
      <div className="labs-box-top">
        <span>{project.eyebrow}</span>
        <StatusPill>{project.state}</StatusPill>
      </div>
      <div className="labs-box-title">
        <strong>{project.title}</strong>
        <span>{project.priority}</span>
      </div>
      <div className="labs-box-bottom">
        <span>{project.next}</span>
        <span>OPEN →</span>
      </div>
      <div className="labs-box-hover" aria-hidden="true">
        <span className="labs-label">WHY</span>
        <p>{project.why}</p>
        <span className="labs-label">CURRENT</span>
        <p>{project.now}</p>
        <span className="labs-label">NEXT</span>
        <p>{project.next}</p>
      </div>
    </a>
  );
}

function boxSize(project: LabProject): "regular" | "wide" | "tall" {
  if (["4planet/species", "4planet/atlas", "founder-control"].includes(project.slug)) return "wide";
  if (["4planet/living-systems", "4planet/impact"].includes(project.slug)) return "tall";
  return "regular";
}

function UniversePanel({ root }: { root: LabProject }) {
  const children = childrenOf(root.slug);
  return (
    <section className="labs-universe" style={accentStyle(root)}>
      <a className="labs-universe-head" href={labHref(root.slug)}>
        <div>
          <span className="labs-label">{root.universe} / MAIN PROJECT</span>
          <h2>{root.title}</h2>
        </div>
        <div className="labs-universe-meta">
          <StatusPill>{root.state}</StatusPill>
          <span>{root.summary}</span>
          <span>OPEN PROJECT →</span>
        </div>
      </a>
      <div className="labs-universe-grid">
        {children.length > 0 ? children.map((project) => <ProjectBox key={project.slug} project={project} size={boxSize(project)} />) : (
          <div className="labs-empty-box">
            <span>NO PUBLIC-SAFE CHILD PROJECTS PROJECTED YET</span>
            <p>BRAIN may contain more. LABS does not invent or expose them until a verified projection is allowed.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function FounderQueue() {
  return (
    <section className="labs-founder-queue labs-grid-section">
      <div className="labs-section-head labs-section-head--inline">
        <span>FOUNDER DECISIONS</span>
        <span>{founderQueue.length.toString().padStart(2, "0")} PROJECTED</span>
      </div>
      <div className="labs-founder-list">
        {founderQueue.length > 0 ? founderQueue.map((item, index) => (
          <a href={labHref(item.slug)} key={`${item.slug}-${item.decision}`}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{item.project}</strong>
            <p>{item.decision}</p>
            <span>→</span>
          </a>
        )) : <p className="labs-empty-copy">No Founder decision is projected in this public-safe snapshot.</p>}
      </div>
    </section>
  );
}

function PortfolioView({ theme, onTheme }: { theme: Theme; onTheme: () => void }) {
  return (
    <Frame theme={theme} onTheme={onTheme}>
      <section className="labs-intro labs-grid-section">
        <div>
          <span className="labs-kicker">PROJECT UNIVERSE / HUMAN VIEW</span>
          <h1>LABS</h1>
        </div>
        <p>One place to inspect projects, enter the work and see what is done, what is moving and what comes next. The interface is a projection; BRAIN remains the authority.</p>
      </section>

      <Freshness />

      <section className="labs-section-head labs-grid-section">
        <span>PROJECT UNIVERSES</span>
        <span>PROJECT → PROCESS → WBS → EVIDENCE → LEARNING → ECONOMICS → CAPITAL</span>
      </section>

      <section className="labs-universe-stack labs-grid-section">
        {universeRoots.map((root) => <UniversePanel key={root.slug} root={root} />)}
      </section>

      <FounderQueue />

      <section className="labs-system-feed labs-grid-section">
        <div className="labs-section-head labs-section-head--inline">
          <span>SYSTEM FEED</span>
          <span>LATEST CONTROL MOVES</span>
        </div>
        {recentSystemMoves.map(([id, move, state]) => (
          <div className="labs-feed-row" key={id}>
            <span>{id}</span>
            <strong>{move}</strong>
            <StatusPill>{state}</StatusPill>
          </div>
        ))}
      </section>

      <section className="labs-projection-note labs-grid-section">
        <span className="labs-label">PROJECTION RULE</span>
        <p>LABS is deliberately read-only while LABS-7 is unverified. Missing values stay UNKNOWN. Private Founder finance, health, legal, sensitive capital intelligence, secrets and protected records do not cross into this public surface.</p>
      </section>
    </Frame>
  );
}

function SectionTitle({ left, right }: { left: string; right?: string }) {
  return <div className="labs-section-head"><span>{left}</span><span>{right ?? ""}</span></div>;
}

function SnapshotCard({ label, text, accent }: { label: string; text: string; accent?: boolean }) {
  return (
    <article className={`labs-snapshot-card${accent ? " is-accent" : ""}`}>
      <span className="labs-label">{label}</span>
      <p>{text || "UNKNOWN"}</p>
    </article>
  );
}

function Milestones({ project }: { project: LabProject }) {
  const items = project.milestones ?? [];
  return (
    <section className="labs-project-section">
      <SectionTitle left="DONE / MILESTONES" right={`${items.filter((item) => item.done).length}/${items.length || 0} COMPLETE`} />
      <div className="labs-milestones">
        {items.length > 0 ? items.map((item, index) => (
          <div key={item.label} className="labs-milestone-row">
            <span>{item.done ? "✓" : "○"}</span>
            <strong>{item.label}</strong>
            <span>{item.done ? "DONE" : "OPEN"}</span>
          </div>
        )) : <div className="labs-unknown-state">UNKNOWN — no milestone set is projected for this project yet.</div>}
      </div>
    </section>
  );
}

function Roadmap({ project }: { project: LabProject }) {
  const items = project.roadmap ?? [];
  return (
    <section className="labs-project-section">
      <SectionTitle left="ROADMAP" right="EVIDENCE-GATED" />
      {items.length > 0 ? (
        <div className="labs-project-roadmap">
          {items.map((item, index) => (
            <article key={`${item.stage}-${item.title}`}>
              <span>{String(index + 1).padStart(2, "0")} / {item.stage}</span>
              <strong>{item.title}</strong>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      ) : <div className="labs-unknown-state">UNKNOWN — no project roadmap is projected here yet.</div>}
    </section>
  );
}

function Processes({ project }: { project: LabProject }) {
  const items = project.processes ?? [];
  return (
    <section className="labs-project-section">
      <SectionTitle left="PROCESSES" right="CURRENT PROJECT SYSTEM" />
      <div className="labs-process-list">
        {items.length > 0 ? items.map((item) => (
          <div key={item.name} className="labs-process-row">
            <strong>{item.name}</strong>
            <StatusPill>{item.state}</StatusPill>
            <p>{item.text}</p>
          </div>
        )) : <div className="labs-unknown-state">UNKNOWN — process projection not connected yet.</div>}
      </div>
    </section>
  );
}

function Tasks({ project }: { project: LabProject }) {
  const items = project.tasks ?? [];
  return (
    <section className="labs-project-section">
      <SectionTitle left="ACTIVE TASKS" right="AI / FOUNDER OWNERSHIP" />
      <div className="labs-task-list">
        {items.length > 0 ? items.map((item, index) => (
          <div key={`${item.text}-${index}`} className="labs-task-row">
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{item.text}</strong>
            <span>{item.owner}</span>
            <StatusPill>{item.state}</StatusPill>
          </div>
        )) : <div className="labs-unknown-state">UNKNOWN — no current tasks are projected for this project.</div>}
      </div>
    </section>
  );
}

function ProjectChildren({ project }: { project: LabProject }) {
  const children = childrenOf(project.slug);
  if (children.length === 0) return null;
  return (
    <section className="labs-project-section">
      <SectionTitle left="SUBPROJECTS / COMPONENTS" right={`${children.length.toString().padStart(2, "0")} VIEWS`} />
      <div className="labs-child-grid">
        {children.map((child) => <ProjectBox project={child} key={child.slug} size={boxSize(child)} />)}
      </div>
    </section>
  );
}

function ProjectPage({ project, theme, onTheme }: { project: LabProject; theme: Theme; onTheme: () => void }) {
  const back = project.parent ?? "";
  const founderDecisions = project.founderDecisions ?? [];
  return (
    <Frame back={back} theme={theme} onTheme={onTheme}>
      <section className="labs-project-identity labs-grid-section" style={accentStyle(project)}>
        <div className="labs-project-path">
          <a href={labHref(back)}>← {project.parent ? project.universe : "ALL LABS"}</a>
          <span>{project.eyebrow}</span>
        </div>
        <div className="labs-project-title-row">
          <h1>{project.title}</h1>
          <div>
            <StatusPill>{project.state}</StatusPill>
            <span>{project.priority}</span>
          </div>
        </div>
        <p>{project.summary}</p>
      </section>

      <Freshness />

      <section className="labs-snapshot-grid labs-grid-section" style={accentStyle(project)}>
        <SnapshotCard label="WHY IT EXISTS" text={project.why} />
        <SnapshotCard label="CURRENT TRUTH" text={project.now} />
        <SnapshotCard label="NEXT MILESTONE" text={project.next} accent />
        <SnapshotCard label="AXE / AI FORWARD PLAN" text={project.aiPlan} />
      </section>

      <div className="labs-project-body labs-grid-section" style={accentStyle(project)}>
        <ProjectChildren project={project} />
        <Milestones project={project} />
        <Roadmap project={project} />
        <Processes project={project} />
        <Tasks project={project} />

        <section className="labs-project-section">
          <SectionTitle left="FOUNDER DECISIONS" right={founderDecisions.length > 0 ? "FOUNDER LAST-MILE" : "NO PROJECTED BLOCKER"} />
          <div className="labs-founder-project-list">
            {founderDecisions.length > 0 ? founderDecisions.map((decision, index) => (
              <div key={decision}><span>{String(index + 1).padStart(2, "0")}</span><p>{decision}</p></div>
            )) : <div className="labs-unknown-state">No Founder decision is projected as blocking this project in this public-safe snapshot.</div>}
          </div>
        </section>

        <section className="labs-project-section">
          <SectionTitle left="EVIDENCE / AUTHORITY" right="PROVENANCE" />
          <div className="labs-authority-grid">
            <SnapshotCard label="EVIDENCE" text={project.evidence} />
            <SnapshotCard label="TRUTH LOCATION" text={project.authority} />
            <SnapshotCard label="OWNER" text={project.owner} />
            <SnapshotCard label="FRESHNESS" text={project.freshness} />
          </div>
        </section>

        <section className="labs-project-actions">
          <div><span className="labs-label">PROJECT ROUTE</span><strong>{`labs.4planet.org/${project.slug}`}</strong></div>
          <div className="labs-action-links">
            <a href={labHref(back)}>← BACK</a>
            {project.externalUrl && <a href={project.externalUrl} target="_blank" rel="noreferrer">OPEN PUBLIC PRODUCT <Arrow /></a>}
          </div>
        </section>
      </div>
    </Frame>
  );
}

function UnknownProject({ slug, theme, onTheme }: { slug: string; theme: Theme; onTheme: () => void }) {
  return (
    <Frame theme={theme} onTheme={onTheme}>
      <section className="labs-unknown labs-grid-section">
        <span className="labs-label">UNREGISTERED PROJECT VIEW</span>
        <h1>NO CANONICAL PROJECT FOUND.</h1>
        <p>`/{slug}` is not represented as a registered LABS project in this projection. Nothing has been invented to fill the gap.</p>
        <a href={labHref()}>← RETURN TO LABS</a>
      </section>
    </Frame>
  );
}

export default function LabsOverview() {
  const slug = useMemo(currentSlug, []);
  const project = projectBySlug(slug);
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    return window.localStorage.getItem("4planet-labs-theme") === "light" ? "light" : "dark";
  });

  const toggleTheme = () => setTheme((current) => current === "dark" ? "light" : "dark");

  useEffect(() => {
    if (typeof window !== "undefined") window.localStorage.setItem("4planet-labs-theme", theme);
  }, [theme]);

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

  if (!slug) return <PortfolioView theme={theme} onTheme={toggleTheme} />;
  if (project) return <ProjectPage project={project} theme={theme} onTheme={toggleTheme} />;
  return <UnknownProject slug={slug} theme={theme} onTheme={toggleTheme} />;
}

void projects;
