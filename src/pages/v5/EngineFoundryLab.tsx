import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { compileEngine, type EngineRun } from "@/labs/engine-foundry/runtime";
import {
  demoWorkItems,
  priorityEngineBlueprint,
  priorityStageRegistry,
  type PriorityOutput,
  type WorkItem,
} from "@/labs/engine-foundry/priorityEngine";
import "@/styles/engine-foundry-lab.css";

const engine = compileEngine(priorityEngineBlueprint, priorityStageRegistry);

const FACTORS: Array<{ key: keyof Pick<WorkItem, "northStar" | "urgency" | "evidence" | "readiness" | "reversibility" | "founderBurden" | "effort" | "risk">; label: string }> = [
  { key: "northStar", label: "North Star" },
  { key: "urgency", label: "Urgency" },
  { key: "evidence", label: "Evidence" },
  { key: "readiness", label: "Readiness" },
  { key: "reversibility", label: "Reversibility" },
  { key: "founderBurden", label: "Founder burden" },
  { key: "effort", label: "Effort" },
  { key: "risk", label: "Risk" },
];

const NEW_ITEM_DEFAULTS: WorkItem = {
  id: "draft",
  title: "",
  northStar: 85,
  urgency: 60,
  evidence: 60,
  readiness: 70,
  reversibility: 80,
  founderBurden: 25,
  effort: 45,
  risk: 30,
  status: "READY",
  recommendedEngine: "PROGRAMME_ENGINE",
};

const ENGINES = [
  {
    id: "PRIORITY ENGINE",
    state: "RUNNABLE",
    body: "Ranks candidate work against explicit value, evidence, readiness, effort, risk and founder burden.",
    active: true,
  },
  {
    id: "PARTNER ENGINE",
    state: "NEXT TRANSFER TEST",
    body: "Need → actor universe → fit → diligence gaps → risk → gated next action.",
    active: false,
  },
  {
    id: "CODE / INTERFACE ENGINE",
    state: "DESIGN TARGET",
    body: "Planet intelligence → typed interface specification → bounded prototype → tests → human-visible preview.",
    active: false,
  },
] as const;

const factorLabel = (key: string) => ({
  northStar: "North Star",
  urgency: "Urgency",
  evidence: "Evidence",
  readiness: "Readiness",
  reversibility: "Reversibility",
  lowFounderBurden: "Low founder burden",
  lowEffort: "Low effort",
  lowRisk: "Low risk",
}[key] ?? key);

export default function EngineFoundryLab() {
  const [items, setItems] = useState<WorkItem[]>(() => structuredClone(demoWorkItems));
  const [draft, setDraft] = useState<WorkItem>(() => ({ ...NEW_ITEM_DEFAULTS }));
  const [result, setResult] = useState<EngineRun | null>(null);
  const [status, setStatus] = useState("READY");

  useEffect(() => {
    const robots = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    const previous = robots?.content;
    let target = robots;
    let created = false;
    if (!target) {
      target = document.createElement("meta");
      target.name = "robots";
      document.head.appendChild(target);
      created = true;
    }
    target.content = "noindex,nofollow";
    return () => {
      if (created) target?.remove();
      else if (target && previous != null) target.content = previous;
    };
  }, []);

  const output = result?.output as PriorityOutput | undefined;
  const top = output?.ranked[0] ?? null;

  const runSummary = useMemo(() => {
    if (!result || !output) return "No run yet";
    return `${output.ranked.length} ready · ${output.blocked.length} gated · ${result.trace.length} trace events`;
  }, [result, output]);

  const updateDraftNumber = (key: (typeof FACTORS)[number]["key"], value: number) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const addItem = () => {
    const title = draft.title.trim();
    if (!title) {
      setStatus("TASK NAME REQUIRED");
      return;
    }
    const id = `user-${Date.now()}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 28)}`;
    setItems((current) => [...current, { ...draft, id, title }]);
    setDraft({ ...NEW_ITEM_DEFAULTS });
    setResult(null);
    setStatus("ITEM ADDED");
  };

  const runEngine = async () => {
    setStatus("RUNNING");
    const next = await engine.run({ items }, { runId: `labs-${Date.now()}` });
    setResult(next);
    setStatus(next.ok ? "SUCCEEDED" : next.status);
  };

  const reset = () => {
    setItems(structuredClone(demoWorkItems));
    setDraft({ ...NEW_ITEM_DEFAULTS });
    setResult(null);
    setStatus("READY");
  };

  const exportRun = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "4planet-engine-foundry-run.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PublicShell>
      <main className="ef-lab">
        <section className="ef-hero">
          <div className="ef-eyebrow">4PLANET LABS · ENGINE FOUNDRY v0.2 · INTERNAL PROTOTYPE</div>
          <h1>Reusable capability.<br />Inspectable decisions.</h1>
          <p>Enter real candidate work, run a bounded specialised engine and inspect exactly why the result was produced. This is the first human surface for ENGINE_ ENGINE.</p>
          <div className="ef-truthbar">
            <strong>REAL DETERMINISTIC OUTPUT</strong>
            <span>Explicit inputs only. No automatic learning, external execution, production deploy, payment or Canon change.</span>
          </div>
          <div className="ef-links"><Link to="/labs">ALL LABS</Link><Link to="/labs/creator">CREATOR ENGINE</Link><Link to="/">4PLANET</Link></div>
        </section>

        <section className="ef-app">
          <aside className="ef-sidebar">
            <span className="ef-mono">ENGINE REGISTRY</span>
            {ENGINES.map((item) => (
              <article key={item.id} className={item.active ? "ef-engine-card is-active" : "ef-engine-card"}>
                <div><b>{item.id}</b><small>{item.state}</small></div>
                <p>{item.body}</p>
              </article>
            ))}
            <div className="ef-authority">
              <span>AUTHORITY</span>
              <p>Advisory LAB only. High-consequence actions are surfaced as gates instead of entering the runnable queue.</p>
            </div>
          </aside>

          <div className="ef-workspace">
            <section className="ef-panel ef-builder">
              <div className="ef-panel-head">
                <div><span>01 · INPUT</span><h2>Build the work queue.</h2></div>
                <div className="ef-run-state"><b>{status}</b><small>{runSummary}</small></div>
              </div>

              <div className="ef-draft">
                <label className="ef-title-field"><span>TASK / ACTION</span><input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} placeholder="Build a public-safe Orca data adapter" /></label>
                <label><span>STATUS</span><select value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value as WorkItem["status"] }))}><option value="READY">READY</option><option value="BLOCKED">BLOCKED</option></select></label>
                <label><span>NEXT ENGINE</span><select value={draft.recommendedEngine} onChange={(event) => setDraft((current) => ({ ...current, recommendedEngine: event.target.value }))}><option>PROGRAMME_ENGINE</option><option>ENGINE_FOUNDRY</option><option>CODE_INTERFACE_ENGINE</option><option>PARTNER_ENGINE</option><option>INTEL_ENGINE</option><option>STORY_ENGINE</option><option>FOUNDER</option></select></label>
              </div>

              <div className="ef-factors">
                {FACTORS.map((factor) => (
                  <label key={factor.key}>
                    <span>{factor.label}<b>{draft[factor.key]}</b></span>
                    <input type="range" min="0" max="100" value={draft[factor.key]} onChange={(event) => updateDraftNumber(factor.key, Number(event.target.value))} />
                  </label>
                ))}
              </div>

              <div className="ef-gates">
                {([
                  ["externalAction", "External action"],
                  ["productionDeploy", "Production deploy"],
                  ["canonChange", "Canon change"],
                  ["payment", "Payment"],
                  ["requiresFounderDecision", "Founder decision"],
                ] as const).map(([key, label]) => (
                  <label key={key}><input type="checkbox" checked={Boolean(draft[key])} onChange={(event) => setDraft((current) => ({ ...current, [key]: event.target.checked }))} />{label}</label>
                ))}
              </div>

              <div className="ef-actions"><button type="button" onClick={addItem}>ADD TO QUEUE</button><button type="button" className="is-primary" onClick={runEngine}>RUN PRIORITY ENGINE</button><button type="button" onClick={reset}>RESET</button><button type="button" onClick={exportRun} disabled={!result}>EXPORT RUN JSON</button></div>

              <div className="ef-queue">
                {items.map((item) => (
                  <article key={item.id}>
                    <div><b>{item.title}</b><small>{item.status} · risk {item.risk} · readiness {item.readiness} · next {item.recommendedEngine ?? "PROGRAMME_ENGINE"}</small></div>
                    <button type="button" aria-label={`Remove ${item.title}`} onClick={() => { setItems((current) => current.filter((candidate) => candidate.id !== item.id)); setResult(null); }}>×</button>
                  </article>
                ))}
              </div>
            </section>

            <section className="ef-results">
              <div className="ef-panel">
                <span className="ef-mono">02 · RANKED QUEUE</span>
                {output?.ranked.length ? output.ranked.map((item) => (
                  <article className="ef-result" key={item.id}>
                    <div className="ef-result-meta"><span>#{item.rank} · {item.recommendedNext}</span><strong>{item.score}</strong></div>
                    <h3>{item.title}</h3><p>{item.explanation}</p>
                    <div className="ef-factor-readout">{Object.entries(item.factors).map(([key, value]) => <small key={key}><b>{value.toFixed(1)}</b>{factorLabel(key)}</small>)}</div>
                  </article>
                )) : <p className="ef-empty">Run the engine to produce a ranked queue.</p>}
              </div>

              <div className="ef-panel">
                <span className="ef-mono">03 · BLOCKED / GATED</span>
                {output?.blocked.length ? output.blocked.map((item) => (
                  <article className="ef-result is-blocked" key={item.id}>
                    <div className="ef-result-meta"><span>{item.recommendedNext}</span><strong>{item.score}</strong></div>
                    <h3>{item.title}</h3><p>{item.blockers.join(" · ")}</p><small>{item.requiredGates.join(" · ")}</small>
                  </article>
                )) : <p className="ef-empty">High-consequence work will be held here instead of silently entering execution.</p>}
              </div>
            </section>

            <section className="ef-panel ef-trace">
              <div className="ef-panel-head"><div><span>04 · EXECUTION TRACE</span><h2>{top ? `Why #1 is ${top.title}` : "Every stage stays inspectable."}</h2></div></div>
              {result ? result.trace.map((record, index) => (
                <div className="ef-trace-row" key={`${record.sequence}-${record.stageId}`}><small>{String(index + 1).padStart(2, "0")}</small><b>{record.stageId}</b><span className={`is-${record.status.toLowerCase()}`}>{record.status}</span></div>
              )) : <p className="ef-empty">VALIDATE → SCORE → BLOCK → RANK will appear here.</p>}
            </section>

            <section className="ef-panel ef-transfer">
              <span className="ef-mono">TRANSFER PROOF</span>
              <div><article><b>01 · PRIORITY ENGINE</b><p>Functional. Proves compile, deterministic execution, gate handling and trace.</p></article><article><b>02 · PARTNER ENGINE</b><p>Next. Must reuse the kernel without copying orchestration. This is the abstraction test.</p></article><article><b>03 · CODE / INTERFACE ENGINE</b><p>Then compile typed Planet intelligence into a bounded interface spec and sandbox preview before any production mutation.</p></article></div>
            </section>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
