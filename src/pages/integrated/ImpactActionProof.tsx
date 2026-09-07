import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { Section } from "@/components/ui";
import { T } from "@/styles/tokens";
import { BAY_OF_BISCAY_SURVEY_ACTION, actionContractTruthSummary } from "@/impact/actionContract";
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
  const cell = ORCA_BAY_PARTNER_CELL;
  const truth = actionContractTruthSummary(action);
  const surveys = truth.confirmedAnnualSurveys;
  const surveyDays = truth.confirmedAnnualSurveyDays;
  const publicSources = publicOrcaCellSources(cell);

  return (
    <PublicShell>
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
          <div style={panel}><div style={{ ...mono, color: T.blue }}>ACTOR</div><h3 style={{ margin: "12px 0 6px", fontSize: 24 }}>{cell.actor.name}</h3><p style={body}>{cell.actor.role}</p><div style={{ marginTop: 12, ...mono }}>{cell.actor.relationshipState.replaceAll("_", " ")}</div></div>
          <div style={panel}><div style={{ ...mono, color: T.blue }}>2026 · PARTNER-CONFIRMED RANGE</div><h3 style={{ margin: "12px 0 6px", fontSize: 24 }}>{surveys ? `${surveys.min}–${surveys.max} surveys` : "—"}</h3><p style={body}>{surveyDays ? `${surveyDays.min}–${surveyDays.max} survey days across four-day return crossings.` : "Survey-day range unresolved."}</p><div style={{ marginTop: 12, ...mono }}>STEVE JONES · ORCA · 4 SEP 2026 · INTERNAL SOURCE</div></div>
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
        <div style={{ marginTop: 26, borderTop: `1px solid ${T.line}` }}>
          {cell.proofLadder.map((step, index) => (
            <div key={step.state} style={{ display: "grid", gridTemplateColumns: "minmax(70px,.25fr) minmax(160px,.65fr) minmax(220px,1fr)", gap: 16, padding: "18px 0", borderBottom: `1px solid ${T.line}` }}>
              <span style={{ ...mono, color: T.blue }}>0{index + 1}</span>
              <div><strong>{step.state}</strong><p style={{ margin: "7px 0 0", fontSize: 13, lineHeight: 1.5 }}>{step.proves}</p></div>
              <div><span style={{ ...mono, color: T.red }}>DOES NOT PROVE</span><p style={{ margin: "7px 0 0", fontSize: 13, lineHeight: 1.5, color: "rgba(8,8,8,.68)" }}>{step.doesNotProve}</p></div>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div style={{ ...mono, color: T.blue }}>06 · SOURCES / PROVENANCE</div>
        <h2 style={{ margin: "14px 0 0", fontFamily: T.display, fontSize: "clamp(34px,4.5vw,62px)", lineHeight: 1 }}>Public evidence stays public. Partner evidence stays attributable.</h2>
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
            <div style={{ ...mono, color: "#8A6500" }}>PARTNER CORRESPONDENCE</div>
            <h3 style={{ margin: "12px 0 8px", fontSize: 20, lineHeight: 1.3 }}>Steve Jones · ORCA · 4 Sep 2026</h3>
            <p style={body}>Supports the current 10–12 survey / 40–48 survey-day planning range. It does not establish current sponsorship price, funded unit or public impact claim.</p>
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
