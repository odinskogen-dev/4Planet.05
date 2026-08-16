import { Link, useLocation } from "react-router-dom";
import { T } from "@/styles/tokens";
import { PublicShell } from "@/components/layout/PublicShell";
import { Section, Label, Button } from "@/components/ui";
import { returnHrefFromSearch } from "@/product/productContext";

const ROLES: [string, string, string][] = [
  ["4PEOPLE MEMBER_", "Free membership and mission updates.", "Follow the domains you care about and take part as new pathways open."],
  ["FOUNDING MEMBER_", "Future paid support for 4Planet's public platform and infrastructure.", "Help build the platform, mission development and proof systems credible action depends on."],
  ["MISSION BACKER_", "Future pathway for following and supporting a specific mission as public pathways open.", "Back a specific challenge once its delivery and reporting are in place."],
  ["4AMBASSADOR_", "Future pathway for creators, communicators and public participation.", "Carry the work into culture, community and public imagination."],
];

export default function Join() {
  const location = useLocation();
  const returnHref = returnHrefFromSearch(location.search);
  const NOW: [string, string, string][] = [
    ["FOLLOW", "Follow a Domain, Mission or species.", "Watch the living systems you care about and see what is reported about them over time."],
    ["EXPLORE THE EVIDENCE", "Use ATLAS and the test journeys.", "Explore real source records in ATLAS and walk the IMPACT test journeys — no account, no payment."],
    ["LEND EXPERTISE", "Scientists, ecologists, data people.", "If you work with ecological data or field science, 4Planet wants your review and correction."],
    ["OPEN A DATA SOURCE", "Point us to credible, licensed data.", "Suggest authoritative datasets and sources 4Planet should integrate — with their terms."],
    ["CREATIVE WORK", "Writers, photographers, designers.", "Contribute images, writing and design that carry ecological attention (with clear rights)."],
    ["PARTNER ENQUIRY", "Organisations, brands, funders.", "Explore partnership once your delivery, evidence and reporting can be shown honestly."],
  ];
  return (
    <PublicShell>
      <Section pad="clamp(48px,7vw,96px)">
        {returnHref && (
          <Link to={returnHref} data-testid="return-to-atlas" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: T.mono, fontSize: 11, letterSpacing: ".12em", color: "#fff", background: T.blue, padding: "10px 14px", textDecoration: "none", marginBottom: 20 }}>
            ← BACK TO OBSERVATION IN ATLAS
          </Link>
        )}
        <Label color={T.blue} style={{ marginBottom: 16 }}>Join 4PLANET</Label>
        <h1 style={{ fontWeight: 500, color: T.ink, fontSize: "clamp(30px,3.4vw,48px)", letterSpacing: "-.035em", lineHeight: 1.05 }}>Everyone has a role in bringing nature back into balance.</h1>
        <p style={{ fontSize: "clamp(16px,2vw,18px)", color: T.dim, marginTop: 18, maxWidth: 640, lineHeight: 1.55 }}>
          4Planet is being built to bring people, partners, brands and funders into the same system for action.
          Some ways to take part are open now; paid membership is not yet active.
        </p>

        {/* Ways to take part NOW — honest, no payment or data capture */}
        <div className="mono" style={{ fontSize: 11, color: T.blue, marginTop: 40, letterSpacing: ".14em" }}>WAYS TO TAKE PART NOW</div>
        <div className="three" style={{ marginTop: 18, border: `1px solid ${T.line}` }}>
          {NOW.map(([t, role, desc], i) => (
            <div key={t} style={{ padding: "clamp(22px,3vw,34px)", borderTop: i >= 3 ? `1px solid ${T.line}` : "none", borderLeft: i % 3 ? `1px solid ${T.line}` : "none" }}>
              <span style={{ fontWeight: 600, fontSize: "clamp(17px,2vw,21px)", color: T.ink }}>{t}</span>
              <div className="mono" style={{ fontSize: 11, color: T.dim, marginTop: 10 }}>{role}</div>
              <p style={{ fontSize: 14, color: T.dim, marginTop: 12, lineHeight: 1.55 }}>{desc}</p>
            </div>
          ))}
        </div>

        <div className="mono" style={{ fontSize: 11, color: T.dim, marginTop: 48, letterSpacing: ".14em" }}>FUTURE MEMBERSHIP · NOT YET ACTIVE</div>
        <div className="tw" style={{ marginTop: 18, border: `1px solid ${T.line}` }}>
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
