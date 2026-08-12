import { Link } from "react-router-dom";
import { T, DOMAIN_ACCENT } from "@/styles/tokens";
import { PublicShell } from "@/components/layout/PublicShell";
import { Section, Button } from "@/components/ui";
import { CinematicImage, Reveal } from "@/components/Cinematic";
import { Img } from "@/components/Img";
import { img, type ImageKey } from "@/content/imageRegistry";
import type { DomainKey } from "@/types/content";
import { AtlasHero } from "./AtlasHero";

// The four first-line public products (Founder Canon, 12 Aug 2026).
const PRODUCTS: { name: string; tag: string; line: string; to: string; accent: string }[] = [
  { name: "ATLAS", tag: "EXPLORE", line: "See what is here, where and when — the whole living planet on one map.", to: "/atlas", accent: T.blue },
  { name: "SPECIES", tag: "MEET LIFE", line: "Meet life on Earth: species, their habitats and how they live.", to: "/species", accent: "#3AE86F" },
  { name: "LIVING SYSTEMS", tag: "UNDERSTAND", line: "Understand how life, places and human systems depend on one another.", to: "/living-systems", accent: "#FF4D22" },
  { name: "IMPACT", tag: "ACT", line: "Follow credible action being built — grounded in real ecology.", to: "/impact", accent: "#3AE86F" },
];

const dslug = (k: string) => k.replace("_", "").toLowerCase();
const ORDER: DomainKey[] = ["OCE4N_", "E4RTH_", "S4PIENS_", "4CULTURE_"];

const eyebrow: React.CSSProperties = { fontFamily: T.mono, fontSize: 11.5, letterSpacing: ".16em", textTransform: "uppercase" };
const actHead: React.CSSProperties = { fontFamily: T.display, fontWeight: 500, color: T.ink, fontSize: "clamp(30px,4.4vw,60px)", letterSpacing: "-.035em", lineHeight: 1.02, textWrap: "balance" } as React.CSSProperties;
const lead: React.CSSProperties = { fontWeight: 500, color: T.ink, fontSize: "clamp(21px,2.5vw,31px)", letterSpacing: "-.02em", lineHeight: 1.32, textWrap: "balance" } as React.CSSProperties;
const body: React.CSSProperties = { fontSize: "clamp(16px,1.15vw,19px)", color: T.ink, lineHeight: 1.62, textWrap: "pretty" } as React.CSSProperties;
const bodyDim: React.CSSProperties = { ...body, color: T.dim };

const WORLDS: Record<DomainKey, { line: string; img: ImageKey; missions: string[] }> = {
  "OCE4N_": { line: "The ocean connects life far beyond the shoreline.", img: "oce4nDomainHero", missions: ["CLE4N", "WH4LES", "COR4L", "RE:WILD"] },
  "E4RTH_": { line: "Living landscapes hold human life together.", img: "e4rthDomainHero", missions: ["CLIM4TE", "AM4ZONIA", "SPECIES", "RE:WILD"] },
  "S4PIENS_": { line: "The systems we build shape the pressure nature carries.", img: "s4piensDomainHero", missions: ["FOOD", "EN4RGY", "CIRCULAR CITY", "F4SHION"] },
  "4CULTURE_": { line: "Stories, sound, image and ideas can move people toward action.", img: "m4gazineHero", missions: ["4PLAY", "4FILM", "4RT", "M4GAZINE"] },
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

function ProductRow({ p, i }: { p: typeof PRODUCTS[number]; i: number }) {
  return (
    <Link to={p.to} className="prod-row" style={{ position: "relative", display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", gap: "clamp(16px,3vw,44px)", padding: "clamp(24px,3.4vw,44px) clamp(4px,1vw,12px)", textDecoration: "none", color: T.ink, borderTop: i === 0 ? `1px solid ${T.line}` : "none", borderBottom: `1px solid ${T.line}` }}>
      <span style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: ".14em", color: p.accent }}>{`0${i + 1}`}</span>
      <div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
          <span style={{ fontFamily: T.display, fontWeight: 500, fontSize: "clamp(24px,3vw,40px)", letterSpacing: "-.03em" }}>{p.name}</span>
          <span style={{ fontFamily: T.mono, fontSize: 10.5, letterSpacing: ".14em", color: T.dim }}>{p.tag}</span>
        </div>
        <p style={{ margin: "8px 0 0", fontSize: "clamp(14px,1.15vw,17px)", color: T.dim, lineHeight: 1.5, maxWidth: "58ch" }}>{p.line}</p>
      </div>
      <span className="prod-arr" style={{ fontFamily: T.mono, fontSize: 18, color: T.ink, transition: "transform .2s" }}>→</span>
    </Link>
  );
}

export default function Home() {
  return (
    <PublicShell>
      {/* 1 — live shared-engine ATLAS globe hero + ENTER ATLAS */}
      <AtlasHero />

      {/* 2 — the four first-line products, introduced clearly */}
      <Section pad="clamp(56px,7vw,110px)">
        <Reveal>
          <div style={{ ...eyebrow, color: T.blue, marginBottom: 8 }}>FOUR WAYS INTO THE LIVING PLANET</div>
          <h2 style={{ ...actHead, fontSize: "clamp(24px,3vw,40px)", maxWidth: 820 }}>One planet model. Four products.</h2>
          <div style={{ marginTop: "clamp(28px,4vw,44px)" }}>
            {PRODUCTS.map((p, i) => <ProductRow key={p.name} p={p} i={i} />)}
          </div>
        </Reveal>
      </Section>

      {/* 3 — the four living worlds (Domains), reusing existing heroes */}
      <Section pad="clamp(48px,6vw,96px)" id="worlds">
        <Reveal>
          <div style={{ ...eyebrow, color: T.blue, marginBottom: 8 }}>ENTER THE LIVING WORLD</div>
          <h2 style={{ ...actHead, fontSize: "clamp(24px,3vw,40px)", maxWidth: 820 }}>Four connected domains.</h2>
          <p style={{ ...bodyDim, marginTop: 16, maxWidth: 640 }}>Ocean, land, human systems and culture — the living world organised so you can find the part you care about.</p>
        </Reveal>
        <Reveal delay={60}>
          <div className="worlds-grid" style={{ marginTop: "clamp(28px,4vw,44px)" }}>
            {ORDER.map((dk) => <WorldTile key={dk} dk={dk} />)}
          </div>
        </Reveal>
      </Section>

      {/* 4 — one honest "how it works" beat (Planet → Domain → Mission → Action → Proof) */}
      <section id="how" style={{ background: T.paper, color: T.ink }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(56px,8vw,120px) clamp(20px,5vw,72px)" }}>
          <Reveal>
            <div style={{ ...eyebrow, color: T.blue, marginBottom: 16 }}>A CLEAR WAY IN</div>
            <h2 style={{ ...actHead, fontSize: "clamp(24px,3vw,40px)", maxWidth: 820 }}>Environmental problems are complex. Participation should not be.</h2>
            <p style={{ ...bodyDim, marginTop: 18, maxWidth: 700 }}>4PLANET organises the living world into connected domains and missions, then brings together people, field organisations, scientists and funders around credible action you can understand, support and follow.</p>
          </Reveal>
          <Reveal delay={60}>
            <div className="process5" style={{ marginTop: "clamp(36px,5vw,60px)", borderTop: `1px solid ${T.line}`, paddingTop: "clamp(24px,3vw,40px)" }}>
              {STEPS.map(([t, d], i) => (
                <div key={t} className="process5-step">
                  <span className="mono" style={{ fontSize: 11, color: T.blue }}>{`0${i + 1}_`}</span>
                  <div style={{ fontWeight: 500, fontSize: "clamp(15px,1.2vw,18px)", marginTop: 12, letterSpacing: "-.01em" }}>{t}</div>
                  <p style={{ fontSize: 13, marginTop: 10, lineHeight: 1.5, color: T.dim }}>{d}</p>
                </div>
              ))}
            </div>
            <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", color: T.blue, marginTop: "clamp(32px,4vw,52px)" }}>PLANET → DOMAIN → MISSION → ACTION → PROOF</div>
            <p style={{ ...bodyDim, fontSize: 13.5, marginTop: 18, maxWidth: 640 }}>No impact pathway is open for public support yet. Each opens only when its delivery model, evidence and reporting are in place — the ecological facts we show are sourced; the delivery model is shown at its true status.</p>
          </Reveal>
        </div>
      </section>

      {/* 5 — participate + clean close */}
      <Section pad="clamp(48px,6vw,96px)">
        <Reveal>
          <div style={{ ...eyebrow, color: T.blue, marginBottom: 8 }}>TAKE PART</div>
          <h2 style={{ ...actHead, fontSize: "clamp(24px,3vw,40px)", maxWidth: 820 }}>Build this with us.</h2>
          <div className="part-grid" style={{ marginTop: "clamp(28px,4vw,44px)", borderTop: `1px solid ${T.line}`, borderLeft: `1px solid ${T.line}` }}>
            {PARTICIPATE.map(([t, d, to]) => (
              <Link key={t} to={to} className="part-box" style={{ padding: "clamp(24px,3vw,38px)", textDecoration: "none", color: T.ink, borderRight: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontFamily: T.display, fontWeight: 500, fontSize: "clamp(20px,2vw,26px)", letterSpacing: "-.02em" }}>{t}</span>
                  <span className="pb-arr" style={{ color: T.faint, transition: "color .18s, transform .18s" }}>→</span>
                </div>
                <p style={{ fontSize: 14, color: T.dim, marginTop: 12, lineHeight: 1.5, maxWidth: 380 }}>{d}</p>
              </Link>
            ))}
          </div>
        </Reveal>
      </Section>
    </PublicShell>
  );
}
