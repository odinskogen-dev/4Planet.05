import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { compileEngine, type EngineRun } from "@/labs/engine-foundry/runtime";
import {
  demoPartnerCandidates,
  demoPartnerNeed,
  partnerEngineBlueprint,
  partnerStageRegistry,
  type PartnerCandidate,
  type PartnerNeed,
  type PartnerOutput,
} from "@/labs/engine-foundry/partnerEngine";
import "@/styles/engine-foundry-lab.css";
import "@/styles/partner-engine-lab.css";

const partnerEngine = compileEngine(partnerEngineBlueprint, partnerStageRegistry);

const candidateTemplate = (): PartnerCandidate => ({
  id: `candidate-${Date.now()}`,
  name: "New candidate",
  country: "",
  eligibility: "UNKNOWN",
  missionFit: 70,
  capabilityFit: 70,
  deliveryEvidence: 50,
  evidenceStrength: 50,
  capacity: 60,
  accessRoute: 50,
  relationship: 10,
  risk: 30,
  asyncRoute: true,
  meetingRequired: false,
  evidenceRefs: [],
});

const METRICS: Array<{ key: keyof Pick<PartnerCandidate, "missionFit" | "capabilityFit" | "deliveryEvidence" | "evidenceStrength" | "capacity" | "accessRoute" | "relationship" | "risk">; label: string }> = [
  { key: "missionFit", label: "Mission fit" },
  { key: "capabilityFit", label: "Capability" },
  { key: "deliveryEvidence", label: "Delivery proof" },
  { key: "evidenceStrength", label: "Evidence" },
  { key: "capacity", label: "Capacity" },
  { key: "accessRoute", label: "Access route" },
  { key: "relationship", label: "Relationship" },
  { key: "risk", label: "Risk" },
];

export default function PartnerEngineLab() {
  const [need, setNeed] = useState<PartnerNeed>(() => structuredClone(demoPartnerNeed));
  const [candidates, setCandidates] = useState<PartnerCandidate[]>(() => structuredClone(demoPartnerCandidates));
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

  const output = result?.output as PartnerOutput | undefined;
  const summary = useMemo(() => {
    if (!result || !output) return "No run yet";
    return `${output.ranked.length} ranked · ${output.blocked.length} blocked · ${result.trace.length} trace events`;
  }, [result, output]);

  const updateCandidate = <K extends keyof PartnerCandidate>(index: number, key: K, value: PartnerCandidate[K]) => {
    setCandidates((current) => current.map((candidate, candidateIndex) => candidateIndex === index ? { ...candidate, [key]: value } : candidate));
    setResult(null);
  };

  const run = async () => {
    setStatus("RUNNING");
    const next = await partnerEngine.run({ need, candidates }, { runId: `partner-lab-${Date.now()}` });
    setResult(next);
    setStatus(next.ok ? "SUCCEEDED" : next.status);
  };

  const reset = () => {
    setNeed(structuredClone(demoPartnerNeed));
    setCandidates(structuredClone(demoPartnerCandidates));
    setResult(null);
    setStatus("READY");
  };

  const exportRun = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "4planet-partner-engine-run.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PublicShell>
      <main className="ef-lab pe-lab">
        <section className="ef-hero pe-hero">
          <div className="ef-eyebrow">4PLANET LABS · ENGINE FOUNDRY · TRANSFER PROOF 02</div>
          <h1>Find the right partner.<br />Keep the gaps visible.</h1>
          <p>Partner Engine reuses the same Foundry compiler, runtime, trace and authority model as Priority Engine. The domain logic is different: need → candidate → fit → diligence → blockers → ranked next step.</p>
          <div className="ef-truthbar">
            <strong>INPUT-DRIVEN / NO OUTREACH</strong>
            <span>Scores reflect the values entered here. They are not verified partner claims, endorsements or confidence scores. This engine cannot contact anyone.</span>
          </div>
          <div className="ef-links"><Link to="/labs/engines">ENGINE FOUNDRY</Link><Link to="/labs">ALL LABS</Link><Link to="/">4PLANET</Link></div>
        </section>

        <section className="pe-shell">
          <section className="ef-panel pe-need">
            <div className="ef-panel-head"><div><span>01 · NEED</span><h2>Define the job before ranking actors.</h2></div><div className="ef-run-state"><b>{status}</b><small>{summary}</small></div></div>
            <div className="pe-need-grid">
              <label><span>TITLE</span><input value={need.title} onChange={(event) => { setNeed((current) => ({ ...current, title: event.target.value })); setResult(null); }} /></label>
              <label><span>MISSION / SYSTEM</span><input value={need.mission} onChange={(event) => { setNeed((current) => ({ ...current, mission: event.target.value })); setResult(null); }} /></label>
              <label><span>GEOGRAPHY</span><input value={need.geography ?? ""} onChange={(event) => { setNeed((current) => ({ ...current, geography: event.target.value })); setResult(null); }} /></label>
              <label className="pe-wide"><span>CAPABILITY NEEDED</span><input value={need.capabilityNeed} onChange={(event) => { setNeed((current) => ({ ...current, capabilityNeed: event.target.value })); setResult(null); }} /></label>
            </div>
          </section>

          <section className="ef-panel pe-candidates">
            <div className="ef-panel-head"><div><span>02 · CANDIDATES</span><h2>Compare without hiding uncertainty.</h2></div><button className="pe-add" type="button" onClick={() => { setCandidates((current) => [...current, candidateTemplate()]); setResult(null); }}>ADD CANDIDATE</button></div>
            <div className="pe-candidate-list">
              {candidates.map((candidate, index) => (
                <article className="pe-candidate" key={candidate.id}>
                  <div className="pe-candidate-head">
                    <div className="pe-fields">
                      <label><span>NAME</span><input value={candidate.name} onChange={(event) => updateCandidate(index, "name", event.target.value)} /></label>
                      <label><span>COUNTRY</span><input value={candidate.country} onChange={(event) => updateCandidate(index, "country", event.target.value)} /></label>
                      <label><span>ELIGIBILITY</span><select value={candidate.eligibility} onChange={(event) => updateCandidate(index, "eligibility", event.target.value as PartnerCandidate["eligibility"])}><option value="ELIGIBLE">ELIGIBLE</option><option value="UNKNOWN">UNKNOWN</option><option value="INELIGIBLE">INELIGIBLE</option></select></label>
                    </div>
                    <button type="button" className="pe-remove" onClick={() => { setCandidates((current) => current.filter((_, candidateIndex) => candidateIndex !== index)); setResult(null); }}>REMOVE</button>
                  </div>

                  <div className="pe-metrics">
                    {METRICS.map((metric) => (
                      <label key={metric.key}><span>{metric.label}<b>{candidate[metric.key]}</b></span><input type="range" min="0" max="100" value={candidate[metric.key]} onChange={(event) => updateCandidate(index, metric.key, Number(event.target.value))} /></label>
                    ))}
                  </div>

                  <div className="pe-flags">
                    <label><input type="checkbox" checked={candidate.asyncRoute} onChange={(event) => updateCandidate(index, "asyncRoute", event.target.checked)} />Async route available</label>
                    <label><input type="checkbox" checked={candidate.meetingRequired} onChange={(event) => updateCandidate(index, "meetingRequired", event.target.checked)} />Meeting / call required</label>
                    <label className="pe-source"><span>EVIDENCE REFS</span><input value={candidate.evidenceRefs.join(", ")} onChange={(event) => updateCandidate(index, "evidenceRefs", event.target.value.split(",").map((value) => value.trim()).filter(Boolean))} placeholder="Source ID, URL or BRAIN record" /></label>
                  </div>
                </article>
              ))}
            </div>
            <div className="ef-actions pe-actions"><button type="button" className="is-primary" onClick={run}>RUN PARTNER ENGINE</button><button type="button" onClick={reset}>RESET DEMO</button><button type="button" onClick={exportRun} disabled={!result}>EXPORT RUN JSON</button></div>
          </section>

          <section className="pe-output-grid">
            <div className="ef-panel">
              <span className="ef-mono">03 · RANKED PARTNERS</span>
              {output?.ranked.length ? output.ranked.map((candidate) => (
                <article className="pe-result" key={candidate.id}>
                  <div className="pe-result-top"><span>#{candidate.rank} · {candidate.recommendedNext}</span><strong>{candidate.score}</strong></div>
                  <h3>{candidate.name}</h3><p>{candidate.explanation}</p>
                  <div className="pe-badges"><small>{candidate.country || "COUNTRY UNKNOWN"}</small><small>{candidate.eligibility}</small>{candidate.requiredGates.map((gate) => <small key={gate}>{gate}</small>)}</div>
                  {candidate.diligenceGaps.length > 0 && <div className="pe-gaps"><b>DILIGENCE</b>{candidate.diligenceGaps.map((gap) => <span key={gap}>{gap}</span>)}</div>}
                </article>
              )) : <p className="ef-empty">Run Partner Engine to rank the current candidate set.</p>}
            </div>

            <div className="ef-panel">
              <span className="ef-mono">04 · BLOCKED</span>
              {output?.blocked.length ? output.blocked.map((candidate) => (
                <article className="pe-result is-blocked" key={candidate.id}><div className="pe-result-top"><span>{candidate.recommendedNext}</span><strong>{candidate.score}</strong></div><h3>{candidate.name}</h3><p>{candidate.blockers.join(" · ")}</p></article>
              )) : <p className="ef-empty">Ineligible or extreme-risk candidates will fail closed here.</p>}
            </div>
          </section>

          <section className="ef-panel ef-trace">
            <div className="ef-panel-head"><div><span>05 · SHARED RUNTIME TRACE</span><h2>Same machine. Different engine.</h2></div></div>
            {result ? result.trace.map((record, index) => <div className="ef-trace-row" key={`${record.sequence}-${record.stageId}`}><small>{String(index + 1).padStart(2, "0")}</small><b>{record.stageId}</b><span className={`is-${record.status.toLowerCase()}`}>{record.status}</span></div>) : <p className="ef-empty">VALIDATE → FIT → DILIGENCE → BLOCK → RANK will appear here.</p>}
          </section>

          <section className="ef-panel pe-transfer-proof">
            <span className="ef-mono">TRANSFER TEST</span>
            <div className="pe-proof-grid"><article><b>SHARED</b><p>EngineBlueprint compiler, runtime loop, authority check, failure model, run state and execution trace.</p></article><article><b>PARTNER-SPECIFIC</b><p>Partner input contract, fit factors, diligence gaps, actor blockers and next-action policy.</p></article><article><b>PASS CONDITION</b><p>The shared runtime remains unchanged and the second engine passes repository QA. Then we measure reuse and move toward composition.</p></article></div>
          </section>
        </section>
      </main>
    </PublicShell>
  );
}
