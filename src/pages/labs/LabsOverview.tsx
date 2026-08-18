import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";

type LabProject = {
  slug: string;
  code: string;
  title: string;
  status: string;
  priority: string;
  note: string;
  question: string;
};

const projects: LabProject[] = [
  {
    slug: "FounderControl",
    code: "LAB_01",
    title: "Founder Control",
    status: "DESIGN",
    priority: "P1",
    note: "A private control surface derived from canonical 4PLANET programme truth — with a separate public/capital-safe projection.",
    question: "Can one calm interface make the whole organisation legible without creating another source of truth?",
  },
  {
    slug: "4PlanetUniversity",
    code: "LAB_02",
    title: "4PLANET University",
    status: "IDEA",
    priority: "P2",
    note: "An exploratory learning layer for understanding the living planet, systems, species, choices and action.",
    question: "What would a genuinely useful learning experience built on 4PLANET intelligence feel like?",
  },
  {
    slug: "FoodApp",
    code: "LAB_03",
    title: "Food App",
    status: "REFERENCE CONCEPT",
    priority: "P1/P2",
    note: "A possible product expression of the approved PERSON × FOOD × NORWAY reference work. Not yet a separate committed product.",
    question: "Can evidence-rich food intelligence become understandable and useful at the moment of an everyday choice?",
  },
  {
    slug: "NatureGame",
    code: "LAB_04",
    title: "Nature Game",
    status: "WILD IDEA",
    priority: "P3",
    note: "A deliberately unconstrained experiment around play, discovery, species, places and living systems.",
    question: "Can play make ecological relationships intuitive without flattening the truth?",
  },
];

function useLabMeta(title: string) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${title} — 4PLANET LABS`;

    let robots = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    const created = !robots;
    if (!robots) {
      robots = document.createElement("meta");
      robots.name = "robots";
      document.head.appendChild(robots);
    }
    const previousRobots = robots.content;
    robots.content = "noindex,nofollow,noarchive";

    return () => {
      document.title = previousTitle;
      if (created) robots?.remove();
      else if (robots) robots.content = previousRobots;
    };
  }, [title]);
}

const page: React.CSSProperties = {
  minHeight: "100vh",
  background: "#f5f5f4",
  color: "#0a0a0a",
};

const wrap: React.CSSProperties = {
  width: "min(1440px, 100%)",
  margin: "0 auto",
  padding: "clamp(24px, 4vw, 64px)",
};

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
  borderTop: "1px solid #d8d8d4",
  borderLeft: "1px solid #d8d8d4",
};

function Status({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="mono"
      style={{
        display: "inline-flex",
        alignItems: "center",
        minHeight: 28,
        padding: "6px 9px",
        border: "1px solid #cfcfca",
        background: "rgba(255,255,255,.55)",
        fontSize: 10,
        letterSpacing: ".12em",
      }}
    >
      {children}
    </span>
  );
}

export function LabsOverview() {
  useLabMeta("Overview");

  return (
    <main style={page}>
      <div style={wrap}>
        <header style={{ paddingBottom: "clamp(56px, 9vw, 132px)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 24, flexWrap: "wrap", marginBottom: 64 }}>
            <Link to="/labs" className="mono" style={{ fontSize: 12, letterSpacing: ".16em" }}>
              4PLANET_ LABS
            </Link>
            <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textAlign: "right" }}>
              PUBLIC DEVELOPMENT ENVIRONMENT<br />NOT PRODUCTION
            </div>
          </div>

          <div className="lbl" style={{ marginBottom: 18 }}>EXPERIMENTS · PROTOTYPES · NEXT VERSIONS</div>
          <h1
            className="display"
            style={{
              maxWidth: 1050,
              fontSize: "clamp(56px, 10vw, 148px)",
              lineHeight: ".84",
              letterSpacing: "-.065em",
              fontWeight: 560,
            }}
          >
            Build what<br />could be next.
          </h1>
          <p style={{ maxWidth: 680, marginTop: 36, fontSize: "clamp(17px, 2vw, 24px)", lineHeight: 1.35 }}>
            A working laboratory for ideas that may strengthen 4PLANET — or simply teach us something useful. Strong experiments can graduate. Weak ones can die cheaply.
          </p>
        </header>

        <section aria-labelledby="projects-title">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 20, alignItems: "end", marginBottom: 18, flexWrap: "wrap" }}>
            <div>
              <div className="lbl">CURRENT LAB OBJECTS</div>
              <h2 id="projects-title" className="display" style={{ fontSize: "clamp(30px, 4vw, 54px)", letterSpacing: "-.045em", marginTop: 7 }}>
                Experiments in the system
              </h2>
            </div>
            <div className="mono" style={{ fontSize: 10, letterSpacing: ".12em" }}>IDEA → BUILD → LEARN → PROMOTE / HOLD / KILL</div>
          </div>

          <div style={grid}>
            {projects.map((project) => (
              <Link
                key={project.slug}
                to={`/labs/${project.slug}`}
                className="hov lift"
                style={{
                  minHeight: 355,
                  padding: "clamp(22px, 3vw, 34px)",
                  borderRight: "1px solid #d8d8d4",
                  borderBottom: "1px solid #d8d8d4",
                  background: "rgba(255,255,255,.72)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start" }}>
                    <span className="mono" style={{ fontSize: 10, letterSpacing: ".15em" }}>{project.code}</span>
                    <Status>{project.status}</Status>
                  </div>
                  <h3 className="display" style={{ fontSize: "clamp(31px, 3vw, 46px)", lineHeight: .96, letterSpacing: "-.045em", marginTop: 42 }}>
                    {project.title}
                  </h3>
                  <p style={{ marginTop: 18, maxWidth: 430, fontSize: 14.5, lineHeight: 1.5 }}>{project.note}</p>
                </div>
                <div className="mono" style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 10, letterSpacing: ".12em" }}>
                  <span>{project.priority}</span>
                  <span>OPEN →</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <footer style={{ marginTop: "clamp(70px, 10vw, 150px)", borderTop: "1px solid #d8d8d4", paddingTop: 24, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 26 }}>
          <div>
            <div className="lbl">ONE CORE</div>
            <p style={{ marginTop: 8, maxWidth: 400 }}>LABS is not a second 4PLANET. Experiments share the same truth, identity and product foundations wherever that is appropriate.</p>
          </div>
          <div>
            <div className="lbl">PRODUCTION</div>
            <p style={{ marginTop: 8, maxWidth: 400 }}>Accepted public product lives at <a className="ul" href="https://4planet.org">4planet.org</a>. LABS does not imply production readiness.</p>
          </div>
          <div>
            <div className="lbl">BUILD ID</div>
            <p className="mono" style={{ marginTop: 8, fontSize: 11 }}>LABS FOUNDING SHELL · 2026-08-18</p>
          </div>
        </footer>
      </div>
    </main>
  );
}

export function LabProjectPage({ forcedSlug }: { forcedSlug?: string }) {
  const params = useParams();
  const slug = forcedSlug ?? params.slug ?? "";
  const project = projects.find((item) => item.slug.toLowerCase() === slug.toLowerCase());
  useLabMeta(project?.title ?? "Experiment");

  if (!project) {
    return (
      <main style={page}>
        <div style={wrap}>
          <Link to="/labs" className="mono" style={{ fontSize: 11, letterSpacing: ".14em" }}>← 4PLANET_ LABS</Link>
          <h1 className="display" style={{ fontSize: "clamp(48px,8vw,110px)", letterSpacing: "-.06em", marginTop: 80 }}>Not in the lab.</h1>
        </div>
      </main>
    );
  }

  return (
    <main style={page}>
      <div style={wrap}>
        <Link to="/labs" className="mono" style={{ fontSize: 11, letterSpacing: ".14em" }}>← 4PLANET_ LABS</Link>
        <div style={{ maxWidth: 980, padding: "clamp(72px,10vw,150px) 0" }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 22 }}>
            <Status>{project.status}</Status><Status>{project.priority}</Status>
          </div>
          <div className="lbl">{project.code}</div>
          <h1 className="display" style={{ fontSize: "clamp(60px,10vw,140px)", lineHeight: .86, letterSpacing: "-.065em", marginTop: 14 }}>
            {project.title}
          </h1>
          <p style={{ marginTop: 32, maxWidth: 740, fontSize: "clamp(18px,2.2vw,27px)", lineHeight: 1.35 }}>{project.note}</p>
        </div>

        <section style={{ borderTop: "1px solid #d8d8d4", padding: "clamp(34px,5vw,70px) 0", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 36 }}>
          <div>
            <div className="lbl">QUESTION</div>
            <p className="display" style={{ marginTop: 12, fontSize: "clamp(25px,3vw,38px)", lineHeight: 1.08, letterSpacing: "-.035em" }}>{project.question}</p>
          </div>
          <div>
            <div className="lbl">CURRENT TRUTH</div>
            <p style={{ marginTop: 12, maxWidth: 520 }}>This is a LAB object, not a released 4PLANET product. Its current purpose is to preserve the idea, make the next test explicit and allow evidence-driven development over time.</p>
          </div>
          <div>
            <div className="lbl">NEXT</div>
            <p style={{ marginTop: 12, maxWidth: 520 }}>Define the smallest useful experiment. Build only enough to learn. Promote, hold or kill from evidence.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
