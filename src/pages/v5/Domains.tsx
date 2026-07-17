import { useParams, Link } from "react-router-dom";
import { T, DOMAIN_ACCENT, DOMAIN_DESC } from "@/styles/tokens";
import { PublicShell } from "@/components/layout/PublicShell";
import { Section, Button } from "@/components/ui";
import { CinematicImage, Reveal } from "@/components/Cinematic";
import { content } from "@/content/contentRepository";
import { DOMAIN_NARRATIVE } from "@/content/domainNarratives";
import { img, domainHero, missionHero, type ImageKey } from "@/content/imageRegistry";
import { fieldNote } from "@/content/fieldNotes";
import type { DomainKey } from "@/types/content";
import { NotFound } from "@/pages/system";

const ORDER: DomainKey[] = ["OCE4N_", "E4RTH_", "S4PIENS_", "4CULTURE_"];
const dslug = (k: string) => k.replace("_", "").toLowerCase();
const strip = (k: string) => k.replace("_", "");
const keyFromSlug = (s?: string): DomainKey | undefined => ORDER.find((k) => dslug(k) === (s ?? "").toLowerCase());
const mono = (color: string): React.CSSProperties => ({ fontFamily: T.mono, fontSize: 11.5, letterSpacing: ".14em", textTransform: "uppercase", color });
const display: React.CSSProperties = { fontFamily: T.display, fontWeight: 500, letterSpacing: "-.035em" };

// one documentary image per domain (never the hero) — from a mission in that world
const SECOND_IMG: Record<DomainKey, ImageKey> = { "OCE4N_": "wh4lesHero", "E4RTH_": "e4rthField", "S4PIENS_": "en3rgyHero", "4CULTURE_": "filmHero" };
// canonical mission order per domain (4CULTURE order is locked)
const MISSION_ORDER: Partial<Record<DomainKey, string[]>> = { "4CULTURE_": ["4play", "4film", "4telier", "m4gazine"] };
function orderedMissions(dk: DomainKey) {
  const ms = content.getMissionsByDomain(dk);
  const ord = MISSION_ORDER[dk];
  if (!ord) return ms;
  return [...ms].sort((a, b) => ord.indexOf(a.slug) - ord.indexOf(b.slug));
}

/* ───────── /domains — World Atlas (calm light index; colour lives on the images) ───────── */
function WorldTile({ dk }: { dk: DomainKey }) {
  const acc = DOMAIN_ACCENT[dk]; const m = domainHero(dk) ?? img(SECOND_IMG[dk]);
  const missions = orderedMissions(dk);
  return (
    <Link to={"/domains/" + dslug(dk)} className="world-tile" style={{ position: "relative", display: "block", overflow: "hidden", textDecoration: "none", background: "#000", minHeight: "clamp(360px,44vw,540px)" }}>
      {m && <img src={m.src} alt={m.alt} loading="lazy" decoding="async" className="world-img" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: m.objectPosition ?? "50% 50%" }} />}
      <div aria-hidden className="world-scrim" style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(8,8,8,.14) 0%, rgba(8,8,8,.12) 38%, rgba(8,8,8,.86) 100%)" }} />
      <div aria-hidden style={{ position: "absolute", top: 0, left: 0, width: 80, height: 3, background: acc }} />
      <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "clamp(24px,2.6vw,38px)", minHeight: "inherit" }}>
        <div style={{ ...display, color: acc, fontSize: "clamp(34px,4.4vw,60px)", letterSpacing: "-.04em", lineHeight: .95 }}>{strip(dk)}</div>
        <p style={{ color: "rgba(255,255,255,.9)", fontSize: "clamp(14px,1.1vw,17px)", marginTop: 10, maxWidth: 360, lineHeight: 1.45 }}>{DOMAIN_DESC[dk]}</p>
        <div className="mono world-enter" style={{ fontSize: 11.5, letterSpacing: ".14em", color: "#fff", marginTop: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 7, height: 7, background: acc, display: "inline-block" }} />ENTER {strip(dk)}<span className="world-arrow" style={{ transition: "transform .25s" }}>→</span>
        </div>
      </div>
    </Link>
  );
}

export function DomainsIndex() {
  return (
    <PublicShell>
      <Section bg={T.ink} pad="clamp(84px,10vw,140px)">
        <Reveal>
          <div style={{ ...mono(T.blue), marginBottom: 22 }}>ENTER FOUR WORLDS</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 40, flexWrap: "wrap" }}>
            <h1 style={{ ...display, color: "#fff", fontSize: "clamp(30px,4.6vw,60px)", lineHeight: 1.02, maxWidth: 620, textWrap: "balance" } as React.CSSProperties}>One living planet.<br />Four ways in.</h1>
            <p style={{ fontSize: "clamp(16px,1.3vw,19px)", color: "rgba(255,255,255,.86)", maxWidth: 440, lineHeight: 1.55 }}>Each world reveals a different part of the system — and a clearer way to understand what is under pressure, what can help and where you can take part.</p>
          </div>
        </Reveal>
        <Reveal delay={60}>
          <div className="world-atlas" style={{ marginTop: "clamp(30px,4vw,52px)" }}>
            {ORDER.map((dk) => <WorldTile key={dk} dk={dk} />)}
          </div>
        </Reveal>
      </Section>
    </PublicShell>
  );
}

/* ───────── /domains/:key — world entry (dark) → white reading plane → doors → dark participation ───────── */
function MissionDoor({ slug, name, line, acc }: { slug: string; name: string; line: string; acc: string }) {
  const m = missionHero(slug);
  return (
    <Link to={"/missions/" + slug} className="world-tile" style={{ position: "relative", display: "block", overflow: "hidden", textDecoration: "none", background: "#000", minHeight: "clamp(300px,32vw,420px)" }}>
      {m && <img src={m.src} alt={m.alt} loading="lazy" decoding="async" className="world-img" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: m.objectPosition ?? "50% 50%" }} />}
      <div aria-hidden className="world-scrim" style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(8,8,8,.10) 0%, rgba(8,8,8,.12) 40%, rgba(8,8,8,.84) 100%)" }} />
      <div aria-hidden style={{ position: "absolute", top: 0, left: 0, width: 64, height: 3, background: acc }} />
      <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "clamp(22px,2.4vw,34px)", minHeight: "inherit" }}>
        <div style={{ ...display, color: acc, fontSize: "clamp(26px,3vw,40px)", lineHeight: .96 }}>{strip(name)}</div>
        <p style={{ color: "rgba(255,255,255,.92)", fontSize: "clamp(14px,1.1vw,16.5px)", marginTop: 10, maxWidth: 380, lineHeight: 1.4 }}>{line}</p>
      </div>
    </Link>
  );
}

export function DomainWorld() {
  const { key } = useParams();
  const dk = keyFromSlug(key);
  if (!dk) return <NotFound />;
  const acc = DOMAIN_ACCENT[dk];
  const n = DOMAIN_NARRATIVE[dk];
  const d = content.getDomain(dk);
  const missions = orderedMissions(dk);
  const fn = fieldNote(dk);
  const hero = domainHero(dk) ?? img(SECOND_IMG[dk]);
  const second = img(SECOND_IMG[dk]);
  const manifesto = n.body.slice(1);   // do not repeat the hero opening line

  return (
    <PublicShell>
      {/* immersive world entry (dark) */}
      <CinematicImage meta={hero} height="100svh" overlay={0.5} priority accent={acc} align="end">
        <Reveal>
          <div style={{ ...mono("#fff"), marginBottom: 16 }}>{d.code}</div>
          <h1 style={{ ...display, color: acc, fontSize: "clamp(46px,7.4vw,108px)", letterSpacing: "-.045em", lineHeight: .9 }}>{strip(dk)}</h1>
          <p style={{ fontSize: "clamp(17px,1.8vw,23px)", color: "rgba(255,255,255,.94)", marginTop: 18, maxWidth: 560, lineHeight: 1.38 }}>{n.body[0]}</p>
        </Reveal>
      </CinematicImage>

      {/* dark manifesto reading plane — inside the world */}
      <Section bg="#000" pad="clamp(72px,9vw,132px)">
        <Reveal><div style={{ ...mono(acc), marginBottom: "clamp(28px,4vw,44px)" }}>DOMAIN MANIFESTO</div></Reveal>
        <div style={{ maxWidth: 760, display: "grid", gap: 18 }}>
          {manifesto.map((p, i) => (
            <Reveal key={i}>
              <p style={{ margin: 0, fontFamily: i === 0 ? T.display : T.sans, fontSize: i === 0 ? "clamp(23px,2.9vw,36px)" : "clamp(16.5px,1.4vw,19px)", fontWeight: i === 0 ? 500 : 400, letterSpacing: i === 0 ? "-.02em" : "normal", color: i === 0 ? "#fff" : "rgba(255,255,255,.82)", lineHeight: i === 0 ? 1.22 : 1.68, textWrap: (i === 0 ? "balance" : "pretty") } as React.CSSProperties}>{p}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* one documentary image */}
      <CinematicImage meta={second} height="min(66vh, 640px)" accent={acc} />

      {/* why this world matters + four mission doors — dark */}
      <Section bg="#000" pad="clamp(72px,9vw,132px)">
        <Reveal>
          <div style={{ ...mono(acc), marginBottom: 20 }}>WHY THIS WORLD MATTERS</div>
          <p style={{ ...display, fontSize: "clamp(21px,2.5vw,32px)", letterSpacing: "-.02em", lineHeight: 1.28, maxWidth: 880, color: "#fff", margin: 0, textWrap: "balance" } as React.CSSProperties}>{n.why}</p>
        </Reveal>
        <Reveal delay={60} style={{ marginTop: "clamp(44px,6vw,80px)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 24, flexWrap: "wrap", marginBottom: "clamp(20px,3vw,30px)" }}>
            <h2 style={{ ...display, color: "#fff", fontSize: "clamp(24px,3vw,40px)" }}>Four Missions</h2>
            <span style={mono(acc)}>{String(missions.length).padStart(2, "0")} IN {strip(dk)}</span>
          </div>
          <div className="door-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "clamp(14px,1.6vw,22px)" }}>
            {missions.map((m) => <MissionDoor key={m.slug} slug={m.slug} name={m.name} line={m.hero} acc={acc} />)}
          </div>
        </Reveal>
      </Section>

      {/* domain note + other worlds — dark */}
      <Section bg="#000" pad="clamp(56px,7vw,100px)">
        <div className="tw-plain" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(28px,4vw,64px)" }}>
          <Reveal>
            <div style={{ ...mono(acc), marginBottom: 16 }}>DOMAIN NOTE</div>
            <div style={{ borderTop: `1px solid ${acc}`, paddingTop: 18 }}>
              <div style={{ ...display, fontSize: "clamp(19px,1.8vw,24px)", color: "#fff" }}>{fn.title}</div>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,.82)", marginTop: 12, lineHeight: 1.6, maxWidth: 460, textWrap: "pretty" } as React.CSSProperties}>{fn.body.join(" ")}</p>
            </div>
          </Reveal>
          <Reveal delay={60}>
            <div style={{ ...mono(acc), marginBottom: 16 }}>OTHER WORLDS</div>
            <div style={{ borderTop: `1px solid rgba(255,255,255,.2)`, paddingTop: 6 }}>
              {ORDER.filter((k) => k !== dk).map((k) => (
                <Link key={k} to={"/domains/" + dslug(k)} className="link" style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "14px 0", borderBottom: `1px solid rgba(255,255,255,.14)`, color: "#fff", textDecoration: "none" }}>
                  <span style={{ ...display, fontSize: "clamp(18px,1.7vw,22px)" }}>{strip(k)}</span>
                  <span className="mono" style={{ fontSize: 10.5, letterSpacing: ".1em", color: DOMAIN_ACCENT[k] }}>{DOMAIN_DESC[k]} →</span>
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      </Section>

      {/* dark participation ending — continuous world */}
      <section style={{ background: "#000", color: "#fff" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(56px,8vw,110px) clamp(20px,5vw,72px)" }}>
          <Reveal>
            <div style={{ ...mono(acc), marginBottom: 20 }}>PARTICIPATE</div>
            <h2 style={{ ...display, color: "#fff", fontSize: "clamp(26px,3.6vw,50px)", lineHeight: 1.02, maxWidth: 760 }}>Follow {strip(dk)} as its Missions, evidence and pathways open.</h2>
            <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
              <Button to="/people" primary accent={acc} arrow>JOIN 4PLANET</Button>
              <Button to="/partners" onDark accent="#fff">EXPLORE PARTNERSHIP</Button>
            </div>
          </Reveal>
        </div>
      </section>
    </PublicShell>
  );
}
