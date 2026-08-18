import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { speciesBySlug } from "@/data/species";
import { useFollows } from "@/planet/follow";
import { contextHref } from "@/product/ProductNav";
import { withReturnTo } from "@/product/productContext";
import "@/styles/jaguar-habitat.css";

type WebNode = {
  id: string;
  name: string;
  sci: string;
  type: string;
  text: string;
  boundary: string;
};

const FACTS = [
  ["COMMON NAME", "Jaguar", "Panthera onca"],
  ["FAMILY", "Felidae", "Genus Panthera · Order Carnivora"],
  ["CONSERVATION", "Near Threatened", "IUCN global assessment · population trend decreasing"],
  ["POPULATION", "No single global count", "Population size is fragmented and unevenly known"],
  ["RANGE", "Mexico → northern Argentina", "Core strongholds remain in large connected landscapes"],
  ["HABITAT", "Forest · wetland · savanna", "Often strongly associated with water and dense cover"],
  ["WEIGHT", "≈36–158 kg", "Large geographic and sex differences; reference range"],
  ["HEAD–BODY", "≈1.1–1.85 m", "Tail adds roughly 45–75 cm; reference range"],
  ["LIFESPAN", "≈12–15 years wild", "Approximate reference range; individuals vary"],
  ["ECOLOGICAL ROLE", "Apex predator", "A top predator within diverse local food webs"],
] as const;

const NODES: WebNode[] = [
  {
    id: "capybara",
    name: "Capybara",
    sci: "Hydrochoerus hydrochaeris",
    type: "PREY · SPECIES NODE",
    text: "A large semi-aquatic rodent common around rivers and wetlands in much of South America. Jaguars hunt capybara in some landscapes.",
    boundary: "Prey importance varies by place, season and individual jaguar.",
  },
  {
    id: "peccary",
    name: "Peccaries",
    sci: "Tayassuidae",
    type: "PREY · GROUP NODE",
    text: "Peccaries are forest and woodland mammals that can form an important part of jaguar diets where they occur.",
    boundary: "This is a prey-group relationship, not a claim about every jaguar population.",
  },
  {
    id: "caiman",
    name: "Caiman",
    sci: "Caiman spp.",
    type: "PREY · GROUP NODE",
    text: "Jaguars are unusually comfortable in and around water and can prey on caimans in wetland and river systems.",
    boundary: "Species and frequency vary geographically; this is not a universal diet statement.",
  },
  {
    id: "forest",
    name: "Connected habitat",
    sci: "Forest · wetland · corridors",
    type: "HABITAT DEPENDENCY",
    text: "Large connected habitats help sustain movement, prey access and gene flow across jaguar populations.",
    boundary: "Connectivity needs are landscape-specific and should be assessed with local evidence.",
  },
];

const PRESSURES = [
  ["KNOWN PRESSURE FAMILY", "Habitat loss & fragmentation", "Conversion and fragmentation can reduce connected habitat, isolate populations and intensify conflict at forest edges."],
  ["KNOWN PRESSURE FAMILY", "Prey depletion", "Loss of wild prey can weaken food webs and increase the likelihood that jaguars encounter livestock."],
  ["KNOWN PRESSURE FAMILY", "Conflict & retaliatory killing", "Jaguars may be killed following livestock losses or perceived risk, with intensity varying strongly by place."],
  ["RESPONSE FAMILY · NOT 4PLANET DELIVERY", "Connectivity + coexistence", "Potential responses include protecting connected habitat, maintaining prey, reducing livestock vulnerability, monitoring populations and supporting effective enforcement."],
] as const;

export function JaguarHabitatPage() {
  const profile = speciesBySlug("jaguar");
  const location = useLocation();
  const { following, toggle } = useFollows();
  const [activeNode, setActiveNode] = useState<WebNode>(NODES[0]);
  const [shareState, setShareState] = useState("SHARE");

  useEffect(() => {
    document.body.classList.add("jaguar-habitat-active");
    return () => document.body.classList.remove("jaguar-habitat-active");
  }, []);

  if (!profile) return null;

  const watched = following(profile.id);
  const atlasHref = contextHref("/atlas", location.search, { entity: profile.id, journey: "amazonia" });
  const livingHref = withReturnTo("/living-systems", location.search);

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: "Jaguar — 4PLANET SPECIES_", text: "Explore the jaguar inside its living system.", url });
      else {
        await navigator.clipboard.writeText(url);
        setShareState("LINK COPIED");
        window.setTimeout(() => setShareState("SHARE"), 1800);
      }
    } catch {
      setShareState("SHARE");
    }
  }

  return (
    <PublicShell>
      <main className="jaguar-world">
        <section className="jg-hero" aria-labelledby="jaguar-title">
          <img className="jg-hero__image" src="/assets/species/jaguar/jaguar-hero-wesley.jpg" alt="Jaguar drinking at the edge of water" fetchPriority="high" />
          <div className="jg-hero__veil" />
          <div className="jg-hero__scan" />
          <nav className="jg-rail jg-mono" aria-label="Jaguar lenses">
            <Link to={atlasHref}>SEE / ATLAS →</Link>
            <span className="active">MEET / SPECIES</span>
            <Link to={livingHref}>UNDERSTAND / WEB →</Link>
            <Link to="/missions/am4zonia">ACT / AM4ZONIA →</Link>
          </nav>
          <div className="jg-hero__content">
            <div>
              <div className="jg-kicker jg-mono">4PLANET SPECIES_ · E4RTH_ · HABITAT MODE 01</div>
              <h1 id="jaguar-title">Jaguar</h1>
              <div className="jg-latin">Panthera onca</div>
              <p className="jg-lede">Meet the largest cat native to the Americas inside the habitats, prey relationships and pressures that shape its life.</p>
              <div className="jg-actions">
                <a className="jg-action primary jg-mono" href="#identity">ENTER SPECIES WORLD ↓</a>
                <a className="jg-action jg-mono" href="#food-web">OPEN FOOD WEB ↓</a>
              </div>
            </div>
            <aside className="jg-hero__meta jg-mono" aria-label="Habitat mode metadata">
              <div className="jg-meta-row"><span>WORLD</span><b>E4RTH_</b></div>
              <div className="jg-meta-row"><span>SYSTEM</span><b>TROPICAL FOREST / WETLAND</b></div>
              <div className="jg-meta-row"><span>TAXON</span><b>GBIF 5219426 · ACCEPTED</b></div>
              <div className="jg-meta-row"><span>MEDIA</span><b>STILL 01 · VIDEO NEXT</b></div>
              <div className="jg-meta-row"><span>TRUTH MODE</span><b>SOURCES + BOUNDARIES</b></div>
            </aside>
          </div>
          <div className="jg-hero__credit jg-mono">PHOTO · WESLEY FERNANDES / <a href="https://unsplash.com/photos/W561HYFsPAE" target="_blank" rel="noreferrer">UNSPLASH ↗</a> · ILLUSTRATIVE SPECIES MEDIA, NOT LOCATION EVIDENCE</div>
        </section>

        <section className="jg-section" id="identity">
          <div className="jg-wrap">
            <div className="jg-eyebrow jg-mono">01 · IDENTITY / SPECIES CARD EXPANDED</div>
            <h2>Know the animal before the abstraction.</h2>
            <p className="jg-standfirst">A modern species profile should answer the basic human questions immediately, then let a researcher, teacher or curious visitor move deeper into taxonomy, evidence, place and relationships without losing the animal itself.</p>
            <div className="jg-facts">
              {FACTS.map(([k, v, note]) => (
                <article className="jg-fact" key={k}>
                  <div className="jg-fact__k jg-mono">{k}</div>
                  <div className="jg-fact__v">{v}</div>
                  <div className="jg-fact__note jg-mono">{note}</div>
                </article>
              ))}
            </div>
            <p className="jg-source jg-mono">REFERENCE LAYER · TAXON IDENTITY: <a href="https://www.gbif.org/species/5219426" target="_blank" rel="noreferrer">GBIF ↗</a> · CONSERVATION / RANGE CONTEXT: IUCN / PANTHERA · SIZE AND LIFESPAN ARE GENERAL REFERENCE RANGES AND SHOULD NOT BE READ AS VALUES FOR EVERY INDIVIDUAL.</p>
          </div>
        </section>

        <section className="jg-habitat" aria-labelledby="habitat-title">
          <img src="/assets/species/jaguar/amazon-canopy-hm002.jpg" alt="Looking upward into dense Amazon rainforest canopy" loading="lazy" />
          <div className="jg-habitat__veil" />
          <div className="jg-habitat__copy">
            <div className="jg-eyebrow jg-mono">02 · HABITAT / AMAZON RAINFOREST</div>
            <h2 id="habitat-title">Do not show a species without its world.</h2>
            <p className="jg-standfirst">The Amazon is only one part of the jaguar’s range, but it contains some of its largest remaining connected habitat. Forest structure, water, prey and landscape connectivity matter together.</p>
            <p className="jg-source jg-mono">HABITAT PHOTO · MADELINE HOGAN / UNSPLASH · AMAZON RAINFOREST, PERU · ILLUSTRATIVE HABITAT CONTEXT, NOT A JAGUAR OCCURRENCE RECORD.</p>
          </div>
        </section>

        <section className="jg-section" id="food-web">
          <div className="jg-wrap">
            <div className="jg-eyebrow jg-mono">03 · LIVING SYSTEMS / FOOD WEB PROTOTYPE</div>
            <h2>A predator is a network of relationships.</h2>
            <p className="jg-standfirst">This is the beginning of the traversable Species × Living Systems model: click a node to understand the relationship. In the full system, each valid species node can open its Species Card, then its complete profile, Atlas context and further food-web connections.</p>
            <div className="jg-web-layout">
              <div className="jg-web" aria-label="Jaguar food web preview">
                <span className="jg-link jg-link--1" /><span className="jg-link jg-link--2" /><span className="jg-link jg-link--3" /><span className="jg-link jg-link--4" />
                <div className="jg-node jg-node--center"><strong>Jaguar</strong><small className="jg-mono">PANTHERA ONCA · PREDATOR</small></div>
                {NODES.map((node, index) => (
                  <button key={node.id} type="button" className={`jg-node jg-node--${["a", "b", "c", "d"][index]} ${activeNode.id === node.id ? "active" : ""}`} onClick={() => setActiveNode(node)}>
                    <strong>{node.name}</strong><small className="jg-mono">{node.type}</small>
                  </button>
                ))}
              </div>
              <aside className="jg-node-card" aria-live="polite">
                <div className="jg-node-card__type jg-mono">{activeNode.type}</div>
                <h3>{activeNode.name}</h3>
                <em>{activeNode.sci}</em>
                <p>{activeNode.text}</p>
                <p className="jg-source jg-mono">BOUNDARY · {activeNode.boundary}</p>
                <div className="jg-node-card__next jg-mono">NEXT ARCHITECTURE · NODE → SPECIES CARD → FULL PROFILE → ATLAS → FOLLOW / SAVE / SHARE</div>
              </aside>
            </div>
          </div>
        </section>

        <section className="jg-animal-scene">
          <div className="jg-animal-scene__image">
            <img src="/assets/species/jaguar/jaguar-secondary-ramon.jpg" alt="Jaguar resting among vegetation" loading="lazy" />
          </div>
          <div className="jg-animal-scene__copy">
            <div className="jg-eyebrow jg-mono">04 · SEE THE ANIMAL / MEDIA LAYER</div>
            <h2>Seeing is part of learning.</h2>
            <p className="jg-standfirst">SPECIES should let people study the animal as an animal — markings, build, movement and habitat — then open sound and video only when requested. Rich media should deepen understanding without making the page heavy.</p>
            <p className="jg-source jg-mono">PHOTO · RAMON VLOON / <a href="https://unsplash.com/photos/9Up5W9NITQw" target="_blank" rel="noreferrer">UNSPLASH ↗</a> · ILLUSTRATIVE SPECIES MEDIA. VIDEO MODE IS RESERVED FOR A RIGHTS-VERIFIED, LAZY-LOADED ASSET.</p>
          </div>
        </section>

        <section className="jg-section">
          <div className="jg-wrap">
            <div className="jg-eyebrow jg-mono">05 · PRESSURES → RESPONSE FAMILIES</div>
            <h2>Understanding should lead somewhere.</h2>
            <p className="jg-standfirst">Pressure is not a generic red warning. It should connect a real ecological mechanism to the places, actors and response families that can matter — with uncertainty kept visible.</p>
            <div className="jg-pressure-grid">
              {PRESSURES.map(([state, title, text]) => (
                <article className="jg-pressure" key={title}>
                  <div className="jg-pressure__state jg-mono">{state}</div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
            <p className="jg-source jg-mono">TRUTH BOUNDARY · THESE ARE GENERAL PRESSURE / RESPONSE FAMILIES. THEY ARE NOT A CLAIM OF 4PLANET DELIVERY, A UNIVERSAL JAGUAR DIAGNOSIS OR A LOCAL MANAGEMENT PRESCRIPTION.</p>
          </div>
        </section>

        <section className="jg-section">
          <div className="jg-wrap">
            <div className="jg-eyebrow jg-mono">06 · CONTINUE THROUGH ONE INTERFACE</div>
            <h2>The animal is an entry point, not a dead end.</h2>
            <div className="jg-lenses">
              <Link to={atlasHref}><small className="jg-mono">SEE / EXPLORE</small><strong>Find the jaguar in ATLAS →</strong></Link>
              <Link to={livingHref}><small className="jg-mono">UNDERSTAND</small><strong>Follow its Living Systems web →</strong></Link>
              <Link to="/missions/am4zonia"><small className="jg-mono">ACT / LEARN</small><strong>Enter AM4ZONIA_ →</strong></Link>
            </div>
            <div className="jg-actions">
              <button className={`jg-action ${watched ? "primary" : ""} jg-mono`} type="button" onClick={() => toggle({ id: profile.id, type: "TAXON", label: profile.commonName, sub: profile.scientificName })}>{watched ? "FOLLOWING JAGUAR" : "FOLLOW JAGUAR"}</button>
              <button className="jg-action subtle jg-mono" type="button" onClick={share}>{shareState}</button>
              <Link className="jg-action subtle jg-mono" to={contextHref("/species", location.search)}>BACK TO SPECIES INDEX</Link>
            </div>
          </div>
        </section>

        <footer className="jg-footer jg-mono">
          <span>4PLANET SPECIES_ · JAGUAR · PANTHERA ONCA · E4RTH_ HABITAT WORLD v1</span>
          <span>PUBLIC PROTOTYPE · SOURCES / LIMITS VISIBLE · NO DELIVERY OR IMPACT CLAIM</span>
        </footer>
      </main>
    </PublicShell>
  );
}
