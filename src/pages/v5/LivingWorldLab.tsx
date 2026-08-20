import { useEffect } from "react";
import { Link } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { img } from "@/content/imageRegistry";
import "@/styles/living-world-lab.css";

const MYCELIUM_PATHS = [
  "M18 66 C 130 22, 180 92, 280 48 S 470 20, 592 70",
  "M80 126 C 176 80, 248 150, 358 110 S 526 82, 620 142",
  "M14 186 C 112 138, 206 214, 306 164 S 472 132, 620 196",
  "M126 16 C 142 78, 106 118, 70 158",
  "M260 22 C 246 82, 278 122, 328 168",
  "M458 18 C 442 74, 474 116, 534 156",
  "M168 90 C 204 74, 214 50, 218 22",
  "M388 110 C 418 96, 438 70, 444 30",
] as const;

function MyceliumField() {
  return (
    <div className="lw-mycelium" aria-label="Animated mycelium-inspired network experiment">
      <svg viewBox="0 0 640 220" role="img" aria-hidden="true">
        <defs>
          <filter id="lwGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {MYCELIUM_PATHS.map((d, i) => (
          <path key={d} d={d} className="lw-mycelium-path" style={{ animationDelay: `${i * -1.35}s` }} />
        ))}
        {[
          [80,126],[168,90],[218,22],[260,22],[328,168],[388,110],[444,30],[458,18],[534,156],[592,70],[306,164]
        ].map(([cx, cy], i) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={i % 3 === 0 ? 4.8 : 3} className="lw-mycelium-node" style={{ animationDelay: `${i * -.72}s` }} />
        ))}
      </svg>
      <div className="lw-mycelium-copy">
        <span>MYCELIUM / TRACE</span>
        <strong>Hidden infrastructure becomes visible only when it matters.</strong>
      </div>
    </div>
  );
}

function OceanMotion() {
  const ocean = img("oce4nDomainHero");
  return (
    <div className="lw-ocean" aria-label="Calm ocean motion experiment">
      <img src={ocean.src} alt={ocean.alt} />
      <div className="lw-ocean-haze" aria-hidden />
      <div className="lw-ocean-wave lw-ocean-wave-a" aria-hidden />
      <div className="lw-ocean-wave lw-ocean-wave-b" aria-hidden />
      <div className="lw-stage-copy">
        <span>OCEAN / CONTEXT</span>
        <h2>Let the interface breathe like water.</h2>
        <p>Slow drift, layered return and gentle parallax instead of generic software easing.</p>
      </div>
    </div>
  );
}

function StormEncounter() {
  const storm = img("frontHero");
  return (
    <div className="lw-storm" aria-label="Cinematic storm and lightning encounter experiment">
      <img src={storm.src} alt={storm.alt} />
      <div className="lw-storm-haze" aria-hidden />
      <svg className="lw-lightning lw-lightning-a" viewBox="0 0 100 160" aria-hidden="true">
        <path d="M62 4 L40 68 L58 66 L30 154 L78 82 L56 84 Z" />
      </svg>
      <svg className="lw-lightning lw-lightning-b" viewBox="0 0 100 160" aria-hidden="true">
        <path d="M62 4 L40 68 L58 66 L30 154 L78 82 L56 84 Z" />
      </svg>
      <div className="lw-storm-flash" aria-hidden />
      <div className="lw-stage-copy lw-stage-copy-bottom">
        <span>STORM / ENCOUNTER</span>
        <h2>Nature is not only calm.</h2>
        <p>Power, danger, scale and beauty can create a memorable doorway into a real planetary story.</p>
      </div>
    </div>
  );
}

const BIO = [
  ["WATER", "Continuous flow + return", "Motion easing, map transitions, temporal state"],
  ["LEAF", "Branching distribution", "Dependency, provenance and system navigation"],
  ["MYCELIUM", "Distributed support + redundancy", "Shared core, actor/data relationships, hidden infrastructure"],
  ["SEED", "Fit-dependent dispersal", "Story distribution, sharing and channel selection"],
] as const;

export default function LivingWorldLab() {
  useEffect(() => {
    const robots = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    const previous = robots?.content;
    let created = false;
    let target = robots;
    if (!target) {
      target = document.createElement("meta");
      target.name = "robots";
      document.head.appendChild(target);
      created = true;
    }
    target.content = "noindex,nofollow";
    return () => {
      if (created) target?.remove();
      else if (target && previous != null) target.content = previous;
    };
  }, []);

  return (
    <PublicShell>
      <main className="lw-lab">
        <section className="lw-intro">
          <div className="lw-kicker">4PLANET LABS · LIVING WORLD DESIGN v0.1</div>
          <h1>What if the interface behaved more like the living world?</h1>
          <p>This is an isolated visual and motion laboratory. Nothing here changes the current public release candidate. We are testing nature-derived behaviour, not adding nature decoration.</p>
          <div className="lw-intro-links">
            <Link to="/">BACK TO 4PLANET</Link>
            <Link to="/species/jaguar">OPEN JAGUAR</Link>
          </div>
        </section>

        <section className="lw-section">
          <div className="lw-section-head">
            <span>01 · NETWORK</span>
            <h2>Luminous mycelium as a quiet background system.</h2>
            <p>Test: can a living-network pattern make shared infrastructure feel connected without turning evidence into fantasy?</p>
          </div>
          <MyceliumField />
        </section>

        <section className="lw-section">
          <div className="lw-section-head">
            <span>02 · MOTION</span>
            <h2>Water as motion grammar.</h2>
            <p>Test: slow drift and layered return as a reusable alternative to generic slide/fade animation.</p>
          </div>
          <OceanMotion />
        </section>

        <section className="lw-section">
          <div className="lw-section-head">
            <span>03 · DRAMA</span>
            <h2>Storm as a cinematic encounter.</h2>
            <p>Test: a short, controlled flash of natural power. It must remain optional, accessible and rare enough to stay meaningful.</p>
          </div>
          <StormEncounter />
        </section>

        <section className="lw-section lw-bio-section">
          <div className="lw-section-head">
            <span>04 · BIOMIMICRY</span>
            <h2>Function before form.</h2>
            <p>The useful question is not “what does nature look like?” but “how does this living system solve a problem?”</p>
          </div>
          <div className="lw-bio-grid">
            {BIO.map(([name, principle, use]) => (
              <article key={name} className="lw-bio-card">
                <span>{name}</span>
                <h3>{principle}</h3>
                <p>{use}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="lw-story-engine">
          <div className="lw-section-head">
            <span>05 · STORY → DISTRIBUTION</span>
            <h2>One real discovery. Many truthful doorways.</h2>
          </div>
          <div className="lw-story-flow" aria-label="Story distribution engine flow">
            {["REAL SIGNAL", "STORY ANGLE", "JOURNEY / ARTICLE", "CHANNEL VERSION", "DISCOVERY", "OBSERVED USE", "CORRECTION / RETURN"].map((item, i) => (
              <div key={item} className="lw-story-node"><small>{String(i + 1).padStart(2, "0")}</small><strong>{item}</strong></div>
            ))}
          </div>
          <div className="lw-story-seed">
            <span>FIRST TEST SEED</span>
            <h3>“Meet the jaguar. Then follow everything that has to stay alive around it.”</h3>
            <p>One proof object can become the shareable Jaguar Journey, a short vertical discovery clip, a visual species card, a research challenge prompt and a deeper M4GAZINE story — all pointing back to the same source-bounded experience.</p>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
