import { useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { CinematicImage, Reveal } from "@/components/Cinematic";
import { Section } from "@/components/ui";
import { T, DOMAIN_ACCENT } from "@/styles/tokens";
import { domainHero, missionHero } from "@/content/imageRegistry";
import {
  DOMAINS,
  LEGACY_MISSION_REDIRECTS,
  displayName,
  domainSlug,
  getMission,
} from "@/content/narrativeContract";
import { ActionLink, MissionStrip, StatusBadge, display, mono } from "@/components/narrative/NarrativeUI";
import { NotFound } from "@/pages/system";

function ListBlock({ title, items, accent }: { title: string; items: string[]; accent: string }) {
  return (
    <div>
      <div style={mono(accent)}>{title}</div>
      <div style={{ display: "grid", gap: 0, borderTop: `1px solid ${T.line}`, marginTop: 16 }}>
        {items.map((item, index) => (
          <div key={item} style={{ display: "grid", gridTemplateColumns: "42px 1fr", gap: 16, padding: "16px 0", borderBottom: `1px solid ${T.line}` }}>
            <span style={mono(T.dim)}>0{index + 1}</span>
            <p style={{ margin: 0, color: T.ink, fontSize: 15.5, lineHeight: 1.6 }}>{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MissionDetail() {
  const { slug } = useParams();
  const redirect = slug ? LEGACY_MISSION_REDIRECTS[slug] : undefined;
  const mission = getMission(slug);

  useEffect(() => {
    if (!mission) return;
    const previousTitle = document.title;
    const description = document.querySelector('meta[name="description"]');
    const previousDescription = description?.getAttribute("content");
    document.title = mission.seoTitle;
    if (description) description.setAttribute("content", mission.seoDescription);
    return () => {
      document.title = previousTitle;
      if (description && previousDescription) description.setAttribute("content", previousDescription);
    };
  }, [mission]);

  if (redirect) return <Navigate to={`/missions/${redirect}`} replace />;
  if (!mission) return <NotFound />;

  const domain = DOMAINS[mission.domain];
  const accent = DOMAIN_ACCENT[mission.domain];
  const hero = missionHero(mission.slug) ?? domainHero(mission.domain);

  return (
    <PublicShell>
      <CinematicImage meta={hero} fallback={domainHero(mission.domain)} height="100svh" priority overlay={0.58} accent={accent} align="end">
        <Reveal>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 20, alignItems: "center", flexWrap: "wrap", marginBottom: 22 }}>
            <Link to={`/domains/${domainSlug(mission.domain)}`} style={{ ...mono(accent), textDecoration: "none" }}>{mission.code}</Link>
            <StatusBadge status={mission.status} onDark />
          </div>
          <h1 style={{ ...display, margin: 0, color: accent, fontSize: "clamp(54px,9vw,138px)", lineHeight: .84 }}>{displayName(mission.name)}</h1>
          <p className="mission-desktop-hero" style={{ margin: "26px 0 0", color: "#fff", fontSize: "clamp(20px,2.3vw,32px)", lineHeight: 1.32, maxWidth: 820 }}>{mission.hero}</p>
          <p className="mission-mobile-hero" style={{ margin: "22px 0 0", color: "#fff", fontSize: "clamp(22px,7vw,32px)", lineHeight: 1.26, maxWidth: 520 }}>{mission.mobileHero}</p>
          <p style={{ margin: "18px 0 0", color: "rgba(255,255,255,.78)", fontSize: "clamp(15px,1.5vw,19px)", lineHeight: 1.55, maxWidth: 720 }}>{mission.lead}</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 30 }}>
            <ActionLink href={mission.action.href} primary>{mission.action.label}</ActionLink>
            <ActionLink href="#evidence" onDark>VIEW SOURCES & LIMITS</ActionLink>
          </div>
        </Reveal>
        <style>{`.mission-mobile-hero{display:none}@media(max-width:560px){.mission-desktop-hero{display:none}.mission-mobile-hero{display:block}}`}</style>
      </CinematicImage>

      <section style={{ background: T.ink, color: "#fff" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "clamp(72px,9vw,132px) clamp(20px,5vw,72px)" }}>
          <Reveal>
            <div style={{ ...mono(accent), marginBottom: 24 }}>THE RELATIONSHIP</div>
            <h2 style={{ ...display, margin: 0, color: "#fff", fontSize: "clamp(36px,5.5vw,76px)", lineHeight: .98, maxWidth: 980 }}>{mission.relationship}</h2>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(300px,.75fr)", gap: "clamp(42px,8vw,118px)", marginTop: "clamp(50px,7vw,92px)" }} className="mission-opening-grid">
            <Reveal>
              <div style={{ display: "grid", gap: 22 }}>
                {mission.opening.map((paragraph, index) => (
                  <p key={paragraph} style={{ ...display, margin: 0, color: index === 0 ? "#fff" : "rgba(255,255,255,.72)", fontSize: index === 0 ? "clamp(25px,3.4vw,44px)" : "clamp(18px,2vw,25px)", lineHeight: index === 0 ? 1.12 : 1.45 }}>{paragraph}</p>
                ))}
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div id="system" style={{ borderTop: `1px solid ${accent}`, paddingTop: 18 }}>
                <div style={mono(accent)}>THE LIVING SYSTEM</div>
                <p style={{ margin: "18px 0 0", color: "rgba(255,255,255,.82)", fontSize: 16, lineHeight: 1.7 }}>{mission.livingSystem.join(" · ")}</p>
              </div>
            </Reveal>
          </div>
          <style>{`@media(max-width:760px){.mission-opening-grid{grid-template-columns:1fr!important}}`}</style>
        </div>
      </section>

      <Section pad="clamp(72px,9vw,132px)">
        <Reveal>
          <div style={{ ...mono(accent), marginBottom: 24 }}>WHAT CHANGES</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 1, background: T.line, border: `1px solid ${T.line}` }} className="mission-change-grid">
            {mission.whatChanges.map((item, index) => (
              <div key={item} style={{ background: "#fff", padding: "clamp(24px,3vw,38px)", minHeight: 220 }}>
                <div style={mono(accent)}>0{index + 1}</div>
                <p style={{ ...display, margin: "30px 0 0", color: T.ink, fontSize: "clamp(21px,2.4vw,31px)", lineHeight: 1.18 }}>{item}</p>
              </div>
            ))}
          </div>
          <style>{`@media(max-width:720px){.mission-change-grid{grid-template-columns:1fr!important}}`}</style>
        </Reveal>
      </Section>

      <section style={{ background: "#f3f3f1" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "clamp(72px,9vw,132px) clamp(20px,5vw,72px)" }}>
          <Reveal>
            <div style={{ ...mono(accent), marginBottom: 24 }}>WHAT 4PLANET IS BUILDING</div>
            <h2 style={{ ...display, margin: 0, color: T.ink, fontSize: "clamp(34px,5vw,68px)", lineHeight: 1, maxWidth: 900 }}>{mission.approach}</h2>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 22, marginTop: "clamp(42px,6vw,72px)" }} className="mission-build-grid">
            {mission.whatFourPlanetBuilds.map((item, index) => (
              <div key={item} style={{ borderTop: `2px solid ${accent}`, paddingTop: 18 }}>
                <div style={mono(accent)}>BUILD 0{index + 1}</div>
                <p style={{ margin: "16px 0 0", color: T.ink, fontSize: 16, lineHeight: 1.65 }}>{item}</p>
              </div>
            ))}
          </div>
          <style>{`@media(max-width:720px){.mission-build-grid{grid-template-columns:1fr!important}}`}</style>
        </div>
      </section>

      <section style={{ background: "#fff" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(48px,6vw,82px) clamp(20px,5vw,72px)" }}>
          <MissionStrip mission={mission} />
        </div>
      </section>

      <Section id="evidence" pad="clamp(72px,9vw,132px)">
        <Reveal>
          <div style={{ ...mono(accent), marginBottom: 24 }}>SOURCES, MEDIA & LIMITS</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "clamp(40px,6vw,90px)" }} className="mission-evidence-grid">
            <div>
              <h2 style={{ ...display, margin: 0, color: T.ink, fontSize: "clamp(30px,4vw,54px)", lineHeight: 1.04 }}>The public page shows what is known. The register keeps what is still required visible.</h2>
              <div style={{ display: "grid", gap: 0, borderTop: `1px solid ${T.line}`, marginTop: 30 }}>
                {mission.sources.length > 0 ? mission.sources.map((item) => (
                  <a key={item.url} href={item.url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", justifyContent: "space-between", gap: 20, padding: "17px 0", borderBottom: `1px solid ${T.line}`, textDecoration: "none", color: T.ink }}>
                    <span style={{ fontSize: 15.5, lineHeight: 1.45 }}>{item.title}</span>
                    <span style={mono(accent)}>{item.role} ↗</span>
                  </a>
                )) : (
                  <div style={{ padding: "18px 0", borderBottom: `1px solid ${T.line}`, color: T.dim, fontSize: 15, lineHeight: 1.55 }}>
                    Public source links open when the first specific work, release or article is selected.
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: "grid", gap: 38 }}>
              <ListBlock title="SOURCE GAPS" items={mission.sourceNeeds} accent={accent} />
              <ListBlock title="MEDIA REQUIREMENTS" items={mission.mediaRequirements} accent={accent} />
              <ListBlock title="RIGHTS & CLAIM LIMITS" items={mission.rightsRequirements} accent={accent} />
            </div>
          </div>
          <style>{`@media(max-width:780px){.mission-evidence-grid{grid-template-columns:1fr!important}}`}</style>
        </Reveal>
      </Section>

      <section style={{ background: T.ink, color: "#fff" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "clamp(70px,9vw,126px) clamp(20px,5vw,72px)" }}>
          <Reveal>
            <div style={{ ...mono(accent), marginBottom: 22 }}>CURRENT PUBLIC CAPABILITY / {mission.action.capability}</div>
            <h2 style={{ ...display, margin: 0, color: "#fff", fontSize: "clamp(36px,5vw,70px)", lineHeight: .98, maxWidth: 920 }}>
              {mission.status === "CONCEPT" ? "The Mission can be understood before it can be joined." : "Follow the work without confusing development with delivery."}
            </h2>
            <p style={{ margin: "24px 0 0", color: "rgba(255,255,255,.72)", fontSize: 16, lineHeight: 1.65, maxWidth: 740 }}>{mission.contribution}</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 30 }}>
              <ActionLink href={mission.action.href} primary>{mission.action.label}</ActionLink>
              <ActionLink href={`/domains/${domainSlug(mission.domain)}`} onDark>BACK TO {displayName(domain.name)}</ActionLink>
              <ActionLink href="/missions" onDark>ALL MISSIONS</ActionLink>
            </div>
          </Reveal>
        </div>
      </section>
    </PublicShell>
  );
}
