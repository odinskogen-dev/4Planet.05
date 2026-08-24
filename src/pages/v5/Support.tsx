import { Link, useSearchParams } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { Seo } from "@/components/Seo";
import { Section } from "@/components/ui";
import { T, DOMAIN_ACCENT } from "@/styles/tokens";
import type { StripeProductKey } from "@/payments/stripe";

const mono: React.CSSProperties = { fontFamily: T.mono, fontSize: 11, letterSpacing: ".13em", textTransform: "uppercase" };
const display: React.CSSProperties = { fontFamily: T.display, fontWeight: 500, letterSpacing: "-.045em" };
const GROUPS: Array<{ label: string; accent: string; missions: Array<[string, string, StripeProductKey]> }> = [
  { label: "OCE4N_", accent: DOMAIN_ACCENT.OCE4N_, missions: [["CLE4N_", "cle4n", "mission_supporter_cle4n"], ["WH4LES_", "wh4les", "mission_supporter_wh4les"], ["COR4L_", "cor4l", "mission_supporter_cor4l"], ["RE:WILD_ Marine", "rewild-marine", "mission_supporter_rewild_marine"]] },
  { label: "E4RTH_", accent: DOMAIN_ACCENT.E4RTH_, missions: [["CLIM4TE_", "clim4te", "mission_supporter_clim4te"], ["AM4ZONIA_", "am4zonia", "mission_supporter_am4zonia"], ["SPECIES_", "species", "mission_supporter_species"], ["RE:WILD_ Land", "rewild-land", "mission_supporter_rewild_land"]] },
  { label: "S4PIENS_", accent: DOMAIN_ACCENT.S4PIENS_, missions: [["FOOD_", "food", "mission_supporter_food"], ["EN4RGY_", "en4rgy", "mission_supporter_en4rgy"], ["CIRCULAR CITY_", "circular-city", "mission_supporter_circular_city"], ["F4SHION_", "f4shion", "mission_supporter_f4shion"]] },
  { label: "4CULTURE_", accent: DOMAIN_ACCENT["4CULTURE_"], missions: [["M4GAZINE_", "m4gazine", "mission_supporter_m4gazine"], ["4RT_", "4rt", "mission_supporter_4rt"], ["4FILM_", "4film", "mission_supporter_4film"], ["4PLAY_", "4play", "mission_supporter_4play"]] },
];

const IMPACT: Array<[string, StripeProductKey, string]> = [
  ["TREE PATHWAY", "impact_tree", "Support the Tree IMPACT pathway. Payment is a contribution, not proof that a specific tree has already been planted."],
  ["PLASTIC PATHWAY", "impact_plastic", "Support the Plastic IMPACT pathway. Payment is a contribution, not proof that a specific kilogram has already been collected."],
  ["CORAL PATHWAY", "impact_coral", "Support the Coral IMPACT pathway. Payment is a contribution, not proof of coral outplanting or reef restoration."],
  ["REWILD PATHWAY", "impact_rewild", "Support the Rewild IMPACT pathway. Payment is a contribution, not proof of restored area or ecological outcome."],
];

function Price({ children }: { children: React.ReactNode }) {
  return <span style={{ ...mono, color: T.ink, whiteSpace: "nowrap" }}>{children}</span>;
}

export default function Support() {
  const [params] = useSearchParams();
  const selectedMission = params.get("mission") || "";
  return (
    <PublicShell>
      <Seo title="Join & Support | 4PLANET" description="Join 4PLANET free, become a supporting member, support a Mission or IMPACT pathway, or explore sponsorship, pilots and founding support." path="/join" />
      <Section pad="clamp(56px,8vw,112px)">
        <div style={{ ...mono, color: T.blue }}>4PLANET · PARTICIPATE</div>
        <h1 style={{ ...display, marginTop: 18, color: T.ink, fontSize: "clamp(44px,8vw,96px)", lineHeight: .9, maxWidth: 1050 }}>Join free. Support when you choose.</h1>
        <p style={{ maxWidth: 760, color: T.dim, fontSize: "clamp(17px,2vw,21px)", lineHeight: 1.6, marginTop: 28 }}>Basic participation stays free. Paid support, membership, sponsorship and IMPACT contributions are separate choices with different terms. Payment never becomes ecological proof by itself.</p>

        <div style={{ marginTop: 58, borderTop: `1px solid ${T.lineStrong}` }}>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 24, padding: "28px 0", alignItems: "center" }}>
            <div><div style={{ ...mono, color: T.blue }}>01 · JOIN</div><h2 style={{ ...display, color: T.ink, fontSize: 32, margin: "10px 0 8px" }}>4PEOPLE_ / ME4PLANET</h2><p style={{ color: T.dim, lineHeight: 1.55, maxWidth: 660 }}>Join the public participation layer without paying. Payment is never required just to belong.</p></div>
            <div style={{ textAlign: "right" }}><Price>FREE</Price><div style={{ marginTop: 14 }}><Link to="/people" className="btn4" style={{ display: "inline-flex", padding: "11px 16px", border: `1px solid ${T.ink}`, color: T.ink, textDecoration: "none" }}>JOIN FREE →</Link></div></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 24, padding: "28px 0", borderTop: `1px solid ${T.line}`, alignItems: "center" }}>
            <div><div style={{ ...mono, color: T.blue }}>02 · SUPPORT THE SHARED BUILD</div><h2 style={{ ...display, color: T.ink, fontSize: 32, margin: "10px 0 8px" }}>SUPPORT 4PLANET</h2><p style={{ color: T.dim, lineHeight: 1.55, maxWidth: 660 }}>Recurring support for building and operating 4PLANET. No membership benefits are implied and it is not tied to a specific ecological delivery or outcome.</p></div>
            <div style={{ textAlign: "right" }}><Price>NOK 50 / MONTH</Price><div style={{ marginTop: 14 }}><Link to="/checkout/review/support_4planet" className="btn4" style={{ display: "inline-flex", padding: "11px 16px", background: T.ink, border: `1px solid ${T.ink}`, color: T.paper, textDecoration: "none" }}>SUPPORT →</Link></div></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 24, padding: "28px 0", borderTop: `1px solid ${T.line}`, alignItems: "center" }}>
            <div><div style={{ ...mono, color: T.blue }}>03 · SUPPORTING MEMBERSHIP</div><h2 style={{ ...display, color: T.ink, fontSize: 32, margin: "10px 0 8px" }}>SUPPORTING MEMBER</h2><p style={{ color: T.dim, lineHeight: 1.55, maxWidth: 660 }}>Optional paid membership for people who want a stronger supporting relationship with 4PLANET. Basic ME4PLANET / 4PEOPLE participation remains free; only explicitly described member benefits apply.</p></div>
            <div style={{ textAlign: "right" }}><Price>NOK 100 / MONTH</Price><div style={{ marginTop: 14 }}><Link to="/checkout/review/membership_supporter" className="btn4" style={{ display: "inline-flex", padding: "11px 16px", border: `1px solid ${T.ink}`, color: T.ink, textDecoration: "none" }}>BECOME A SUPPORTING MEMBER →</Link></div></div>
          </div>
        </div>

        <section style={{ marginTop: 68 }}>
          <div style={{ ...mono, color: T.blue }}>04 · SUPPORT A MISSION</div>
          <h2 style={{ ...display, color: T.ink, fontSize: "clamp(34px,5vw,62px)", marginTop: 12 }}>One price. Choose the Mission.</h2>
          <p style={{ maxWidth: 760, color: T.dim, lineHeight: 1.6, marginTop: 15 }}>Mission Supporter is NOK 100/month for every Mission. It supports 4PLANET's work to develop and operate that pathway; it does not mean your payment directly purchased a particular ecological outcome.</p>
          <div style={{ marginTop: 34, borderTop: `1px solid ${T.lineStrong}` }}>
            {GROUPS.map((group) => <div key={group.label} style={{ display: "grid", gridTemplateColumns: "minmax(150px,.55fr) minmax(0,1.45fr)", gap: 24, padding: "24px 0", borderBottom: `1px solid ${T.line}` }}>
              <div><span style={{ ...mono, color: group.accent }}>{group.label}</span></div>
              <div>{group.missions.map(([name, slug, key]) => <div key={slug} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto auto", gap: 16, alignItems: "center", padding: "13px 0", borderTop: `1px solid ${T.line}`, background: selectedMission === slug ? "rgba(46,46,255,.035)" : "transparent" }}><Link to={`/missions/${slug}`} className="link" style={{ color: T.ink, fontWeight: 500 }}>{name}</Link><Price>100 / MONTH</Price><Link to={`/checkout/review/${key}`} className="link" style={{ color: group.accent }}>SUPPORT →</Link></div>)}</div>
            </div>)}
          </div>
        </section>

        <section style={{ marginTop: 72, borderTop: `1px solid ${T.lineStrong}`, paddingTop: 30 }}>
          <div style={{ ...mono, color: T.blue }}>05 · IMPACT CONTRIBUTIONS</div>
          <h2 style={{ ...display, color: T.ink, fontSize: "clamp(34px,5vw,62px)", marginTop: 12 }}>Fund the pathway now. Keep delivery truth separate.</h2>
          <p style={{ maxWidth: 800, color: T.dim, lineHeight: 1.6 }}>Tree, Plastic, Coral and Rewild can now receive one-time public contributions. The current live amount is NOK 100 per contribution. Until a real implementation partner, unit economics, allocation and proof path are attached, 4PLANET does not call the payment a delivered ecological unit.</p>
          <div style={{ marginTop: 28, borderTop: `1px solid ${T.lineStrong}` }}>
            {IMPACT.map(([name, key, line]) => <div key={key} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 24, alignItems: "center", padding: "22px 0", borderBottom: `1px solid ${T.line}` }}><div><strong style={{ color: T.ink }}>{name}</strong><div style={{ color: T.dim, marginTop: 5, maxWidth: 720 }}>{line}</div></div><div style={{ textAlign: "right" }}><Price>NOK 100 / CONTRIBUTION</Price><div style={{ marginTop: 8 }}><Link to={`/checkout/review/${key}`} className="link" style={{ color: T.blue }}>CONTRIBUTE →</Link></div></div></div>)}
          </div>
          <p style={{ color: T.faint, fontSize: 12.5, lineHeight: 1.55, marginTop: 16 }}>As partner-backed units become real, each pathway can graduate from CONTRIBUTION to a defined unit only when delivery, evidence, claims and remedy rules are actually configured.</p>
          <Link to="/impact" className="link" style={{ color: T.blue }}>SEE IMPACT →</Link>
        </section>

        <section style={{ marginTop: 72, borderTop: `1px solid ${T.lineStrong}`, paddingTop: 30 }}>
          <div style={{ ...mono, color: T.blue }}>06 · LARGER / NEGOTIATED SUPPORT</div>
          <h2 style={{ ...display, color: T.ink, fontSize: "clamp(34px,5vw,62px)", marginTop: 12 }}>Projects, Missions, sponsorship, pilots and founding support.</h2>
          <p style={{ maxWidth: 800, color: T.dim, lineHeight: 1.6 }}>All five paths are public and payable. They use enquiry → agreement → reviewed Stripe Invoice rather than an anonymous high-value card checkout. The intended amount is not a charge; payment happens only on the approved invoice.</p>
          {[
            ["PROJECT SPONSOR", "NOK 50,000–250,000", "/sponsor?type=project", "Support one defined project."],
            ["MISSION SPONSOR", "NOK 250,000–750,000", "/sponsor?type=mission", "Support one defined Mission."],
            ["SPONSOR PACKAGE", "NOK 100,000–500,000", "/sponsor?type=package", "Build a negotiated sponsorship package around a defined 4PLANET scope."],
            ["PILOT / FUNDER", "NOK 100,000–300,000", "/sponsor?type=pilot", "Fund a bounded pilot or B2B engagement."],
            ["FOUNDING PATRON", "NOK 250,000–1,500,000", "/sponsor?type=patron", "Founding support for the shared 4PLANET build."],
          ].map(([name, range, to, line]) => <div key={name} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 24, alignItems: "center", padding: "22px 0", borderTop: `1px solid ${T.line}` }}><div><strong style={{ color: T.ink }}>{name}</strong><div style={{ color: T.dim, marginTop: 5 }}>{line}</div></div><div style={{ textAlign: "right" }}><Price>{range}</Price><div style={{ marginTop: 8 }}><Link to={to} className="link" style={{ color: T.blue }}>EXPLORE →</Link></div></div></div>)}
        </section>
      </Section>
    </PublicShell>
  );
}
