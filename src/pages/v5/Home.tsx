import { type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { DOMAIN_ACCENT } from "@/styles/tokens";
import { PublicShell } from "@/components/layout/PublicShell";
import { Reveal } from "@/components/Cinematic";
import { img, type ImageKey } from "@/content/imageRegistry";
import { IMPACT_UNITS } from "@/data/impactUnits";
import type { DomainKey } from "@/types/content";
import { AtlasHero } from "./AtlasHero";
import "@/styles/home-brand-reset.css";

const PRODUCTS = [
  ["01", "Atlas", "Explore places, observations and planetary context.", "/atlas"],
  ["02", "Species", "Understand species, habitats and the evidence around them.", "/species"],
  ["03", "Living Systems", "See how living and human systems connect, change and come under pressure.", "/living-systems"],
  ["04", "Impact", "Find action pathways and follow what happens next.", "/impact"],
] as const;

const WORLDS: Record<DomainKey, { displayName: string; system: string; line: string; image: ImageKey }> = {
  OCE4N_: {
    displayName: "OCE4N",
    system: "Marine systems",
    line: "Oceans, coasts, reefs and migration — and the living systems beneath the surface.",
    image: "oce4nDomainHero",
  },
  E4RTH_: {
    displayName: "E4RTH",
    system: "Terrestrial systems",
    line: "Forests, freshwater, soil, species and the recovery of living land.",
    image: "e4rthDomainHero",
  },
  S4PIENS_: {
    displayName: "S4PIENS",
    system: "Human systems",
    line: "Food, energy, cities and materials shaping pressure on the planet.",
    image: "s4piensDomainHero",
  },
  "4CULTURE_": {
    displayName: "4Culture",
    system: "Cultural systems",
    line: "Stories, sound, image and ideas shaping what people notice, value and do.",
    image: "cultureAnchor",
  },
};

const ORDER: DomainKey[] = ["OCE4N_", "E4RTH_", "S4PIENS_", "4CULTURE_"];
const dslug = (key: string) => key.replace("_", "").toLowerCase();
const HOME_ATLAS_SRC = "/embed/atlas?l=bluemarble&c=0%2C15&z=1.35&t=light&embed=place";

function ProductLens({ item }: { item: typeof PRODUCTS[number] }) {
  const [no, name, line, to] = item;
  return (
    <Link to={to} className="home-lens">
      <div className="home-lens__number">{no}</div>
      <h3>{name}</h3>
      <p>{line}</p>
    </Link>
  );
}

function ImpactCard({ unit }: { unit: typeof IMPACT_UNITS[number] }) {
  const action = unit.action.toLowerCase();
  const title = action.charAt(0).toUpperCase() + action.slice(1);
  return (
    <Link to={"/impact/" + unit.slug} className="home-impact-card">
      {!unit.imagePending && (
        <picture>
          {unit.imageMobile && <source media="(max-width:680px)" srcSet={unit.imageMobile} />}
          <img src={unit.image} alt={unit.imageAlt} loading="lazy" decoding="async" />
        </picture>
      )}
      <span aria-hidden className="home-impact-card__scrim" />
      <div className="home-impact-card__content">
        <div className="home-impact-card__eyebrow">In development</div>
        <h3>{title}</h3>
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
              <div className="home-kicker home-kicker--blue">From understanding to action</div>
              <h2 className="home-impact-title">
                <span>Understand it.</span>
                <span>Help it.</span>
                <span>Follow what happens.</span>
              </h2>
            </div>
            <div>
              <p>
                These action pathways are in development. Each one shows a real problem, a possible response,
                who would need to be involved and how progress could be checked before public participation opens.
              </p>
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
      <img
        src={media.src}
        alt={media.alt}
        loading="lazy"
        decoding="async"
        style={{ objectPosition: media.objectPosition ?? "50% 50%" }}
      />
      <span aria-hidden className="home-world__scrim" />
      <div className="home-world__content">
        <h3>{world.displayName}</h3>
        <p><strong>{world.system}.</strong> {world.line}</p>
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
              <div className="home-kicker home-kicker--blue">Explore the planet</div>
              <h2>One planet. Many relationships.</h2>
            </div>
            <div>
              <p>
                Atlas is 4Planet&apos;s interactive map. Explore places, species, observations and layers of
                planetary context — then open the full Atlas when you want to go deeper.
              </p>
              <Link to="/atlas" className="home-text-link">Open Atlas →</Link>
            </div>
          </div>
        </Reveal>
        <div className="home-atlas-window">
          <iframe
            src={HOME_ATLAS_SRC}
            title="Interactive 4Planet Atlas"
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
        <img
          src={media.src}
          alt={media.alt}
          loading="lazy"
          decoding="async"
          style={{ objectPosition: media.objectPosition ?? "50% 50%" }}
        />
      </picture>
      <span aria-hidden className="home-orca__scrim" />
      <div className="home-orca__content">
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
              <div className="home-kicker home-kicker--blue">Why 4Planet</div>
              <h2>Human life depends on a living planet.</h2>
            </div>
            <div className="home-premise__copy">
              <p>
                Food, water, health and prosperity depend on living systems. But the links between human activity
                and the rest of nature are often difficult to see.
              </p>
              <p className="home-premise__closing">
                4Planet makes those relationships easier to understand, then connects that understanding to
                credible ways people and organisations can help.
              </p>
              <Link to="/about/story" className="home-text-link">Why 4Planet →</Link>
            </div>
          </div>
        </section>

        <AtlasWindow />

        <section className="home-lenses">
          <div className="home-shell">
            <Reveal>
              <div className="home-section-intro">
                <div>
                  <div className="home-kicker home-kicker--blue">How it works</div>
                  <h2>Four ways to understand the same planet.</h2>
                </div>
                <p>
                  Atlas shows where things are. Species brings individual life into focus. Living Systems explains
                  connections and pressures. Impact shows where action could begin and what happens next.
                </p>
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
            <div className="home-kicker home-kicker--inverse">Where we work</div>
            <div className="home-section-intro home-section-intro--dark">
              <h2>Four domains. One connected planet.</h2>
              <p>
                4Planet uses four domains to make complex problems easier to understand — and to show where
                different kinds of action can help. They are parts of the same living system, not separate worlds.
              </p>
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
              <h2>We believe the future can be better.</h2>
              <p>
                Care deeply. Truth first. Everyone has a part to play. Build things that are useful, make them real,
                use power for good — and leave things better.
              </p>
              <Link to="/about" className="home-text-link home-text-link--blue">What we believe →</Link>
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
              <h3>There is a place for everyone. You too.</h3>
              <p>
                4Planet is for people and organisations who want to understand more, contribute meaningfully and
                follow what happens next.
              </p>
              <Link to="/join" className="home-brand-button">Join us</Link>
            </div>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
