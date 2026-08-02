import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { T, DOMAIN_ACCENT } from "@/styles/tokens";
import type { NarrativeMission, NarrativeStatus } from "@/content/narrativeContract";
import { STATUS_MEANING, displayName } from "@/content/narrativeContract";

export const display: React.CSSProperties = {
  fontFamily: T.display,
  fontWeight: 500,
  letterSpacing: "-.035em",
};

export const mono = (colour: string = T.blue): React.CSSProperties => ({
  fontFamily: T.mono,
  fontSize: 11,
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: colour,
});

const STATUS_TONE: Record<NarrativeStatus, { background: string; colour: string }> = {
  "CONCEPT": { background: "#f0f0f0", colour: T.ink },
  "IN DEVELOPMENT": { background: "#e8e8ff", colour: T.blue },
  "PARTNER VALIDATION": { background: "#fff0e8", colour: "#a33a16" },
  "PILOT PREPARATION": { background: "#e8f7ee", colour: "#12603a" },
  "TEST ONLY": { background: "#fff6d8", colour: "#6b5000" },
  "COMING": { background: "#eeeeee", colour: T.dim },
  "AVAILABLE": { background: "#e6f8ec", colour: "#105f33" },
  "REPORTING": { background: "#e8f1ff", colour: "#164f9f" },
  "VERIFIED RESULT": { background: "#0a0a0a", colour: "#ffffff" },
};

export function StatusBadge({ status, onDark = false }: { status: NarrativeStatus; onDark?: boolean }) {
  const tone = STATUS_TONE[status];
  return (
    <span
      title={STATUS_MEANING[status]}
      style={{
        ...mono(onDark ? "#fff" : tone.colour),
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 11px",
        background: onDark ? "rgba(255,255,255,.10)" : tone.background,
        border: onDark ? "1px solid rgba(255,255,255,.32)" : "1px solid transparent",
        lineHeight: 1,
      }}
    >
      <span aria-hidden style={{ width: 6, height: 6, background: onDark ? "#fff" : tone.colour, display: "inline-block" }} />
      {status}
    </span>
  );
}

export function ActionLink({
  href,
  children,
  primary = false,
  onDark = false,
}: {
  href: string;
  children: ReactNode;
  primary?: boolean;
  onDark?: boolean;
}) {
  const style: React.CSSProperties = {
    ...mono(primary ? "#fff" : onDark ? "#fff" : T.ink),
    display: "inline-flex",
    alignItems: "center",
    minHeight: 46,
    padding: "0 17px",
    textDecoration: "none",
    background: primary ? T.blue : "transparent",
    border: primary ? `1px solid ${T.blue}` : `1px solid ${onDark ? "rgba(255,255,255,.55)" : T.ink}`,
    transition: "transform .2s ease",
  };
  return href.startsWith("/")
    ? <Link to={href} style={style}>{children}<span aria-hidden style={{ marginLeft: 12 }}>→</span></Link>
    : <a href={href} style={style}>{children}<span aria-hidden style={{ marginLeft: 12 }}>↓</span></a>;
}

export function MissionStrip({ mission, dark = false }: { mission: NarrativeMission; dark?: boolean }) {
  const foreground = dark ? "#fff" : T.ink;
  const dim = dark ? "rgba(255,255,255,.68)" : T.dim;
  const border = dark ? "rgba(255,255,255,.22)" : T.line;
  const fields = [
    ["ISSUE", mission.issue],
    ["WHY IT MATTERS", mission.whyItMatters],
    ["OUR APPROACH", mission.approach],
    ["CONTRIBUTION", mission.contribution],
  ];
  return (
    <section aria-label="Mission status and scope" style={{ borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}` }}>
      <div className="narrative-strip" style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))" }}>
        {fields.map(([label, value], index) => (
          <div key={label} style={{ padding: "24px 22px 28px", borderLeft: index ? `1px solid ${border}` : "none" }}>
            <div style={mono(dark ? DOMAIN_ACCENT[mission.domain] : T.blue)}>{label}</div>
            <p style={{ margin: "12px 0 0", color: foreground, fontSize: 14.5, lineHeight: 1.55 }}>{value}</p>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 20, alignItems: "center", flexWrap: "wrap", padding: "18px 22px", borderTop: `1px solid ${border}` }}>
        <div>
          <div style={mono(dim)}>NEXT MILESTONE</div>
          <p id="next" style={{ margin: "8px 0 0", color: foreground, fontSize: 14.5, lineHeight: 1.5, maxWidth: 820 }}>{mission.nextMilestone}</p>
        </div>
        <StatusBadge status={mission.status} onDark={dark} />
      </div>
      <style>{`@media(max-width:900px){.narrative-strip{grid-template-columns:1fr 1fr!important}.narrative-strip>div:nth-child(3){border-left:0!important;border-top:1px solid ${border}}.narrative-strip>div:nth-child(4){border-top:1px solid ${border}}}@media(max-width:560px){.narrative-strip{grid-template-columns:1fr!important}.narrative-strip>div{border-left:0!important;border-top:1px solid ${border}}.narrative-strip>div:first-child{border-top:0}}`}</style>
    </section>
  );
}

export function MissionCard({ mission, compact = false }: { mission: NarrativeMission; compact?: boolean }) {
  const accent = DOMAIN_ACCENT[mission.domain];
  return (
    <Link
      to={`/missions/${mission.slug}`}
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: compact ? 260 : 340,
        padding: compact ? "22px" : "clamp(24px,3vw,38px)",
        background: "#0a0a0a",
        color: "#fff",
        textDecoration: "none",
        borderTop: `4px solid ${accent}`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "flex-start" }}>
        <span style={mono(accent)}>{mission.code}</span>
        <StatusBadge status={mission.status} onDark />
      </div>
      <div style={{ marginTop: 52 }}>
        <h3 style={{ ...display, margin: 0, color: "#fff", fontSize: compact ? "clamp(24px,2.6vw,34px)" : "clamp(30px,3.3vw,48px)", lineHeight: .98 }}>
          {displayName(mission.name)}
        </h3>
        <p style={{ margin: "15px 0 0", color: "rgba(255,255,255,.9)", fontSize: compact ? 14.5 : 17, lineHeight: 1.5, maxWidth: 520 }}>{mission.hero}</p>
        <p style={{ margin: "14px 0 0", color: "rgba(255,255,255,.58)", fontSize: 13.5, lineHeight: 1.45, maxWidth: 520 }}>{mission.relationship}</p>
      </div>
      <div style={{ ...mono(accent), marginTop: 32 }}>ENTER MISSION →</div>
    </Link>
  );
}

export function StatusLegend() {
  const statuses: NarrativeStatus[] = ["CONCEPT", "IN DEVELOPMENT", "PARTNER VALIDATION", "PILOT PREPARATION", "TEST ONLY", "AVAILABLE", "REPORTING", "VERIFIED RESULT"];
  return (
    <div style={{ display: "grid", gap: 1, background: T.line, border: `1px solid ${T.line}` }}>
      {statuses.map((status) => (
        <div key={status} style={{ display: "grid", gridTemplateColumns: "minmax(150px,220px) 1fr", gap: 22, alignItems: "center", background: "#fff", padding: "16px 18px" }}>
          <StatusBadge status={status} />
          <p style={{ margin: 0, color: T.dim, fontSize: 14, lineHeight: 1.5 }}>{STATUS_MEANING[status]}</p>
        </div>
      ))}
    </div>
  );
}
