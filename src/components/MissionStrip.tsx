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
  const slug = location.pathname.split("/").filter(Boolean).at(-1) ?? "mission";
  const ink = dark ? "rgba(255,255,255,.94)" : T.ink;
  const dim = dark ? "rgba(255,255,255,.6)" : T.dim;
  const line = dark ? "rgba(255,255,255,.16)" : "rgba(8,8,8,.12)";
  const bg = dark ? "#0A0A0A" : "#fff";
  const mono = { fontFamily: T.mono, fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase" as const };

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
        padding: "clamp(30px,4vw,48px) clamp(20px,5vw,64px)",
        "--mission-line": line,
      } as React.CSSProperties}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: "clamp(22px,3vw,32px)" }}>
        <div style={{ ...mono, color: dim, display: "inline-flex", alignItems: "center", gap: 10 }}>
          <span aria-hidden style={{ width: 7, height: 7, borderRadius: "50%", background: accent, display: "inline-block" }} />
          WHERE THIS MISSION STANDS · <span style={{ color: ink }}>{status}</span>
        </div>
        {nextMilestone && <div style={{ ...mono, color: dim }}>NEXT MILESTONE · <span style={{ color: ink }}>{nextMilestone}</span></div>}
      </div>

      <div className="mission-human-strip">
        {fields.map(([label, value]) => (
          <div className="mission-human-strip__cell" key={label}>
            <div style={{ ...mono, color: accent, marginBottom: 10 }}>{label}</div>
            <p style={{ margin: 0, color: ink, fontSize: "clamp(14.5px,1.05vw,16px)", lineHeight: 1.56 }}>{value}</p>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "clamp(34px,5vw,56px)" }}>
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
