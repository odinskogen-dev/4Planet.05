import { useParams, Link } from "react-router-dom";
import { T } from "@/styles/tokens";
import { PublicShell } from "@/components/layout/PublicShell";
import { NotFound } from "@/pages/system";
import { Section, Label, Button, StatusLabel } from "@/components/ui";
import { content } from "@/content/contentRepository";
import { ImpactCard } from "@/components/ImpactCard";
import { impactImage } from "@/content/imageRegistry";

const PROOF: [string, string, string][] = [
  ["01_", "PARTNER REPORT", "An approved delivery partner reports what was actually done in the field."],
  ["02_", "EVIDENCE REVIEW", "Evidence is checked against a defined standard before anything is claimed."],
  ["03_", "CLAIM APPROVAL", "Only reviewed, supportable claims are approved for public use."],
  ["04_", "PUBLIC REPORT", "The public archive opens with the first live Impact Unit."],
];

export function ImpactIndex() {
  const pathways = content.getImpactPathways();
  return (
    <PublicShell>
      <Section pad="clamp(48px,7vw,96px)">
        <Label color={T.blue} style={{ marginBottom: 16 }}>Impact Pathways</Label>
        <h1 style={{ fontFamily: T.display, fontWeight: 500, color: T.ink, fontSize: "clamp(32px,3.4vw,48px)", letterSpacing: "-.035em", lineHeight: 1 }}>Action without proof is only a promise.</h1>
        <p style={{ fontSize: "clamp(17px,2vw,20px)", color: T.ink, marginTop: 18, maxWidth: 680, lineHeight: 1.5 }}>
          4Planet is developing Impact Pathways that make it easier to understand what support is intended to do, how delivery is documented and how progress becomes visible over time.
        </p>
        <p style={{ fontSize: 15, color: T.dim, marginTop: 14, maxWidth: 640, lineHeight: 1.55 }}>
          Each pathway opens only after delivery, cost, capacity, evidence and reporting are confirmed. No pathway is open for public support yet.
        </p>
        <div className="tw" style={{ marginTop: 34, border: `1px solid ${T.line}` }}>
          {pathways.map((p, i) => (
            <ImpactCard key={p.slug} to={"/impact/" + p.slug} code={p.code} label={p.actionLabel ?? p.unitLabel} desc={p.description} status={p.status}
              img={impactImage(p.slug)} borderLeft={i % 2 === 1} borderTop={i >= 2} />
          ))}
        </div>
      </Section>

      <Section bg={T.blue} pad="clamp(40px,6vw,80px)">
        <Label color="rgba(255,255,255,.7)" style={{ marginBottom: 14 }}>Proof</Label>
        <h2 style={{ fontWeight: 500, color: "#fff", fontSize: "clamp(26px,4vw,42px)", letterSpacing: "-.03em" }}>Proof follows delivery.</h2>
        <div className="tw" style={{ marginTop: 30, border: `1px solid ${T.lineOnDark}` }}>
          {PROOF.map(([n, t, d], i) => (
            <div key={t} style={{ padding: "clamp(20px,2.6vw,30px)", borderLeft: i % 2 ? `1px solid ${T.lineOnDark}` : "none", borderTop: i >= 2 ? `1px solid ${T.lineOnDark}` : "none" }}>
              <span className="mono" style={{ fontSize: 11, color: "rgba(255,255,255,.7)" }}>{n}</span>
              <div style={{ fontWeight: 500, fontSize: 15, marginTop: 12, color: "#fff" }}>{t}</div>
              <p style={{ fontSize: 13.5, color: "rgba(255,255,255,.82)", marginTop: 10, lineHeight: 1.5 }}>{d}</p>
            </div>
          ))}
        </div>
      </Section>
    </PublicShell>
  );
}

export function PathwayPage() {
  const { slug } = useParams();
  const p = slug ? content.getImpactPathway(slug) : undefined;
  if (!p) return <NotFound />;
  const mission = content.getMissions().find((m) => m.impactPathwaySlug === p.slug);
  const heroImg = impactImage(p.slug);

  return (
    <PublicShell>
      {heroImg && (
        <div style={{ position: "relative", height: "clamp(48vh,60vh,640px)", overflow: "hidden", background: T.ink }}>
          <img src={heroImg.src} alt={heroImg.alt} loading="eager" decoding="async" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: heroImg.objectPosition ?? "50% 50%" }} />
          <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(8,8,8,.08), rgba(8,8,8,.36))" }} />
        </div>
      )}
      <section style={{ borderBottom: `1px solid ${T.line}` }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "clamp(40px,6vw,72px) clamp(20px,5vw,72px)" }}>
          <Link to="/impact" className="mono link" style={{ fontSize: 12, color: T.dim }}>← Impact Pathways</Link>
          <div className="mono" style={{ fontSize: 12, color: T.blue, marginTop: 22 }}>{p.code}</div>
          <h1 style={{ fontFamily: T.display, fontWeight: 500, color: T.blue, fontSize: "clamp(32px,5vw,64px)", letterSpacing: "-.04em", lineHeight: 1, marginTop: 12 }}>{p.unitLabel}</h1>
          <p style={{ fontSize: "clamp(17px,2.2vw,21px)", color: T.ink, marginTop: 18, maxWidth: 620, lineHeight: 1.5 }}>{p.description}</p>
          <div style={{ display: "flex", gap: 10, marginTop: 22, flexWrap: "wrap" }}>
            <StatusLabel>{p.status}</StatusLabel><span style={{ marginLeft: 18 }}><StatusLabel>PUBLIC SUPPORT CLOSED</StatusLabel></span>
          </div>
        </div>
      </section>

      <Section pad="clamp(40px,6vw,72px)">
        <div style={{ maxWidth: 740 }}>
          <Label style={{ marginBottom: 12 }}>What opens this pathway</Label>
          <p style={{ fontSize: 16, color: T.ink, lineHeight: 1.6 }}>
            This pathway opens for public support only after an approved delivery partner, a defined unit model, a cost and capacity model, evidence requirements and a reporting standard are confirmed. Until then 4Planet makes no completed-impact claims for it.
          </p>
        </div>

        <div style={{ borderTop: `1px solid ${T.line}`, marginTop: 32, paddingTop: 28 }}>
          <Label style={{ marginBottom: 16 }}>Proof model</Label>
          <div className="tw" style={{ border: `1px solid ${T.line}` }}>
            {PROOF.map(([n, t, d], i) => (
              <div key={t} style={{ padding: "clamp(20px,2.6vw,30px)", borderLeft: i % 2 ? `1px solid ${T.line}` : "none", borderTop: i >= 2 ? `1px solid ${T.line}` : "none" }}>
                <span className="mono meta-blue" style={{ fontSize: 11 }}>{n}</span>
                <div style={{ fontWeight: 500, fontSize: 15, marginTop: 12 }}>{t}</div>
                <p style={{ fontSize: 13.5, color: T.dim, marginTop: 10, lineHeight: 1.5 }}>{d}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap" }}>
          {mission && <Button to={"/missions/" + mission.slug}>VIEW {mission.name} MISSION</Button>}
          <Button to="/join" primary arrow>JOIN 4PLANET_</Button>
        </div>
      </Section>
    </PublicShell>
  );
}
