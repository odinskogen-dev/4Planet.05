import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { childrenOf, projectBySlug, projectionState, verifiedAt } from "./labsFreshProjection";
import type { GoldLabProject } from "./labsGoldMeta";
import { humanStateFor } from "./labsHumanState";
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
  if (!links.length) return null;
  return <div className="labs-gold-actions" aria-label="Project links">{links.slice(0, 4).map((asset, index) => <a className={index === 0 ? "is-primary" : ""} href={asset.href} target="_blank" rel="noreferrer" key={`${asset.label}-${asset.href}`}><span>{asset.kind}</span><strong>{asset.label}</strong><b>↗</b></a>)}</div>;
}

function Hero({ project }: { project: GoldLabProject }) {
  const parent = project.parent ? projectBySlug(project.parent) : undefined;
  return <section className="labs-project-hero labs-project-hero--gold" style={accentStyle(project)}><div className="labs-project-path"><a href={labHref()}>LABS</a>{parent && <><span>/</span><a href={labHref(parent.slug)}>{parent.title}</a></>}<span>/</span><strong>{project.title}</strong></div><div className="labs-project-hero-main labs-project-hero-main--gold"><div><span className="labs-label">{project.control.classification}</span><h1>{project.title}</h1><p>{project.summary}</p></div><div className="labs-project-state-stack"><Status project={project} /><span>{project.priority}</span>{project.projectId && <span>{project.projectId}</span>}</div></div><PrimaryLinks project={project} /><div className="labs-gold-commandline"><div><span>MAIN GOAL</span><strong>{project.control.mainGoal}</strong></div><div><span>PHASE</span><strong>{project.control.phase}</strong></div><div><span>NEXT GATE</span><strong>{project.control.nextGate}</strong></div><div><span>MONEY</span><strong>{project.control.moneyTruth}</strong></div></div></section>;
}

function RealityBoard({ project }: { project: GoldLabProject }) {
  return <section className="labs-gold-reality"><article className="is-now"><span>CURRENT STATE</span><p>{humanText(humanStateFor(project))}</p></article><article><span>NEXT GATE</span><p>{project.control.nextGate}</p></article><article><span>ECONOMICS</span><p>{project.control.economics}</p></article><article><span>SUCCESS LOOKS LIKE</span><p>{project.control.success}</p></article></section>;
}

function Goals({ project }: { project: GoldLabProject }) {
  return <section className="labs-control-section labs-gold-goals"><SectionHead left="GOALS" right={project.control.goalId ? `Goal contract · ${project.control.goalId}` : "current controlled goal"} /><div className="labs-gold-goal-grid"><article><span>01 · MAIN GOAL</span><h2>{project.control.mainGoal}</h2></article><article><span>02 · SUCCESS / PROOF</span><p>{project.control.success}</p></article><article><span>03 · ECONOMIC GOAL</span><p>{project.control.economicGoal}</p></article></div></section>;
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
  return <section className="labs-control-section labs-gold-details"><SectionHead left="DEEPER CONTROL" right="collapsed by default" />{!!tasks.length && <DetailDisclosure label="UPCOMING WORK" meta={`${tasks.length} items`}>{tasks.map((task, index) => <div className="labs-gold-row" key={`${task.text}-${index}`}><span>{task.state}</span><p>{humanText(task.text)}</p><small>{task.owner}</small></div>)}</DetailDisclosure>}{!!roadmap.length && <DetailDisclosure label="ROADMAP" meta={`${roadmap.length} stages`}>{roadmap.map((item, index) => <div className="labs-gold-row" key={`${item.stage}-${index}`}><span>{item.stage}</span><p><strong>{item.title}</strong> · {item.text}</p></div>)}</DetailDisclosure>}{!!processes.length && <DetailDisclosure label="PROCESS" meta={`${processes.length} parts`}>{processes.map((item) => <div className="labs-gold-row" key={item.name}><span>{item.state}</span><p><strong>{item.name}</strong> · {item.text}</p></div>)}</DetailDisclosure>}{!!milestones.length && <DetailDisclosure label="CHECKPOINTS" meta={`${milestones.filter((m) => m.done).length}/${milestones.length} complete`}>{milestones.map((item, index) => <div className="labs-gold-row" key={`${item.label}-${index}`}><span>{item.done ? "DONE" : "OPEN"}</span><p>{item.label}</p></div>)}</DetailDisclosure>}</section>;
}

function Evidence({ project }: { project: GoldLabProject }) {
  return <section className="labs-control-section labs-gold-evidence"><DetailDisclosure label="TECHNICAL EVIDENCE" meta="audit / recovery detail">{project.control.technical.map((item, index) => <div className="labs-gold-row" key={`${item}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><p className="labs-tech-text">{item}</p></div>)}<div className="labs-gold-row"><span>AUTH</span><p>{project.authority}</p></div><div className="labs-gold-row"><span>SOURCE</span><p>{project.control.source}</p></div><div className="labs-gold-row"><span>FRESH</span><p>{project.freshness}</p></div><div className="labs-gold-row"><span>MONEY</span><p>{project.control.moneyTruth}</p></div></DetailDisclosure></section>;
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
  return <div className="labs-shell labs-shell--v4" data-theme={theme}><Header theme={theme} setTheme={setTheme} project={project} /><main className={`labs-page labs-page--detail labs-page--detail-v4 ${project.slug === "4planet" ? "labs-page--fourplanet" : ""}`} style={accentStyle(project)}><GridRails /><div className="labs-detail-wrap labs-detail-wrap--v4 labs-grid-section"><Hero project={project} /><RealityBoard project={project} /><Goals project={project} /><FounderPort project={project} /><Children project={project} /><WorkDetails project={project} /><Evidence project={project} /><div className="labs-detail-actions"><a href={labHref(project.parent ?? "")}>← {project.parent ? (projectBySlug(project.parent)?.title ?? "PARENT") : "LABS"}</a><a href={labHref()}>ALL PROJECTS</a></div></div></main><footer className="labs-footer"><span>4PLANET LABS · NOINDEX · READ-ONLY PROJECTION</span><span>GOAL → PROJECT → EVIDENCE → ECONOMICS → NEXT GATE</span><a href="https://4planet.org">4PLANET.ORG ↗</a></footer></div>;
}
