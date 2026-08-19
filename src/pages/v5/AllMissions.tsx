import { Link } from "react-router-dom";
import { T, DOMAIN_ACCENT, DOMAIN_DESC } from "@/styles/tokens";
import { PublicShell } from "@/components/layout/PublicShell";
import { Section, Button } from "@/components/ui";
import { Reveal } from "@/components/Cinematic";
import { content } from "@/content/contentRepository";
import { missionHero } from "@/content/imageRegistry";
import { publicStatus } from "@/content/status";
import type { DomainKey } from "@/types/content";

const ORDER: DomainKey[] = ["OCE4N_", "E4RTH_", "S4PIENS_", "4CULTURE_"];
const dslug = (k: string) => k.replace("_", "").toLowerCase();

function MissionTile({ slug, name, line, acc }: { slug: string; name: string; line: string; acc: string }) {
  const m = missionHero(slug);
  return (
    <Link to={"/missions/" + slug} className="world-tile" style={{ position: "relative", display: "block", overflow: "hidden", textDecoration: "none", background: T.ink, minHeight: "clamp(250px,28vw,330px)" }}>
      {m
        ? <img src={m.src} alt={m.alt} loading="lazy" decoding="async" className="world-img" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: m.objectPosition ?? "50% 50%" }} />
        : <div aria-hidden style={{ position: "absolute", inset: 0, background: "#0c0c14" }} />}
      <div aria-hidden className="world-scrim" style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(8,8,8,.1) 0%, rgba(8,8,8,.16) 35%, rgba(8,8,8,.9) 100%)" }} />
      <div aria-hidden style={{ position: "absolute", top: 0, left: 0, width: 64, height: 3, background: acc }} />
      <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "clamp(18px,2vw,27px)", minHeight: "inherit" }}>
        <div className="mono" style={{ fontSize: 9.5, letterSpacing: ".12em", color: acc, marginBottom: 10 }}>{publicStatus(slug)}{!m ? "  ·  ASSET IN PROGRESS" : ""}</div>
        <div style={{ fontWeight: 500, color: "#fff", fontSize: "clamp(22px,2.2vw,31px)", letterSpacing: "-.035em", lineHeight: 1 }}>{name.replace("_", "")}</div>
        <p style={{ color: "rgba(255,255,255,.9)", fontSize: "clamp(13px,1vw,15px)", marginTop: 10, lineHeight: 1.45, maxWidth: 360 }}>{line}</p>
        <div className="mono world-enter" style={{ fontSize: 10, letterSpacing: ".12em", color: "rgba(255,255,255,.72)", marginTop: 16 }}>UNDERSTAND THIS →</div>
      </div>
    </Link>
  );
}

export function AllMissions() {
  return (
    <PublicShell>
      <Section pad="clamp(68px,9vw,128px)">
        <Reveal>
          <div className="mono" style={{ fontSize: 11.5, letterSpacing: ".16em", color: T.blue, marginBottom: 22 }}>16 MISSIONS · ONE LIVING PLANET</div>
          <h1 style={{ fontWeight: 500, color: T.ink, fontSize: "clamp(38px,5.6vw,82px)", letterSpacing: "-.05em", lineHeight: .93, maxWidth: "12ch" }}>
            What do you want to help change?
          </h1>
          <p style={{ fontSize: "clamp(17px,1.5vw,21px)", color: T.ink, marginTop: 24, maxWidth: 680, lineHeight: 1.55 }}>
            Start with something you care about. Each Mission shows what is happening, why it matters, the living system around it and what can actually help.
          </p>
          <p style={{ fontSize: 14.5, color: T.dim, marginTop: 12, maxWidth: 620, lineHeight: 1.55 }}>
            Then change lens: see it in ATLAS, meet the species inside it, follow the relationships in LIVING SYSTEMS and continue into credible action through IMPACT.
          </p>
        </Reveal>
      </Section>

      {ORDER.map((dk, gi) => {
        const acc = DOMAIN_ACCENT[dk];
        const missions = content.getMissionsByDomain(dk);
        const domainPrompt = dk === "OCE4N_"
          ? "What would a healthier ocean look like?"
          : dk === "E4RTH_"
            ? "What does life on land need to recover?"
            : dk === "S4PIENS_"
              ? "How do the systems we depend on reshape the living planet?"
              : "How can culture change what people notice, value and do?";

        return (
          <Section key={dk} pad="clamp(30px,4vw,58px)" bg={T.paper}>
            <Reveal>
              <div style={{ display: "grid", gridTemplateColumns: "clamp(190px,23vw,320px) 1fr", gap: "clamp(20px,3vw,44px)", alignItems: "stretch" }} className="atlas-group">
                <Link to={"/domains/" + dslug(dk)} style={{ position: "relative", overflow: "hidden", textDecoration: "none", background: acc, minHeight: 240, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "clamp(20px,2.2vw,30px)" }} className="world-tile domain-card">
                  {(() => {
                    const ct = dk === "OCE4N_" ? "#fff" : T.ink;
                    return (<>
                      <div className="mono" style={{ fontSize: 10, letterSpacing: ".13em", color: ct, opacity: .82 }}>{DOMAIN_DESC[dk]}</div>
                      <div>
                        <div style={{ fontFamily: T.display, fontWeight: 500, color: ct, fontSize: "clamp(30px,3.4vw,48px)", letterSpacing: "-.045em", lineHeight: .92 }}>{dk.replace("_", "")}</div>
                        <p style={{ color: ct, opacity: .86, fontSize: 14, lineHeight: 1.45, marginTop: 12, maxWidth: 280 }}>{domainPrompt}</p>
                        <div className="mono world-enter" style={{ fontSize: 10.5, letterSpacing: ".12em", color: ct, marginTop: 18 }}>ENTER WORLD →</div>
                      </div>
                    </>);
                  })()}
                </Link>
                <div className="atlas-tiles" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, background: T.line }}>
                  {missions.map((m) => (
                    <MissionTile key={m.slug} slug={m.slug} name={m.name} line={m.question ?? m.hero} acc={acc} />
                  ))}
                </div>
              </div>
            </Reveal>
          </Section>
        );
      })}

      <Section pad="clamp(54px,7vw,100px)">
        <Reveal>
          <div style={{ borderTop: `1px solid ${T.line}`, paddingTop: 34, display: "flex", justifyContent: "space-between", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
            <p style={{ fontSize: "clamp(19px,2vw,27px)", fontWeight: 500, letterSpacing: "-.025em", maxWidth: 590 }}>You do not need to understand the whole planet before you can start helping one part of it.</p>
            <Button to="/atlas" primary arrow>EXPLORE THE PLANET</Button>
          </div>
        </Reveal>
      </Section>
    </PublicShell>
  );
}

export default AllMissions;

export const MissionsIndex = AllMissions;
