import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { T } from "@/styles/tokens";
import { PublicShell } from "@/components/layout/PublicShell";
import { RelationshipReveal } from "@/components/phase04/RelationshipReveal";
import { ProvenanceBar } from "@/components/phase04/ProvenanceBar";
import { LIVING_SYSTEMS, RELATIONS, nodeById } from "@/planet/livingSystems";
import { claimForRelation } from "@/data/runtimeClaims";
import { runtimeSource } from "@/data/runtimeSources";
import type { RelationshipStep } from "@/phase04/model";

const pollination = LIVING_SYSTEMS.find((s) => s.name === "Pollination");
const pollinationIds = pollination?.chain ?? [];
const pollinationRelations = pollinationIds.slice(1).map((id, index) =>
  RELATIONS.find((relation) => relation.from === pollinationIds[index] && relation.to === id),
).filter(Boolean);
const pollinationClaims = pollinationRelations.map((relation) => claimForRelation(relation!.id)).filter(Boolean);
const pollinationSources = Array.from(new Set(pollinationClaims.flatMap((claim) => claim.supportingSourceIds)))
  .map(runtimeSource)
  .filter(Boolean);

const chain: RelationshipStep[] = pollinationIds.map((id, index) => {
  const node = nodeById(id);
  const relation = index > 0 ? pollinationRelations[index - 1] : undefined;
  const control = relation ? claimForRelation(relation.id) : undefined;
  return {
    id,
    label: node?.label ?? id,
    kind: node?.type ?? "UNKNOWN",
    status: control ? `${control.gate} · ${control.reviewState}` : "ENTRY POINT",
  };
});

export function LivingSystems() {
  return (
    <PublicShell>
      <section style={{ maxWidth: 1380, margin: "0 auto", padding: "clamp(70px,10vw,150px) clamp(20px,5vw,72px) clamp(50px,7vw,90px)" }}>
        <div style={{ ...mono, color: T.blue }}>4PLANET_ / LIVING SYSTEMS / SHARED ENGINE</div>
        <h1 style={{ ...display, fontSize: "clamp(58px,9vw,132px)", margin: "clamp(32px,6vw,72px) 0 0", maxWidth: 1150 }}>
          What depends<br />on what?
        </h1>
        <p style={{ fontSize: "clamp(20px,2.3vw,31px)", lineHeight: 1.24, letterSpacing: "-.025em", maxWidth: 820, margin: "30px 0 0" }}>
          Living Systems is not a fifth app. It is the shared relationship mode that lets ATLAS, SPECIES, missions and place journeys reveal dependencies, functions, pressures and human systems.
        </p>
        <div style={{ display: "flex", gap: 9, flexWrap: "wrap", marginTop: 28 }}>
          <Link to="/atlas" style={button}>Explore in ATLAS →</Link>
          <Link to="/species" style={{ ...button, background: "#fff", color: T.ink }}>Start with a species</Link>
          <Link to="/place/oslofjorden" style={{ ...button, background: "#fff", color: T.ink }}>Oslofjorden journey</Link>
        </div>
      </section>

      <section style={{ maxWidth: 1380, margin: "0 auto", padding: "clamp(40px,7vw,90px) clamp(20px,5vw,72px)" }}>
        <div style={{ ...mono, color: T.blue, marginBottom: 18 }}>RELATIONSHIP REVEAL / POLLINATION PROOF CHAIN</div>
        <RelationshipReveal
          steps={chain}
          note="The graph remains a seeded prototype reasoning surface. Material relation wording is now constrained by the versioned Claim-first runtime export; Claim review does not imply independent expert review."
        />
        <div style={{ marginTop: 18 }}>
          <ProvenanceBar value={{
            state: "4PLANET CONTEXT",
            actor: "4PLANET / Knowledge OS",
            sources: pollinationSources.map((source) => source.publisher),
            sourceLinks: pollinationSources.map((source) => ({ id: source.sourceId, label: `${source.publisher} — ${source.label}`, url: source.url })),
            method: "Versioned derivative Claim-first runtime export from the canonical Knowledge OS",
            dataDate: "CANONICAL CLAIM BASELINE · 2026-08-09",
            lastChecked: "2026-08-09",
            claimIds: pollinationClaims.map((claim) => `${claim.claimId}@${claim.claimVersion}`),
            rightsState: "SOURCE-SPECIFIC — SEE LINKED SOURCE TERMS",
            whyWeSayThis: "Each visible relationship step resolves to a canonical material Claim treatment before public wording is shown. The product uses public-safe wording and preserves the Claim limitations rather than treating repeated prototype prose as evidence.",
            limitation: "Claim-first treatment reduces truth drift but does not make the complete Living Systems graph scientifically reviewed. New or changed material edges still require canonical Claim/source review.",
            flags: ["CLAIM QUALIFIED"],
          }} />
        </div>
      </section>

      <section style={{ background: T.ink, color: "#fff", padding: "clamp(70px,10vw,140px) clamp(20px,5vw,72px)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(280px,.8fr)", gap: "clamp(30px,6vw,80px)" }}>
          <div><div style={{ ...mono, color: T.acid }}>ONE ENGINE / MANY INTERFACES</div><h2 style={{ ...display, fontSize: "clamp(44px,7vw,92px)", margin: "18px 0 0" }}>Relationship intelligence should appear where context needs it.</h2></div>
          <div style={{ alignSelf: "end" }}>
            {[
              ["ATLAS", "Place and spatial context", "/atlas"],
              ["SPECIES", "Identity and ecological relationships", "/species"],
              ["MISSIONS", "Deep subject worlds", "/missions"],
              ["IMPACT", "Action and evidence context", "/impact"],
            ].map(([name, desc, to]) => <Link key={name} to={to} style={{ display: "block", color: "#fff", textDecoration: "none", borderTop: "1px solid rgba(255,255,255,.25)", padding: "15px 0" }}><span style={{ fontFamily: T.display, fontSize: 24, letterSpacing: "-.03em" }}>{name}</span><span style={{ display: "block", fontSize: 13, color: "rgba(255,255,255,.65)", marginTop: 4 }}>{desc}</span></Link>)}
          </div>
        </div>
      </section>
      <style>{`@media(max-width:760px){#main-content section:last-of-type>div{grid-template-columns:1fr!important}}`}</style>
    </PublicShell>
  );
}

const display: CSSProperties = { fontFamily: T.display, fontWeight: 500, letterSpacing: "-.055em", lineHeight: .92 };
const mono: CSSProperties = { fontFamily: T.mono, fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase" };
const button: CSSProperties = { display: "inline-flex", padding: "11px 14px", border: `1px solid ${T.ink}`, background: T.ink, color: "#fff", textDecoration: "none", fontSize: 13 };
