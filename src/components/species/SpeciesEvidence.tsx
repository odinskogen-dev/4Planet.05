import type { EvidenceState, SpeciesProfile } from "@/data/species";
import { T } from "@/styles/tokens";

const mono: React.CSSProperties = { fontFamily: T.mono, fontSize: 10, letterSpacing: ".12em" };

export interface SpeciesEvidenceItem {
  state: EvidenceState;
  label?: string;
  text: string;
  sourceLabel?: string;
  sourceUrl?: string;
  checkedAt: string;
  limitation?: string;
}

const stateColor = (state: EvidenceState, dark: boolean) => {
  if (state === "KNOWN") return T.acid;
  if (state === "INTERPRETED") return dark ? "#8EA4FF" : T.blue;
  return dark ? "#E5B55D" : "#8A6500";
};

export function SpeciesEvidenceClaimCard({
  claim,
  dark = false,
}: {
  claim: SpeciesEvidenceItem;
  dark?: boolean;
}) {
  const color = stateColor(claim.state, dark);
  const dim = dark ? "rgba(255,255,255,.62)" : T.dim;
  return (
    <article style={{ minHeight: 260, background: dark ? "#090d0a" : "#fff", padding: "clamp(20px,3vw,30px)", display: "flex", flexDirection: "column" }}>
      <div style={{ ...mono, color }}>{claim.state} · CHECKED {claim.checkedAt}</div>
      {claim.label && <h4 style={{ margin: "22px 0 0", fontFamily: T.display, fontWeight: 500, fontSize: "clamp(22px,2.4vw,32px)", lineHeight: 1.02, letterSpacing: "-.025em" }}>{claim.label}</h4>}
      <p style={{ margin: claim.label ? "14px 0 0" : "24px 0 0", fontSize: "clamp(16px,1.5vw,19px)", lineHeight: 1.55 }}>{claim.text}</p>
      {claim.limitation && <p style={{ margin: "18px 0 0", color: dim, fontSize: 12.5, lineHeight: 1.58 }}><strong>BOUNDARY:</strong> {claim.limitation}</p>}
      {claim.sourceUrl && (
        <a href={claim.sourceUrl} target="_blank" rel="noreferrer" style={{ ...mono, marginTop: "auto", paddingTop: 24, color: dark ? T.acid : T.blue }}>
          {claim.sourceLabel ?? "OPEN SOURCE"} ↗
        </a>
      )}
    </article>
  );
}

export function SpeciesEvidence({
  profile,
  dark = false,
  title = "What can we say with confidence?",
  intro = "Material claims stay inspectable without taking over the first experience. Known facts, interpretation and unknowns remain separate.",
}: {
  profile: SpeciesProfile;
  dark?: boolean;
  title?: string;
  intro?: string;
}) {
  const claims: SpeciesEvidenceItem[] = (profile.publicClaims ?? []).map((claim) => ({
    state: claim.state,
    text: claim.text,
    sourceLabel: claim.source,
    sourceUrl: claim.sourceUrl,
    checkedAt: claim.checkedAt,
    limitation: claim.limitation,
  }));
  if (!claims.length) return null;

  const ink = dark ? "#fff" : T.ink;
  const dim = dark ? "rgba(255,255,255,.62)" : T.dim;
  const line = dark ? "rgba(255,255,255,.18)" : T.line;

  return (
    <section aria-labelledby={`species-evidence-${profile.slug}`} style={{ background: dark ? "#050805" : "#fff", color: ink }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "clamp(58px,8vw,108px) clamp(18px,5vw,72px)" }}>
        <div style={{ ...mono, color: dark ? T.acid : T.blue }}>SPECIES_ · EVIDENCE</div>
        <h2 id={`species-evidence-${profile.slug}`} style={{ margin: "16px 0 0", maxWidth: 820, fontFamily: T.display, fontWeight: 500, fontSize: "clamp(36px,5.4vw,72px)", letterSpacing: "-.045em", lineHeight: .96 }}>
          {title}
        </h2>
        <p style={{ margin: "22px 0 0", maxWidth: 720, fontSize: "clamp(15px,1.6vw,19px)", lineHeight: 1.6, color: dim }}>{intro}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))", gap: 1, marginTop: 38, background: line, border: `1px solid ${line}` }}>
          {claims.map((claim, index) => <SpeciesEvidenceClaimCard key={`${profile.id}-${index}`} claim={claim} dark={dark} />)}
        </div>
        <div style={{ marginTop: 18, ...mono, color: dim, lineHeight: 1.7 }}>
          SOURCE-BACKED SPECIES CONTEXT ≠ LOCAL PRESENCE · OCCURRENCE ≠ RANGE · SPECIES-LEVEL CLAIM ≠ POPULATION-SPECIFIC CLAIM
        </div>
      </div>
    </section>
  );
}
