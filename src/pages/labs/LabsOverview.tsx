import { useEffect } from "react";

const projects = [
  {
    slug: "founder-control",
    title: "FOUNDER CONTROL",
    status: "P1 LAB EXPERIMENT",
    description: "A read-only view of goals, projects, proof, money and learning — derived from canonical programme truth.",
  },
  {
    slug: "4planet-university",
    title: "4PLANET UNIVERSITY",
    status: "LAB QUEUE",
    description: "Source-linked learning paths for understanding life, living systems and planetary action.",
  },
  {
    slug: "food-app",
    title: "FOOD APP",
    status: "AFTER CURRENT GOLD GATE",
    description: "A bounded interactive expression of the Everyday Protein Choice reference — no green score, no medical advice.",
  },
  {
    slug: "nature-game",
    title: "NATURE GAME",
    status: "WILD EXPERIMENT",
    description: "A tiny game prototype where ecological relationships remain sourced and simulation stays visibly separate from observed truth.",
  },
];

const mono = "'Fragment Mono', ui-monospace, SFMono-Regular, Menlo, monospace";

export default function LabsOverview() {
  useEffect(() => {
    document.title = "4PLANET LABS — Public Development";
    let robots = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!robots) {
      robots = document.createElement("meta");
      robots.name = "robots";
      document.head.appendChild(robots);
    }
    const previous = robots.content;
    robots.content = "noindex,nofollow,noarchive";
    return () => {
      robots!.content = previous;
    };
  }, []);

  return (
    <main style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'DM Sans', Arial, sans-serif" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "22px clamp(20px,4vw,64px)", borderBottom: "1px solid #242424" }}>
        <a href="/labs" style={{ color: "inherit", textDecoration: "none", fontWeight: 700, letterSpacing: "-0.03em" }}>
          4PLANET_
        </a>
        <span style={{ fontFamily: mono, fontSize: 11, letterSpacing: "0.08em", opacity: 0.62 }}>LAB / PUBLIC DEVELOPMENT</span>
      </header>

      <section style={{ padding: "clamp(70px,11vw,150px) clamp(20px,4vw,64px) 56px", maxWidth: 1500, margin: "0 auto" }}>
        <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: "0.12em", opacity: 0.58, marginBottom: 24 }}>ONE CORE · MANY EXPERIMENTS · TRUTHFUL ALWAYS</div>
        <h1 style={{ fontFamily: "'Instrument Sans', Arial, sans-serif", fontSize: "clamp(64px,13vw,190px)", lineHeight: 0.82, letterSpacing: "-0.075em", margin: 0, fontWeight: 650 }}>
          LABS
        </h1>
        <p style={{ maxWidth: 760, fontSize: "clamp(20px,2.1vw,32px)", lineHeight: 1.18, letterSpacing: "-0.035em", margin: "42px 0 0", color: "#d8d8d8" }}>
          The public workshop for what 4PLANET might become next. Experiments can move fast here. Production cannot.
        </p>
      </section>

      <section style={{ padding: "32px clamp(20px,4vw,64px) 100px", maxWidth: 1500, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", borderTop: "1px solid #343434", borderLeft: "1px solid #343434" }}>
          {projects.map((project, index) => (
            <article key={project.slug} style={{ minHeight: 330, padding: "30px 26px", borderRight: "1px solid #343434", borderBottom: "1px solid #343434", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: "0.11em", color: "#999", marginBottom: 46 }}>
                  LAB {String(index + 1).padStart(2, "0")} · {project.status}
                </div>
                <h2 style={{ fontFamily: "'Instrument Sans', Arial, sans-serif", fontSize: "clamp(29px,3vw,48px)", lineHeight: 0.94, letterSpacing: "-0.055em", margin: 0, fontWeight: 600 }}>
                  {project.title}
                </h2>
              </div>
              <p style={{ margin: "36px 0 0", color: "#bdbdbd", lineHeight: 1.45, maxWidth: 420 }}>{project.description}</p>
            </article>
          ))}
        </div>
      </section>

      <footer style={{ padding: "24px clamp(20px,4vw,64px) 36px", borderTop: "1px solid #242424", display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "space-between", fontFamily: mono, fontSize: 10, letterSpacing: "0.08em", color: "#888" }}>
        <span>NOT PRODUCTION · NOINDEX · EXPERIMENTS MAY CHANGE OR DISAPPEAR</span>
        <a href="https://4planet.org" style={{ color: "#fff", textDecoration: "none" }}>4PLANET.ORG →</a>
      </footer>
    </main>
  );
}
