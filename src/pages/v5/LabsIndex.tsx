import { useEffect } from "react";
import { Link } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import "@/styles/labs-index.css";

const LABS = [
  {
    id: "CREATOR ENGINE",
    state: "EARLY STAGE",
    title: "Infrastructure for Creative Independence",
    body: "A holistic creator operating experiment connecting work, rights, opportunities, money, obligations and the path to more creative time.",
    href: "/labs/creator",
    capability: "PEOPLE × 4CULTURE × ECONOMY",
  },
  {
    id: "HUMAN CAPACITY",
    state: "INSIDE CREATOR ENGINE",
    title: "People are the infrastructure",
    body: "A bounded capacity experiment: map the friction tax, return time safely, keep private economy separate, and route only voluntary capacity toward meaningful 4PLANET needs.",
    href: "/labs/creator/capacity",
    capability: "PEOPLE × ECONOMY × MOVEMENT",
  },
  {
    id: "LIVING WORLD DESIGN",
    state: "EARLY STAGE",
    title: "Nature-derived interface behaviour",
    body: "A visual and motion laboratory testing mycelium networks, water-derived motion, cinematic encounters and functional biomimicry.",
    href: "/labs/living-world",
    capability: "BRAND × PRODUCT × LIVING WORLD",
  },
] as const;

export default function LabsIndex() {
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
    return () => {
      if (created) target?.remove();
      else if (target && previous != null) target.content = previous;
    };
  }, []);

  return (
    <PublicShell>
      <main className="labs-index">
        <section className="labs-hero">
          <span>4PLANET LABS · PUBLIC DEVELOPMENT WORKSHOP</span>
          <h1>Early-stage ideas earn their way into the system.</h1>
          <p>Bounded prototypes, real-device experiments and reusable capability tests. LABS is not production truth and does not create a second 4PLANET architecture.</p>
          <Link to="/">BACK TO 4PLANET</Link>
        </section>

        <section className="labs-grid" aria-label="4PLANET Labs early-stage projects">
          {LABS.map((lab, index) => (
            <Link key={lab.id} to={lab.href} className="labs-card">
              <div className="labs-card-meta"><small>{String(index + 1).padStart(2, "0")}</small><span>{lab.state}</span></div>
              <div>
                <b>{lab.id}</b>
                <h2>{lab.title}</h2>
                <p>{lab.body}</p>
              </div>
              <footer><span>{lab.capability}</span><strong>OPEN LAB →</strong></footer>
            </Link>
          ))}
        </section>

        <section className="labs-rule">
          <span>LABS RULE</span>
          <h2>Prototype → learn → promote, hold or kill.</h2>
          <p>One core. No private leakage. No silent P0 displacement. No experiment becomes a public product merely because it looks good.</p>
        </section>
      </main>
    </PublicShell>
  );
}
