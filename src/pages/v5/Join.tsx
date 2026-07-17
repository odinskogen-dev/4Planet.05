import { Link } from "react-router-dom";
import { T } from "@/styles/tokens";
import { PublicShell } from "@/components/layout/PublicShell";
import { Section, Label, Button } from "@/components/ui";

const ROLES: [string, string, string][] = [
  ["4PEOPLE MEMBER_", "Free membership and mission updates.", "Follow the domains you care about and take part as new pathways open."],
  ["FOUNDING MEMBER_", "Future paid support for 4Planet's public platform and infrastructure.", "Help build the platform, mission development and proof systems credible action depends on."],
  ["MISSION BACKER_", "Future pathway for following and supporting a specific mission as public pathways open.", "Back a specific challenge once its delivery and reporting are in place."],
  ["4AMBASSADOR_", "Future pathway for creators, communicators and public participation.", "Carry the work into culture, community and public imagination."],
];

export default function Join() {
  return (
    <PublicShell>
      <Section pad="clamp(48px,7vw,96px)">
        <Label color={T.blue} style={{ marginBottom: 16 }}>Join 4PLANET_</Label>
        <h1 style={{ fontWeight: 500, color: T.ink, fontSize: "clamp(30px,3.4vw,48px)", letterSpacing: "-.035em", lineHeight: 1.05 }}>Everyone has a role in bringing nature back into balance.</h1>
        <p style={{ fontSize: "clamp(16px,2vw,18px)", color: T.dim, marginTop: 18, maxWidth: 640, lineHeight: 1.55 }}>
          4Planet is being built to bring people, partners, brands and funders into the same system for action. These are roles in that system — not active subscription tiers.
        </p>

        <div className="tw" style={{ marginTop: 34, border: `1px solid ${T.line}` }}>
          {ROLES.map(([t, role, desc], i) => (
            <div key={t} style={{ padding: "clamp(22px,3vw,38px)", borderLeft: i % 2 ? `1px solid ${T.line}` : "none", borderTop: i >= 2 ? `1px solid ${T.line}` : "none" }}>
              <span style={{ fontWeight: 500, fontSize: "clamp(18px,2.1vw,23px)", color: T.ink }}>{t}</span>
              <div className="mono" style={{ fontSize: 11, color: T.blue, marginTop: 10 }}>{role}</div>
              <p style={{ fontSize: 14, color: T.dim, marginTop: 12, lineHeight: 1.55 }}>{desc}</p>
              <div className="mono" style={{ fontSize: 10.5, color: T.faint, marginTop: 16, letterSpacing: ".08em" }}>OPENING WITH THE FIRST SECURE PUBLIC RELEASE</div>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 13.5, color: T.faint, marginTop: 20, maxWidth: 640, lineHeight: 1.55 }}>
          Membership will support 4Planet's platform, mission development and proof infrastructure. It will not purchase or fund a specific Impact Unit. No registration, payment or data capture is active in this release.
        </p>
        <div style={{ marginTop: 24, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Button to="/domains" arrow>ENTER DOMAINS_</Button>
          <Button to="/impact">EXPLORE IMPACT</Button>
        </div>
      </Section>
    </PublicShell>
  );
}
