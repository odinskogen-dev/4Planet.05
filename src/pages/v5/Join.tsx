import { Link, useLocation } from "react-router-dom";
import { T } from "@/styles/tokens";
import { PublicShell } from "@/components/layout/PublicShell";
import { Section, Label, Button } from "@/components/ui";
import { returnHrefFromSearch } from "@/product/productContext";
import { useFourPlanetIdentity } from "@/auth/FourPlanetIdentity";

const ROLES: [string, string, string, string][] = [
  ["4PEOPLE MEMBER_", "OPEN NOW", "Free 4PLANET ID and personal profile.", "Create one identity for saved participation and the personal 4PLANET products connected to it."],
  ["FOUNDING MEMBER_", "FUTURE PAID PATHWAY", "Future paid support for 4Planet's public platform and infrastructure.", "Help build the platform, mission development and proof systems credible action depends on."],
  ["MISSION BACKER_", "FUTURE PATHWAY", "Future pathway for following and supporting a specific mission as public pathways open.", "Back a specific challenge once its delivery and reporting are in place."],
  ["4AMBASSADOR_", "FUTURE PATHWAY", "Future pathway for creators, communicators and public participation.", "Carry the work into culture, community and public imagination."],
];

export default function Join() {
  const location = useLocation();
  const returnHref = returnHrefFromSearch(location.search);
  const { user, openAuth } = useFourPlanetIdentity();
  const NOW: [string, string, string][] = [
    ["CREATE YOUR 4PLANET ID", "Free personal identity.", "Create a profile you can use as personal features and participation paths are connected across 4PLANET."],
    ["FOLLOW", "Follow a Domain, Mission or species.", "Watch the living systems you care about and see what is reported about them over time."],
    ["EXPLORE THE EVIDENCE", "Use ATLAS and the test journeys.", "Explore real source records in ATLAS and walk the IMPACT test journeys. Public exploration stays open without an account."],
    ["LEND EXPERTISE", "Scientists, ecologists, data people.", "If you work with ecological data or field science, 4Planet wants your review and correction."],
    ["OPEN A DATA SOURCE", "Point us to credible, licensed data.", "Suggest authoritative datasets and sources 4Planet should integrate — with their terms."],
    ["CREATIVE WORK", "Writers, photographers, designers.", "Contribute images, writing and design that carry ecological attention (with clear rights)."],
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
        <h1 style={{ fontWeight: 500, color: T.ink, fontSize: "clamp(30px,3.4vw,48px)", letterSpacing: "-.035em", lineHeight: 1.05 }}>One planet. One identity for taking part.</h1>
        <p style={{ fontSize: "clamp(16px,2vw,18px)", color: T.dim, marginTop: 18, maxWidth: 680, lineHeight: 1.55 }}>
          Create a free 4PLANET ID for your personal profile and saved participation. The public planet remains open to everyone — we only ask you to sign in when it creates personal value.
        </p>

        <div style={{ marginTop: 26, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <button
            type="button"
            onClick={() => openAuth(user ? "account" : "signup")}
            style={{ border: `1px solid ${T.blue}`, background: T.blue, color: "#fff", padding: "13px 18px", borderRadius: 999, fontFamily: T.mono, fontSize: 10.5, fontWeight: 600, letterSpacing: ".12em", cursor: "pointer" }}
          >
            {user ? "OPEN YOUR 4PLANET ID" : "CREATE 4PLANET ID"}
          </button>
          {!user && (
            <button
              type="button"
              onClick={() => openAuth("signin")}
              style={{ border: `1px solid ${T.line}`, background: "transparent", color: T.ink, padding: "13px 18px", borderRadius: 999, fontFamily: T.mono, fontSize: 10.5, letterSpacing: ".12em", cursor: "pointer" }}
            >
              LOG IN
            </button>
          )}
          {user && <span className="mono" style={{ fontSize: 10.5, color: T.blue, letterSpacing: ".1em" }}>4PLANET ID ACTIVE ✓</span>}
        </div>

        <div className="mono" style={{ fontSize: 11, color: T.blue, marginTop: 48, letterSpacing: ".14em" }}>WAYS TO TAKE PART NOW</div>
        <div className="three" style={{ marginTop: 18, border: `1px solid ${T.line}` }}>
          {NOW.map(([t, role, desc], i) => (
            <div key={t} style={{ padding: "clamp(22px,3vw,34px)", borderTop: i >= 3 ? `1px solid ${T.line}` : "none", borderLeft: i % 3 ? `1px solid ${T.line}` : "none" }}>
              <span style={{ fontWeight: 600, fontSize: "clamp(17px,2vw,21px)", color: T.ink }}>{t}</span>
              <div className="mono" style={{ fontSize: 11, color: T.dim, marginTop: 10 }}>{role}</div>
              <p style={{ fontSize: 14, color: T.dim, marginTop: 12, lineHeight: 1.55 }}>{desc}</p>
            </div>
          ))}
        </div>

        <div className="mono" style={{ fontSize: 11, color: T.dim, marginTop: 48, letterSpacing: ".14em" }}>MEMBERSHIP PATHWAYS</div>
        <div className="tw" style={{ marginTop: 18, border: `1px solid ${T.line}` }}>
          {ROLES.map(([t, state, role, desc], i) => (
            <div key={t} style={{ padding: "clamp(22px,3vw,38px)", borderLeft: i % 2 ? `1px solid ${T.line}` : "none", borderTop: i >= 2 ? `1px solid ${T.line}` : "none" }}>
              <span style={{ fontWeight: 500, fontSize: "clamp(18px,2.1vw,23px)", color: T.ink }}>{t}</span>
              <div className="mono" style={{ fontSize: 10, color: i === 0 ? T.blue : T.faint, marginTop: 9, letterSpacing: ".1em" }}>{state}</div>
              <div className="mono" style={{ fontSize: 11, color: T.blue, marginTop: 10 }}>{role}</div>
              <p style={{ fontSize: 14, color: T.dim, marginTop: 12, lineHeight: 1.55 }}>{desc}</p>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 13.5, color: T.faint, marginTop: 20, maxWidth: 680, lineHeight: 1.55 }}>
          The free 4PLANET ID is active now. Paid membership and mission funding are separate future pathways and are not activated by creating an account.
        </p>
        <div style={{ marginTop: 24, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Button to="/domains" arrow>ENTER DOMAINS_</Button>
          <Button to="/impact">EXPLORE IMPACT</Button>
        </div>
      </Section>
    </PublicShell>
  );
}