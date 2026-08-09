import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { Label, Section } from "@/components/ui";
import { T } from "@/styles/tokens";
import {
  POLLINATION_DECISION_PACKS,
  buildLensSensitivityView,
  projectDecisionPackForLivingSystems,
  type DecisionPack,
} from "@/brain/decision";

const mono: React.CSSProperties = { fontFamily: T.mono, fontSize: 10, letterSpacing: ".11em" };
const panel: React.CSSProperties = { border: `1px solid ${T.line}`, padding: "clamp(18px,2.5vw,28px)" };
const scenarioKeys = ["FARM", "MUNICIPALITY", "FUNDER", "4PLANET"] as const;
type ScenarioKey = (typeof scenarioKeys)[number];
const scenarioLabel: Record<ScenarioKey, string> = { FARM: "LAND MANAGER", MUNICIPALITY: "MUNICIPALITY", FUNDER: "FUNDER", "4PLANET": "4PLANET" };

function ScenarioButton({ id, active, onClick }: { id: ScenarioKey; active: boolean; onClick: () => void }) {
  return <button onClick={onClick} style={{ ...mono, border: `1px solid ${active ? T.blue : T.line}`, background: active ? T.blue : "transparent", color: active ? "#fff" : T.ink, padding: "10px 12px", cursor: "pointer" }}>{scenarioLabel[id]}</button>;
}

function EvidenceState({ direction }: { direction: "SUPPORTS" | "QUALIFIES" | "CHALLENGES" }) {
  const color = direction === "SUPPORTS" ? T.acid : direction === "CHALLENGES" ? T.red : "#8A6500";
  return <span style={{ ...mono, border: `1px solid ${color}`, color, padding: "4px 6px" }}>{direction}</span>;
}

export function PollinationDecisionProof() {
  const [scenario, setScenario] = useState<ScenarioKey>("MUNICIPALITY");
  const pack: DecisionPack = POLLINATION_DECISION_PACKS[scenario];
  const projection = useMemo(() => projectDecisionPackForLivingSystems(pack), [pack]);
  const lens = useMemo(() => buildLensSensitivityView(pack.options, "EVIDENCE_CONFIDENCE"), [pack]);

  return (
    <PublicShell>
      <Section pad="clamp(72px,9vw,124px)">
        <Link to="/living-systems" style={{ ...mono, color: T.blue }}>← LIVING SYSTEMS</Link>
        <div style={{ marginTop: 32 }}><Label color={T.blue}>INTERNAL PRODUCT PROOF · DECISION INTELLIGENCE</Label></div>
        <h1 style={{ marginTop: 20, maxWidth: 1000, fontFamily: T.display, fontSize: "clamp(46px,7.5vw,106px)", lineHeight: .9, letterSpacing: "-.05em" }}>
          Decision Intelligence for a Living Planet.
        </h1>
        <p style={{ marginTop: 28, maxWidth: 790, fontSize: "clamp(17px,2vw,21px)", lineHeight: 1.55 }}>
          A bounded proof of how 4PLANET can move from living-system understanding to options, evidence, trade-offs and possible next actions — without turning uncertainty into certainty or decision support into an automated decision.
        </p>
        <p style={{ marginTop: 14, maxWidth: 790, color: T.dim, fontSize: 13.5, lineHeight: 1.55 }}>
          Pollination → Food · contextual Decision Pack v1 · not independently expert validated. Source Registry pointers shown by this prototype are not yet equivalent to immutable Source Records.
        </p>

        <div style={{ marginTop: 34, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {scenarioKeys.map((id) => <ScenarioButton key={id} id={id} active={scenario === id} onClick={() => setScenario(id)} />)}
        </div>

        <div style={{ ...panel, marginTop: 24, borderColor: T.blue }}>
          <div style={{ ...mono, color: T.blue }}>DECISION QUESTION · {pack.status.replace(/_/g, " ")}</div>
          <h2 style={{ marginTop: 16, maxWidth: 1000, fontFamily: T.display, fontSize: "clamp(30px,4vw,52px)", lineHeight: 1.02, letterSpacing: "-.035em" }}>{pack.question.text}</h2>
          <p style={{ marginTop: 16, maxWidth: 820, color: T.dim, lineHeight: 1.55 }}>{pack.question.objective}</p>
          <div style={{ marginTop: 20, ...mono, color: "#8A6500" }}>PLACE / EVIDENCE SCOPE · {pack.context.place.label.toUpperCase()} · {pack.context.place.evidenceScope}</div>
          <p style={{ marginTop: 10, fontSize: 12.5, color: T.dim }}>{pack.context.place.transferBoundary}</p>
        </div>

        <div className="tw" style={{ marginTop: 24 }}>
          {projection.sections.map((section) => (
            <article key={section.id} style={panel}>
              <div style={{ ...mono, color: T.blue }}>{section.title}</div>
              <p style={{ marginTop: 14, fontSize: 15.5, lineHeight: 1.6 }}>{section.summary}</p>
              {section.disclosure && <p style={{ marginTop: 12, color: T.dim, fontSize: 12.5, lineHeight: 1.5 }}><strong>BOUNDARY:</strong> {section.disclosure}</p>}
            </article>
          ))}
        </div>

        <section style={{ marginTop: 72 }}>
          <div style={{ ...mono, color: T.blue }}>OPTIONS · MULTIDIMENSIONAL, NOT RANKED</div>
          <h2 style={{ marginTop: 14, fontFamily: T.display, fontSize: "clamp(36px,5vw,68px)", letterSpacing: "-.04em" }}>What may help depends on the decision.</h2>
          <div className="three" style={{ marginTop: 28 }}>
            {pack.options.map((option) => {
              const evidence = option.dimensions.find((d) => d.dimension === "EFFECTIVENESS_EVIDENCE");
              const transfer = option.dimensions.find((d) => d.dimension === "TRANSFERABILITY");
              const uncertainty = option.dimensions.find((d) => d.dimension === "UNCERTAINTY");
              const metricRows = [["EVIDENCE", evidence], ["TRANSFER", transfer], ["UNCERTAINTY", uncertainty]] as const;
              return <article key={option.optionId} style={panel}>
                <div style={{ ...mono, color: T.blue }}>{option.optionId}</div>
                <h3 style={{ marginTop: 14, fontFamily: T.display, fontSize: 29, lineHeight: 1.03 }}>{option.label}</h3>
                <p style={{ marginTop: 14, color: T.dim, lineHeight: 1.55 }}>{option.relevance.value}</p>
                {metricRows.map(([label, dimension]) => dimension && <div key={label} style={{ marginTop: 16, borderTop: `1px solid ${T.line}`, paddingTop: 10 }}><span style={{ ...mono, color: T.dim }}>{label}</span><div style={{ marginTop: 6, fontSize: 13 }}>{dimension.rating} · {dimension.confidence}</div></div>)}
              </article>;
            })}
          </div>
          <p style={{ marginTop: 16, maxWidth: 840, fontSize: 12.5, color: T.dim, lineHeight: 1.55 }}>
            LENS_SENSITIVITY_V1 compares explicit dimensions pairwise. “Dominates” inside a lens means only “no worse on the known priority dimensions represented here”; it is not a recommendation or universal ranking. No aggregate score exists.
          </p>
          <div style={{ ...panel, marginTop: 18 }}>
            <div style={{ ...mono, color: T.blue }}>EVIDENCE CONFIDENCE LENS · {lens.comparisons.length} PAIRWISE RELATIONS</div>
            {lens.comparisons.map((comparison) => <div key={`${comparison.optionA}-${comparison.optionB}`} style={{ marginTop: 12, fontSize: 13.5, lineHeight: 1.5 }}><strong>{comparison.optionA}</strong> ↔ <strong>{comparison.optionB}</strong> · {comparison.relation.replace(/_/g, " ")}<div style={{ color: T.dim, marginTop: 3 }}>{comparison.explanation}</div></div>)}
          </div>
        </section>

        <section style={{ marginTop: 72 }}>
          <div style={{ ...mono, color: T.blue }}>EVIDENCE · CONFLICTS STAY VISIBLE</div>
          <div className="tw" style={{ marginTop: 22 }}>
            {pack.evidence.length ? pack.evidence.map((item) => <article key={item.id} style={panel}>
              <EvidenceState direction={item.direction} />
              <p style={{ marginTop: 15, fontSize: 15, lineHeight: 1.58 }}>{item.claim.value}</p>
              <p style={{ marginTop: 12, ...mono, color: T.dim }}>{item.evidenceStrength} · {item.geography ?? "CONTEXT VARIES"}</p>
            </article>) : <div style={panel}><p style={{ color: T.dim }}>This scenario is primarily a 4PLANET assessment of evidence/gap infrastructure; no evidence item is silently invented to make the panel look complete.</p></div>}
          </div>
        </section>

        <div style={{ ...panel, marginTop: 72, background: "#fafafa" }}>
          <div style={{ ...mono, color: T.red }}>TRUTH BOUNDARY</div>
          <p style={{ marginTop: 14, maxWidth: 940, lineHeight: 1.6 }}>
            No universal best option. Relevance is not effectiveness. Implementation is not outcome. Expected outcome is not observed outcome. Policy is not result. Actor is not partner. Global or transferred evidence is not local evidence. Database absence is not real-world absence.
          </p>
          <p style={{ marginTop: 14, color: T.dim, fontSize: 12.5 }}>This branch is an internal product proof and is not a public release, deployed decision service, agronomic prescription, funding recommendation or automated decision system.</p>
        </div>
      </Section>
    </PublicShell>
  );
}
