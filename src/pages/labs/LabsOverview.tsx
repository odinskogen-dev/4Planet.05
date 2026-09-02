import { useMemo, useState } from "react";
import { authority, criticalPath, planVersion, projects, scorecard, verifiedAt, type Project } from "./labsData";
import "./labs.css";

function ProjectCard({ project, onOpen }: { project: Project; onOpen: (p: Project) => void }) {
  return (
    <button className="labs-project" onClick={() => onOpen(project)} data-state={project.state}>
      <div className="labs-project-top"><span>{project.priority}</span><b>{project.state}</b></div>
      <h3>{project.title}</h3>
      <p>{project.role}</p>
      <div className="labs-deadline">{project.deadline}</div>
      <small>{project.phase}</small>
    </button>
  );
}

function Inspector({ project, onClose }: { project: Project; onClose: () => void }) {
  return (
    <aside className="labs-inspector">
      <button className="labs-close" onClick={onClose} aria-label="Close">×</button>
      <span className="labs-kicker">PROJECT CONTROL</span>
      <h2>{project.title}</h2>
      <div className="labs-meta"><b>{project.priority}</b><b>{project.state}</b><b>{project.deadline}</b></div>
      <section><label>WHY</label><p>{project.why}</p></section>
      <section><label>SMART GOAL</label><p>{project.goal}</p></section>
      <section><label>NEXT FACTORY PACKAGE</label><p>{project.next}</p></section>
      <section><label>ECONOMIC / VALUE HYPOTHESIS</label><p>{project.economic}</p></section>
      <section><label>EVIDENCE STATE</label><p>{project.evidence}</p></section>
      <section><label>KEY RESULTS / KPI</label><ul>{project.kpis.map((k) => <li key={k}>{k}</li>)}</ul></section>
    </aside>
  );
}

export default function LabsOverview() {
  const [selected, setSelected] = useState<Project | null>(null);
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => projects.filter((p) => `${p.title} ${p.role} ${p.goal}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const critical = criticalPath.map((id) => projects.find((p) => p.id === id)).filter(Boolean) as Project[];

  return (
    <main className="labs-root">
      <header className="labs-header">
        <a href="/" className="labs-brand"><i />4PLANET LABS</a>
        <div><span>FOUNDER OPERATING SYSTEM</span><span>{planVersion}</span></div>
        <b>SNAPSHOT {verifiedAt}</b>
      </header>

      <section className="labs-truth"><span>TRUTH MODE</span><strong>{authority}</strong><em>UNKNOWN stays UNKNOWN · progress is evidence-based</em></section>

      <section className="labs-hero">
        <div><span className="labs-kicker">GIGA CONTROL ROOM</span><h1>Build the machine.<br/>Prove it in reality.</h1><p>North Star → objectives → Key Results → deliverables → WBS → Factory → evidence → learning.</p></div>
        <div className="labs-hero-stats">
          <div><b>{projects.length}</b><span>PROJECT FAMILIES</span></div>
          <div><b>{critical.length}</b><span>CRITICAL PATH</span></div>
          <div><b>16</b><span>GIGA SCORECARD DIMENSIONS</span></div>
          <div><b>5</b><span>AUTONOMOUS CONTROL ROLES</span></div>
        </div>
      </section>

      <section className="labs-section">
        <div className="labs-section-head"><div><span className="labs-kicker">01</span><h2>Critical path</h2></div><small>Hard gates and closest deadlines first</small></div>
        <div className="labs-path">{critical.map((p, i) => <button key={p.id} onClick={() => setSelected(p)}><span>{String(i+1).padStart(2,"0")}</span><strong>{p.title}</strong><small>{p.deadline}</small></button>)}</div>
      </section>

      <section className="labs-section">
        <div className="labs-section-head"><div><span className="labs-kicker">02</span><h2>GIGA scorecard</h2></div><small>Value Loops are one outcome metric — not the whole operating system</small></div>
        <div className="labs-scorecard">{scorecard.map(([name, desc]) => <div key={name}><strong>{name}</strong><p>{desc}</p><span>BASELINE REQUIRED</span></div>)}</div>
      </section>

      <section className="labs-section">
        <div className="labs-section-head"><div><span className="labs-kicker">03</span><h2>Project universe</h2></div><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search projects, goals, roles…" /></div>
        <div className="labs-grid">{filtered.map((p) => <ProjectCard key={p.id} project={p} onOpen={setSelected} />)}</div>
      </section>

      <section className="labs-section labs-autonomy">
        <div className="labs-section-head"><div><span className="labs-kicker">04</span><h2>Autonomous organisation</h2></div><small>One prioritiser · one production engine · specialists · independent judge</small></div>
        <div className="labs-role-grid">
          <div><b>GIGA CONDUCTOR</b><p>Rehydrates truth, measures plan vs evidence, ranks the portfolio and feeds bounded work to Factory.</p></div>
          <div><b>FACTORY PRODUCTION</b><p>Plans, researches, designs, writes, codes, tests, diagnoses, corrects, red-teams and learns every hour.</p></div>
          <div><b>CAPITAL CONVERSION</b><p>Moves qualified funding from opportunity to contracted/cash without pipeline theatre.</p></div>
          <div><b>ODIN LIFE CONTROL</b><p>Protects Founder capacity, money, home, deadlines and personal opportunity in a separate private truth plane.</p></div>
          <div><b>GOLD QA</b><p>Independent judge: traceability, Human Gold, truth, economics, recovery, drift and Factory quality.</p></div>
        </div>
      </section>

      {selected && <Inspector project={selected} onClose={() => setSelected(null)} />}
    </main>
  );
}
