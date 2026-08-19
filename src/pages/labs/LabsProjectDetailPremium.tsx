import { useEffect, useState, type CSSProperties } from "react";
import {
  childrenOf,
  projectBySlug,
  projectionState,
  verifiedAt,
  type LabProject,
} from "./labsData";

type Theme = "dark" | "light";

type GoalCard = {
  horizon: string;
  title: string;
  text: string;
  state: "LOCKED" | "ACTIVE" | "TARGET" | "NEXT";
};

type Signal = {
  type: "TRUTH" | "DONE" | "NEXT" | "FOUNDER";
  title: string;
  text: string;
};

function isLabsHost() {
  if (typeof window === "undefined") return false;
  return window.location.hostname.toLowerCase() === "labs.4planet.org";
}

function labHref(slug = "") {
  const clean = slug.replace(/^\/+|\/+$/g, "");
  if (isLabsHost()) return clean ? `/${clean}` : "/";
  return clean ? `/labs?project=${encodeURIComponent(clean)}` : "/labs";
}

function accentStyle(project: LabProject) {
  const accent = project.slug === "4planet" ? "var(--accent-fourplanet)" : `var(--accent-${project.accent})`;
  return { "--accent": accent } as CSSProperties;
}

function progressOf(project: LabProject) {
  const milestones = project.milestones ?? [];
  if (!milestones.length) return null;
  const done = milestones.filter((item) => item.done).length;
  return { done, total: milestones.length };
}

function nextTask(project: LabProject) {
  return project.tasks?.find((task) => ["ACTIVE", "NEXT", "GATED", "AS NEEDED"].includes(task.state)) ?? project.tasks?.[0];
}

function goalsFor(project: LabProject): GoalCard[] {
  if (project.slug === "4planet") {
    return [
      {
        horizon: "NORTH STAR",
        title: "LIVING PLANET INFRASTRUCTURE",
        text: "Build the world's most useful integrated intelligence, coordination and action infrastructure for a living planet.",
        state: "LOCKED",
      },
      {
        horizon: "30 DAYS · 17 SEP",
        title: "LOAD-BEARING MACHINE",
        text: "Premium public proof, external learning, active conversion, first delivery route, compounding intelligence and safe autonomous execution.",
        state: "ACTIVE",
      },
      {
        horizon: "90 DAYS · 16 NOV",
        title: "FIRST COMPLETE EXTERNAL LOOP",
        text: "≥1,000 real users · ≥25 observed sessions · ≥5 expert/scientific reviews · ≥10 authoritative integrations · first-money target ≥NOK1.5m · ≥1 financed/paid pilot · ≥70% of AI-eligible work closes without Founder.",
        state: "TARGET",
      },
    ];
  }

  const cards: GoalCard[] = [
    { horizon: "CURRENT", title: "NEXT PROJECT GOAL", text: project.next, state: "ACTIVE" },
  ];
  const openMilestones = (project.milestones ?? []).filter((item) => !item.done).slice(0, 2);
  openMilestones.forEach((item, index) => cards.push({
    horizon: `CHECKPOINT ${String(index + 1).padStart(2, "0")}`,
    title: item.label,
    text: item.note ?? "Open checkpoint. Evidence is required before this is counted complete.",
    state: index === 0 ? "NEXT" : "TARGET",
  }));
  if (cards.length === 1 && project.roadmap?.[0]) {
    cards.push({
      horizon: project.roadmap[0].stage,
      title: project.roadmap[0].title,
      text: project.roadmap[0].text,
      state: "NEXT",
    });
  }
  return cards;
}

function signalsFor(project: LabProject): Signal[] {
  const done = [...(project.milestones ?? [])].reverse().find((item) => item.done);
  const task = nextTask(project);
  const founder = project.founderDecisions?.[0];
  const signals: Signal[] = [{ type: "TRUTH", title: "CURRENT TRUTH", text: project.now }];
  if (done) signals.push({ type: "DONE", title: "VERIFIED CHECKPOINT", text: done.label });
  if (task) signals.push({ type: "NEXT", title: `${task.owner} · ${task.state}`, text: task.text });
  if (founder) signals.push({ type: "FOUNDER", title: "FOUNDER PORT", text: founder });
  return signals;
}

function GridRails() {
  return <div className="labs-rails" aria-hidden="true">{Array.from({ length: 13 }, (_, index) => <span key={index} />)}</div>;
}

function Status({ project }: { project: LabProject }) {
  return <span className={`labs-status labs-status--${project.state.toLowerCase()}`}>{project.state}</span>;
}

function Header({ theme, setTheme, project }: { theme: Theme; setTheme: (theme: Theme) => void; project: LabProject }) {
  return (
    <header className="labs-header">
      <a className="labs-brand" href={labHref()}><span className="labs-online-dot" aria-hidden="true" />4PLANET LABS</a>
      <div className="labs-header-center"><span>PROJECT OS</span><span>{projectionState}</span><span className="labs-online"><i /> ONLINE</span></div>
      <div className="labs-header-tools">
        <span className="labs-snapshot">{project.title} · {verifiedAt}</span>
        <div className="labs-theme-switch" aria-label="Appearance">
          <button type="button" className={theme === "dark" ? "is-active" : ""} onClick={() => setTheme("dark")} aria-pressed={theme === "dark"}>DARK</button>
          <button type="button" className={theme === "light" ? "is-active" : ""} onClick={() => setTheme("light")} aria-pressed={theme === "light"}>WHITE</button>
        </div>
        <span className="labs-founder-mark">FOUNDER</span>
      </div>
    </header>
  );
}

function SectionHead({ left, right }: { left: string; right: string }) {
  return <div className="labs-section-head labs-section-head--v4"><span>{left}</span><span>{right}</span></div>;
}

function ProjectHero({ project }: { project: LabProject }) {
  const progress = progressOf(project);
  const currentPhase = project.roadmap?.[0]?.title ?? "PHASE NOT PROJECTED";
  return (
    <section className="labs-project-hero labs-project-hero--v4" style={accentStyle(project)}>
      <div className="labs-project-path">
        <a href={labHref()}>LABS</a>
        {project.parent && <><span>/</span><a href={labHref(project.parent)}>{projectBySlug(project.parent)?.title ?? project.parent}</a></>}
        <span>/</span><strong>{project.title}</strong>
      </div>
      <div className="labs-project-hero-main labs-project-hero-main--v4">
        <div><span className="labs-label">{project.eyebrow}</span><h1>{project.title}</h1><p>{project.summary}</p></div>
        <div className="labs-project-state-stack"><Status project={project} /><span>{project.priority}</span><span>{progress ? `${progress.done}/${progress.total} CHECKPOINTS` : "CHECKPOINT STATE UNKNOWN"}</span></div>
      </div>
      <div className="labs-project-commandline">
        <div><span>GOAL</span><strong>{goalsFor(project)[0]?.title ?? "UNKNOWN"}</strong></div>
        <div><span>PHASE</span><strong>{currentPhase}</strong></div>
        <div><span>NEXT</span><strong>{nextTask(project)?.state ?? "UNKNOWN"}</strong></div>
        <div><span>FOUNDER</span><strong>{project.founderDecisions?.length ? `${project.founderDecisions.length} OPEN` : "CLEAR"}</strong></div>
      </div>
      <div className="labs-project-hero-line" aria-hidden="true" />
    </section>
  );
}

function ProjectPulse({ project }: { project: LabProject }) {
  const progress = progressOf(project);
  const milestones = project.milestones ?? [];
  const task = nextTask(project);
  return (
    <section className="labs-project-pulse">
      <div className="labs-pulse-primary"><span className="labs-label">CURRENT TRUTH</span><p>{project.now}</p></div>
      <div className="labs-pulse-cell"><span>CHECKPOINTS</span><strong>{progress ? `${progress.done} / ${progress.total}` : "UNKNOWN"}</strong>{milestones.length ? <div className="labs-segment-track" aria-label={`${progress?.done ?? 0} of ${progress?.total ?? 0} milestones complete`}>{milestones.map((item, index) => <i key={index} data-done={item.done} />)}</div> : null}</div>
      <div className="labs-pulse-cell"><span>NEXT PIPE</span><strong>{task?.state ?? "UNKNOWN"}</strong><small>{task?.text ?? "No next production projected."}</small></div>
      <div className="labs-pulse-cell labs-pulse-cell--founder"><span>FOUNDER PORT</span><strong>{project.founderDecisions?.length ? `${project.founderDecisions.length} OPEN` : "CLEAR"}</strong><small>{project.founderDecisions?.[0] ?? "No Founder blocker projected."}</small></div>
    </section>
  );
}

function Goals({ project }: { project: LabProject }) {
  const goals = goalsFor(project);
  return (
    <section className="labs-control-section labs-goals-section">
      <SectionHead left="GOALS" right="current project intent / evidence-gated" />
      <div className="labs-goal-grid">{goals.map((goal, index) => <article className="labs-goal-card" data-state={goal.state} key={`${goal.horizon}-${goal.title}`}><div><span>{String(index + 1).padStart(2, "0")}</span><span>{goal.horizon}</span><b>{goal.state}</b></div><h2>{goal.title}</h2><p>{goal.text}</p></article>)}</div>
    </section>
  );
}

function PhaseRail({ project }: { project: LabProject }) {
  const items = project.roadmap ?? [];
  return (
    <section className="labs-control-section">
      <SectionHead left="PHASES / ROADMAP" right={items.length ? `${items.length} projected phases` : "UNKNOWN"} />
      {items.length ? <div className="labs-phase-rail">{items.map((item, index) => <article key={`${item.stage}-${index}`} data-phase={index === 0 ? "CURRENT" : index === 1 ? "NEXT" : "LATER"}><div className="labs-phase-index"><span>{String(index + 1).padStart(2, "0")}</span><b>{index === 0 ? "CURRENT" : index === 1 ? "NEXT" : "LATER"}</b></div><small>{item.stage}</small><h3>{item.title}</h3><p>{item.text}</p></article>)}</div> : <p className="labs-unknown-copy">UNKNOWN — no project phase/roadmap projection is connected.</p>}
    </section>
  );
}

function ProductionControl({ project }: { project: LabProject }) {
  const processes = project.processes ?? [];
  const tasks = project.tasks ?? [];
  return (
    <section className="labs-control-section">
      <SectionHead left="PRODUCTION CONTROL" right="processes + upcoming work" />
      <div className="labs-production-layout">
        <div className="labs-production-pane">
          <div className="labs-pane-title"><span>PROCESS OVERVIEW</span><b>{processes.length || "UNKNOWN"}</b></div>
          {processes.length ? <div className="labs-process-v4">{processes.map((item, index) => <div className="labs-process-v4-row" key={item.name}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item.name}</strong><b>{item.state}</b><p>{item.text}</p></div>)}</div> : <p className="labs-unknown-copy">UNKNOWN — process projection not connected.</p>}
        </div>
        <div className="labs-production-pane">
          <div className="labs-pane-title"><span>UPCOMING TASKS / PRODUCTIONS</span><b>{tasks.length || "UNKNOWN"}</b></div>
          {tasks.length ? <div className="labs-production-queue">{tasks.map((item, index) => <div key={`${item.text}-${index}`} data-state={item.state}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{item.text}</strong><small>{item.owner}</small></div><b>{item.state}</b></div>)}</div> : <p className="labs-unknown-copy">UNKNOWN — no current tasks are projected.</p>}
        </div>
      </div>
    </section>
  );
}

function ProjectFeed({ project }: { project: LabProject }) {
  const signals = signalsFor(project);
  return (
    <section className="labs-control-section">
      <SectionHead left="PROJECT FEED" right={`snapshot · ${project.freshness}`} />
      <div className="labs-control-feed">{signals.map((signal, index) => <article key={`${signal.type}-${index}`} data-type={signal.type}><span>{signal.type}</span><div><strong>{signal.title}</strong><p>{signal.text}</p></div></article>)}</div>
    </section>
  );
}

function FounderDecisions({ project }: { project: LabProject }) {
  const items = project.founderDecisions ?? [];
  return (
    <section className="labs-control-section labs-founder-port-v4">
      <SectionHead left="FOUNDER DECISIONS" right={items.length ? `${items.length} projected` : "CLEAR"} />
      {items.length ? <div className="labs-decision-list labs-decision-list--v4">{items.map((item, index) => <div key={`${item}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></div>)}</div> : <p className="labs-no-blocker">No Founder decision is projected as blocking this project.</p>}
    </section>
  );
}

function ProjectChildren({ project }: { project: LabProject }) {
  const children = childrenOf(project.slug);
  if (!children.length) return null;
  return (
    <section className="labs-control-section">
      <SectionHead left="SUBPROJECTS / COMPONENTS" right={`${children.length} project views`} />
      <div className="labs-project-link-grid">{children.map((child) => <a href={labHref(child.slug)} style={accentStyle(child)} key={child.slug}><span>{child.eyebrow}</span><strong>{child.title}</strong><small>{child.state} · {child.priority}</small><b>→</b></a>)}</div>
    </section>
  );
}

function Milestones({ project }: { project: LabProject }) {
  const items = project.milestones ?? [];
  return (
    <section className="labs-control-section">
      <SectionHead left="CHECKPOINT LOG" right={items.length ? `${items.filter((m) => m.done).length}/${items.length} complete` : "UNKNOWN"} />
      {items.length ? <div className="labs-milestones labs-milestones--v4">{items.map((item, index) => <div className="labs-milestone-row" key={`${item.label}-${index}`} data-done={item.done}><span>{item.done ? "✓" : "○"}</span><strong>{item.label}</strong><p>{item.note ?? (item.done ? "Verified complete in this projection" : "Open / next evidence required")}</p></div>)}</div> : <p className="labs-unknown-copy">UNKNOWN — no milestone set is projected.</p>}
    </section>
  );
}

function Assets({ project }: { project: LabProject }) {
  const items = project.assets ?? [];
  return (
    <section className="labs-control-section">
      <SectionHead left="LINKED ASSETS" right="public-safe links only" />
      {items.length ? <div className="labs-assets labs-assets--v4">{items.map((asset) => <a href={asset.href} target="_blank" rel="noreferrer" key={`${asset.label}-${asset.href}`}><span>{asset.kind}</span><strong>{asset.label}</strong><small>{asset.href.replace(/^https?:\/\//, "")}</small><b>↗</b></a>)}</div> : <p className="labs-unknown-copy">UNKNOWN — no public-safe linked assets are projected. Internal/private assets remain hidden from public LABS.</p>}
    </section>
  );
}

function Evidence({ project }: { project: LabProject }) {
  return (
    <section className="labs-control-section">
      <SectionHead left="EVIDENCE / AUTHORITY / FRESHNESS" right="view layer only" />
      <div className="labs-authority-grid labs-authority-grid--v4"><div><span className="labs-label">AUTHORITY</span><strong>{project.authority}</strong></div><div><span className="labs-label">FRESHNESS</span><strong>{project.freshness}</strong></div><div><span className="labs-label">EVIDENCE BASIS</span><strong>{project.evidence}</strong></div><div><span className="labs-label">PROJECTION</span><strong>{projectionState}</strong></div></div>
    </section>
  );
}

export default function LabsProjectDetailPremium({ project }: { project: LabProject }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    return window.localStorage.getItem("4planet-labs-theme") === "light" ? "light" : "dark";
  });

  useEffect(() => { window.localStorage.setItem("4planet-labs-theme", theme); }, [theme]);
  useEffect(() => {
    document.title = `${project.title} — 4PLANET LABS`;
    let robots = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!robots) { robots = document.createElement("meta"); robots.name = "robots"; document.head.appendChild(robots); }
    const previous = robots.content;
    robots.content = "noindex,nofollow,noarchive";
    return () => { if (robots) robots.content = previous; };
  }, [project]);

  return (
    <div className="labs-shell labs-shell--v4" data-theme={theme}>
      <Header theme={theme} setTheme={setTheme} project={project} />
      <main className={`labs-page labs-page--detail labs-page--detail-v4 ${project.slug === "4planet" ? "labs-page--fourplanet" : ""}`} style={accentStyle(project)}>
        <GridRails />
        <div className="labs-detail-wrap labs-detail-wrap--v4 labs-grid-section">
          <ProjectHero project={project} />
          <ProjectPulse project={project} />
          <Goals project={project} />
          <PhaseRail project={project} />
          <ProductionControl project={project} />
          <ProjectFeed project={project} />
          <FounderDecisions project={project} />
          <ProjectChildren project={project} />
          <Milestones project={project} />
          <Assets project={project} />
          <Evidence project={project} />
          <div className="labs-detail-actions"><a href={labHref(project.parent ?? "")}>← {project.parent ? (projectBySlug(project.parent)?.title ?? "PARENT") : "LABS"}</a>{project.externalUrl && <a href={project.externalUrl} target="_blank" rel="noreferrer">OPEN PUBLIC SURFACE ↗</a>}</div>
        </div>
      </main>
      <footer className="labs-footer"><span>4PLANET LABS · NOINDEX · PUBLIC DEVELOPMENT</span><span>BRAIN → PROJECT → PROCESS → WBS → EVIDENCE → LEARNING → ECONOMICS → CAPITAL</span><a href="https://4planet.org">4PLANET.ORG ↗</a></footer>
    </div>
  );
}
