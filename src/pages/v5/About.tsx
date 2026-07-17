import { Link } from "react-router-dom";
import { T } from "@/styles/tokens";
import { PublicShell } from "@/components/layout/PublicShell";
import { Section, Label, Button } from "@/components/ui";

export function About() {
  const CH: [string, string[]][] = [
    ["The Story", ["4Planet began with a refusal: to treat nature as a single, abstract issue too large to act on. The living world is many connected systems — and each one can be understood, supported and rebuilt.", "So 4Planet is being built as an institution for a living planet: a public entrance into domains, missions, culture and proof, backed by a private operating layer that does the unglamorous work of coordination and evidence."]],
    ["Why 4Planet Exists", ["The oceans, forests, species and systems that make human life possible are being pushed out of balance by how we build, consume and organise our societies.", "4Planet exists to make environmental challenges easier to understand, credible action easier to join, and progress easier to follow."]],
    ["How the System Works", ["4Planet connects public understanding, mission development, cultural work, participation and practical action — supported by a private operating layer for partners, evidence and reporting.", "Impact Pathways open only when their delivery model, evidence requirements and reporting are in place. Nothing is claimed before it is real."]],
    ["The Four Domains", ["The work is organised into four connected parts of the same living planet: OCE4N_ (the living ocean), E4RTH_ (the living land), S4PIENS_ (the systems we build) and 4CULTURE_ (culture for action). Each holds four missions."]],
    ["4Culture", ["4Culture is both a domain and the distribution layer of 4Planet — editorial, film, sound and image that turn ecological intelligence into attention, participation and durable public relevance."]],
    ["4Planet OS", ["Behind the public world sits 4Planet OS: private operating infrastructure for missions, partners, evidence and reporting. It is not a public product, and it is never presented as one."]],
    ["The Founder", ["Founded by Odin Oddekalv. 4Planet brings together ecological attention, design, culture and practical systems for action — not to add more noise, but to make it easier for more people to understand what is at stake, support what works and follow the results."]],
    ["The Road Ahead", ["4Planet is early, and says so. The next steps are honest ones: open the first membership release, confirm field partners, define the proof standard, and open the first Impact Pathways only when they can be trusted."]],
  ];
  return (
    <PublicShell>
      {/* v26: fullscreen story/founder hero */}
      <section style={{ position: "relative", height: "clamp(72vh, 88vh, 920px)", overflow: "hidden", background: T.ink }}>
        <img src="/assets/brand/story-hero.jpg" alt="A single figure walking across vast desert dunes, footprints trailing behind" loading="eager" decoding="async" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 50%" }} />
        <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(8,8,8,.12) 0%, rgba(8,8,8,.18) 50%, rgba(8,8,8,.62) 100%)" }} />
        <div style={{ position: "absolute", left: "clamp(20px,5vw,72px)", right: "clamp(20px,5vw,72px)", bottom: "clamp(36px,6vw,76px)", zIndex: 2 }}>
          <div className="mono" style={{ fontSize: 11, letterSpacing: ".14em", color: "rgba(255,255,255,.82)", marginBottom: 16 }}>4PLANET_ / THE STORY</div>
          <h1 style={{ fontFamily: T.display, fontWeight: 500, color: "#fff", fontSize: "clamp(34px,5vw,72px)", letterSpacing: "-.045em", lineHeight: 1, maxWidth: 1040 }}>Everything we depend on is alive.</h1>
        </div>
      </section>

      <Section pad="clamp(48px,7vw,96px)">
        <Label color={T.blue} style={{ marginBottom: 16 }}>4PLANET_</Label>
        <div style={{ maxWidth: 780, display: "grid", gap: 20 }}>
          <p style={{ fontSize: "clamp(18px,2.4vw,24px)", color: T.ink, lineHeight: 1.55, letterSpacing: "-.01em" }}>Human life is inseparable from forests, oceans, species and the living systems around us. The systems that provide food, water, climate stability, material cycles and wonder are under pressure — and that pressure is largely something we designed.</p>
          <p style={{ fontSize: "clamp(17px,2vw,20px)", color: T.ink, lineHeight: 1.6 }}>4Planet is being built to help bring nature back into balance: through better understanding, credible participation, practical pathways and visible proof. Not a campaign. An institution meant to last.</p>
        </div>
        <div style={{ marginTop: 48, borderTop: `1px solid ${T.lineStrong}` }}>
          {CH.map(([h, paras]) => (
            <div key={h} id={({ "The Story": "story", "The System": "system", "The Founder": "founder", "The Road Ahead": "road" } as Record<string,string>)[h] || undefined} className="chapter" style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "clamp(14px,3vw,40px)", padding: "30px 0", borderBottom: `1px solid ${T.line}`, scrollMarginTop: 80 }}>
              <div className="chapter-rail mono" style={{ fontSize: 11, color: T.blue, letterSpacing: ".06em" }}>{h}</div>
              <div style={{ display: "grid", gap: 14, maxWidth: 720 }}>
                {paras.map((para, i) => <p key={i} style={{ fontSize: 16, color: T.ink, lineHeight: 1.65 }}>{para}</p>)}
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 32, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Button to="/domains" arrow>Enter Domains</Button>
          <Button to="/people">Join 4Planet</Button>
        </div>
      </Section>
    </PublicShell>
  );
}
