import { Link } from "react-router-dom";
import { T } from "@/styles/tokens";
import { PublicShell } from "@/components/layout/PublicShell";
import { Section, Label, Button } from "@/components/ui";

export function Reports() {
  const PROOF: [string, string, string][] = [
    ["01_", "PARTNER REPORT", "An approved delivery partner reports what was actually done."],
    ["02_", "EVIDENCE REVIEW", "Evidence is checked against a defined standard."],
    ["03_", "CLAIM APPROVAL", "Only reviewed, supportable claims are approved."],
    ["04_", "PUBLIC REPORT", "The archive opens with the first live Impact Unit."],
  ];
  return (
    <PublicShell>
      <Section pad="clamp(48px,7vw,96px)">
        <Label color={T.blue} style={{ marginBottom: 16 }}>Proof &amp; Reporting</Label>
        <h1 style={{ fontWeight: 500, color: T.ink, fontSize: "clamp(32px,3.4vw,48px)", letterSpacing: "-.035em", lineHeight: 1 }}>Proof follows delivery.</h1>
        <p style={{ fontSize: "clamp(16px,2vw,19px)", color: T.ink, marginTop: 18, maxWidth: 640, lineHeight: 1.55 }}>
          4Planet publishes reports only after a live Impact Unit has received partner reporting, evidence has been reviewed, and public claims have been approved. Until then, 4Planet makes no completed-impact claims.
        </p>
        <div className="tw" style={{ marginTop: 34, border: `1px solid ${T.line}` }}>
          {PROOF.map(([n, t, d], i) => (
            <div key={t} style={{ padding: "clamp(22px,3vw,34px)", borderLeft: i % 2 ? `1px solid ${T.line}` : "none", borderTop: i >= 2 ? `1px solid ${T.line}` : "none" }}>
              <span className="mono meta-blue" style={{ fontSize: 11 }}>{n}</span>
              <div style={{ fontWeight: 500, fontSize: 15, marginTop: 12 }}>{t}</div>
              <p style={{ fontSize: 13.5, color: T.dim, marginTop: 10, lineHeight: 1.5 }}>{d}</p>
            </div>
          ))}
        </div>
      </Section>
    </PublicShell>
  );
}
