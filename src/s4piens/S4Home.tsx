import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GRAMMAR, ORBIT, SYSTEMS, systemBySlug } from "./systems";
import { S4Footer, systemHref } from "./S4App";

const STATUS_LABEL = { GOLD: "Mapped in depth", PROOF: "Mapped", NEXT: "In preparation" } as const;

export function HumanFigure({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 420" aria-hidden>
      <circle cx="100" cy="36" r="27" />
      <path d="M62 84 Q100 74 138 84 L150 92 Q160 100 162 116 L172 214 Q173 224 164 226 Q156 228 154 218 L144 132 L140 132 L140 236 L136 400 Q135 412 124 412 Q114 412 113 400 L104 258 L96 258 L87 400 Q86 412 76 412 Q65 412 64 400 L60 236 L60 132 L56 132 L46 218 Q44 228 36 226 Q27 224 28 214 L38 116 Q40 100 50 92 Z" />
    </svg>
  );
}

function Orbit({ active, setActive }: { active: string; setActive: (s: string) => void }) {
  const nav = useNavigate();
  const R = 38; // % of box
  return (
    <div className="s-orbit">
      <svg className="s-orbit__rings" viewBox="0 0 100 100" aria-hidden>
        <circle cx="50" cy="50" r={R} className="s-orbit__ring" />
        <circle cx="50" cy="50" r="28" className="s-orbit__ring s-orbit__ring--inner" />
        {ORBIT.map((o, i) => {
          const a = (i / ORBIT.length) * Math.PI * 2 - Math.PI / 2;
          const x = 50 + Math.cos(a) * R, y = 50 + Math.sin(a) * R;
          const on = o.slug === active;
          return (
            <g key={o.slug}>
              {on && <line x1={50 + Math.cos(a) * 28} y1={50 + Math.sin(a) * 28} x2={x} y2={y} className="s-orbit__spoke" />}
              <circle cx={x} cy={y} r={o.status === "NEXT" ? 0.9 : 1.4} className={"s-orbit__node s-orbit__node--" + o.status.toLowerCase() + (on ? " is-on" : "")} />
              {on && <circle cx={x} cy={y} r="3" className="s-orbit__halo" />}
            </g>
          );
        })}
      </svg>
      <HumanFigure className="s-human" />
      <span className="s-orbit__species n-mono">HOMO SAPIENS</span>
      {ORBIT.map((o, i) => {
        const a = (i / ORBIT.length) * Math.PI * 2 - Math.PI / 2;
        const cx = Math.cos(a), x = 50 + cx * (R + 3.2), y = 50 + Math.sin(a) * (R + 5.2);
        const align = cx > 0.3 ? " is-right" : cx < -0.3 ? " is-left" : "";
        return (
          <button key={o.slug} className={"s-orbit__label" + align + (o.slug === active ? " is-on" : "") + (o.status === "NEXT" ? " is-next" : "")}
            style={{ left: x + "%", top: y + "%" }} aria-pressed={o.slug === active}
            onMouseEnter={() => setActive(o.slug)} onFocus={() => setActive(o.slug)}
            onClick={() => (o.status === "NEXT" ? setActive(o.slug) : nav(systemHref(o.slug)))}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export default function S4Home() {
  const [active, setActive] = useState("food");
  const sys = systemBySlug(active);
  const orbitItem = ORBIT.find((o) => o.slug === active)!;
  useEffect(() => {
    document.title = "S4PIENS — How human systems work";
    document.querySelector('meta[name="description"]')?.setAttribute("content", "Start with a human need and follow the real systems behind it — food, energy and industry — to the places, living systems, problems and solutions they connect to. From 4PLANET.");
  }, []);
  return (
    <main className="s-home">
      <section className="s-home__hero">
        <div className="s-home__copy">
          <p className="n-kicker n-mono">HUMAN SYSTEMS ATLAS · FROM 4PLANET</p>
          <h1 className="n-display s-display">Everything you live on comes from somewhere.</h1>
          <p className="n-lead">Start with a human need. Follow the system behind it — through fields, mines, factories and ports — to the living world it depends on, the problems it creates and what people are building to change it.</p>
          <div className="s-focus" aria-live="polite">
            <span className="n-mono s-focus__state">{STATUS_LABEL[orbitItem.status]}</span>
            <h2>{sys ? sys.name : orbitItem.label}</h2>
            <p>{sys ? sys.need : "This system is being mapped. We open a system only when its chain, places and sources are ready."}</p>
            {sys ? <Link className="n-btn s-btn" to={systemHref(sys.slug)}>Enter {sys.name.toLowerCase()} →</Link>
              : <span className="n-fine">Food and energy & industry are open now.</span>}
          </div>
        </div>
        <Orbit active={active} setActive={setActive} />
      </section>

      <section className="n-band">
        <header className="n-band__head">
          <span className="n-mono">01</span>
          <h2>One way to read any system</h2>
          <p>Every system in S4PIENS is read with the same grammar, so food and steel can be understood side by side. Each step answers one question.</p>
        </header>
        <ol className="s-grammar">
          {GRAMMAR.map((g, i) => <li key={g}><span className="n-mono">{String(i + 1).padStart(2, "0")}</span>{g}</li>)}
        </ol>
      </section>

      <section className="n-band">
        <header className="n-band__head">
          <span className="n-mono">02</span>
          <h2>Two systems, followed end to end</h2>
          <p>Food is the first system mapped in depth. Energy & industry tests that the same grammar holds for something completely different. More systems follow only when their sources are ready.</p>
        </header>
        <div className="s-systems">
          {SYSTEMS.map((s) => (
            <Link key={s.slug} to={systemHref(s.slug)} className="s-syscard">
              <span className="n-mono">{STATUS_LABEL[s.status].toUpperCase()}{s.mission ? " · " + s.mission : ""}</span>
              <h3>{s.name}</h3>
              <p>{s.thesis}</p>
              {s.example && (
                <ol className="s-mini-chain" aria-label={s.example.title}>
                  {s.example.steps.map((x) => <li key={x}>{x}</li>)}
                </ol>
              )}
              <span className="s-syscard__go">Follow the chain →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="n-band s-honest">
        <header className="n-band__head">
          <span className="n-mono">03</span>
          <h2>How we keep it honest</h2>
        </header>
        <ul className="s-honest__list">
          <li><b>Explanation is labelled.</b> How a system works is 4PLANET context. Measured figures carry their source and year.</li>
          <li><b>Proximity is not cause.</b> A factory near a river is not proof it harms the river.</li>
          <li><b>A solution is not proven by existing.</b> Maturity and evidence are shown as two separate scales.</li>
          <li><b>No guilt scores.</b> S4PIENS explains systems. Your personal choices live in 4SAPIEN.</li>
        </ul>
      </section>
      <S4Footer />
    </main>
  );
}
