import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import {
  childrenOf,
  descendantsOf,
  founderQueue,
  portfolioStats,
  projectBySlug,
  projects,
  projectionState,
  recentSystemMoves,
  universeRoots,
  verifiedAt,
  type LabProject,
} from "./labsData";
import "./labs.css";
import "./labsV4.css";

type Theme = "dark" | "light";
type InspectHandler = (project: LabProject) => void;

type GoalCard = {
  horizon: string;
  title: string;
  text: string;
  state: "LOCKED" | "ACTIVE" | "TARGET" | "NEXT";
};

type ControlSignal = {
  type: "TRUTH" | "DONE" | "NEXT" | "FOUNDER" | "SYSTEM";
  title: string;
  text: string;
};

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
  const accent = project.slug === "4planet" ? "var(--accent-fourplanet)" : `var(--accent-${project.accent})`;
  return { "--accent": accent } as CSSProperties;
}

function progressOf(project: LabProject) {
  const milestones = project.milestones ?? [];
  if (!milestones.length) return null;
  const done = milestones.filter((item) => item.done).length;
  return { done, total: milestones.length };
}

function nearestActiveTask(project: LabProject) {
  return project.tasks?.find((task) => ["ACTIVE", "NEXT", "GATED", "AS NEEDED"].includes(task.state)) ?? project.tasks?.[0];
}

function projectGoals(project: LabProject): GoalCard[] {
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
  const open = (project.milestones ?? []).filter((item) => !item.done).slice(0, 2);
  open.forEach((item, index) => cards.push({
    horizon: `CHECKPOINT ${String(index + 1).padStart(2, "0")}`,
    title: item.label,
    text: item.note ?? "Open checkpoint. Evidence is required before this is counted complete.",
    state: index === 0 ? "NEXT" : "TARGET",
  }));
  if (cards.length === 1 && project.roadmap?.length) {
    const nextRoadmap = project.roadmap[0];
    cards.push({ horizon: nextRoadmap.stage, title: nextRoadmap.title, text: nextRoadmap.text, state: "NEXT" });
  }
  return cards;
}

function projectSignals(project: LabProject): ControlSignal[] {
  const done = [...(project.milestones ?? [])].reverse().find((item) => item.done);
  const task = nearestActiveTask(project);
  const founder = project.founderDecisions?.[0];
  const signals: ControlSignal[] = [
    { type: "TRUTH", title: "CURRENT TRUTH", text: project.now },
  ];
  if (done) signals.push({ type: "DONE", title: "VERIFIED CHECKPOINT", text: done.label });
  if (task) signals.push({ type: "NEXT", title: `${task.owner} · ${task.state}`, text: task.text });
  if (founder) signals.push({ type: "FOUNDER", title: "FOUNDER PORT", text: founder });
  return signals;
}

function GridRails() {
  return <div className="labs-rails" aria-hidden="true">{Array.from({ length: 13 }, (_, index) => <span key={index} />)}</div>;
}

function Glyph({ project }: { project: LabProject }) {
  const glyph = project.kind === "DOMAIN"
    ? "◫"
    : project.kind === "MISSION"
      ? "·"
      : project.slug === "odin"
        ? "✦"
        : project.slug === "p4nther"
          ? "◇"
          : project.slug === "sandbox"
            ? "□"
            : project.title === "BRAIN" || project.title === "NATUREBRAIN"
              ? "◎"
              : project.kind === "PRODUCT"
                ? "▣"
                : "＋";
  return <span className="labs-glyph" aria-hidden="true">{glyph}</span>;
}

function Status({ project }: { project: LabProject }) {
  return <span className={`labs-status labs-status--${project.state.toLowerCase()}`}>{project.state}</span>;
}

function Header({ theme, setTheme, back }: { theme: Theme; setTheme: (theme: Theme) => void; back?: string }) {
  return (
    <header className="labs-header">
      <a className="labs-brand" href={labHref(back ?? "")}><span className="labs-online-dot" aria-hidden="true" />4PLANET LABS</a>
      <div className="labs-header-center"><span>PROJECT OS</span><span>{projectionState}</span><span className="labs-online"><i /> ONLINE</span></div>
      <div className="labs-header-tools">
        <span className="labs-snapshot">SNAPSHOT {verifiedAt}</span>
        <div className="labs-theme-switch" aria-label="Appearance">
          <button type="button" className={theme === "dark" ? "is-active" : ""} onClick={() => setTheme("dark")} aria-pressed={theme === "dark"}>DARK</button>
          <button type="button" className={theme === "light" ? "is-active" : ""} onClick={() => setTheme("light")} aria-pressed={theme === "light"}>WHITE</button>
        </div>
        <span className="labs-founder-mark">FOUNDER</span>
      </div>
    </header>
  );
}

function FreshnessStrip() {
  return (
    <div className="labs-freshness labs-grid-section">
      <span>TRUTH MODE</span><strong>{projectionState}</strong><span>Missing values stay UNKNOWN · BRAIN remains the authority</span>
    </div>
  );
}

function CommandStrip({ onInspect }: { onInspect: InspectHandler }) {
  const firstFounder = founderQueue[0] ? projectBySlug(founderQueue[0].slug) : undefined;
  const firstConflict = projects.find((project) => project.state === "CONFLICT");
  const firstMoving = projects.find((project) => project.kind !== "ROOT" && ["ACTIVE", "BUILDING"].includes(project.state));
  const commands = [
    { value: portfolioStats.founder, label: "FOUNDER ACTIONS", note: firstFounder?.title ?? "No public-safe action projected", project: firstFounder },
    { value: portfolioStats.aiActive, label: "AI NEXT / ACTIVE", note: "Derived from projected tasks", project: firstMoving },
    { value: portfolioStats.active, label: "MOVING PROJECTS", note: "Active / building / public", project: firstMoving },
    { value: portfolioStats.queued, label: "LAB / QUEUE", note: "Queued / experiment / hold", project: projectBySlug("sandbox") },
    { value: portfolioStats.conflicts, label: "OPEN CONFLICTS", note: firstConflict?.title ?? "None", project: firstConflict },
  ];
  return (
    <section className="labs-command labs-grid-section" aria-label="Founder command">
      <div className="labs-section-head labs-section-head--command"><span>FOUNDER COMMAND</span><span>structured snapshot only · no invented progress %</span></div>
      <div className="labs-command-grid">
        {commands.map((item) => (
          <button type="button" className="labs-command-card" key={item.label} onMouseEnter={() => item.project && onInspect(item.project)} onFocus={() => item.project && onInspect(item.project)} onClick={() => item.project && (window.location.href = labHref(item.project.slug))} disabled={!item.project}>
            <strong>{item.value}</strong><span>{item.label}</span><small>{item.note}</small>{item.project && <b aria-hidden="true">→</b>}
          </button>
        ))}
      </div>
    </section>
  );
}

function HoverIntel({ project }: { project: LabProject }) {
  return <div className="labs-box-hover" aria-hidden="true"><span>WHY</span><p>{project.why}</p><span>NOW</span><p>{project.now}</p><span>NEXT</span><p>{project.next}</p></div>;
}

function ProjectBox({ project, onInspect, compact = false }: { project: LabProject; onInspect: InspectHandler; compact?: boolean }) {
  const progress = progressOf(project);
  const task = nearestActiveTask(project);
  return (
    <a className={`labs-project-box ${compact ? "labs-project-box--compact" : ""}`} style={accentStyle(project)} href={labHref(project.slug)} onMouseEnter={() => onInspect(project)} onFocus={() => onInspect(project)} data-state={project.state} data-kind={project.kind}>
      <div className="labs-box-top"><Glyph project={project} /><Status project={project} /></div>
      <div className="labs-box-title"><strong>{project.title}</strong><span>{project.eyebrow}</span></div>
      <div className="labs-box-bottom"><span>{task ? task.state : project.priority}</span><span>{progress ? `${progress.done}/${progress.total} MILESTONES` : project.priority}</span></div>
      <HoverIntel project={project} />
    </a>
  );
}

function DomainPanel({ project, onInspect }: { project: LabProject; onInspect: InspectHandler }) {
  const missions = childrenOf(project.slug);
  return (
    <section className="labs-domain" style={accentStyle(project)}>
      <a href={labHref(project.slug)} className="labs-domain-head" onMouseEnter={() => onInspect(project)} onFocus={() => onInspect(project)}><div><Glyph project={project} /><span>{project.title}</span></div><small>{missions.length} MISSIONS</small></a>
      <div className="labs-domain-missions">
        {missions.map((missionProject) => <a className="labs-mission-row" href={labHref(missionProject.slug)} key={missionProject.slug} onMouseEnter={() => onInspect(missionProject)} onFocus={() => onInspect(missionProject)} data-state={missionProject.state}><span>{missionProject.title}</span><small>{missionProject.state === "CONFLICT" ? "CONFLICT" : missionProject.priority}</small></a>)}
      </div>
    </section>
  );
}

function FourPlanetUniverse({ root, onInspect }: { root: LabProject; onInspect: InspectHandler }) {
  const children = childrenOf(root.slug);
  const core = children.filter((project) => project.kind === "CORE" || project.kind === "SYSTEM");
  const domains = children.filter((project) => project.kind === "DOMAIN");
  return (
    <section className="labs-universe labs-universe--4planet" style={accentStyle(root)}>
      <a href={labHref(root.slug)} className="labs-universe-head labs-universe-head--hero" onMouseEnter={() => onInspect(root)} onFocus={() => onInspect(root)}>
        <div><span className="labs-label">01 / PRIMARY PROJECT UNIVERSE</span><h2>4PLANET</h2><p>{root.summary}</p></div>
        <div className="labs-planet-visual" aria-hidden="true"><span /></div>
        <div className="labs-universe-meta"><Status project={root} /><span>{descendantsOf(root.slug).length} PROJECT VIEWS</span><span>4 DOMAINS</span></div>
      </a>
      <div className="labs-subhead"><span>CORE SYSTEMS + WORKSTREAMS</span><span>hover / focus for project intel</span></div>
      <div className="labs-core-grid">{core.map((project) => <ProjectBox key={project.slug} project={project} onInspect={onInspect} compact />)}</div>
      <div className="labs-subhead"><span>DOMAINS → MISSIONS</span><span>Wave 01 operational entry points</span></div>
      <div className="labs-domain-grid">{domains.map((domain) => <DomainPanel key={domain.slug} project={domain} onInspect={onInspect} />)}</div>
    </section>
  );
}

function UniversePanel({ root, index, onInspect }: { root: LabProject; index: number; onInspect: InspectHandler }) {
  if (root.slug === "4planet") return <FourPlanetUniverse root={root} onInspect={onInspect} />;
  const children = childrenOf(root.slug);
  return (
    <section className={`labs-universe labs-universe--${root.universe.toLowerCase()}`} style={accentStyle(root)}>
      <a href={labHref(root.slug)} className="labs-universe-head labs-universe-head--compact" onMouseEnter={() => onInspect(root)} onFocus={() => onInspect(root)}>
        <div className="labs-universe-symbol"><Glyph project={root} /></div>
        <div><span className="labs-label">{String(index + 1).padStart(2, "0")} / {root.eyebrow}</span><h2>{root.title}</h2><p>{root.summary}</p></div>
        <div className="labs-universe-meta"><Status project={root} /><span>{children.length} SUBPROJECTS</span></div>
      </a>
      <div className="labs-secondary-grid">{children.map((project) => <ProjectBox key={project.slug} project={project} onInspect={onInspect} compact />)}</div>
    </section>
  );
}

function MiniTask({ task }: { task: NonNullable<LabProject["tasks"]>[number] }) {
  return <div className="labs-mini-task"><span>{task.owner}</span><p>{task.text}</p><small>{task.state}</small></div>;
}

function Inspector({ project }: { project: LabProject }) {
  const progress = progressOf(project);
  const children = childrenOf(project.slug);
  const assets = project.assets ?? [];
  const activeTasks = (project.tasks ?? []).filter((task) => ["ACTIVE", "NEXT", "GATED", "AS NEEDED"].includes(task.state)).slice(0, 3);
  const founderDecision = project.founderDecisions?.[0];
  return (
    <aside className="labs-inspector" style={accentStyle(project)} aria-live="polite">
      <div className="labs-inspector-head"><div><span className="labs-label">PROJECT INSPECTOR</span><h2>{project.title}</h2><p>{project.eyebrow}</p></div><Status project={project} /></div>
      <div className="labs-inspector-strip"><div><span>PRIORITY</span><strong>{project.priority}</strong></div><div><span>MILESTONES</span><strong>{progress ? `${progress.done}/${progress.total}` : "UNKNOWN"}</strong></div><div><span>CHILDREN</span><strong>{children.length}</strong></div><div><span>FOUNDER</span><strong>{project.founderDecisions?.length ?? 0}</strong></div></div>
      <section className="labs-inspector-block labs-inspector-block--truth"><span className="labs-label">CURRENT TRUTH</span><p>{project.now}</p></section>
      <div className="labs-inspector-two"><section className="labs-inspector-block"><span className="labs-label">NEXT</span><p>{project.next}</p></section><section className="labs-inspector-block"><span className="labs-label">AXE / AI PLAN</span><p>{project.aiPlan}</p></section></div>
      <section className="labs-inspector-block"><div className="labs-inspector-title"><span className="labs-label">PIPE / TASKS</span><span>{activeTasks.length || "0"}</span></div>{activeTasks.length ? activeTasks.map((task, index) => <MiniTask key={`${task.text}-${index}`} task={task} />) : <p className="labs-unknown-copy">UNKNOWN — no current tasks are projected.</p>}</section>
      <section className={`labs-inspector-block ${founderDecision ? "labs-inspector-block--founder" : ""}`}><span className="labs-label">FOUNDER ACTION</span><p>{founderDecision ?? "No public-safe Founder blocker is projected for this project."}</p></section>
      <section className="labs-inspector-block"><div className="labs-inspector-title"><span className="labs-label">LINKED ASSETS</span><span>{assets.length}</span></div>{assets.length ? <div className="labs-asset-mini-list">{assets.slice(0, 4).map((asset) => <a key={`${asset.label}-${asset.href}`} href={asset.href} target="_blank" rel="noreferrer"><span>{asset.kind}</span><strong>{asset.label}</strong><b>↗</b></a>)}</div> : <p className="labs-unknown-copy">UNKNOWN — no public-safe linked assets are projected.</p>}</section>
      <section className="labs-inspector-evidence"><div><span>AUTHORITY</span><strong>{project.authority}</strong></div><div><span>FRESHNESS</span><strong>{project.freshness}</strong></div></section>
      <a className="labs-open-project" href={labHref(project.slug)}>OPEN FULL PROJECT PAGE <span>↗</span></a>
    </aside>
  );
}

function FounderQueue() {
  return (
    <section className="labs-founder-queue"><div className="labs-section-head"><span>FOUNDER QUEUE</span><span>projected decisions / judgements only</span></div>
      {founderQueue.length ? <div className="labs-founder-list">{founderQueue.map((item, index) => <a href={labHref(item.slug)} key={`${item.slug}-${item.decision}`}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item.project}</strong><p>{item.decision}</p><b>→</b></a>)}</div> : <p className="labs-unknown-copy">No public-safe Founder decisions are projected.</p>}
    </section>
  );
}

function SystemFeed() {
  return <section className="labs-feed-section"><div className="labs-section-head"><span>SYSTEM FEED</span><span>control moves in this dated projection</span></div><div className="labs-feed">{recentSystemMoves.map(([id, text, state]) => <div className="labs-feed-row" key={id}><span>{id}</span><strong>{text}</strong><b>{state}</b></div>)}</div></section>;
}

function PortfolioView() {
  const [selected, setSelected] = useState<LabProject>(projectBySlug("4planet")!);
  return (
    <main className="labs-page labs-page--portfolio"><GridRails /><section className="labs-portfolio-layout labs-grid-section"><div className="labs-portfolio-main"><CommandStrip onInspect={setSelected} /><FreshnessStrip /><div className="labs-section-head labs-section-head--portfolio"><span>PROJECT MAZE / CONTROL MAP</span><span>importance + active state first · click to enter</span></div><div className="labs-universe-stack">{universeRoots.map((root, index) => <UniversePanel key={root.slug} root={root} index={index} onInspect={setSelected} />)}</div><FounderQueue /><SystemFeed /></div><Inspector project={selected} /></section></main>
  );
}

function ProjectHero({ project }: { project: LabProject }) {
  const progress = progressOf(project);
  const currentPhase = project.roadmap?.[0]?.title ?? "PHASE NOT PROJECTED";
  return (
    <section className="labs-project-hero labs-project-hero--v4" style={accentStyle(project)}>
      <div className="labs-project-path"><a href={labHref()}>LABS</a>{project.parent && <><span>/</span><a href={labHref(project.parent)}>{projectBySlug(project.parent)?.title ?? project.parent}</a></>}<span>/</span><strong>{project.title}</strong></div>
      <div className="labs-project-hero-main labs-project-hero-main--v4">
        <div><span className="labs-label">{project.eyebrow}</span><h1>{project.title}</h1><p>{project.summary}</p></div>
        <div className="labs-project-state-stack"><Status project={project} /><span>{project.priority}</span><span>{progress ? `${progress.done}/${progress.total} CHECKPOINTS` : "CHECKPOINT STATE UNKNOWN"}</span></div>
      </div>
      <div className="labs-project-commandline">
        <div><span>GOAL</span><strong>{projectGoals(project)[0]?.title ?? "UNKNOWN"}</strong></div>
        <div><span>PHASE</span><strong>{currentPhase}</strong></div>
        <div><span>NEXT</span><strong>{nearestActiveTask(project)?.state ?? "UNKNOWN"}</strong></div>
        <div><span>FOUNDER</span><strong>{project.founderDecisions?.length ? `${project.founderDecisions.length} OPEN` : "CLEAR"}</strong></div>
      </div>
      <div className="labs-project-hero-line" aria-hidden="true" />
    </section>
  );
}

function SectionHead({ left, right }: { left: string; right: string }) {
  return <div className="labs-section-head labs-section-head--v4"><span>{left}</span><span>{right}</span></div>;
}

function Goals({ project }: { project: LabProject }) {
  const goals = projectGoals(project);
  return (
    <section className="labs-control-section labs-goals-section">
      <SectionHead left="GOALS" right="current project intent / evidence-gated" />
      <div className="labs-goal-grid">
        {goals.map((goal, index) => <article className="labs-goal-card" data-state={goal.state} key={`${goal.horizon}-${goal.title}`}><div><span>{String(index + 1).padStart(2, "0")}</span><span>{goal.horizon}</span><b>{goal.state}</b></div><h2>{goal.title}</h2><p>{goal.text}</p></article>)}
      </div>
    </section>
  );
}

function ProjectPulse({ project }: { project: LabProject }) {
  const progress = progressOf(project);
  const milestones = project.milestones ?? [];
  const nextTask = nearestActiveTask(project);
  return (
    <section className="labs-project-pulse">
      <div className="labs-pulse-primary"><span className="labs-label">CURRENT TRUTH</span><p>{project.now}</p></div>
      <div className="labs-pulse-cell"><span>CHECKPOINTS</span><strong>{progress ? `${progress.done} / ${progress.total}` : "UNKNOWN"}</strong>{milestones.length ? <div className="labs-segment-track" aria-label={`${progress?.done ?? 0} of ${progress?.total ?? 0} milestones complete`}>{milestones.map((item, index) => <i key={index} data-done={item.done} />)}</div> : null}</div>
      <div className="labs-pulse-cell"><span>NEXT PIPE</span><strong>{nextTask?.state ?? "UNKNOWN"}</strong><small>{nextTask?.text ?? "No next production projected."}</small></div>
      <div className="labs-pulse-cell labs-pulse-cell--founder"><span>FOUNDER PORT</span><strong>{project.founderDecisions?.length ? `${project.founderDecisions.length} OPEN` : "CLEAR"}</strong><small>{project.founderDecisions?.[0] ?? "No Founder blocker projected."}</small></div>
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
        <div className="labs-production-pane"><div className="labs-pane-title"><span>PROCESS OVERVIEW</span><b>{processes.length || "UNKNOWN"}</b></div>{processes.length ? <div className="labs-process-v4">{processes.map((item, index) => <div className="labs-process-v4-row" key={item.name}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item.name}</strong><b>{item.state}</b><p>{item.text}</p></div>)}</div> : <p className="labs-unknown-copy">UNKNOWN — process projection not connected.</p>}</div>
        <div className="labs-production-pane"><div className="labs-pane-title"><span>UPCOMING TASKS / PRODUCTIONS</span><b>{tasks.length || "UNKNOWN"}</b></div>{tasks.length ? <div className="labs-production-queue">{tasks.map((item, index) => <div key={`${item.text}-${index}`} data-state={item.state}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{item.text}</strong><small>{item.owner}</small></div><b>{item.state}</b></div>)}</div> : <p className="labs-unknown-copy">UNKNOWN — no current tasks are projected.</p>}</div>
      </div>
    </section>
  );
}

function ControlFeed({ project }: { project: LabProject }) {
  const signals = projectSignals(project);
  return (
    <section className="labs-control-section">
      <SectionHead left="PROJECT FEED" right={`snapshot · ${project.freshness}`} />
      <div className="labs-control-feed">{signals.map((signal, index) => <article key={`${signal.type}-${index}`} data-type={signal.type}><span>{signal.type}</span><div><strong>{signal.title}</strong><p>{signal.text}</p></div></article>)}</div>
    </section>
  );
}

function ProjectChildren({ project }: { project: LabProject }) {
  const children = childrenOf(project.slug);
  if (!children.length) return null;
  return <section className="labs-control-section"><SectionHead left="SUBPROJECTS / COMPONENTS" right={`${children.length} project views`} /><div className="labs-child-grid labs-child-grid--v4">{children.map((child) => <ProjectBox key={child.slug} project={child} onInspect={() => undefined} compact />)}</div></section>;
}

function Milestones({ project }: { project: LabProject }) {
  const items = project.milestones ?? [];
  return <section className="labs-control-section"><SectionHead left="CHECKPOINT LOG" right={items.length ? `${items.filter((m) => m.done).length}/${items.length} complete` : "UNKNOWN"} />{items.length ? <div className="labs-milestones labs-milestones--v4">{items.map((item, index) => <div className="labs-milestone-row" key={`${item.label}-${index}`} data-done={item.done}><span>{item.done ? "✓" : "○"}</span><strong>{item.label}</strong><p>{item.note ?? (item.done ? "Verified complete in this projection" : "Open / next evidence required")}</p></div>)}</div> : <p className="labs-unknown-copy">UNKNOWN — no milestone set is projected.</p>}</section>;
}

function Assets({ project }: { project: LabProject }) {
  const items = project.assets ?? [];
  return <section className="labs-control-section"><SectionHead left="LINKED ASSETS" right="public-safe links only" />{items.length ? <div className="labs-assets labs-assets--v4">{items.map((asset) => <a href={asset.href} target="_blank" rel="noreferrer" key={`${asset.label}-${asset.href}`}><span>{asset.kind}</span><strong>{asset.label}</strong><small>{asset.href.replace(/^https?:\/\//, "")}</small><b>↗</b></a>)}</div> : <p className="labs-unknown-copy">UNKNOWN — no public-safe linked assets are projected. Internal/private assets remain hidden from public LABS.</p>}</section>;
}

function FounderDecisions({ project }: { project: LabProject }) {
  const items = project.founderDecisions ?? [];
  return <section className="labs-control-section labs-founder-port-v4"><SectionHead left="FOUNDER DECISIONS" right={items.length ? `${items.length} projected` : "CLEAR"} />{items.length ? <div className="labs-decision-list labs-decision-list--v4">{items.map((item, index) => <div key={`${item}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></div>)}</div> : <p className="labs-no-blocker">No Founder decision is projected as blocking this project.</p>}</section>;
}

function Evidence({ project }: { project: LabProject }) {
  return <section className="labs-control-section"><SectionHead left="EVIDENCE / AUTHORITY / FRESHNESS" right="view layer only" /><div className="labs-authority-grid labs-authority-grid--v4"><div><span className="labs-label">AUTHORITY</span><strong>{project.authority}</strong></div><div><span className="labs-label">FRESHNESS</span><strong>{project.freshness}</strong></div><div><span className="labs-label">EVIDENCE BASIS</span><strong>{project.evidence}</strong></div><div><span className="labs-label">PROJECTION</span><strong>{projectionState}</strong></div></div></section>;
}

function ProjectDetail({ project }: { project: LabProject }) {
  return (
    <main className={`labs-page labs-page--detail labs-page--detail-v4 ${project.slug === "4planet" ? "labs-page--fourplanet" : ""}`} style={accentStyle(project)}>
      <GridRails />
      <div className="labs-detail-wrap labs-detail-wrap--v4 labs-grid-section">
        <ProjectHero project={project} />
        <ProjectPulse project={project} />
        <Goals project={project} />
        <PhaseRail project={project} />
        <ProductionControl project={project} />
        <ControlFeed project={project} />
        <FounderDecisions project={project} />
        <ProjectChildren project={project} />
        <Milestones project={project} />
        <Assets project={project} />
        <Evidence project={project} />
        <div className="labs-detail-actions"><a href={labHref(project.parent ?? "")}>← {project.parent ? (projectBySlug(project.parent)?.title ?? "PARENT") : "LABS"}</a>{project.externalUrl && <a href={project.externalUrl} target="_blank" rel="noreferrer">OPEN PUBLIC SURFACE ↗</a>}</div>
      </div>
    </main>
  );
}

function UnknownProject({ slug }: { slug: string }) {
  return <main className="labs-page labs-page--detail"><GridRails /><section className="labs-unknown labs-grid-section"><span className="labs-label">FAIL CLOSED / UNREGISTERED VIEW</span><h1>UNKNOWN</h1><p>`/{slug}` is not represented as a registered LABS project in this dated projection. No status has been invented.</p><a href={labHref()}>← RETURN TO LABS</a></section></main>;
}

function Footer() {
  return <footer className="labs-footer"><span>4PLANET LABS · NOINDEX · PUBLIC DEVELOPMENT</span><span>BRAIN → PROJECT → PROCESS → WBS → EVIDENCE → LEARNING → ECONOMICS → CAPITAL</span><a href="https://4planet.org">4PLANET.ORG ↗</a></footer>;
}

export default function LabsV4() {
  const slug = useMemo(currentSlug, []);
  const project = projectBySlug(slug);
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    return window.localStorage.getItem("4planet-labs-theme") === "light" ? "light" : "dark";
  });

  useEffect(() => { window.localStorage.setItem("4planet-labs-theme", theme); }, [theme]);
  useEffect(() => {
    const title = !slug ? "4PLANET LABS — Human Project OS" : project ? `${project.title} — 4PLANET LABS` : "Unknown Project — 4PLANET LABS";
    document.title = title;
    let robots = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!robots) { robots = document.createElement("meta"); robots.name = "robots"; document.head.appendChild(robots); }
    const previous = robots.content;
    robots.content = "noindex,nofollow,noarchive";
    return () => { if (robots) robots.content = previous; };
  }, [project, slug]);

  const back = project?.parent ?? "";
  return <div className="labs-shell labs-shell--v4" data-theme={theme}><Header theme={theme} setTheme={setTheme} back={back} />{!slug ? <PortfolioView /> : project ? <ProjectDetail project={project} /> : <UnknownProject slug={slug} />}<Footer /></div>;
}

void ReactNode;
