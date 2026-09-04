import { Link } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { Section } from "@/components/ui";
import { T } from "@/styles/tokens";
import { BAY_OF_BISCAY_SURVEY_ACTION, actionContractTruthSummary } from "@/impact/actionContract";

const mono: React.CSSProperties = { fontFamily: T.mono, fontSize: 10, letterSpacing: ".12em" };
const panel: React.CSSProperties = { border: `1px solid ${T.line}`, padding: "clamp(18px,2.4vw,28px)" };

export function BayActionProof() {
  const action = BAY_OF_BISCAY_SURVEY_ACTION;
  const truth = actionContractTruthSummary(action);

  return (
    <PublicShell>
      <Section pad="clamp(86px,10vw,136px)">
        <Link to="/impact" style={{ ...mono, color: T.blue }}>← IMPACT</Link>
        <div style={{ marginTop: 24, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <span style={{ ...mono, border: "1px solid #8A6500", color: "#8A6500", padding: "5px 8px" }}>ACTION CONTRACT 01</span>
          <span style={{ ...mono, border: `1px solid ${T.red}`, color: T.red, padding: "5px 8px" }}>{truth.readiness.replaceAll("_", " ")}</span>
          <span style={{ ...mono, border: `1px solid ${T.line}`, padding: "5px 8px" }}>NO PAYMENT · NO FUNDER COMMITMENT</span>
        </div>

        <p style={{ marginTop: 26, ...mono, color: T.blue }}>OCE4N_ · BAY OF BISCAY · UNIVERSAL IMPACT READINESS</p>
        <h1 style={{ marginTop: 16, fontFamily: T.display, fontSize: "clamp(46px,7vw,86px)", lineHeight: .96, letterSpacing: "-.04em", maxWidth: "13ch" }}>{action.title}</h1>
        <p style={{ marginTop: 22, maxWidth: "62ch", fontSize: "clamp(17px,2vw,21px)", lineHeight: 1.55, color: "rgba(8,8,8,.72)" }}>{action.need}</p>

        <div style={{ marginTop: 42, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", border: `1px solid ${T.line}` }}>
          <div style={panel}><div style={{ ...mono, color: T.blue }}>ACTOR</div><h2 style={{ marginTop: 12 }}>{action.actor.name}</h2><p style={{ lineHeight: 1.5 }}>{action.actor.role}</p><small>{action.actor.relationshipState.replaceAll("_", " ")}</small></div>
          <div style={panel}><div style={{ ...mono, color: T.blue }}>DELIVERY UNIT</div><h2 style={{ marginTop: 12 }}>{action.deliveryUnit}</h2><p style={{ lineHeight: 1.5 }}>Route geometry + observation hours + distance surveyed.</p></div>
          <div style={panel}><div style={{ ...mono, color: T.blue }}>FUNDING NEED</div><h2 style={{ marginTop: 12 }}>UNKNOWN</h2><p style={{ lineHeight: 1.5 }}>GBP amount and survey-day quantity remain closed until current ORCA costing and plan are confirmed.</p></div>
        </div>

        <div style={{ marginTop: 18, ...panel }}>
          <div style={{ ...mono, color: T.blue }}>BOUNDED ACTION</div>
          <p style={{ marginTop: 12, maxWidth: "80ch", fontSize: 16, lineHeight: 1.6 }}>{action.boundedAction}</p>
        </div>

        <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 18 }}>
          <div style={panel}>
            <div style={{ ...mono, color: T.red }}>BLOCKERS TO OPEN</div>
            <ol style={{ marginTop: 16, paddingLeft: 20, lineHeight: 1.6 }}>{action.blockers.map((blocker) => <li key={blocker}>{blocker}</li>)}</ol>
          </div>
          <div style={panel}>
            <div style={{ ...mono, color: T.blue }}>SUITABLE FUNDER TYPES · HYPOTHESIS</div>
            <ul style={{ marginTop: 16, paddingLeft: 20, lineHeight: 1.6 }}>{action.suitableFunderTypes.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        </div>

        <div style={{ marginTop: 18, ...panel }}>
          <div style={{ ...mono, color: T.blue }}>MILESTONES + REQUIRED EVIDENCE</div>
          <div style={{ marginTop: 14 }}>
            {action.milestones.map((milestone, index) => (
              <div key={milestone.id} style={{ display: "grid", gridTemplateColumns: "52px minmax(180px,.8fr) minmax(240px,1.2fr)", gap: 14, padding: "14px 0", borderTop: index ? `1px solid ${T.line}` : "none" }}>
                <span style={{ ...mono, color: T.blue }}>0{index + 1}</span>
                <strong>{milestone.label}</strong>
                <span style={{ fontSize: 13, lineHeight: 1.5, color: "rgba(8,8,8,.65)" }}>{milestone.evidenceRequired.join(" · ")}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 18, ...panel, borderColor: "#8A6500" }}>
          <div style={{ ...mono, color: "#8A6500" }}>CLAIM BOUNDARY</div>
          <p style={{ marginTop: 12, maxWidth: "82ch", lineHeight: 1.65 }}>{action.outcomeBoundary}</p>
        </div>

        <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", gap: 10 }}>
          {action.evidenceLinks.map((item) => <a key={item.href} href={item.href} style={{ ...mono, textDecoration: "none", border: `1px solid ${T.ink}`, color: T.ink, padding: "12px 14px" }}>{item.label.toUpperCase()} →</a>)}
        </div>
      </Section>
    </PublicShell>
  );
}
