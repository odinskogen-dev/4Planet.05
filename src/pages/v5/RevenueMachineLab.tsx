import { useEffect } from "react";
import { Link } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { T } from "@/styles/tokens";

const ARMS = [
  ["MISSION SUPPORTER", "Standardised B2B support for a named Mission or programme."],
  ["PROJECT SUPPORTER", "Bounded project funding with clear scope, attribution and reporting."],
  ["PILOT FUNDER", "A larger proof package with explicit deliverables and learning."],
  ["MEMBERSHIP", "Recurring support built on a durable member value proposition."],
  ["DONATION", "A true gift route only where legal and accounting semantics are valid."],
  ["IMPACT UNITS", "Payment connected to uniquely allocated ecological delivery and proof."],
  ["CAMPAIGN / SPONSOR", "Activation and distribution value with strict claims boundaries."],
  ["DIGITAL / INTELLIGENCE", "Later subscriptions, reports, data, API or decision products."],
] as const;

const GATES = ["TRUTH", "ACTOR INTELLIGENCE", "SELF-INTEREST", "INCENTIVE DESIGN", "OFFER FIT", "NARRATIVE", "BRAND", "VISUALS", "FRICTION", "CLAIMS", "RED TEAM", "ERROR QA"];

export default function RevenueMachineLab() {
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
    return () => { if (created) target?.remove(); else if (target && previous != null) target.content = previous; };
  }, []);

  return (
    <PublicShell>
      <main style={{ background: "#080808", color: "#fff", minHeight: "100vh" }}>
        <section style={{ maxWidth: 1240, margin: "0 auto", padding: "clamp(104px,14vw,180px) clamp(20px,5vw,72px) 80px" }}>
          <div className="mono" style={{ fontSize: 11, letterSpacing: ".12em", color: "rgba(255,255,255,.52)" }}>4PLANET LABS · ACTIVE BUILD</div>
          <h1 style={{ fontSize: "clamp(44px,7vw,86px)", lineHeight: .96, letterSpacing: "-.055em", maxWidth: 980, marginTop: 22, fontWeight: 500 }}>ZERO FOUNDER CASH_</h1>
          <p style={{ fontSize: "clamp(20px,2.4vw,30px)", lineHeight: 1.34, maxWidth: 820, marginTop: 30, color: "rgba(255,255,255,.82)" }}>One revenue body. Many income arms. The system should learn from every qualified transaction without creating a second BRAIN.</p>
          <div style={{ marginTop: 44, display: "flex", gap: 18, flexWrap: "wrap" }}>
            <span className="mono" style={{ fontSize: 11, border: "1px solid rgba(255,255,255,.2)", padding: "10px 12px" }}>HIGH-LEVERAGE LABS PRIORITY</span>
            <span className="mono" style={{ fontSize: 11, border: "1px solid rgba(255,255,255,.2)", padding: "10px 12px" }}>RAIL C · MONEY + DELIVERY</span>
          </div>
        </section>

        <section style={{ borderTop: "1px solid rgba(255,255,255,.14)", borderBottom: "1px solid rgba(255,255,255,.14)" }}>
          <div style={{ maxWidth: 1240, margin: "0 auto", padding: "72px clamp(20px,5vw,72px)" }}>
            <div className="mono" style={{ fontSize: 11, color: "rgba(255,255,255,.48)", letterSpacing: ".1em" }}>THE OCTOPUS</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", marginTop: 24, borderTop: "1px solid rgba(255,255,255,.14)", borderLeft: "1px solid rgba(255,255,255,.14)" }}>
              {ARMS.map(([name, body], i) => <div key={name} style={{ padding: 24, minHeight: 170, borderRight: "1px solid rgba(255,255,255,.14)", borderBottom: "1px solid rgba(255,255,255,.14)" }}><div className="mono" style={{ fontSize: 10, color: "#6ea7ff" }}>{String(i + 1).padStart(2, "0")}</div><h2 style={{ fontSize: 18, marginTop: 18, fontWeight: 500 }}>{name}</h2><p style={{ fontSize: 14, lineHeight: 1.55, color: "rgba(255,255,255,.62)", marginTop: 10 }}>{body}</p></div>)}
            </div>
          </div>
        </section>

        <section style={{ maxWidth: 1240, margin: "0 auto", padding: "72px clamp(20px,5vw,72px)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 48 }}>
            <div>
              <div className="mono" style={{ fontSize: 11, color: "rgba(255,255,255,.48)", letterSpacing: ".1em" }}>FIRST PROOF</div>
              <h2 style={{ fontSize: "clamp(28px,4vw,48px)", lineHeight: 1.05, letterSpacing: "-.04em", marginTop: 18, fontWeight: 500 }}>One complete transaction. Zero Founder minutes.</h2>
              <p style={{ color: "rgba(255,255,255,.68)", lineHeight: 1.65, marginTop: 22 }}>Discover → understand → trust → choose → accept → pay → accounting → fulfilment → reporting → learning.</p>
            </div>
            <div>
              <div className="mono" style={{ fontSize: 11, color: "rgba(255,255,255,.48)", letterSpacing: ".1em" }}>CURRENT BUILD</div>
              <p style={{ color: "rgba(255,255,255,.76)", lineHeight: 1.65, marginTop: 18 }}>The first commerce slice is isolated on <b>feat/zero-founder-cash-v1</b>: three B2B offer hypotheses, company details, attribution, terms and a server-side checkout adapter with live payments disabled by default.</p>
              <a href="https://github.com/odinskogen-dev/4Planet.05/tree/feat/zero-founder-cash-v1" target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: 24, color: "#8db8ff", textDecoration: "none", fontWeight: 500 }}>OPEN COMMERCE BRANCH ↗</a>
            </div>
          </div>
        </section>

        <section style={{ background: "#f4f3ef", color: T.ink }}>
          <div style={{ maxWidth: 1240, margin: "0 auto", padding: "72px clamp(20px,5vw,72px)" }}>
            <div className="mono" style={{ fontSize: 11, color: T.faint, letterSpacing: ".1em" }}>PATAGONIA QUALITY · FAIL CLOSED</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 22 }}>{GATES.map((x) => <span key={x} className="mono" style={{ fontSize: 10, letterSpacing: ".08em", border: `1px solid ${T.lineStrong}`, padding: "9px 11px", background: "#fff" }}>{x}</span>)}</div>
            <p style={{ maxWidth: 820, marginTop: 28, lineHeight: 1.7, color: T.dim }}>If a material hard gate fails, the system does not send and does not activate a live purchase path. Conversion can never outrank truth, claims integrity or brand quality.</p>
          </div>
        </section>

        <section style={{ maxWidth: 1240, margin: "0 auto", padding: "72px clamp(20px,5vw,72px) 110px" }}>
          <div className="mono" style={{ fontSize: 11, color: "rgba(255,255,255,.48)", letterSpacing: ".1em" }}>LEARNING LOOP</div>
          <p style={{ fontSize: "clamp(22px,3vw,34px)", lineHeight: 1.35, maxWidth: 920, marginTop: 20 }}>Run → outcome → Learning Record → evidence review → versioned rule/offer/journey change → regression test → next version.</p>
          <p style={{ color: "rgba(255,255,255,.6)", lineHeight: 1.65, marginTop: 22, maxWidth: 780 }}>No silent self-authored truth. No second BRAIN. No unreviewed global learning from one case. The point is compounding evidence, not autonomous theatre.</p>
          <Link to="/labs" style={{ display: "inline-block", marginTop: 34, color: "#8db8ff", textDecoration: "none", fontWeight: 500 }}>BACK TO LABS →</Link>
        </section>
      </main>
    </PublicShell>
  );
}
