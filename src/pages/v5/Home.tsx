import { Link } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { CinematicImage, Reveal } from "@/components/Cinematic";
import { Section } from "@/components/ui";
import { T, DOMAIN_ACCENT } from "@/styles/tokens";
import { img } from "@/content/imageRegistry";
import {
  DOMAIN_ORDER,
  DOMAINS,
  MISSIONS,
  domainSlug,
  displayName,
  getMissionsByDomain,
} from "@/content/narrativeContract";
import { ActionLink, MissionCard, StatusLegend, display, mono } from "@/components/narrative/NarrativeUI";

const body: React.CSSProperties = {
  margin: 0,
  color: T.ink,
  fontSize: "clamp(16px,1.3vw,19px)",
  lineHeight: 1.65,
};

export default function Home() {
  const calibration = ["wh4les", "am4zonia", "food", "4rt"]
    .map((slug) => MISSIONS.find((mission) => mission.slug === slug))
    .filter((mission): mission is NonNullable<typeof mission> => Boolean(mission));

  return (
    <PublicShell>
      <Section pad="clamp(72px,10vw,148px)">
        <Reveal>
          <div style={{ ...mono(T.blue), marginBottom: "clamp(28px,4vw,54px)" }}>4PLANET_ / FOR A LIVING PLANET</div>
          <h1 style={{ ...display, margin: 0, color: T.ink, fontSize: "clamp(54px,9vw,138px)", lineHeight: .88, letterSpacing: "-.055em", maxWidth: 1180 }}>
            Everything we depend on is alive.
          </h1>
          <p style={{ ...body, marginTop: "clamp(28px,4vw,46px)", maxWidth: 760, fontSize: "clamp(19px,2vw,27px)", lineHeight: 1.42 }}>
            4PLANET is building a public interface for the living planet: a place to see life, understand the relationships that sustain it, enter Missions, take part where a real role exists, and follow what happens next.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 34 }}>
            <ActionLink href="/missions" primary>EXPLORE THE MISSIONS</ActionLink>
            <ActionLink href="/atlas">OPEN ATLAS</ActionLink>
            <ActionLink href="#system">HOW IT WORKS</ActionLink>
          </div>
        </Reveal>
      </Section>

      <CinematicImage
        meta={img("heroEarth")}
        height="min(82vh,860px)"
        priority
        overlay={0.12}
        accent={T.blue}
        caption="ONE LIVING PLANET"
      />

      <Section id="system" pad="clamp(72px,10vw,148px)">
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.2fr) minmax(280px,.8fr)", gap: "clamp(38px,7vw,110px)", alignItems: "start" }} className="premium-two">
          <Reveal>
            <div style={{ ...mono(T.blue), marginBottom: 22 }}>LIFE → RELATIONSHIPS → ACTION → PROOF</div>
            <h2 style={{ ...display, margin: 0, color: T.ink, fontSize: "clamp(36px,5.5vw,76px)", lineHeight: .98 }}>
              The world is organised in relationships. Public understanding rarely is.
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <div style={{ display: "grid", gap: 22 }}>
              <p style={body}>Climate, biodiversity, food, oceans, cities and culture are usually presented as separate issues.</p>
              <p style={body}>In reality, they move through the same water, land, species, materials, economies and human decisions.</p>
              <p style={{ ...body, fontWeight: 500 }}>4PLANET makes those connections visible before it asks anyone to act.</p>
            </div>
          </Reveal>
        </div>
        <style>{`@media(max-width:780px){.premium-two{grid-template-columns:1fr!important}}`}</style>
      </Section>

      <section style={{ background: T.ink, color: "#fff" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(72px,9vw,132px) clamp(20px,5vw,72px)" }}>
          <Reveal>
            <div style={{ ...mono(T.blue), marginBottom: 22 }}>FOUR DOMAINS</div>
            <h2 style={{ ...display, margin: 0, color: "#fff", fontSize: "clamp(38px,5.5vw,76px)", lineHeight: .98, maxWidth: 900 }}>
              One living planet. Four ways in.
            </h2>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", marginTop: "clamp(42px,6vw,78px)", borderTop: "1px solid rgba(255,255,255,.2)", borderLeft: "1px solid rgba(255,255,255,.2)" }} className="domain-home-grid">
            {DOMAIN_ORDER.map((key) => {
              const domain = DOMAINS[key];
              const missions = getMissionsByDomain(key);
              const accent = DOMAIN_ACCENT[key];
              return (
                <Link
                  key={key}
                  to={`/domains/${domainSlug(key)}`}
                  style={{ minHeight: 380, padding: "clamp(26px,4vw,52px)", color: "#fff", textDecoration: "none", borderRight: "1px solid rgba(255,255,255,.2)", borderBottom: "1px solid rgba(255,255,255,.2)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
                >
                  <div>
                    <div style={mono(accent)}>{domain.code} / {domain.descriptor}</div>
                    <h3 style={{ ...display, margin: "24px 0 0", color: accent, fontSize: "clamp(38px,5vw,68px)", lineHeight: .92 }}>{displayName(domain.name)}</h3>
                    <p style={{ margin: "22px 0 0", color: "rgba(255,255,255,.88)", fontSize: 17, lineHeight: 1.55, maxWidth: 520 }}>{domain.hero}</p>
                  </div>
                  <div>
                    <p style={{ margin: 0, color: "rgba(255,255,255,.58)", fontSize: 13.5, lineHeight: 1.5 }}>{missions.map((mission) => displayName(mission.name)).join(" · ")}</p>
                    <div style={{ ...mono(accent), marginTop: 18 }}>ENTER {displayName(domain.name)} →</div>
                  </div>
                </Link>
              );
            })}
          </div>
          <style>{`@media(max-width:720px){.domain-home-grid{grid-template-columns:1fr!important}}`}</style>
        </div>
      </section>

      <Section pad="clamp(72px,9vw,132px)">
        <Reveal>
          <div style={{ ...mono(T.blue), marginBottom: 22 }}>THE FIRST SIXTEEN</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 28, flexWrap: "wrap" }}>
            <h2 style={{ ...display, margin: 0, color: T.ink, fontSize: "clamp(36px,5vw,70px)", lineHeight: .98, maxWidth: 820 }}>
              Sixteen Missions. Different systems. One public standard.
            </h2>
            <ActionLink href="/missions">VIEW ALL SIXTEEN</ActionLink>
          </div>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 1, background: T.line, marginTop: "clamp(40px,5vw,66px)", border: `1px solid ${T.line}` }} className="mission-name-grid">
          {DOMAIN_ORDER.flatMap((key) => getMissionsByDomain(key)).map((mission) => (
            <Link key={mission.slug} to={`/missions/${mission.slug}`} style={{ background: "#fff", color: T.ink, textDecoration: "none", padding: "22px 18px", minHeight: 130, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <span style={mono(DOMAIN_ACCENT[mission.domain])}>{mission.code}</span>
              <strong style={{ ...display, fontSize: "clamp(19px,2vw,27px)" }}>{displayName(mission.name)}</strong>
            </Link>
          ))}
        </div>
        <style>{`@media(max-width:900px){.mission-name-grid{grid-template-columns:repeat(2,1fr)!important}}@media(max-width:520px){.mission-name-grid{grid-template-columns:1fr!important}}`}</style>
      </Section>

      <section style={{ background: "#f4f4f2" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(72px,9vw,132px) clamp(20px,5vw,72px)" }}>
          <Reveal>
            <div style={{ ...mono(T.blue), marginBottom: 22 }}>CALIBRATION MISSIONS</div>
            <h2 style={{ ...display, margin: 0, color: T.ink, fontSize: "clamp(34px,4.8vw,66px)", lineHeight: 1, maxWidth: 850 }}>
              Four different tests of the same narrative standard.
            </h2>
            <p style={{ ...body, marginTop: 22, color: T.dim, maxWidth: 720 }}>
              Movement. Place. Human infrastructure. Culture and commerce. These four Missions establish the quality threshold before the full system is scaled.
            </p>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 2, marginTop: "clamp(38px,5vw,64px)" }} className="calibration-grid">
            {calibration.map((mission) => <MissionCard key={mission.slug} mission={mission} />)}
          </div>
          <style>{`@media(max-width:760px){.calibration-grid{grid-template-columns:1fr!important}}`}</style>
        </div>
      </section>

      <Section pad="clamp(72px,9vw,132px)">
        <Reveal>
          <div style={{ ...mono(T.blue), marginBottom: 22 }}>HONEST STATUS</div>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,.8fr) minmax(320px,1.2fr)", gap: "clamp(36px,6vw,90px)", alignItems: "start" }} className="premium-two">
            <div>
              <h2 style={{ ...display, margin: 0, color: T.ink, fontSize: "clamp(34px,4.8vw,64px)", lineHeight: 1 }}>A clear status is part of the product.</h2>
              <p style={{ ...body, marginTop: 24, color: T.dim }}>Contribution is not delivery. Delivery is not outcome. Outcome is not verified result until the stated evidence supports that exact claim.</p>
            </div>
            <StatusLegend />
          </div>
        </Reveal>
      </Section>

      <section style={{ background: T.blue, color: "#fff" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(70px,9vw,126px) clamp(20px,5vw,72px)" }}>
          <Reveal>
            <div style={{ ...mono("#fff"), opacity: .8, marginBottom: 22 }}>JOIN THE BUILD</div>
            <h2 style={{ ...display, margin: 0, color: "#fff", fontSize: "clamp(38px,6vw,82px)", lineHeight: .94, maxWidth: 980 }}>
              Understand the living planet. Make impact easy. Prove what happened.
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 32 }}>
              <ActionLink href="/people" onDark>4PEOPLE</ActionLink>
              <ActionLink href="/brands" onDark>4BRANDS</ActionLink>
              <ActionLink href="/partners" onDark>4PARTNERS</ActionLink>
              <ActionLink href="/funders" onDark>4FUNDERS</ActionLink>
            </div>
          </Reveal>
        </div>
      </section>
    </PublicShell>
  );
}
