import { Link } from "react-router-dom";
import { T, DOMAIN_ACCENT } from "@/styles/tokens";
import { PublicShell } from "@/components/layout/PublicShell";
import { Section, Button } from "@/components/ui";
import { CinematicImage, Reveal } from "@/components/Cinematic";
import { Img } from "@/components/Img";
import { img, type ImageKey } from "@/content/imageRegistry";
import type { DomainKey } from "@/types/content";

const dslug = (k: string) => k.replace("_", "").toLowerCase();
const ORDER: DomainKey[] = ["OCE4N_", "E4RTH_", "S4PIENS_", "4CULTURE_"];

const eyebrow: React.CSSProperties = { fontFamily: T.mono, fontSize: 11.5, letterSpacing: ".16em", textTransform: "uppercase" };
const actHead: React.CSSProperties = { fontFamily: T.display, fontWeight: 500, color: T.ink, fontSize: "clamp(30px,4.4vw,60px)", letterSpacing: "-.035em", lineHeight: 1.02, textWrap: "balance" } as React.CSSProperties;
const lead: React.CSSProperties = { fontWeight: 500, color: T.ink, fontSize: "clamp(21px,2.5vw,31px)", letterSpacing: "-.02em", lineHeight: 1.32, textWrap: "balance" } as React.CSSProperties;
const body: React.CSSProperties = { fontSize: "clamp(16px,1.15vw,19px)", color: T.ink, lineHeight: 1.62, textWrap: "pretty" } as React.CSSProperties;
const bodyDim: React.CSSProperties = { ...body, color: T.dim };

const WORLDS: Record<DomainKey, { line: string; img: ImageKey; missions: string[] }> = {
  "OCE4N_": { line: "The ocean connects life far beyond the shoreline.", img: "oce4nDomainHero", missions: ["WH4LES", "COR4L", "PL4STIC", "4NTARCTICA"] },
  "E4RTH_": { line: "Living landscapes hold human life together.", img: "e4rthDomainHero", missions: ["CLIM4TE", "AM4ZONIA", "SPECIES", "RE:WILD"] },
  "S4PIENS_": { line: "The systems we build shape the pressure nature carries.", img: "s4piensDomainHero", missions: ["FOOD", "EN3RGY", "CIRCULAR CITY", "F4SHION"] },
  "4CULTURE_": { line: "Stories, sound, image and ideas can move people toward action.", img: "m4gazineHero", missions: ["4PLAY", "4FILM", "4TELIER", "M4GAZINE"] },
};
const STEPS: [string, string][] = [
  ["Understand", "Explore the living systems, places and challenges under pressure."],
  ["Enter a world", "Find the part of the living planet you care about."],
  ["Follow a mission", "Understand one challenge, what is changing and what can help."],
  ["Join action", "Support credible pathways as they become ready."],
  ["Follow proof", "See how action is delivered, evidenced and reported over time."],
];
const PATHWAYS: [string, string, string, ImageKey, string, string][] = [
  ["PLANT TREES", "A credible tree pathway in partner validation.", "Follow what must be proven before it opens.", "clim4teHero", "PARTNER VALIDATION", "/impact/tree-unit"],
  ["CLEAN OCEAN PLASTIC", "A marine waste recovery pathway in development.", "Follow the evidence model as it is built.", "pl4sticHero", "IN DEVELOPMENT", "/impact/ocean-waste"],
  ["PROTECT AMAZON RAINFOREST", "A rainforest protection pathway in development.", "Follow the work required before it opens.", "amazoniaHero", "IN DEVELOPMENT", "/impact/amazon-square"],
  ["REWILD DEGRADED LAND", "A habitat recovery pathway in development.", "Follow the restoration model as it is defined.", "rewildHero", "IN DEVELOPMENT", "/impact/habitat-recovery"],
];
const PARTICIPATE: [string, string, string][] = [
  ["4PEOPLE", "Join a clearer way to understand, follow and support the living world.", "/people"],
  ["4BRANDS", "Help build credible environmental action people can understand and believe in.", "/brands"],
  ["4PARTNERS", "Bring real environmental work into a system people can understand, support and follow.", "/partners"],
  ["4FUNDERS", "Help build long-term public infrastructure for environmental action.", "/funders"],
];

function WorldTile({ dk }: { dk: DomainKey }) {
  const acc = DOMAIN_ACCENT[dk]; const w = WORLDS[dk]; const m = img(w.img);
  return (
    <Link to={"/domains/" + dslug(dk)} className="world-tile" style={{ position: "relative", display: "block", overflow: "hidden", textDecoration: "none", background: T.ink, minHeight: "clamp(340px,42vw,520px)" }}>
      <img src={m.src} alt={m.alt} loading="lazy" decoding="async" className="world-img" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: m.objectPosition ?? "50% 50%" }} />
      <div aria-hidden className="world-scrim" style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(8,8,8,.15) 0%, rgba(8,8,8,.12) 40%, rgba(8,8,8,.86) 100%)" }} />
      <div aria-hidden style={{ position: "absolute", top: 0, left: 0, width: 84, height: 4, background: acc }} />
      <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "clamp(22px,2.4vw,34px)", minHeight: "inherit" }}>
        <div style={{ fontWeight: 500, color: "#fff", fontSize: "clamp(34px,4vw,58px)", letterSpacing: "-.04em", lineHeight: .95 }}>{dk.replace("_", "")}</div>
        <p style={{ color: "rgba(255,255,255,.9)", fontSize: "clamp(14px,1.1vw,17px)", marginTop: 10, maxWidth: 340, lineHeight: 1.45 }}>{w.line}</p>
        <div className="mono" style={{ fontSize: 11, letterSpacing: ".08em", color: "rgba(255,255,255,.66)", marginTop: 14 }}>{w.missions.join("  ·  ")}</div>
        <div className="mono world-enter" style={{ fontSize: 11.5, letterSpacing: ".14em", color: "#fff", marginTop: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 7, height: 7, background: acc, display: "inline-block" }} />ENTER {dk.replace("_", "")}<span className="world-arrow" style={{ transition: "transform .25s" }}>→</span>
        </div>
      </div>
    </Link>
  );
}

function PathwayCard({ p, i }: { p: typeof PATHWAYS[number]; i: number }) {
  const [title, dek, follow, key, status, to] = p;
  const m = img(key);
  return (
    <Link to={to} className="pathway-card" style={{ position: "relative", display: "block", textDecoration: "none", color: T.ink, borderLeft: i % 2 ? `1px solid ${T.line}` : "none", borderTop: i >= 2 ? `1px solid ${T.line}` : "none" }}>
      <div style={{ position: "relative", height: "clamp(180px,20vw,240px)", overflow: "hidden", background: T.ink }}>
        <img src={m.src} alt={m.alt} loading="lazy" decoding="async" className="pathway-img" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: m.objectPosition ?? "50% 50%" }} />
        <div aria-hidden className="pathway-scrim" style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(8,8,8,.1), rgba(8,8,8,.5))" }} />
        <span className="mono" style={{ position: "absolute", left: 18, top: 16, fontSize: 10.5, letterSpacing: ".1em", color: "rgba(255,255,255,.85)" }}>{`0${i + 1}_`}</span>
      </div>
      <div style={{ padding: "clamp(22px,2.4vw,32px)" }}>
        <div style={{ fontWeight: 500, fontSize: "clamp(19px,1.7vw,23px)", letterSpacing: "-.02em" }}>{title}</div>
        <p style={{ fontSize: 14.5, color: T.dim, marginTop: 12, lineHeight: 1.5, textWrap: "pretty" } as React.CSSProperties}>{dek}</p>
        <p style={{ fontSize: 13.5, color: T.ink, marginTop: 8, lineHeight: 1.5 }}>{follow}</p>
        <div className="mono" style={{ fontSize: 10.5, letterSpacing: ".12em", color: T.blue, marginTop: 16, display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ width: 6, height: 6, background: T.blue, display: "inline-block" }} />{status}
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  return (
    <PublicShell>
      {/* ACT 01 — hero */}
      <Section pad="clamp(60px,9vw,124px)">
        <Reveal>
          <div style={{ ...eyebrow, color: T.blue, marginBottom: "clamp(28px,4vw,48px)" }}>4PLANET_ / FOR A LIVING PLANET</div>
          <h1 style={{ margin: 0, fontFamily: T.display, fontWeight: 500, color: T.ink, letterSpacing: "-.045em", lineHeight: .92, fontSize: "clamp(50px,8.2vw,132px)" }}>
            <span style={{ display: "block" }}>Everything we depend on</span>
            <span style={{ display: "block" }}>is alive.</span>
          </h1>
          <div style={{ marginTop: "clamp(28px,3.5vw,44px)", maxWidth: 760, display: "grid", gap: 6 }}>
            <p style={{ margin: 0, fontSize: "clamp(18px,2vw,25px)", color: T.ink, letterSpacing: "-.01em", lineHeight: 1.38 }}>4Planet makes the living systems under pressure easier to understand.</p>
            <p style={{ margin: 0, fontSize: "clamp(18px,2vw,25px)", color: T.ink, letterSpacing: "-.01em", lineHeight: 1.38 }}>Credible action easier to join.</p>
            <p style={{ margin: 0, fontSize: "clamp(18px,2vw,25px)", color: T.ink, letterSpacing: "-.01em", lineHeight: 1.38 }}>Real progress easier to follow.</p>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: "clamp(30px,4vw,48px)", flexWrap: "wrap" }}>
            <Button to="/impact" primary arrow>MAKE AN IMPACT</Button>
            <Button to="/domains" arrow>ENTER THE LIVING WORLD</Button>
            <Button href="#how">HOW 4PLANET WORKS</Button>
          </div>
          <div className="mono" style={{ fontSize: 12, letterSpacing: ".14em", color: T.blue, marginTop: "clamp(30px,4vw,48px)" }}>CAUSE THERE IS NO PLANET B.</div>
        </Reveal>
      </Section>
      <CinematicImage meta={img("heroEarth")} height="min(80vh, 820px)" priority position="50% 42%" caption="EARTH / LOW ORBIT" credit="NASA" accent={T.blue} />

      {/* ACT 02 — the pressure */}
      <Section pad="clamp(72px,10vw,150px)" minH="100svh" center>
        <Reveal>
          <div style={{ ...eyebrow, color: T.blue, marginBottom: 26 }}>THE LIVING WORLD UNDER PRESSURE</div>
          <h2 style={{ ...actHead, maxWidth: 900 }}>The most important systems on Earth are the ones most people rarely notice.</h2>
        </Reveal>
        <Reveal delay={80}>
          <div style={{ maxWidth: 680, display: "grid", gap: 20, marginTop: "clamp(32px,4vw,52px)" }}>
            {["Oceans regulate climate.", "Forests move water and store carbon.", "Species pollinate food, cycle nutrients and hold ecosystems together.", "Soils, rivers, fungi, insects, reefs, whales and countless invisible relationships make human civilisation possible."].map((t) => <p key={t} style={body}>{t}</p>)}
          </div>
        </Reveal>
      </Section>
      <CinematicImage meta={img("pressureDoc")} height="min(84vh, 820px)" position="50% 50%" accent={T.blue} />
      <Section pad="clamp(64px,9vw,120px)" minH="100svh" center>
        <Reveal>
          <div style={{ maxWidth: 720, display: "grid", gap: 20 }}>
            <p style={body}>But climate, biodiversity, food, oceans, forests, cities and culture are often treated as separate issues.</p>
            <p style={{ ...lead, fontSize: "clamp(24px,3vw,40px)" }}>They are not.</p>
            <p style={body}>The pressure on the living world comes from connected human systems: how we produce, consume, move, eat, build, finance and imagine the future.</p>
            <div style={{ display: "grid", gap: 6, margin: "10px 0" }}>
              {["Projects are difficult to discover.", "Evidence is difficult to compare.", "Trust is difficult to build.", "Participation is often unclear."].map((t) => (
                <div key={t} style={{ display: "flex", gap: 14, alignItems: "baseline" }}>
                  <span style={{ width: 20, height: 1, background: T.ink, flex: "0 0 auto", transform: "translateY(-5px)" }} />
                  <span style={{ ...body, color: T.ink, fontSize: "clamp(15px,1.1vw,18px)" }}>{t}</span>
                </div>
              ))}
            </div>
            <p style={{ ...lead, fontSize: "clamp(24px,3vw,40px)", marginTop: 8 }}>People care. But they rarely know where to begin.</p>
          </div>
        </Reveal>
      </Section>

      {/* ACT 03 — a clear way in (dark) */}
      <section id="how" style={{ background: T.paper, color: T.ink, position: "relative" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(72px,10vw,150px) clamp(20px,5vw,72px)" }}>
          <Reveal>
            <div style={{ ...eyebrow, color: T.blue, marginBottom: 24 }}>A CLEAR WAY IN</div>
            <h2 style={{ ...actHead, color: T.ink, maxWidth: 900 }}>Environmental problems are complex. Participation should not be.</h2>
            <div style={{ maxWidth: 760, display: "grid", gap: 18, marginTop: 28 }}>
              <p style={{ ...body, color: T.ink }}>4Planet organises the living world into connected Domains. Inside each Domain, we develop Missions around specific challenges.</p>
              <p style={{ ...body, color: T.ink }}>Around those Missions, we bring together people, field organisations, scientists, brands and funders to build clearer ways to understand, support and follow credible action.</p>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="process5" style={{ marginTop: "clamp(44px,6vw,72px)", borderTop: `1px solid ${T.line}`, paddingTop: "clamp(28px,4vw,44px)" }}>
              {STEPS.map(([t, d], i) => (
                <div key={t} className="process5-step">
                  <span className="mono" style={{ fontSize: 11, color: T.blue }}>{`0${i + 1}_`}</span>
                  <div style={{ fontWeight: 500, fontSize: "clamp(16px,1.3vw,20px)", marginTop: 12, color: T.ink, letterSpacing: "-.01em" }}>{t}</div>
                  <p style={{ fontSize: 13, color: T.ink, marginTop: 10, lineHeight: 1.5 }}>{d}</p>
                </div>
              ))}
            </div>
            <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", color: T.blue, marginTop: "clamp(40px,5vw,64px)" }}>PLANET → DOMAIN → MISSION → ACTION → PROOF</div>
          </Reveal>
        </div>
      </section>
      <Section pad="clamp(64px,9vw,120px)">
        <Reveal delay={60}>
          <div style={{ marginTop: "clamp(48px,6vw,80px)" }}>
            <div style={{ ...eyebrow, color: T.blue, marginBottom: 14 }}>MAKE AN IMPACT</div>
            <h3 style={{ ...actHead, fontSize: "clamp(26px,3.4vw,44px)" }}>Follow the actions being built to make participation credible.</h3>
          </div>
          <div className="tw" style={{ marginTop: "clamp(28px,4vw,44px)", border: `1px solid ${T.line}` }}>
            {PATHWAYS.map((p, i) => <PathwayCard key={p[0]} p={p} i={i} />)}
          </div>
          <p style={{ ...bodyDim, fontSize: 14, marginTop: 18, maxWidth: 640 }}>No pathway is open for public support yet. Each opens only when its delivery model, evidence requirements and reporting are in place.</p>
          <div style={{ marginTop: 22 }}><Button to="/impact" arrow>FOLLOW IMPACT</Button></div>
        </Reveal>
      </Section>

      {/* ACT 04 — enter four worlds */}
      <Section pad="clamp(64px,8vw,110px)" id="worlds">
        <Reveal>
          <div style={{ ...eyebrow, color: T.blue, marginBottom: 22 }}>ENTER FOUR WORLDS</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 40, flexWrap: "wrap" }}>
            <h2 style={{ ...actHead, maxWidth: 620 }}>One living planet.<br />Four ways in.</h2>
            <p style={{ ...bodyDim, maxWidth: 440 }}>Each world reveals a different part of the system — and a clearer way to understand what is under pressure, what can help and where you can take part.</p>
          </div>
        </Reveal>
        <Reveal delay={60}>
          <div className="world-atlas" style={{ marginTop: "clamp(32px,4vw,52px)" }}>
            {ORDER.map((dk) => <WorldTile key={dk} dk={dk} />)}
          </div>
        </Reveal>
      </Section>

      {/* ACT 05 — stories change culture */}
      <Section pad="clamp(72px,10vw,140px)">
        <Reveal>
          <div style={{ ...eyebrow, color: T.blue, marginBottom: 24 }}>STORIES CHANGE CULTURE</div>
          <h2 style={{ ...actHead, maxWidth: 860 }}>Facts matter. But facts alone rarely change culture.</h2>
          <div style={{ maxWidth: 680, display: "grid", gap: 16, marginTop: 26 }}>
            <p style={body}>Stories make systems visible. Culture shapes what people notice. What people notice, they learn to value. What people value, they are more likely to protect.</p>
            <p style={bodyDim}>4Planet uses field notes, research, film, sound, image and editorial work to make the living world close enough to care about — and possible to act for.</p>
          </div>
        </Reveal>
        <Reveal delay={60}>
          <div className="mag2" style={{ marginTop: "clamp(40px,5vw,72px)" }}>
            <Link to="/stories" className="mag2-lead" style={{ textDecoration: "none", color: "inherit" }}>
              <Img meta={img("cultureAnchor")} ratio="4/5" accent={T.blue} />
              <div style={{ marginTop: 16 }}>
                <span className="mono" style={{ fontSize: 11, letterSpacing: ".12em", color: T.blue }}>LEAD FEATURE · MISSION STORIES</span>
                <h3 style={{ ...actHead, fontSize: "clamp(24px,2.8vw,38px)", marginTop: 10, maxWidth: 560 }}>WH4LES — Why migratory intelligence matters</h3>
                <p style={{ ...bodyDim, marginTop: 12, maxWidth: 500 }}>The animals that move nutrients across whole oceans — and why protecting them protects the systems they keep alive.</p>
              </div>
            </Link>
            <div className="mag2-side">
              <div className="mono" style={{ fontSize: 11, letterSpacing: ".12em", color: T.blue }}>M4GAZINE_</div>
              <div style={{ fontWeight: 500, fontSize: "clamp(19px,1.8vw,24px)", letterSpacing: "-.02em", marginTop: 10 }}>A cultural field guide for a living planet.</div>
              <div className="mono" style={{ fontSize: 12, color: T.dim, marginTop: 14, lineHeight: 2 }}>Nature · Innovation · Fieldwork · Music · Film · Art · Fashion · <span style={{ color: T.blue }}>Solutions</span> · Proof</div>
              <div style={{ marginTop: 8, fontWeight: 500 }}>Not fear. Momentum.</div>
              <div style={{ borderTop: `1px solid ${T.lineStrong}`, marginTop: 24 }}>
                {([["Solutions", "Making Impact Easy", "/impact"], ["Field Notes", "Reading the ocean as a system", "/stories"], ["Research", "What a credible tree pathway requires", "/stories"]] as [string, string, string][]).map(([kind, title, to]) => (
                  <Link key={title} to={to} className="mag2-row" style={{ display: "block", padding: "16px 0", borderBottom: `1px solid ${T.line}`, textDecoration: "none", color: "inherit" }}>
                    <span className="mono" style={{ fontSize: 10.5, letterSpacing: ".1em", color: kind === "Solutions" ? T.blue : T.ink }}>{kind.toUpperCase()}</span>
                    <div style={{ fontWeight: 500, fontSize: 16, marginTop: 6, letterSpacing: "-.01em" }}>{title}</div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div style={{ marginTop: 26 }}><Button to="/stories" arrow>OPEN M4GAZINE</Button></div>
        </Reveal>
      </Section>

      {/* extra cinematic beat (v24) — a full-bleed breath before the closing act */}
      <CinematicImage meta={img("homepageBonus")} height="min(72vh, 720px)" position="50% 50%" accent={T.blue} />

      {/* ACT 06 — build the future together */}
      <Section pad="clamp(64px,9vw,120px)">
        <Reveal>
          <div style={{ ...eyebrow, color: T.blue, marginBottom: 22 }}>BUILD THE FUTURE TOGETHER</div>
          <h2 style={{ ...actHead, maxWidth: 720 }}>No one brings nature back into balance alone.</h2>
          <p style={{ ...bodyDim, marginTop: 20, maxWidth: 720 }}>The challenges are too large for any one person, organisation or institution. 4Planet is built for people who want to participate, organisations doing real work, brands that want to support credible environmental action and funders who understand that public infrastructure matters.</p>
        </Reveal>
        <Reveal delay={60}>
          <div className="tw" style={{ marginTop: "clamp(30px,4vw,48px)", borderTop: `1px solid ${T.ink}`, borderLeft: `1px solid ${T.line}` }}>
            {PARTICIPATE.map(([t, d, to]) => (
              <Link key={t} to={to} className="part-box" style={{ padding: "clamp(26px,3vw,40px)", textDecoration: "none", color: T.ink,
                borderRight: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontFamily: T.display, fontWeight: 500, fontSize: "clamp(21px,2.2vw,27px)", letterSpacing: "-.02em" }}>{t}</span>
                  <span className="pb-arr" style={{ color: T.faint, transition: "color .18s, transform .18s" }}>→</span>
                </div>
                <p style={{ fontSize: 14.5, color: T.dim, marginTop: 14, lineHeight: 1.5, maxWidth: 380, textWrap: "pretty" } as React.CSSProperties}>{d}</p>
              </Link>
            ))}
          </div>
        </Reveal>
      </Section>
    </PublicShell>
  );
}
