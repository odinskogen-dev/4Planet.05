import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { Section } from "@/components/ui";
import { T } from "@/styles/tokens";
import { BAY_OF_BISCAY_SURVEY_ACTION, actionContractPublicProgrammeEvidence, actionContractTruthSummary } from "@/impact/actionContract";
import { actorForActionContract, actorIsPublic } from "@/content/actorGold";
import { ORCA_BAY_PARTNER_CELL, publicOrcaCellSources } from "@/partners/orcaPartnerCell";

const mono: CSSProperties = { fontFamily: T.mono, fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase" };
const panel: CSSProperties = { border: `1px solid ${T.line}`, padding: "clamp(18px,2.4vw,28px)", minWidth: 0 };
const body: CSSProperties = { margin: 0, maxWidth: "72ch", fontSize: 15, lineHeight: 1.65, color: "rgba(8,8,8,.72)" };
const grid: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))", gap: 14 };

function RuleList({ items }: { items: string[] }) {
  return <ul style={{ margin: "14px 0 0", paddingLeft: 18, lineHeight: 1.65 }}>{items.map((item) => <li key={item}>{item}</li>)}</ul>;
}

export function BayActionProof() {
  const action = BAY_OF_BISCAY_SURVEY_ACTION;
  const canonicalActor = actorForActionContract(action);
  const cell = ORCA_BAY_PARTNER_CELL;
  const truth = actionContractTruthSummary(action);
  const publicProgramme = actionContractPublicProgrammeEvidence(action);
  const surveys = publicProgramme.annualSurveys;
  const surveyDays = publicProgramme.annualSurveyDays;
  const publicSources = publicOrcaCellSources(cell);

  if (!canonicalActor) {
    return (
      <PublicShell>
        <Section pad="clamp(86px,10vw,136px)">
          <Link to="/impact" style={{ ...mono, color: T.blue }}>← IMPACT</Link>
          <p style={{ marginTop: 28, ...mono, color: T.red }}>IDENTITY UNRESOLVED</p>
          <h1 style={{ margin: "16px 0 0", fontFamily: T.display, fontSize: "clamp(48px,7.4vw,96px)", lineHeight: .91, letterSpacing: "-.045em", maxWidth: "12ch" }}>This action is not available.</h1>
          <p style={{ marginTop: 26, ...body }}>The action could not be bound to exactly one reviewed Actor Master record. Funding, delivery and impact claims remain closed.</p>
        </Section>
      </PublicShell>
    );
  }

  const publicActorProfilePath = actorIsPublic(canonicalActor) ? `/actors/${canonicalActor.slug}` : null;

  return (
    <PublicShell>
      <style>{`
        @media (max-width: 600px) {
          .impact-proof-ladder-row {
            grid-template-columns: minmax(0, 1fr) !important;
            gap: 12px !important;
          }
          .impact-proof-ladder-row > * { min-width: 0; }
        }
      `}</style>
      <Section pad="clamp(86px,10vw,136px)">
        <Link to="/impact" style={{ ...mono, color: T.blue }}>← IMPACT</Link>

        <div style={{ marginTop: 24, display: "flex", gap: 9, flexWrap: "wrap" }}>
          <span style={{ ...mono, border: "1px solid #8A6500", color: "#8A6500", padding: "6px 9px" }}>PARTNER CELL · ORCA / BAY</span>
          <span style={{ ...mono, border: `1px solid ${T.red}`, color: T.red, padding: "6px 9px" }}>{truth.readiness.replaceAll("_", " ")}</span>
          <span style={{ ...mono, border: `1px solid ${T.line}`, padding: "6px 9px" }}>FUNDING UNIT CLOSED</span>
        </div>

        <p style={{ marginTop: 28, ...mono, color: T.blue }}>OCE4N_ · REAL MONITORING → DECISION → ACTION → PROOF</p>
        <h1 style={{ margin: "16px 0 0", fontFamily: T.display, fontSize: "clamp(48px,7.4vw,96px)", lineHeight: .91, letterSpacing: "-.045em", maxWidth: "12ch" }}>A real route. A real monitoring programme. Proof without pretending.</h1>
        <p style={{ margin: "26px 0 0", maxWidth: "65ch", fontSize: "clamp(18px,2vw,23px)", lineHeight: 1.48, color: "rgba(8,8,8,.76)" }}>{cell.humanGold.thirtySecond}</p>

        <div style={{ marginTop: 40, ...grid }}>
          <div style={panel}>
            <div style={{ ...mono, color: T.blue }}>05 SEC</div>
            <p style={{ margin: "13px 0 0", fontSize: 18, lineHeight: 1.45 }}>{cell.humanGold.fiveSecond}</p>
          </div>
          <div style={panel}>
            <div style={{ ...mono, color: T.blue }}>DECISION</div>
            <p style={{ margin: "13px 0 0", fontSize: 18, lineHeight: 1.45 }}>{cell.humanGold.decision}</p>
          </div>
          <div style={panel}>
            <div style={{ ...mono, color: T.blue }}>VALUE TO ORCA</div>
            <p style={{ margin: "13px 0 0", fontSize: 18, lineHeight: 1.45 }}>Turn field effort into an inspectable public decision object without replacing ORCA's science or delivery authority.</p>
          </div>
        </div>
      </Section>

      <Section>
        <div style={{ ...mono, color: T.blue }}>01 · PLACE / BOUNDARY</div>
        <h2 style={{ margin: "14px 0 0", fontFamily: T.display, fontSize: "clamp(34px,4.5vw,62px)", lineHeight: 1 }}>Portsmouth → Bay of Biscay → Santander.</h2>
        <p style={{ marginTop: 18, ...body }}>{cell.place.boundary}</p>
        <div style={{ marginTop: 26, ...grid }}>
          <div style={panel}><div style={{ ...mono, color: T.blue }}>ACTOR</div><h3 style={{ margin: "12px 0 6px", fontSize: 24 }}>{canonicalActor.name}</h3><p style={body}>{cell.actor.role}</p><div style={{ marginTop: 12, ...mono }}>{cell.actor.relationshipState.replaceAll("_", " ")}</div>{publicActorProfilePath ? <Link to={publicActorProfilePath} style={{ display: "inline-block", marginTop: 12, ...mono, color: T.blue }}>OPEN CANONICAL ACTOR PROFILE →</Link> : <div style={{ marginTop: 12, ...mono, color: T.red }}>PUBLIC ACTOR PROFILE NOT AVAILABLE</div>}</div>
          <div style={panel}><div style={{ ...mono, color: T.blue }}>PROGRAMME RANGE</div><h3 style={{ margin: "12px 0 6px", fontSize: 24 }}>{surveys ? `${surveys.min}–${surveys.max} surveys` : "SOURCE CLEARANCE PENDING"}</h3><p style={body}>{surveyDays ? `${surveyDays.min}–${surveyDays.max} survey days.` : "No private-correspondence range is projected publicly without explicit source clearance."}</p><div style={{ marginTop: 12, ...mono }}>FAIL CLOSED · PUBLIC SOURCES ONLY</div></div>
          <div style={panel}><div style={{ ...mono, color: T.blue }}>PUBLIC CURRENT PROOF</div><h3 style={{ margin: "12px 0 6px", fontSize: 24 }}>22 JUN 2026</h3><p style={body}>ORCA publicly documents a Portsmouth–Santander survey through the English Channel and Bay of Biscay in June 2026.</p></div>
        </div>
      </Section>

      <Section>
        <div style={{ ...mono, color: T.blue }}>02 · WHAT IS ACTUALLY MEASURED?</div>
        <h2 style={{ margin: "14px 0 0", fontFamily: T.display, fontSize: "clamp(34px,4.5vw,62px)", lineHeight: 1 }}>Effort and observations are different evidence.</h2>
        <div style={{ marginTop: 26, ...grid }}>
          <div style={panel}>
            <div style={{ ...mono, color: T.blue }}>SURVEY EFFORT · DELIVERY EVIDENCE</div>
            <RuleList items={cell.monitoringSemantics.effort} />
          </div>
          <div style={panel}>
            <div style={{ ...mono, color: T.blue }}>BIOLOGICAL OBSERVATIONS</div>
            <RuleList items={cell.monitoringSemantics.observation} />
          </div>
        </div>
        <div style={{ marginTop: 14, border: `1px solid #8A6500`, padding: "clamp(18px,2.4vw,28px)" }}>
          <div style={{ ...mono, color: "#8A6500" }}>TRUTH RULES</div>
          <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>{cell.monitoringSemantics.rules.map((rule) => <span key={rule} style={{ ...mono, border: "1px solid rgba(138,101,0,.35)", padding: "8px 10px" }}>{rule}</span>)}</div>
        </div>
        <div style={{ marginTop: 26, ...grid }}>
          {action.independentEvidenceSources.map((source) => (
            <div key={source.id} style={panel}>
              <div style={{ ...mono, color: source.state === "CONNECTED" ? T.blue : T.red }}>INDEPENDENT EVIDENCE RELATIONSHIPS</div>
              <h3 style={{ margin: "12px 0 8px", fontSize: 20 }}>{source.relationship.replaceAll("_", " ")} · {source.state.replaceAll("_", " ")}</h3>
              <p style={body}>{source.supports}</p>
              <div style={{ marginTop: 12, ...mono }}>{source.publisher || "NO INDEPENDENT SOURCE CONNECTED"}</div>
              {source.sourceRef
                ? <a href={source.sourceRef} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 12, ...mono, color: T.blue }}>OPEN BOUNDED SOURCE DATA →</a>
                : <div style={{ marginTop: 12, ...mono, color: T.red }}>MRV GAP REMAINS OPEN</div>}
              <RuleList items={source.limitations} />
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div style={{ ...mono, color: T.blue }}>03 · WHY THIS IS MORE THAN A PRETTY WHALE PAGE</div>
        <h2 style={{ margin: "14px 0 0", fontFamily: T.display, fontSize: "clamp(34px,4.5vw,62px)", lineHeight: 1 }}>A monitoring programme becomes legible to the people who can enable it.</h2>
        <div style={{ marginTop: 26, ...grid }}>{cell.valueToOrca.map((value, index) => <div key={value} style={panel}><div style={{ ...mono, color: T.blue }}>0{index + 1}</div><p style={{ margin: "12px 0 0", lineHeight: 1.55, fontSize: 17 }}>{value}</p></div>)}</div>
        <div style={{ marginTop: 14, ...grid }}>{cell.publicEvidence.map((item) => <div key={item.headline} style={panel}><div style={{ ...mono, color: T.blue }}>PUBLIC EVIDENCE</div><h3 style={{ margin: "12px 0 8px", fontSize: 21, lineHeight: 1.25 }}>{item.headline}</h3><p style={body}>{item.detail}</p></div>)}</div>
      </Section>

      <Section>
        <div style={{ ...mono, color: T.red }}>04 · CAPITAL / ACTION SEAM</div>
        <h2 style={{ margin: "14px 0 0", fontFamily: T.display, fontSize: "clamp(34px,4.5vw,62px)", lineHeight: 1 }}>Not open yet — because the unit is not true yet.</h2>
        <p style={{ marginTop: 18, ...body }}>{action.boundedAction}</p>
        <div style={{ marginTop: 26, ...grid }}>
          <div style={{ ...panel, borderColor: "rgba(190,30,45,.45)" }}>
            <div style={{ ...mono, color: T.red }}>BLOCKERS</div>
            <RuleList items={cell.fundingSeam.blockers} />
          </div>
          <div style={panel}>
            <div style={{ ...mono, color: T.blue }}>NEXT TRUTH REQUIRED</div>
            <RuleList items={cell.fundingSeam.nextTruthRequired} />
          </div>
        </div>
      </Section>

      <Section>
        <div style={{ ...mono, color: T.blue }}>05 · PROOF LADDER</div>
        <h2 style={{ margin: "14px 0 0", fontFamily: T.display, fontSize: "clamp(34px,4.5vw,62px)", lineHeight: 1 }}>Every stronger claim needs a stronger state.</h2>
        <div data-testid="impact-proof-ladder" aria-label="Proof ladder" style={{ marginTop: 26, borderTop: `1px solid ${T.line}` }}>
          {cell.proofLadder.map((step, index) => (
            <div className="impact-proof-ladder-row" data-testid="impact-proof-ladder-row" key={step.state} style={{ display: "grid", gridTemplateColumns: "minmax(70px,.25fr) minmax(160px,.65fr) minmax(220px,1fr)", gap: 16, padding: "18px 0", borderBottom: `1px solid ${T.line}` }}>
              <span style={{ ...mono, color: T.blue }}>0{index + 1}</span>
              <div><strong>{step.state}</strong><p style={{ margin: "7px 0 0", fontSize: 13, lineHeight: 1.5 }}>{step.proves}</p></div>
              <div><span style={{ ...mono, color: T.red }}>DOES NOT PROVE</span><p style={{ margin: "7px 0 0", fontSize: 13, lineHeight: 1.5, color: "rgba(8,8,8,.68)" }}>{step.doesNotProve}</p></div>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div style={{ ...mono, color: T.blue }}>06 · SOURCES / PROVENANCE</div>
        <h2 style={{ margin: "14px 0 0", fontFamily: T.display, fontSize: "clamp(34px,4.5vw,62px)", lineHeight: 1 }}>Public evidence stays public. Uncleared correspondence stays private.</h2>
        <div style={{ marginTop: 26, ...grid }}>
          {publicSources.map((source) => (
            <a key={source.id} href={source.url ?? undefined} target="_blank" rel="noreferrer" style={{ ...panel, color: T.ink, textDecoration: "none", display: "block" }}>
              <div style={{ ...mono, color: T.blue }}>{source.authority}</div>
              <h3 style={{ margin: "12px 0 8px", fontSize: 20, lineHeight: 1.3 }}>{source.label}</h3>
              <p style={body}>{source.supports}</p>
              <div style={{ marginTop: 14, ...mono }}>SOURCE →</div>
            </a>
          ))}
          <div style={{ ...panel, borderStyle: "dashed" }}>
            <div style={{ ...mono, color: "#8A6500" }}>SOURCE CLEARANCE REQUIRED</div>
            <h3 style={{ margin: "12px 0 8px", fontSize: 20, lineHeight: 1.3 }}>Private programme facts are not public evidence.</h3>
            <p style={body}>Programme ranges derived from private correspondence stay out of this public projection until explicit source-specific clearance is recorded.</p>
          </div>
        </div>
      </Section>

      <Section>
        <div style={{ ...mono, color: T.blue }}>NEXT</div>
        <h2 style={{ margin: "14px 0 0", fontFamily: T.display, fontSize: "clamp(34px,4.5vw,62px)", lineHeight: 1 }}>Close the real unit. Then connect capital. Then prove delivery.</h2>
        <p style={{ marginTop: 18, ...body }}>{action.outcomeBoundary}</p>
        <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", gap: 10 }}>
          <Link to="/species/orca" style={{ ...mono, textDecoration: "none", border: `1px solid ${T.ink}`, color: T.ink, padding: "12px 14px" }}>ORCA SPECIES INTELLIGENCE →</Link>
          <Link to="/impact/lab" style={{ ...mono, textDecoration: "none", border: `1px solid ${T.ink}`, color: T.ink, padding: "12px 14px" }}>IMPACT PROOF STATES →</Link>
          <Link to="/actors" style={{ ...mono, textDecoration: "none", border: `1px solid ${T.ink}`, color: T.ink, padding: "12px 14px" }}>ACTORS →</Link>
        </div>
      </Section>
    </PublicShell>
  );
}
