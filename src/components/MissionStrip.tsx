import { Link, useLocation } from "react-router-dom";
import { T } from "@/styles/tokens";
import { contextHref } from "@/product/ProductNav";

/**
 * Human-first Mission summary + cross-product bridge.
 *
 * A Mission is not a dead-end dossier. It is one doorway into the same living
 * system, so the strip deliberately connects people to ATLAS, SPECIES,
 * LIVING SYSTEMS and IMPACT without creating new truth or status claims.
 */
export function MissionStrip({
  issue, whyItMatters, approach, contribution, status, nextMilestone, accent, dark = false,
}: {
  issue: string; whyItMatters: string; approach: string; contribution: string;
  status: string; nextMilestone?: string; accent: string; dark?: boolean;
}) {
  const location = useLocation();
  const pathParts = location.pathname.split("/").filter(Boolean);
  const slug = pathParts[pathParts.length - 1] ?? "mission";
  const ink = dark ? "rgba(255,255,255,.94)" : T.ink;
  const dim = dark ? "rgba(255,255,255,.6)" : T.dim;
  const line = dark ? "rgba(255,255,255,.16)" : "rgba(8,8,8,.12)";
  const bg = dark ? "#0A0A0A" : "#fff";
  const mono = { fontFamily: T.mono, fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase" as const };

  const humanQuestion: Record<string, string> = {
    cle4n: "How does waste reach the sea — and where can we stop it?",
    wh4les: "What would it take for whales to move through safer oceans?",
    cor4l: "What happens when the living structure of a reef begins to fail?",
    "rewild-marine": "How do we bring life back to damaged coasts and shallow seas?",
    clim4te: "Where can climate action also help living systems recover?",
    am4zonia: "What happens when a rainforest that helps make its own rain is broken apart?",
    species: "What disappears when a species disappears from its relationships?",
    "rewild-land": "How do damaged landscapes become living systems again?",
    food: "How can we feed ourselves without breaking the living systems food depends on?",
    en4rgy: "How can we power human life with less pressure on the systems around us?",
    "circular-city": "Can a city use materials without turning them into waste?",
    f4shion: "What does what we wear ask from land, water, energy and people?",
    m4gazine: "What stories make people see the living planet differently?",
    "4film": "What can film make visible that data alone cannot?",
    "4rt": "Can art change what people notice, value and protect?",
    "4play": "Can play turn planetary complexity into something people can feel and act on?",
  };

  const fields: [string, string][] = [
    ["WHAT IS HAPPENING", issue],
    ["WHY THIS MATTERS", whyItMatters],
    ["WHAT CAN HELP", approach],
    ["WHAT 4PLANET IS BUILDING", contribution],
  ];

  const speciesPath = (() => {
    if (slug === "wh4les") return "/species/orca";
    if (slug === "am4zonia") return "/species/jaguar";
    if (slug === "food") return "/species/western-honey-bee";
    if (["en4rgy", "circular-city", "f4shion"].includes(slug)) return "/species/homo-sapiens";
    return "/species";
  })();

  const links = [
    {
      no: "01",
      name: "SEE IT IN ATLAS",
      line: "Put the Mission back into place. Explore the planet, observations and spatial context.",
      to: contextHref("/atlas", location.search, { journey: slug }),
    },
    {
      no: "02",
      name: slug === "food" || ["en4rgy", "circular-city", "f4shion"].includes(slug) ? "MEET THE SPECIES INSIDE IT" : "MEET THE LIFE INSIDE IT",
      line: ["en4rgy", "circular-city", "f4shion"].includes(slug)
        ? "Start with Homo sapiens — then follow the species and living systems our choices touch."
        : "Move from the problem to the species living through it.",
      to: contextHref(speciesPath, location.search, { journey: slug }),
    },
    {
      no: "03",
      name: "UNDERSTAND THE SYSTEM",
      line: "Follow the relationships: what depends on what, where pressure enters and what can change.",
      to: contextHref("/living-systems", location.search, { journey: slug }),
    },
    {
      no: "04",
      name: "FIND A WAY TO HELP",
      line: "Continue into action pathways without pretending a pathway is operational before the evidence is ready.",
      to: contextHref("/impact", location.search, { journey: slug }),
    },
  ];

  return (
    <section
      aria-label="Mission summary and connected 4PLANET lenses"
      style={{
        background: bg,
        color: ink,
        borderTop: `1px solid ${line}`,
        borderBottom: `1px solid ${line}`,
        padding: "clamp(34px,4.5vw,56px) clamp(20px,5vw,64px)",
        "--mission-line": line,
      } as React.CSSProperties}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div style={{ ...mono, color: dim, display: "inline-flex", alignItems: "center", gap: 10 }}>
          <span aria-hidden style={{ width: 7, height: 7, borderRadius: "50%", background: accent, display: "inline-block" }} />
          WHERE THIS MISSION STANDS · <span style={{ color: ink }}>{status}</span>
        </div>
        {nextMilestone && <div style={{ ...mono, color: dim }}>NEXT MILESTONE · <span style={{ color: ink }}>{nextMilestone}</span></div>}
      </div>

      <div style={{ marginTop: "clamp(34px,5vw,64px)", marginBottom: "clamp(34px,5vw,56px)", maxWidth: 980 }}>
        <div style={{ ...mono, color: accent, marginBottom: 12 }}>START HERE</div>
        <h2 style={{ margin: 0, fontFamily: T.display, fontWeight: 500, fontSize: "clamp(30px,4.4vw,66px)", lineHeight: .98, letterSpacing: "-.045em", maxWidth: "18ch" }}>
          {humanQuestion[slug] ?? "What is changing here — and what could help?"}
        </h2>
      </div>

      <div className="mission-human-strip">
        {fields.map(([label, value]) => (
          <div className="mission-human-strip__cell" key={label}>
            <div style={{ ...mono, color: accent, marginBottom: 10 }}>{label}</div>
            <p style={{ margin: 0, color: ink, fontSize: "clamp(14.5px,1.05vw,16px)", lineHeight: 1.56 }}>{value}</p>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "clamp(42px,6vw,70px)" }}>
        <div style={{ ...mono, color: accent }}>FOLLOW THE CONNECTIONS</div>
        <h2 style={{ marginTop: 10, fontFamily: T.display, fontWeight: 500, fontSize: "clamp(24px,3vw,42px)", lineHeight: 1.02, letterSpacing: "-.035em", maxWidth: "18ch" }}>
          The Mission is one part of a living system.
        </h2>
        <p style={{ marginTop: 14, color: dim, fontSize: "clamp(14px,1.2vw,17px)", lineHeight: 1.55, maxWidth: 650 }}>
          Change lens without losing the thread.
        </p>

        <div className="mission-world-bridge">
          {links.map((link) => (
            <Link
              key={link.no}
              to={link.to}
              className="mission-world-bridge__link"
              style={{ color: ink, background: dark ? "rgba(255,255,255,.015)" : "#fff" }}
            >
              <div style={{ ...mono, color: accent }}>{link.no}</div>
              <div>
                <div style={{ fontFamily: T.display, fontWeight: 500, fontSize: "clamp(17px,1.6vw,22px)", lineHeight: 1.05, letterSpacing: "-.02em" }}>{link.name}</div>
                <p style={{ marginTop: 9, color: dim, fontSize: 13.5, lineHeight: 1.5 }}>{link.line}</p>
              </div>
              <div style={{ ...mono, color: accent }}>OPEN →</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
