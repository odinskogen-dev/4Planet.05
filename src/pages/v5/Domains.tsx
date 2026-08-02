import { Link, useParams } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { CinematicImage, Reveal } from "@/components/Cinematic";
import { Section } from "@/components/ui";
import { T, DOMAIN_ACCENT } from "@/styles/tokens";
import { domainHero, img, type ImageKey } from "@/content/imageRegistry";
import type { DomainKey } from "@/types/content";
import {
  DOMAIN_ORDER,
  DOMAINS,
  domainSlug,
  displayName,
  getMissionsByDomain,
} from "@/content/narrativeContract";
import { ActionLink, MissionCard, display, mono } from "@/components/narrative/NarrativeUI";
import { NotFound } from "@/pages/system";

const FALLBACK: Record<DomainKey, ImageKey> = {
  "OCE4N_": "oce4nDomainHero",
  "E4RTH_": "e4rthDomainHero",
  "S4PIENS_": "s4piensDomainHero",
  "4CULTURE_": "m4gazineHero",
};

const keyFromSlug = (slug: string | undefined): DomainKey | undefined =>
  DOMAIN_ORDER.find((key) => domainSlug(key) === slug?.toLowerCase());

export function DomainsIndex() {
  return (
    <PublicShell>
      <section style={{ background: T.ink, color: "#fff" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(84px,11vw,154px) clamp(20px,5vw,72px)" }}>
          <Reveal>
            <div style={{ ...mono(T.blue), marginBottom: 24 }}>FOUR DOMAINS</div>
            <h1 style={{ ...display, margin: 0, color: "#fff", fontSize: "clamp(48px,8vw,118px)", lineHeight: .9, maxWidth: 1080 }}>
              One living planet. Four ways in.
            </h1>
            <p style={{ margin: "30px 0 0", color: "rgba(255,255,255,.78)", fontSize: "clamp(17px,1.7vw,23px)", lineHeight: 1.55, maxWidth: 720 }}>
              Each Domain follows a different part of the same system — ocean movement, living landscapes, human infrastructure and public imagination.
            </p>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 2, marginTop: "clamp(50px,7vw,90px)" }} className="domain-index-grid">
            {DOMAIN_ORDER.map((key) => {
              const domain = DOMAINS[key];
              const accent = DOMAIN_ACCENT[key];
              const missions = getMissionsByDomain(key);
              return (
                <Link
                  key={key}
                  to={`/domains/${domainSlug(key)}`}
                  style={{ minHeight: 430, padding: "clamp(28px,4vw,52px)", textDecoration: "none", color: "#fff", background: "#111", borderTop: `4px solid ${accent}`, display: "flex", flexDirection: "column", justifyContent: "space-between" }}
                >
                  <div>
                    <div style={mono(accent)}>{domain.code} / {domain.descriptor}</div>
                    <h2 style={{ ...display, margin: "28px 0 0", color: accent, fontSize: "clamp(44px,6vw,82px)", lineHeight: .9 }}>{displayName(domain.name)}</h2>
                    <p style={{ margin: "24px 0 0", color: "rgba(255,255,255,.9)", fontSize: 18, lineHeight: 1.55, maxWidth: 540 }}>{domain.hero}</p>
                  </div>
                  <div>
                    <p style={{ margin: 0, color: "rgba(255,255,255,.55)", fontSize: 13.5, lineHeight: 1.6 }}>
                      {missions.map((mission) => displayName(mission.name)).join(" · ")}
                    </p>
                    <div style={{ ...mono(accent), marginTop: 18 }}>ENTER DOMAIN →</div>
                  </div>
                </Link>
              );
            })}
          </div>
          <style>{`@media(max-width:760px){.domain-index-grid{grid-template-columns:1fr!important}}`}</style>
        </div>
      </section>
    </PublicShell>
  );
}

export function DomainWorld() {
  const { key: slug } = useParams();
  const key = keyFromSlug(slug);
  if (!key) return <NotFound />;

  const domain = DOMAINS[key];
  const accent = DOMAIN_ACCENT[key];
  const missions = getMissionsByDomain(key);
  const hero = domainHero(key) ?? img(FALLBACK[key]);

  return (
    <PublicShell>
      <CinematicImage meta={hero} height="100svh" priority overlay={0.56} accent={accent} align="end">
        <Reveal>
          <div style={{ ...mono(accent), marginBottom: 18 }}>{domain.code} / {domain.descriptor}</div>
          <h1 style={{ ...display, margin: 0, color: accent, fontSize: "clamp(58px,10vw,144px)", lineHeight: .84 }}>{displayName(domain.name)}</h1>
          <p style={{ margin: "26px 0 0", color: "#fff", fontSize: "clamp(19px,2.2vw,30px)", lineHeight: 1.38, maxWidth: 760 }}>{domain.hero}</p>
        </Reveal>
      </CinematicImage>

      <section style={{ background: T.ink, color: "#fff" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "clamp(72px,9vw,134px) clamp(20px,5vw,72px)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(280px,.72fr)", gap: "clamp(42px,8vw,120px)" }} className="domain-reading-grid">
            <Reveal>
              <div style={{ ...mono(accent), marginBottom: 22 }}>THE RELATIONSHIP</div>
              <h2 style={{ ...display, margin: 0, color: "#fff", fontSize: "clamp(36px,5vw,72px)", lineHeight: .98 }}>{domain.relationship}</h2>
            </Reveal>
            <Reveal delay={80}>
              <p style={{ margin: 0, color: "rgba(255,255,255,.84)", fontSize: "clamp(17px,1.5vw,20px)", lineHeight: 1.68 }}>{domain.lead}</p>
            </Reveal>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: "rgba(255,255,255,.18)", marginTop: "clamp(52px,7vw,96px)", border: "1px solid rgba(255,255,255,.18)" }} className="domain-body-grid">
            {domain.body.map((paragraph, index) => (
              <div key={paragraph} style={{ background: "#0a0a0a", padding: "clamp(24px,3vw,38px)" }}>
                <div style={mono(accent)}>0{index + 1}</div>
                <p style={{ margin: "18px 0 0", color: "rgba(255,255,255,.82)", fontSize: 15.5, lineHeight: 1.65 }}>{paragraph}</p>
              </div>
            ))}
          </div>

          <div style={{ borderTop: `1px solid ${accent}`, marginTop: "clamp(54px,7vw,96px)", paddingTop: 28 }}>
            <div style={mono(accent)}>THE DOMAIN QUESTION</div>
            <p style={{ ...display, margin: "18px 0 0", color: "#fff", fontSize: "clamp(28px,4vw,54px)", lineHeight: 1.05, maxWidth: 900 }}>{domain.question}</p>
          </div>
          <style>{`@media(max-width:780px){.domain-reading-grid,.domain-body-grid{grid-template-columns:1fr!important}}`}</style>
        </div>
      </section>

      <Section pad="clamp(72px,9vw,132px)">
        <Reveal>
          <div style={{ ...mono(accent), marginBottom: 22 }}>FOUR MISSIONS</div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 26, alignItems: "flex-end", flexWrap: "wrap" }}>
            <h2 style={{ ...display, margin: 0, color: T.ink, fontSize: "clamp(36px,5vw,68px)", lineHeight: 1, maxWidth: 800 }}>
              Four distinct ways to enter {displayName(domain.name)}.
            </h2>
            <ActionLink href="/missions">ALL SIXTEEN</ActionLink>
          </div>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 2, marginTop: "clamp(42px,6vw,74px)" }} className="domain-mission-grid">
          {missions.map((mission) => <MissionCard key={mission.slug} mission={mission} />)}
        </div>
        <style>{`@media(max-width:760px){.domain-mission-grid{grid-template-columns:1fr!important}}`}</style>
      </Section>
    </PublicShell>
  );
}
