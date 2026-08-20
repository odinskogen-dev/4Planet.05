import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { childrenOf, projectBySlug, projectionState, verifiedAt } from "./labsCurrentProjection";
import type { GoldLabProject } from "./labsGoldMeta";
import { projectPulseFor, type PulseWorkItem } from "./labsProjectPulse";
import "./labsGold.css";

type Theme = "dark" | "light";

function isLabsHost() {
  return typeof window !== "undefined" && window.location.hostname.toLowerCase() === "labs.4planet.org";
}

function labHref(slug = "") {
  const clean = slug.replace(/^\/+|\/+$/g, "");
  if (isLabsHost()) return clean ? `/${clean}` : "/";
  return clean ? `/labs?project=${encodeURIComponent(clean)}` : "/labs";
}

function accentStyle(project: GoldLabProject) {
  const accent = project.slug === "4planet" || project.accent === "brand" ? "var(--accent-fourplanet)" : `var(--accent-${project.accent})`;
  return { "--accent": accent } as CSSProperties;
}

function humanText(text: string) {
  return text.replace(/\b[a-f0-9]{32,40}\b/gi, "exact tested artifact").replace(/\b(?:run|workflow)\s+\d{8,}\b/gi, "exact QA run").replace(/\s+/g, " ").trim();
}

function Status({ project }: { project: GoldLabProject }) {
  return <span className={`labs-status labs-status--${project.state.toLowerCase()}`}>{project.state}</span>;
}

function Header({ theme, setTheme, project }: { theme: Theme; setTheme: (theme: Theme) => void; project: GoldLabProject }) {
  return <header className="labs-header"><a className="labs-brand" href={labHref()}><span className="labs-online-dot" aria-hidden="true" />4PLANET LABS</a><div className="labs-header-center"><span>PROJECT CONTROL</span><span>{projectionState}</span></div><div className="labs-header-tools"><span className="labs-snapshot">{project.title} · {verifiedAt}</span><div className="labs-theme-switch" aria-label="Appearance"><button type="button" className={theme === "dark" ? "is-active" : ""} onClick={() => setTheme("dark")} aria-pressed={theme === "dark"}>DARK</button><button type="button" className={theme === "light" ? "is-active" : ""} onClick={() => setTheme("light")} aria-pressed={theme === "light"}>WHITE</button></div></div></header>;
}

function GridRails() {
  return <div className="labs-rails" aria-hidden="true">{Array.from({ length: 13 }, (_, index) => <span key={index} />)}</div>;
}

function SectionHead({ left, right }: { left: string; right: string }) {
  return <div className="labs-section-head labs-section-head--v4"><span>{left}</span><span>{right}</span></div>;
}

function PrimaryLinks({ project }: { project: GoldLabProject }) {
  const links = project.control.links;
  if (!links.length) return <div className="labs-gold-no-link" aria-label="Project digital home"><span>DIGITAL HOME</span><strong>NO VERIFIED FOUNDER-FACING LINK YET</strong><p>Broken, stale or unverified URLs stay withheld rather than guessed.</p></div>;
  return <div className="labs-gold-actions" aria-label="Project links">{links.slice(0, 4).map((asset, index) => <a className={index === 0 ? "is-primary" : ""} href={asset.href} target="_blank" rel="noreferrer" key={`${asset.label}-${asset.href}`}><span>{asset.kind}</span><strong>{asset.label}</strong><b>↗</b></a>)}</div>;
}

function Hero({ project }: { project: GoldLabProject }) {
  const parent = project.parent ? projectBySlug(project.parent) : undefined;
  const pulse = projectPulseFor(project);
  return <section className="labs-project-hero labs-project-hero--gold" style={accentStyle(project)}><div className="labs-project-path"><a href={labHref()}>LABS</a>{parent && <><span>/</span><a href={labHref(parent.slug)}>{parent.title}</a></>}<span>/</span><strong>{project.title}</strong></div><div className="labs-project-hero-main labs-project-hero-main--gold"><div><span className="labs-label">{project.control.classification}</span><h1>{project.title}</h1><p>{project.summary}</p></div><div className="labs-project-state-stack"><Status project={project} /><span>{project.priority}</span>{project.projectId && <span>{project.projectId}</span>}</div></div><PrimaryLinks project={project} /><div className="labs-gold-commandline"><div><span>PHASE</span><strong>{project.control.phase}</strong></div><div><span>GOAL CONTRACT</span><strong>{project.control.goalId ?? "CURRENT AUTHORITY"}</strong></div><div><span>DIGITAL HOME</span><strong>{pulse.digitalState}</strong></div><div><span>FRESHNESS</span><strong>{pulse.freshness}</strong></div></div></section>;
}

function ProjectBrief({ project }: { project: GoldLabProject }) {
  const pulse = projectPulseFor(project);
  return <section className="labs-control-section labs-gold-brief"><SectionHead left="PROJECT BRIEF" right="what this is · why it matters · who owns it" /><div className="labs-gold-brief-grid"><article className="is-current"><span>CURRENT STATE</span><p>{humanText(pulse.current)}</p></article><article><span>WHY THIS PROJECT EXISTS</span><p>{pulse.why}</p></article><article><span>OWNER / OPERATING MODEL</span><p>{pulse.owner}</p></article><article><span>AUTHORITY</span><p>{pulse.authority}</p></article><article><span>AI EXECUTION LOGIC</span><p>{pulse.aiPlan}</p></article></div></section>;
}

function Goals({ project }: { project: GoldLabProject }) {
  return <section className="labs-control-section labs-gold-goals"><SectionHead left="GOAL CONTRACT" right={project.control.goalId ?? "current controlled goal"} /><div className="labs-gold-goal-grid"><article><span>MAIN GOAL</span><h2>{project.control.mainGoal}</h2></article><article><span>SUCCESS / PROOF</span><p>{project.control.success}</p></article><article><span>ECONOMIC GOAL</span><p>{project.control.economicGoal}</p></article></div></section>;
}

function WorkList({ items, empty }: { items: PulseWorkItem[]; empty: string }) {
  if (!items.length) return <p className="labs-gold-empty">{empty}</p>;
  return <div className="labs-gold-pulse-list">{items.map((item, index) => <div key={`${item.state}-${item.text}-${index}`}><span>{item.state}</span><p>{humanText(item.text)}</p>{item.owner && <small>{item.owner}</small>}</div>)}</div>;
}

function Execution({ project }: { project: GoldLabProject }) {
  const pulse = projectPulseFor(project);
  return <section className="labs-control-section labs-gold-execution"><SectionHead left="EXECUTION" right="NOW → NEXT → WAITING → FOUNDER · WBS stays in BRAIN" /><div className="labs-gold-execution-grid"><article><span>WORK NOW</span><WorkList items={pulse.workNow} empty="No current work item is projected." /></article><article><span>WORK NEXT</span><WorkList items={pulse.workNext} empty="No separate next work item is projected beyond the current gate." /></article><article><span>WAITING / BLOCKED</span><WorkList items={pulse.waiting} empty="No separate blocker is projected. Unknown dependencies remain governed by the Project gate." /></article><article><span>FOUNDER GATE</span><WorkList items={pulse.founder} empty="No public-safe Founder action is projected for this Project right now." /></article><article className="labs-gold-execution-wide"><span>WBS / PROCESS COVERAGE</span><p>{pulse.wbsSummary}</p></article></div></section>;
}

function EconomicsProof({ project }: { project: GoldLabProject }) {
  const pulse = projectPulseFor(project);
  return <section className="labs-control-section labs-gold-economy-proof"><SectionHead left="MONEY + PROOF" right="plan ≠ pipeline ≠ award ≠ contract ≠ cash" /><div className="labs-gold-economy-grid"><article><span>ECONOMICS</span><p>{project.control.economics}</p></article><article><span>MONEY TRUTH</span><p>{project.control.moneyTruth}</p></article><article><span>EVIDENCE / PROOF</span><p>{pulse.proof}</p></article><article><span>NEXT GATE</span><p>{project.control.nextGate}</p></article></div></section>;
}

function FounderPort({ project }: { project: GoldLabProject }) {
  const decisions = project.founderDecisions ?? [];
  if (!decisions.length) return null;
  return <section className="labs-control-section labs-gold-founder"><SectionHead left="FOUNDER" right={`${decisions.length} decision${decisions.length === 1 ? "" : "s"}`} />{decisions.map((decision, index) => <div key={`${decision}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><p>{humanText(decision)}</p></div>)}</section>;
}

function Children({ project }: { project: GoldLabProject }) {
  const children = childrenOf(project.slug);
  if (!children.length) return null;
  return <section className="labs-control-section"><SectionHead left="CONNECTED PROJECTS" right={`${children.length} views`} /><div className="labs-project-link-grid labs-project-link-grid--gold">{children.map((child) => <a href={labHref(child.slug)} style={accentStyle(child as GoldLabProject)} key={child.slug}><span>{child.eyebrow}</span><strong>{child.title}</strong><small>{child.state} · {child.priority}</small><b>→</b></a>)}</div></section>;
}

function DetailDisclosure({ label, meta, children, open = false }: { label: string; meta: string; children: ReactNode; open?: boolean }) {
  return <details className="labs-gold-disclosure" open={open}><summary><span>{label}</span><small>{meta}</small><b>+</b></summary><div>{children}</div></details>;
}

function WorkDetails({ project }: { project: GoldLabProject }) {
  const roadmap = project.roadmap ?? [];
  const tasks = project.tasks ?? [];
  const processes = project.processes ?? [];
  const milestones = project.milestones ?? [];
  if (!(roadmap.length + tasks.length + processes.length + milestones.length)) return null;
  return <section className="labs-control-section labs-gold-details"><SectionHead left="FULL PROJECT CONTROL" right="deeper WBS / process detail · collapsed by default" />{!!tasks.length && <DetailDisclosure label="UPCOMING WORK" meta={`${tasks.length} items`}>{tasks.map((task, index) => <div className="labs-gold-row" key={`${task.text}-${index}`}><span>{task.state}</span><p>{humanText(task.text)}</p><small>{task.owner}</small></div>)}</DetailDisclosure>}{!!roadmap.length && <DetailDisclosure label="ROADMAP" meta={`${roadmap.length} stages`}>{roadmap.map((item, index) => <div className="labs-gold-row" key={`${item.stage}-${index}`}><span>{item.stage}</span><p><strong>{item.title}</strong> · {item.text}</p></div>)}</DetailDisclosure>}{!!processes.length && <DetailDisclosure label="PROCESS" meta={`${processes.length} parts`}>{processes.map((item) => <div className="labs-gold-row" key={item.name}><span>{item.state}</span><p><strong>{item.name}</strong> · {item.text}</p></div>)}</DetailDisclosure>}{!!milestones.length && <DetailDisclosure label="CHECKPOINTS" meta={`${milestones.filter((m) => m.done).length}/${milestones.length} complete`}>{milestones.map((item, index) => <div className="labs-gold-row" key={`${item.label}-${index}`}><span>{item.done ? "DONE" : "OPEN"}</span><p>{item.label}</p></div>)}</DetailDisclosure>}</section>;
}

function Evidence({ project }: { project: GoldLabProject }) {
  return <section className="labs-control-section labs-gold-evidence"><DetailDisclosure label="TECHNICAL / RECOVERY EVIDENCE" meta="audit detail · hidden from normal scan">{project.control.technical.map((item, index) => <div className="labs-gold-row" key={`${item}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><p className="labs-tech-text">{item}</p></div>)}<div className="labs-gold-row"><span>AUTH</span><p>{project.authority}</p></div><div className="labs-gold-row"><span>SOURCE</span><p>{project.control.source}</p></div><div className="labs-gold-row"><span>FRESH</span><p>{project.freshness}</p></div></DetailDisclosure></section>;
}

export default function LabsProjectDetailPremium({ project }: { project: GoldLabProject }) {
  const [theme, setTheme] = useState<Theme>(() => typeof window !== "undefined" && window.localStorage.getItem("4planet-labs-theme") === "light" ? "light" : "dark");
  useEffect(() => { window.localStorage.setItem("4planet-labs-theme", theme); }, [theme]);
  useEffect(() => {
    document.title = `${project.title} — 4PLANET LABS`;
    let robots = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!robots) { robots = document.createElement("meta"); robots.name = "robots"; document.head.appendChild(robots); }
    const previous = robots.content;
    robots.content = "noindex,nofollow,noarchive";
    return () => { if (robots) robots.content = previous; };
  }, [project]);
  return <div className="labs-shell labs-shell--v4" data-theme={theme}><Header theme={theme} setTheme={setTheme} project={project} /><main className={`labs-page labs-page--detail labs-page--detail-v4 ${project.slug === "4planet" ? "labs-page--fourplanet" : ""}`} style={accentStyle(project)}><GridRails /><div className="labs-detail-wrap labs-detail-wrap--v4 labs-grid-section"><Hero project={project} /><ProjectBrief project={project} /><Goals project={project} /><Execution project={project} /><EconomicsProof project={project} /><FounderPort project={project} /><Children project={project} /><WorkDetails project={project} /><Evidence project={project} /><div className="labs-detail-actions"><a href={labHref(project.parent ?? "")}>← {project.parent ? (projectBySlug(project.parent)?.title ?? "PARENT") : "LABS"}</a><a href={labHref()}>ALL PROJECTS</a></div></div></main><footer className="labs-footer"><span>4PLANET LABS · NOINDEX · READ-ONLY PROJECTION</span><span>GOAL → PROJECT → WBS → EVIDENCE → ECONOMICS → NEXT GATE</span><a href="https://4planet.org">4PLANET.ORG ↗</a></footer></div>;
}
