import { Link, useLocation } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { img } from "@/content/imageRegistry";
import { T, DOMAIN_ACCENT } from "@/styles/tokens";
import { content } from "@/content/contentRepository";
import { contextHref } from "@/product/ProductNav";
import "@/styles/homo-sapiens-gold.css";

const TAXON_URL = "https://www.gbif.org/species/10856082";
const TAXON_ID = "taxon:gbif:10856082";
const accent = DOMAIN_ACCENT["S4PIENS_"];
const portrait = img("cultureAnchor");
const foodImage = img("foodHero");

const mono: React.CSSProperties = {
  fontFamily: T.mono,
  fontSize: 10.5,
  letterSpacing: ".14em",
  textTransform: "uppercase",
};

const NEEDS = [
  ["01", "EAT", "Food", "FOOD_"],
  ["02", "DRINK", "Freshwater", "WATER"],
  ["03", "POWER", "Energy", "EN4RGY_"],
  ["04", "SHELTER", "Built systems", "CIRCULAR CITY_"],
  ["05", "WEAR", "Fibres + materials", "F4SHION_"],
  ["06", "MOVE", "Mobility + trade", "MOBILITY"],
] as const;

export default function HomoSapiensWorld() {
  const location = useLocation();
  const humanMissions = content.getMissionsByDomain("S4PIENS_");

  return (
    <PublicShell>
      <main className="hs-gold" style={{ "--hs-accent": accent } as React.CSSProperties}>
        <section className="hs-gold-hero">
          <picture className="hs-gold-hero__image">
            <img src={portrait.src} alt={portrait.alt} />
          </picture>
          <div className="hs-gold-hero__shade" aria-hidden />
          <div className="hs-gold-hero__index" style={mono}>4PLANET_ · SPECIES_ · S4PIENS_ · GOLD REFERENCE</div>
          <div className="hs-gold-hero__copy">
            <div style={{ ...mono, color: accent }}>SPECIES · GBIF 10856082 · IDENTITY KNOWN</div>
            <h1>Homo sapiens</h1>
            <p className="hs-gold-hero__common">Human</p>
            <p className="hs-gold-hero__lead">We are not outside the living system.</p>
            <p className="hs-gold-hero__body">We eat, drink, build, move, heat, cool, wear and make things. Every one of those needs reaches into land, water, energy, materials and other forms of life. S4PIENS starts with us — then follows those connections outward across the planet.</p>
            <div className="hs-gold-actions">
              <Link to="/sandbox/s4piens" className="hs-gold-action is-primary" style={mono}>OPEN HUMAN SYSTEMS ATLAS →</Link>
              <Link to={contextHref("/atlas", location.search, { entity: TAXON_ID, journey: "sapiens" })} className="hs-gold-action" style={mono}>SEE IN ATLAS →</Link>
            </div>
          </div>
          <div className="hs-gold-hero__footer" style={mono}>
            <span>DEPENDENCY · PLANET → HUMAN</span>
            <span>PRESSURE · HUMAN SYSTEM → PLANET</span>
            <span>RESPONSE · SYSTEM → CHANGE</span>
          </div>
        </section>

        <section className="hs-gold-paper">
          <div className="hs-gold-inner">
            <div style={{ ...mono, color: accent }}>ONE SPECIES · SIX EVERYDAY DOORS INTO THE PLANET</div>
            <h2>Start with what a human needs.</h2>
            <p className="hs-gold-intro">A human-centred interface becomes understandable when it begins with ordinary needs rather than abstract environmental categories. Each need can open a value chain, then a place, pressure, living system, species and solution.</p>
            <div className="hs-gold-needs">
              {NEEDS.map(([number, verb, system, route], index) => (
                <div key={verb} className={index === 0 ? "is-gold" : ""}>
                  <span style={mono}>{number}</span>
                  <strong>{verb}</strong>
                  <span>{system}</span>
                  <span style={mono}>{index === 0 ? "GOLD STANDARD · " : "NEXT · "}{route}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="hs-gold-dark">
          <div className="hs-gold-inner">
            <div style={{ ...mono, color: accent }}>TRUTH MODEL · DO NOT FLATTEN THE HUMAN</div>
            <h2>Know what the profile establishes — and what it does not.</h2>
            <div className="hs-gold-truth">
              <article>
                <span className="is-known" style={mono}>KNOWN</span>
                <h3>Species identity</h3>
                <p>Homo sapiens is represented here through the GBIF taxon identity used across this prototype. That establishes identity, not a planetary impact score.</p>
              </article>
              <article>
                <span className="is-interpreted" style={mono}>INTERPRETED</span>
                <h3>Human systems lens</h3>
                <p>4PLANET organises human needs, value chains, pressures and responses as a systems map. This is a product model for understanding relationships, not a claim that every person contributes equally.</p>
              </article>
              <article>
                <span className="is-unknown" style={mono}>UNKNOWN WITHOUT MORE EVIDENCE</span>
                <h3>Local cause and individual footprint</h3>
                <p>A global profile cannot infer one person’s footprint, a local causal contribution or an ecological outcome without place-, time- and source-specific evidence.</p>
              </article>
            </div>
            <a href={TAXON_URL} target="_blank" rel="noreferrer" className="hs-gold-source" style={mono}>SOURCE · GBIF · HOMO SAPIENS ↗</a>
          </div>
        </section>

        <section className="hs-gold-food">
          <picture className="hs-gold-food__image">
            {foodImage.srcMobile && <source media="(max-width: 760px)" srcSet={foodImage.srcMobile} />}
            <img src={foodImage.src} alt={foodImage.alt} />
          </picture>
          <div className="hs-gold-food__shade" aria-hidden />
          <div className="hs-gold-food__copy">
            <div style={{ ...mono, color: accent }}>GOLD STANDARD 01 · FOOD_</div>
            <h2>Follow one meal through the planet.</h2>
            <p>FOOD_ is the first chain because eating is universal and the system behind it crosses farms, fisheries, inputs, factories, trade, land, water, climate, biodiversity and waste. The Human Systems Atlas turns that chain into something a person can inspect instead of merely read about.</p>
            <Link to="/sandbox/s4piens" className="hs-gold-action is-primary" style={mono}>ENTER FOOD_ GOLD JOURNEY →</Link>
          </div>
        </section>

        <section className="hs-gold-paper">
          <div className="hs-gold-inner">
            <div style={{ ...mono, color: accent }}>S4PIENS_ · THE SYSTEMS WE BUILD</div>
            <h2>Four Missions become doors into the same shared model.</h2>
            <div className="hs-gold-missions">
              {humanMissions.map((mission, index) => (
                <Link key={mission.slug} to={`/missions/${mission.slug}`}>
                  <span style={mono}>0{index + 1}</span>
                  <div>
                    <strong>{mission.name}</strong>
                    <p>{mission.question ?? mission.hero}</p>
                  </div>
                  <span style={mono}>OPEN →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
