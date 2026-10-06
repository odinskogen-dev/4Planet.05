import { type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { T, DOMAIN_ACCENT } from "@/styles/tokens";
import { PublicShell } from "@/components/layout/PublicShell";
import { Reveal } from "@/components/Cinematic";
import { img, type ImageKey } from "@/content/imageRegistry";
import { IMPACT_UNITS } from "@/data/impactUnits";
import type { DomainKey } from "@/types/content";
import { AtlasHero } from "./AtlasHero";
import "@/styles/home-brand-reset.css";

const PRODUCTS = [
  ["01", "Atlas", "See the planet — places, observations and planetary context.", "/atlas", T.blue],
  ["02", "Species", "Meet life — species, habitats, relationships and evidence.", "/species", "#3AE86F"],
  ["03", "Living Systems", "Understand connections — dependencies, pressures and change.", "/livingsystems/", "#FF4D22"],
  ["04", "Impact", "Find a way to help — action, delivery, evidence and what happens next.", "/impact", "#3AE86F"],
] as const;

const WORLDS: Record<DomainKey, { line: string; image: ImageKey }> = {
  OCE4N_: { line: "The living ocean — migration, coasts, reefs and the systems beneath the surface.", image: "oce4nDomainHero" },
  E4RTH_: { line: "Forests, freshwater, soil, species and the recovery of living land.", image: "e4rthDomainHero" },
  S4PIENS_: { line: "Human systems — food, energy, cities and materials shaping planetary pressure.", image: "s4piensDomainHero" },
  "4CULTURE_": { line: "Stories, sound, image and ideas shaping attention, meaning and participation.", image: "m4gazineHero" },
};

const ORDER: DomainKey[] = ["OCE4N_", "E4RTH_", "S4PIENS_", "4CULTURE_"];
const dslug = (key: string) => key.replace("_", "").toLowerCase();
const sentenceCase = (value: string) => {
  const text = value.toLowerCase().replace(/_/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
};
const HOME_ATLAS_SRC = "/embed/atlas?l=bluemarble&c=0%2C15&z=1.35&t=light&embed=place";

function ProductLens({ item }: { item: typeof PRODUCTS[number] }) {
  const [no, name, line, to, accent] = item;
  return (
    <Link
      to={to}
      className="home-lens"
      reloadDocument={to === "/livingsystems/"}
      style={{ "--home-accent": accent } as CSSProperties}
    >
      <div className="home-lens__top">
        <span className="home-lens__number">{no}_</span>
        <span aria-hidden className="home-lens__open">Open ↗</span>
      </div>
      <h3>{name}</h3>
      <p>{line}</p>
    </Link>
  );
}

function ImpactCard({ unit }: { unit: typeof IMPACT_UNITS[number] }) {
  return (
    <Link
      to={"/impact/" + unit.slug}
      className="home-impact-card"
      style={{ "--home-accent": unit.accent } as CSSProperties}
    >
      {!unit.imagePending && (
        <picture>
          {unit.imageMobile && <source media="(max-width:680px)" srcSet={unit.imageMobile} />}
          <img src={unit.image} alt={unit.imageAlt} loading="lazy" decoding="async" />
        </picture>
      )}
      <span aria-hidden className="home-impact-card__scrim" />
      <div className="home-impact-card__content">
        <div className="home-impact-card__meta">
          <span>{unit.index}_ {unit.missionName}</span>
          <span>Explore →</span>
        </div>
        <h3>{sentenceCase(unit.action)}</h3>
        <div className="home-impact-card__state">{sentenceCase(unit.delivery.status)}</div>
      </div>
    </Link>
  );
}

function ImpactPreview() {
  const units = IMPACT_UNITS.slice(0, 4);
  if (!units.length) return null;
  return (
    <section className="home-impact">
      <div className="home-shell">
        <Reveal>
          <div className="home-section-intro home-section-intro--impact">
            <div>
              <div className="home-kicker home-kicker--blue">Impact_ Find a way to help</div>
              <h2>Understand it. Help it. Follow what happens.</h2>
            </div>
            <div>
              <p>Explore concrete action pathways 4PLANET is developing around real ecological work. See what the action is, what still has to become true and how evidence would be followed.</p>
              <p className="home-status-line">Current state_ Prototype pathways_ Not yet open for public support</p>
            </div>
          </div>
        </Reveal>

        <div className="home-impact-gallery">
          {units.map((unit) => <ImpactCard key={unit.slug} unit={unit} />)}
        </div>
        <Link to="/impact" className="home-text-link">Explore Impact →</Link>
      </div>
    </section>
  );
}

function WorldPanel({ dk }: { dk: DomainKey }) {
  const world = WORLDS[dk];
  const media = img(world.image);
  const accent = DOMAIN_ACCENT[dk];
  return (
    <Link
      to={"/domains/" + dslug(dk)}
      className="home-world"
      style={{ "--home-accent": accent } as CSSProperties}
    >
      <img src={media.src} alt={media.alt} loading="lazy" decoding="async" style={{ objectPosition: media.objectPosition ?? "50% 50%" }} />
      <span aria-hidden className="home-world__scrim" />
      <div className="home-world__content">
        <div className="home-kicker home-world__kicker">{dk}</div>
        <h3>{dk.replace("_", "")}</h3>
        <p>{world.line}</p>
      </div>
    </Link>
  );
}

function AtlasWindow() {
  return (
    <section className="home-atlas-section">
      <div className="home-shell">
        <Reveal>
          <div className="home-section-intro">
            <div>
              <div className="home-kicker home-kicker--blue">Explore the planet_ Live Atlas</div>
              <h2>One planet. Many relationships.</h2>
            </div>
            <div>
              <p>Move through places, observations and planetary context in the shared 4PLANET ATLAS.</p>
              <Link to="/atlas" className="home-text-link">Open Atlas →</Link>
            </div>
          </div>
        </Reveal>
        <div className="home-atlas-window">
          <iframe
            src={HOME_ATLAS_SRC}
            title="Interactive 4PLANET ATLAS"
            loading="lazy"
            referrerPolicy="no-referrer"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}

function OrcaEncounter() {
  const media = img("orcaEncounter");
  return (
    <Link to="/species/orca" className="home-orca" aria-label="Meet the Orca">
      <picture>
        {media.srcMobile && <source media="(max-width:680px)" srcSet={media.srcMobile} />}
        <img src={media.src} alt={media.alt} loading="lazy" decoding="async" style={{ objectPosition: media.objectPosition ?? "50% 50%" }} />
      </picture>
      <span aria-hidden className="home-orca__scrim" />
      <div className="home-orca__content">
        <div className="home-kicker">Species_</div>
        <h2>Meet the Orca.</h2>
      </div>
    </Link>
  );
}

export default function Home() {
  return (
    <PublicShell>
      <div className="home-brand-reset">
        <AtlasHero />

        <section id="why-4planet" className="home-premise">
          <div className="home-shell home-premise__grid">
            <div>
              <div className="home-kicker home-kicker--blue">Why 4PLANET</div>
              <h2>Human life depends on a living planet.</h2>
            </div>
            <div className="home-premise__copy">
              <p>Our food, water, health, economies and societies depend on living systems. Yet the relationships between human systems and the rest of nature are often difficult to see.</p>
              <p className="home-premise__closing">4PLANET exists to make those relationships easier to understand — and credible ways to help easier to find.</p>
              <Link to="/about/story" className="home-text-link">Why 4PLANET →</Link>
            </div>
          </div>
        </section>

        <AtlasWindow />

        <section className="home-lenses">
          <div className="home-shell">
            <Reveal>
              <div className="home-section-intro">
                <div>
                  <div className="home-kicker home-kicker--blue">One planet_ Four lenses</div>
                  <h2>See the same living planet from different angles.</h2>
                </div>
                <p>Atlas, Species, Living Systems and Impact are connected ways into one shared living-planet model — not separate worlds.</p>
              </div>
            </Reveal>
            <div className="home-lens-grid">
              {PRODUCTS.map((item) => <ProductLens key={item[0]} item={item} />)}
            </div>
          </div>
        </section>

        <OrcaEncounter />

        <section id="worlds" className="home-worlds">
          <div className="home-shell home-worlds__intro">
            <div className="home-kicker">The living world</div>
            <div className="home-section-intro home-section-intro--dark">
              <h2>Four connected worlds.</h2>
              <p>Enter the living ocean, living land, the human systems shaping planetary pressure and the culture that shapes what people care about and do.</p>
            </div>
          </div>
          <div className="home-world-grid">
            {ORDER.map((dk) => <WorldPanel key={dk} dk={dk} />)}
          </div>
        </section>

        <ImpactPreview />

        <section className="home-belief-join">
          <div className="home-shell">
            <div className="home-belief-copy">
              <div className="home-kicker home-kicker--blue">What we believe</div>
              <h2>We believe the future can be better.</h2>
              <p>Care deeply. Truth first. Everyone has a part to play. Build things that are useful, make them real, use power for good — and leave things better.</p>
              <Link to="/about" className="home-text-link">What we believe →</Link>
            </div>

            <figure className="home-belief-visual">
              <img
                src={img("s4piensFieldResearcher").src}
                alt={img("s4piensFieldResearcher").alt}
                loading="lazy"
                decoding="async"
              />
            </figure>

            <div className="home-belief-join__join">
              <div className="home-kicker">Join us</div>
              <h3>There is a place for everyone. You too.</h3>
              <Link to="/join" className="home-brand-button">JOIN US</Link>
            </div>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
