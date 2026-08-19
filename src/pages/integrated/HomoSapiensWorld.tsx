import { Link, useLocation } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { T, DOMAIN_ACCENT } from "@/styles/tokens";
import { content } from "@/content/contentRepository";
import { contextHref } from "@/product/ProductNav";

const TAXON_URL = "https://www.gbif.org/species/10856082";
const TAXON_ID = "taxon:gbif:10856082";
const accent = DOMAIN_ACCENT["S4PIENS_"];

const mono: React.CSSProperties = {
  fontFamily: T.mono,
  fontSize: 10.5,
  letterSpacing: ".14em",
  textTransform: "uppercase",
};

export default function HomoSapiensWorld() {
  const location = useLocation();
  const humanMissions = content.getMissionsByDomain("S4PIENS_");

  return (
    <PublicShell>
      <main className="human-world">
        <section className="human-world__hero">
          <div style={{ position: "relative", zIndex: 1, maxWidth: 1120 }}>
            <div style={{ ...mono, color: accent }}>4PLANET SPECIES_ · S4PIENS_</div>
            <h1 style={{ marginTop: 18, fontFamily: T.display, fontWeight: 500, fontSize: "clamp(52px,8vw,124px)", lineHeight: .86, letterSpacing: "-.055em", maxWidth: "9ch" }}>
              Homo sapiens
            </h1>
            <p style={{ marginTop: 18, fontStyle: "italic", color: "rgba(255,255,255,.64)", fontSize: "clamp(17px,1.8vw,24px)" }}>
              Human
            </p>
            <p style={{ marginTop: 26, maxWidth: "26ch", fontFamily: T.display, fontWeight: 500, fontSize: "clamp(24px,3vw,44px)", lineHeight: 1.06, letterSpacing: "-.03em" }}>
              We are not outside the living system.
            </p>
            <p style={{ marginTop: 18, maxWidth: 720, color: "rgba(255,255,255,.82)", fontSize: "clamp(15px,1.4vw,19px)", lineHeight: 1.62 }}>
              We eat, drink, build, move, heat, cool, wear and make things. Every one of those needs passes through land, water, energy, materials and other forms of life. This Species World starts with us — then follows the connections outward.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 30 }}>
              <Link to={contextHref("/living-systems", location.search, { entity: TAXON_ID, journey: "sapiens" })} style={{ ...mono, background: "#fff", color: "#000", padding: "13px 18px" }}>
                FOLLOW OUR DEPENDENCIES →
              </Link>
              <Link to={contextHref("/atlas", location.search, { entity: TAXON_ID, journey: "sapiens" })} style={{ ...mono, color: "#fff", border: "1px solid rgba(255,255,255,.42)", padding: "12px 18px" }}>
                SEE THE PLANET
              </Link>
            </div>
          </div>
        </section>

        <section style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(64px,9vw,130px) clamp(20px,5vw,72px)" }}>
          <div style={{ ...mono, color: accent }}>WHAT WE KNOW · WHAT THIS PAGE MEANS</div>
          <h2 style={{ marginTop: 12, fontFamily: T.display, fontWeight: 500, fontSize: "clamp(30px,4vw,62px)", lineHeight: .98, letterSpacing: "-.04em", maxWidth: "15ch" }}>
            Start with identity. Keep the pressure claims bounded.
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))", borderTop: "1px solid rgba(255,255,255,.18)", borderLeft: "1px solid rgba(255,255,255,.18)", marginTop: 38 }}>
            {[
              ["KNOWN", "Homo sapiens is represented here as an accepted species identity from GBIF's Catalogue of Life-backed taxonomy.", "#3AE86F"],
              ["INTERPRETED", "4PLANET uses the S4PIENS missions to organise relationships between human needs, human systems and ecological pressure. That is a systems lens, not a claim that every person causes every pressure equally.", T.blue],
              ["UNKNOWN", "A global Species World cannot infer an individual's footprint, a local causal contribution or the strength of a pressure without place- and source-specific evidence.", "#D7A52A"],
            ].map(([state, text, color]) => (
              <div key={state} style={{ padding: "clamp(22px,3vw,34px)", minHeight: 230, borderRight: "1px solid rgba(255,255,255,.18)", borderBottom: "1px solid rgba(255,255,255,.18)" }}>
                <div style={{ ...mono, color }}>{state}</div>
                <p style={{ marginTop: 18, color: "rgba(255,255,255,.84)", fontSize: 15, lineHeight: 1.6 }}>{text}</p>
              </div>
            ))}
          </div>

          <a href={TAXON_URL} target="_blank" rel="noreferrer" style={{ ...mono, display: "inline-block", marginTop: 20, color: accent }}>
            SOURCE · GBIF · HOMO SAPIENS ↗
          </a>
        </section>

        <section style={{ background: "#0A0A0A", borderTop: "1px solid rgba(255,255,255,.14)" }}>
          <div style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(64px,9vw,130px) clamp(20px,5vw,72px)" }}>
            <div style={{ ...mono, color: accent }}>WHAT DO HUMANS NEED — AND WHAT DOES IT TOUCH?</div>
            <h2 style={{ marginTop: 12, fontFamily: T.display, fontWeight: 500, fontSize: "clamp(30px,4vw,62px)", lineHeight: .98, letterSpacing: "-.04em", maxWidth: "16ch" }}>
              Follow our everyday systems back into the living planet.
            </h2>
            <p style={{ marginTop: 18, color: "rgba(255,255,255,.66)", maxWidth: 700, fontSize: "clamp(15px,1.3vw,18px)", lineHeight: 1.6 }}>
              These are existing 4PLANET Missions, shown here as four ways to trace human dependency and pressure. Open one to inspect the issue, the living system and what can help.
            </p>

            <div className="human-dependency-grid" style={{ marginTop: 38 }}>
              {humanMissions.map((mission, index) => (
                <Link key={mission.slug} to={`/missions/${mission.slug}`} style={{ color: "#fff", textDecoration: "none" }}>
                  <div>
                    <div style={{ ...mono, color: accent }}>{`0${index + 1}`} · {mission.name.replace("_", "")}</div>
                    <h3 style={{ marginTop: 18, fontFamily: T.display, fontWeight: 500, fontSize: "clamp(25px,3vw,42px)", lineHeight: 1, letterSpacing: "-.035em", maxWidth: "15ch" }}>
                      {mission.question ?? mission.hero}
                    </h3>
                  </div>
                  <div>
                    <p style={{ color: "rgba(255,255,255,.66)", fontSize: 14.5, lineHeight: 1.55, maxWidth: 520 }}>{mission.whyItMatters}</p>
                    <div style={{ ...mono, color: accent, marginTop: 18 }}>OPEN MISSION →</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(62px,8vw,110px) clamp(20px,5vw,72px)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 24, flexWrap: "wrap" }}>
            <div>
              <div style={{ ...mono, color: accent }}>ONE SPECIES · MANY RELATIONSHIPS</div>
              <h2 style={{ marginTop: 10, fontFamily: T.display, fontWeight: 500, fontSize: "clamp(26px,3.4vw,50px)", lineHeight: 1.02, letterSpacing: "-.035em", maxWidth: "17ch" }}>
                The point is not guilt. The point is visibility.
              </h2>
              <p style={{ marginTop: 16, color: "rgba(255,255,255,.68)", maxWidth: 620, fontSize: 15.5, lineHeight: 1.6 }}>
                See the dependency. See the pressure. See what can change. Then connect the same thread back to species, places and credible action.
              </p>
            </div>
            <Link to="/species" style={{ ...mono, color: "#fff", border: "1px solid rgba(255,255,255,.35)", padding: "12px 18px" }}>BACK TO SPECIES →</Link>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
