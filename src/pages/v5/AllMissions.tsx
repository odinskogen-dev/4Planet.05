import { PublicShell } from "@/components/layout/PublicShell";
import { Reveal } from "@/components/Cinematic";
import { Section } from "@/components/ui";
import { T, DOMAIN_ACCENT } from "@/styles/tokens";
import {
  DOMAIN_ORDER,
  DOMAINS,
  displayName,
  getMissionsByDomain,
} from "@/content/narrativeContract";
import { MissionCard, StatusLegend, display, mono } from "@/components/narrative/NarrativeUI";

export function AllMissions() {
  return (
    <PublicShell>
      <section style={{ background: T.ink, color: "#fff" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(84px,11vw,154px) clamp(20px,5vw,72px)" }}>
          <Reveal>
            <div style={{ ...mono(T.blue), marginBottom: 24 }}>MISSION ATLAS</div>
            <h1 style={{ ...display, margin: 0, color: "#fff", fontSize: "clamp(52px,9vw,128px)", lineHeight: .86, maxWidth: 1150 }}>
              Sixteen Missions. One living planet.
            </h1>
            <p style={{ margin: "32px 0 0", color: "rgba(255,255,255,.78)", fontSize: "clamp(17px,1.7vw,23px)", lineHeight: 1.55, maxWidth: 780 }}>
              Every Mission begins with life, reveals a relationship, states the pressure, defines the proposed 4PLANET role and shows what is actually available now.
            </p>
          </Reveal>
        </div>
      </section>

      {DOMAIN_ORDER.map((domainKey, domainIndex) => {
        const domain = DOMAINS[domainKey];
        const missions = getMissionsByDomain(domainKey);
        const accent = DOMAIN_ACCENT[domainKey];
        return (
          <section key={domainKey} style={{ background: domainIndex % 2 ? "#f3f3f1" : "#fff" }}>
            <div style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(64px,8vw,112px) clamp(20px,5vw,72px)" }}>
              <Reveal>
                <div style={{ display: "grid", gridTemplateColumns: "minmax(220px,.55fr) minmax(0,1.45fr)", gap: "clamp(30px,6vw,96px)", alignItems: "end" }} className="mission-domain-head">
                  <div>
                    <div style={mono(accent)}>{domain.code}</div>
                    <h2 style={{ ...display, margin: "16px 0 0", color: T.ink, fontSize: "clamp(40px,6vw,84px)", lineHeight: .9 }}>{displayName(domain.name)}</h2>
                  </div>
                  <div>
                    <p style={{ ...display, margin: 0, color: T.ink, fontSize: "clamp(23px,3vw,38px)", lineHeight: 1.12 }}>{domain.hero}</p>
                    <p style={{ margin: "18px 0 0", color: T.dim, fontSize: 15.5, lineHeight: 1.6, maxWidth: 720 }}>{domain.relationship}</p>
                  </div>
                </div>
              </Reveal>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 2, marginTop: "clamp(38px,5vw,66px)" }} className="all-mission-grid">
                {missions.map((mission) => <MissionCard key={mission.slug} mission={mission} compact />)}
              </div>
              <style>{`@media(max-width:760px){.mission-domain-head,.all-mission-grid{grid-template-columns:1fr!important}}`}</style>
            </div>
          </section>
        );
      })}

      <Section pad="clamp(72px,9vw,132px)">
        <Reveal>
          <div style={{ ...mono(T.blue), marginBottom: 22 }}>STATUS CONTRACT</div>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,.72fr) minmax(320px,1.28fr)", gap: "clamp(36px,6vw,90px)", alignItems: "start" }} className="mission-status-grid">
            <div>
              <h2 style={{ ...display, margin: 0, color: T.ink, fontSize: "clamp(34px,5vw,66px)", lineHeight: 1 }}>The status says what exists — not what the Mission hopes to become.</h2>
              <p style={{ margin: "24px 0 0", color: T.dim, fontSize: 16, lineHeight: 1.65 }}>
                Public support, partnership and verified-result language stay closed until the exact capability and evidence exist.
              </p>
            </div>
            <StatusLegend />
          </div>
          <style>{`@media(max-width:780px){.mission-status-grid{grid-template-columns:1fr!important}}`}</style>
        </Reveal>
      </Section>
    </PublicShell>
  );
}

export default AllMissions;
export const MissionsIndex = AllMissions;
