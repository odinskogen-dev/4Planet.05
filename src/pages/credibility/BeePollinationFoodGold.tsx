import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { T } from "@/styles/tokens";

const nodes = [
  {
    n: "01",
    label: "POLLINATORS",
    title: "Bees are important pollinators — and not the only ones.",
    body: "Pollination is carried out by multiple animal groups. This proof begins with bees because they are a clear way into the relationship, not because every crop depends on honey bees.",
    state: "SOURCE",
    sourceLabel: "FAO — Pollination services",
    sourceUrl: "https://www.fao.org/pollination/en/",
  },
  {
    n: "02",
    label: "POLLINATION",
    title: "Many crop plants depend at least partly on animal pollination.",
    body: "Dependence varies by crop. The relationship matters for food production, but it is not a claim that all crops, calories or food depend on animal pollination.",
    state: "SOURCE",
    sourceLabel: "FAO — Pollination services",
    sourceUrl: "https://www.fao.org/pollination/en/",
  },
  {
    n: "03",
    label: "APPLE",
    title: "An apple makes the dependency visible.",
    body: "A bounded UK study across four commercial apple varieties found that pollination supply and contribution vary among pollinator groups and varieties. That is the case we use here — not a universal rule for agriculture.",
    state: "SOURCE",
    sourceLabel: "Garratt et al. — PLOS ONE",
    sourceUrl: "https://doi.org/10.1371/journal.pone.0153889",
  },
  {
    n: "04",
    label: "FOOD SYSTEM",
    title: "Ecological relationships become human dependencies.",
    body: "The apple is one concrete bridge from ecological function to food production. 4PLANET context stops there rather than turning one example into the slogan ‘no bees = no food’.",
    state: "4PLANET CONTEXT",
    sourceLabel: "Bounded synthesis of the two sources above",
    sourceUrl: "https://www.fao.org/pollination/en/",
  },
] as const;

export default function BeePollinationFoodGold() {
  return (
    <PublicShell>
      <section style={{ minHeight: "82svh", display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(320px,.75fr)", borderBottom: `1px solid ${T.ink}` }}>
        <div style={{ padding: "clamp(94px,12vw,164px) clamp(20px,5vw,72px) clamp(60px,8vw,100px)", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 52 }}>
          <div>
            <div style={{ ...mono, color: T.blue }}>RELATIONSHIP / POLLINATION → FOOD</div>
            <h1 style={{ ...display, margin: "clamp(42px,7vw,88px) 0 0", fontSize: "clamp(58px,9vw,126px)" }}>
              An apple begins<br />with a relationship.
            </h1>
          </div>
          <p style={{ margin: 0, maxWidth: 820, fontSize: "clamp(21px,2.5vw,33px)", lineHeight: 1.2, letterSpacing: "-.028em" }}>
            Species become functions. Functions support crops. Crops become food. The useful part is seeing the chain without pretending it is simpler than it is.
          </p>
        </div>

        <div aria-label="Original relationship illustration: pollinators to apple" style={{ background: "#F3F2EE", padding: "clamp(80px,10vw,140px) clamp(28px,5vw,72px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: "min(100%,520px)" }}>
            {["POLLINATORS", "POLLINATION", "APPLE", "FOOD"].map((label, index) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <div style={{ width: "clamp(90px,10vw,132px)", height: "clamp(90px,10vw,132px)", borderRadius: "50%", border: `1px solid ${index === 2 ? T.red : T.ink}`, background: index === 2 ? T.red : "transparent", color: index === 2 ? "#fff" : T.ink, display: "grid", placeItems: "center", flex: "0 0 auto" }}>
                  <span style={{ ...mono, textAlign: "center", fontSize: 9.5 }}>{label}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ ...mono, color: T.dim }}>0{index + 1}</div>
                  {index < 3 && <div aria-hidden style={{ height: 38, width: 1, background: T.ink, margin: "8px 0 8px 18px" }} />}
                </div>
              </div>
            ))}
            <p style={{ margin: "28px 0 0", fontSize: 12.5, lineHeight: 1.55, color: T.dim }}>
              Original 4PLANET relationship diagram. No external documentary image is used in this proof object, so no image is being presented as evidence.
            </p>
          </div>
        </div>
      </section>

      <main style={{ maxWidth: 1380, margin: "0 auto", padding: "0 clamp(20px,5vw,72px)" }}>
        <section style={{ padding: "clamp(76px,10vw,142px) 0" }}>
          <div style={{ ...mono, color: T.blue }}>THE CHAIN</div>
          <h2 style={{ ...display, margin: "18px 0 0", fontSize: "clamp(44px,6.5vw,88px)", maxWidth: 1080 }}>What depends on what?</h2>
          <div style={{ marginTop: 48 }}>
            {nodes.map((node, index) => (
              <article key={node.n} className="bee-gold-row" style={{ display: "grid", gridTemplateColumns: "90px minmax(180px,.55fr) minmax(0,1.2fr)", gap: "clamp(18px,4vw,56px)", padding: "30px 0", borderTop: `1px solid ${T.line}` }}>
                <div style={{ ...mono, color: T.dim }}>{node.n}</div>
                <div>
                  <div style={{ ...mono, color: node.state === "SOURCE" ? "#0B7A39" : T.blue }}>{node.state}</div>
                  <div style={{ ...display, fontSize: "clamp(28px,3.6vw,46px)", marginTop: 12 }}>{node.label}</div>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontFamily: T.display, fontWeight: 500, fontSize: "clamp(23px,2.8vw,36px)", letterSpacing: "-.03em", lineHeight: 1.05 }}>{node.title}</h3>
                  <p style={{ margin: "14px 0 0", fontSize: 15, lineHeight: 1.6, color: T.dim }}>{node.body}</p>
                  <a href={node.sourceUrl} target="_blank" rel="noreferrer" style={{ ...mono, display: "inline-block", marginTop: 16, color: T.blue, textDecoration: "none" }}>{node.sourceLabel} ↗</a>
                </div>
                {index === nodes.length - 1 ? null : <span aria-hidden />}
              </article>
            ))}
          </div>
        </section>

        <section style={{ padding: "clamp(70px,9vw,126px) 0", borderTop: `1px solid ${T.ink}` }}>
          <div style={{ ...mono, color: T.red }}>PRESSURES</div>
          <h2 style={{ ...display, margin: "18px 0 0", fontSize: "clamp(42px,6vw,80px)", maxWidth: 1040 }}>A relationship can weaken for more than one reason.</h2>
          <p style={{ margin: "24px 0 0", maxWidth: 860, fontSize: 18, lineHeight: 1.62 }}>
            Habitat and forage change, pesticide exposure, disease and climate/phenology can all matter to pollinators in different contexts. This candidate does not imply that every pressure is equally important everywhere, or that honey-bee health is a proxy for all wild pollinators.
          </p>
        </section>

        <section style={{ padding: "clamp(70px,9vw,126px) 0", borderTop: `1px solid ${T.ink}` }}>
          <div style={{ ...mono, color: T.acid }}>RESPONSES</div>
          <h2 style={{ ...display, margin: "18px 0 0", fontSize: "clamp(42px,6vw,80px)", maxWidth: 1040 }}>Support the function, not a slogan.</h2>
          <p style={{ margin: "24px 0 0", maxWidth: 860, fontSize: 18, lineHeight: 1.62 }}>
            Relevant response categories can include habitat and forage, reduced pesticide risk and agricultural practices that support diverse pollinator communities. Evidence strength and local relevance still have to be assessed before any specific intervention is presented as effective for a place.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 28 }}>
            <Link to="/living-systems" style={primaryButton}>Explore Living Systems →</Link>
            <Link to="/impact" style={secondaryButton}>See Impact pathways in development</Link>
          </div>
        </section>

        <section style={{ padding: "clamp(60px,8vw,110px) 0 clamp(90px,11vw,150px)", borderTop: `1px solid ${T.ink}` }}>
          <div style={{ ...mono, color: T.blue }}>THE LIMIT THAT MATTERS</div>
          <p style={{ ...display, margin: "22px 0 0", fontSize: "clamp(38px,5.5vw,72px)", maxWidth: 1100 }}>
            Bees are not all pollinators. Apples are not all food. The point is the relationship — not the simplification.
          </p>
        </section>
      </main>

      <style>{`@media(max-width:820px){#main-content>section:first-child{grid-template-columns:1fr!important}.bee-gold-row{grid-template-columns:60px 1fr!important}.bee-gold-row>div:last-of-type{grid-column:2}}@media(max-width:560px){.bee-gold-row{grid-template-columns:1fr!important}.bee-gold-row>div:last-of-type{grid-column:auto}}`}</style>
    </PublicShell>
  );
}

const display: CSSProperties = { fontFamily: T.display, fontWeight: 500, letterSpacing: "-.055em", lineHeight: .92 };
const mono: CSSProperties = { fontFamily: T.mono, fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase" };
const primaryButton: CSSProperties = { display: "inline-flex", padding: "12px 16px", border: `1px solid ${T.ink}`, background: T.ink, color: "#fff", textDecoration: "none", fontSize: 13 };
const secondaryButton: CSSProperties = { ...primaryButton, background: "#fff", color: T.ink };
