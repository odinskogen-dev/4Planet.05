import { Link } from "react-router-dom";
import { T, DOMAIN_ACCENT, DOMAIN_DESC } from "@/styles/tokens";
import { PublicShell } from "@/components/layout/PublicShell";
import { Section, Button } from "@/components/ui";
import { Reveal } from "@/components/Cinematic";
import { content } from "@/content/contentRepository";
import { domainHero, missionHero, img, type ImageKey } from "@/content/imageRegistry";
import { publicStatus } from "@/content/status";
import type { DomainKey } from "@/types/content";

const ORDER: DomainKey[] = ["OCE4N_", "E4RTH_", "S4PIENS_", "4CULTURE_"];
const dslug = (k: string) => k.replace("_", "").toLowerCase();
const GROUP_IMG: Record<DomainKey, ImageKey> = { "OCE4N_": "oce4nDomainHero", "E4RTH_": "e4rthDomainHero", "S4PIENS_": "s4piensDomainHero", "4CULTURE_": "m4gazineHero" };

function MissionTile({ slug, name, line, acc }: { slug: string; name: string; line: string; acc: string }) {
  const m = missionHero(slug);
  return (
    <Link to={"/missions/" + slug} className="world-tile" style={{ position: "relative", display: "block", overflow: "hidden", textDecoration: "none", background: T.ink, minHeight: "clamp(230px,26vw,300px)" }}>
      {m
        ? <img src={m.src} alt={m.alt} loading="lazy" decoding="async" className="world-img" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: m.objectPosition ?? "50% 50%" }} />
        : <div aria-hidden style={{ position: "absolute", inset: 0, background: '#0c0c14' }} />}
      <div aria-hidden className="world-scrim" style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(8,8,8,.1) 0%, rgba(8,8,8,.14) 40%, rgba(8,8,8,.84) 100%)" }} />
      <div aria-hidden style={{ position: "absolute", top: 0, left: 0, width: 64, height: 3, background: acc }} />
      <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "clamp(16px,1.8vw,24px)", minHeight: "inherit" }}>
        <div style={{ fontWeight: 500, color: "#fff", fontSize: "clamp(20px,2vw,28px)", letterSpacing: "-.03em", lineHeight: 1 }}>{name.replace("_", "")}</div>
        <p style={{ color: "rgba(255,255,255,.86)", fontSize: 13, marginTop: 8, lineHeight: 1.4, maxWidth: 300 }}>{line}</p>
        <div className="mono" style={{ fontSize: 9.5, letterSpacing: ".1em", color: acc, marginTop: 12 }}>{publicStatus(slug)}{!m ? "  ·  ASSET IN PROGRESS" : ""}</div>
      </div>
    </Link>
  );
}

export function AllMissions() {
  return (
    <PublicShell>
      <Section pad="clamp(56px,8vw,104px)">
        <Reveal>
          <div className="mono" style={{ fontSize: 11.5, letterSpacing: ".16em", color: T.blue, marginBottom: 22 }}>MISSION ATLAS</div>
          <h1 style={{ fontWeight: 500, color: T.ink, fontSize: "clamp(30px,4.4vw,60px)", letterSpacing: "-.04em", lineHeight: 1 }}>Sixteen missions.<br />One living planet.</h1>
          <p style={{ fontSize: "clamp(16px,1.4vw,20px)", color: T.ink, marginTop: 22, maxWidth: 560, lineHeight: 1.5 }}>Each Mission begins with a living system under pressure — and a clearer way to understand what can help.</p>
        </Reveal>
      </Section>

      {ORDER.map((dk, gi) => {
        const acc = DOMAIN_ACCENT[dk]; const missions = content.getMissionsByDomain(dk);
        return (
          <Section key={dk} pad="clamp(28px,4vw,52px)" bg={gi % 2 ? T.paper : T.paper}>
            <Reveal>
              <div style={{ display: "grid", gridTemplateColumns: "clamp(180px,22vw,300px) 1fr", gap: "clamp(20px,3vw,44px)", alignItems: "stretch" }} className="atlas-group">
                {/* v27: white text on brand-blue (OCE4N), black on the lighter domain colours */}
                <Link to={"/domains/" + dslug(dk)} style={{ position: "relative", overflow: "hidden", textDecoration: "none", background: acc, minHeight: 220, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "clamp(18px,2vw,26px)" }} className="world-tile domain-card">
                  {(() => { const ct = dk === "OCE4N_" ? "#fff" : T.ink; return (<>
                  <div style={{ fontFamily: T.display, fontWeight: 500, color: ct, fontSize: "clamp(26px,3vw,40px)", letterSpacing: "-.04em", lineHeight: .95 }}>{dk.replace("_", "")}</div>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: ".12em", color: ct, marginTop: 8, opacity: .8 }}>{DOMAIN_DESC[dk]}</div>
                  <div className="mono world-enter" style={{ fontSize: 10.5, letterSpacing: ".12em", color: ct, marginTop: 14 }}>ENTER WORLD →</div>
                  </>); })()}
                </Link>
                <div className="atlas-tiles" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, background: T.line }}>
                  {missions.map((m) => <MissionTile key={m.slug} slug={m.slug} name={m.name} line={m.hero} acc={acc} />)}
                </div>
              </div>
            </Reveal>
          </Section>
        );
      })}

      <Section pad="clamp(48px,7vw,96px)">
        <Reveal>
          <div style={{ borderTop: `1px solid ${T.line}`, paddingTop: 32, display: "flex", justifyContent: "space-between", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
            <p style={{ fontSize: "clamp(18px,1.8vw,24px)", fontWeight: 500, letterSpacing: "-.02em", maxWidth: 520 }}>Every Mission is a living system made easier to understand, support and follow.</p>
            <Button to="/people" primary arrow>JOIN 4PLANET</Button>
          </div>
        </Reveal>
      </Section>
    </PublicShell>
  );
}

export default AllMissions;

export const MissionsIndex = AllMissions;
