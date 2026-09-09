import { T } from "@/styles/tokens";

/**
 * WS-B — Technical Mission Strip.
 * Placed after the cinematic opening and before the article. A concise,
 * high-contrast information line that makes a Mission feel like a real
 * initiative a person can follow — not a dashboard, SaaS card or boxed wall.
 *
 * STATUS and CONTRIBUTION must never imply a Mission is funded, partnered,
 * operational or delivering. NEXT MILESTONE renders only when a real one is
 * supplied — no invented milestones.
 */
export function MissionStrip({
  issue, whyItMatters, approach, contribution, status, nextMilestone, accent, dark = false,
}: {
  issue: string; whyItMatters: string; approach: string; contribution: string;
  status: string; nextMilestone?: string; accent: string; dark?: boolean;
}) {
  const ink = dark ? "rgba(255,255,255,.94)" : T.ink;
  const dim = dark ? "rgba(255,255,255,.6)" : T.dim;
  const line = dark ? "rgba(255,255,255,.16)" : "rgba(8,8,8,.12)";
  const bg = dark ? "#0A0A0A" : "#fff";
  const mono = { fontFamily: T.mono, fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase" as const };
  const fields: [string, string][] = [
    ["ISSUE", issue],
    ["WHY IT MATTERS", whyItMatters],
    ["OUR APPROACH", approach],
    ["CONTRIBUTION", contribution],
  ];
  return (
    <section aria-label="Mission summary" style={{ background: bg, color: ink, borderTop: `1px solid ${line}`, borderBottom: `1px solid ${line}`, padding: "clamp(30px,4vw,48px) clamp(20px,5vw,64px)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: "clamp(22px,3vw,32px)" }}>
        <div style={{ ...mono, color: dim, display: "inline-flex", alignItems: "center", gap: 10 }}>
          <span aria-hidden style={{ width: 7, height: 7, borderRadius: "50%", background: accent, display: "inline-block" }} />
          STATUS · <span style={{ color: ink }}>{status}</span>
        </div>
        {nextMilestone && <div style={{ ...mono, color: dim }}>NEXT MILESTONE · <span style={{ color: ink }}>{nextMilestone}</span></div>}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: "clamp(20px,2.6vw,36px)" }}>
        {fields.map(([label, value]) => (
          <div key={label}>
            <div style={{ ...mono, color: accent, marginBottom: 8 }}>{label}</div>
            <p style={{ margin: 0, color: ink, fontSize: "clamp(14px,1vw,15.5px)", lineHeight: 1.5 }}>{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
