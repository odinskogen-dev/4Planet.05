import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { SpeciesAtlasWindow } from "@/components/species/SpeciesAtlasWindow";
import { SpeciesEvidence } from "@/components/species/SpeciesEvidence";
import { speciesBySlug } from "@/data/species";
import { speciesMedia } from "@/data/speciesMedia";
import { T } from "@/styles/tokens";

const mono: React.CSSProperties = { fontFamily: T.mono, fontSize: 10, letterSpacing: ".12em" };
const max: React.CSSProperties = { maxWidth: 1240, margin: "0 auto", paddingLeft: "clamp(18px,5vw,72px)", paddingRight: "clamp(18px,5vw,72px)" };

const VIDEO = {
  src: "https://upload.wikimedia.org/wikipedia/commons/3/3b/Pantanal_Jaguar_%28Panthera_onca%29.webm",
  source: "https://commons.wikimedia.org/wiki/File:Pantanal_Jaguar_(Panthera_onca).webm",
  creator: 'Gregory "Slobirdr" Smith',
  licence: "CC BY-SA 2.0",
};

const PREY = [
  { name: "CAPYBARAS", kind: "MAMMAL PREY", note: "A documented prey example. Relative importance varies by place and prey availability." },
  { name: "PECCARIES", kind: "MAMMAL PREY", note: "A documented prey group across parts of the jaguar range." },
  { name: "CAIMANS", kind: "REPTILE PREY", note: "Jaguars are documented taking crocodilians, including in wetland systems such as the Pantanal." },
  { name: "DEER", kind: "MAMMAL PREY", note: "A documented prey group; this card does not imply a single deer species or local diet share." },
];

const PRESSURES = [
  ["HABITAT LOSS + FRAGMENTATION", "Breaking connected habitat can reduce movement and isolate populations."],
  ["HUMAN–JAGUAR CONFLICT", "Livestock losses or perceived risk can trigger retaliatory killing; coexistence measures can reduce that conflict."],
  ["DIRECT KILLING + ILLEGAL TRADE", "Jaguars can be killed directly and targeted for body parts."],
  ["PREY DEPLETION", "Overhunting of wild prey can weaken the ecological conditions jaguars depend on and intensify conflict."],
] as const;

function ShareButton() {
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: "Jaguar — 4PLANET_", text: "Explore the jaguar as an entry into the living planet.", url });
      else { await navigator.clipboard.writeText(url); setCopied(true); window.setTimeout(() => setCopied(false), 1800); }
    } catch { /* user cancelled */ }
  };
  return <button type="button" onClick={share} style={{ background: "transparent", border: "1px solid rgba(255,255,255,.46)", color: "#fff", padding: "12px 15px", cursor: "pointer", font: "inherit", fontSize: 12, fontWeight: 600 }}>{copied ? "COPIED" : "SHARE THIS SPECIES"}</button>;
}

function SectionHead({ kicker, title, intro, dark = false }: { kicker: string; title: string; intro?: string; dark?: boolean }) {
  return <div style={{ maxWidth: 820 }}><div style={{ ...mono, color: dark ? T.acid : T.blue }}>{kicker}</div><h2 style={{ margin: "16px 0 0", fontFamily: T.display, fontWeight: 500, fontSize: "clamp(38px,6vw,78px)", letterSpacing: "-.05em", lineHeight: .94 }}>{title}</h2>{intro && <p style={{ margin: "24px 0 0", maxWidth: 700, fontSize: "clamp(16px,2vw,20px)", lineHeight: 1.58, color: dark ? "rgba(255,255,255,.74)" : "rgba(8,8,8,.72)" }}>{intro}</p>}</div>;
}

function Fact({ label, value, boundary }: { label: string; value: string; boundary?: string }) {
  return <div style={{ borderTop: "1px solid rgba(255,255,255,.22)", padding: "18px 0 24px" }}><div style={{ ...mono, color: "rgba(255,255,255,.52)" }}>{label}</div><div style={{ marginTop: 9, fontSize: "clamp(18px,2vw,24px)", lineHeight: 1.25 }}>{value}</div>{boundary && <div style={{ marginTop: 8, fontSize: 11, lineHeight: 1.5, color: "rgba(255,255,255,.52)" }}>{boundary}</div>}</div>;
}

export default function JaguarWorld() {
  const profile = speciesBySlug("jaguar");
  const media = speciesMedia("jaguar");
  const [motion, setMotion] = useState(false);
  const [openNode, setOpenNode] = useState<string | null>(null);
  const hero = media?.localPath || "";
  const profileHref = useMemo(() => "/species/jaguar", []);

  if (!profile) return null;

  return (
    <PublicShell>
      <article style={{ background: "#fff", color: T.ink }}>
        <header style={{ position: "relative", minHeight: "min(880px,calc(100vh - 64px))", background: "#020603", color: "#fff", overflow: "hidden" }}>
          {hero && <img src={hero} alt="Jaguar resting on a tree limb in the Pantanal" fetchPriority="high" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", opacity: .82 }} />}
          <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,rgba(0,0,0,.84) 0%,rgba(0,0,0,.40) 52%,rgba(0,0,0,.18) 100%),linear-gradient(0deg,rgba(0,0,0,.72),transparent 55%)" }} />
          <div style={{ ...max, position: "relative", zIndex: 1, minHeight: "min(880px,calc(100vh - 64px))", display: "flex", flexDirection: "column", justifyContent: "flex-end", paddingTop: 100, paddingBottom: "clamp(42px,7vw,84px)" }}>
            <div style={{ ...mono, color: T.acid }}>SPECIES_ · E4RTH_ · GOLD REFERENCE 02</div>
            <h1 style={{ margin: "18px 0 0", maxWidth: 930, fontFamily: T.display, fontSize: "clamp(72px,14vw,178px)", letterSpacing: "-.075em", fontWeight: 500, lineHeight: .77 }}>JAGUAR</h1>
            <div style={{ marginTop: 18, fontFamily: T.display, fontSize: "clamp(20px,3vw,34px)", fontStyle: "italic", opacity: .82 }}>{profile.scientificName}</div>
            <p style={{ margin: "28px 0 0", maxWidth: 720, fontSize: "clamp(18px,2.3vw,25px)", lineHeight: 1.5, color: "rgba(255,255,255,.88)" }}>Meet one species. Follow the relationships around it. Enter the ecosystems, pressures and choices that shape whether it can thrive.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 30 }}><a href="#atlas-window" style={{ color: "#071009", background: T.acid, padding: "12px 15px", textDecoration: "none", fontSize: 12, fontWeight: 650 }}>ENTER THE LIVING SYSTEM ↓</a><ShareButton /></div>
            {media?.attribution && <div style={{ ...mono, position: "absolute", right: "clamp(18px,5vw,72px)", bottom: 14, maxWidth: 520, textAlign: "right", color: "rgba(255,255,255,.62)", fontSize: 8.5 }}>{media.attribution}</div>}
          </div>
        </header>

        <section style={{ background: "#050805", color: "#fff" }}>
          <div style={{ ...max, paddingTop: "clamp(54px,8vw,100px)", paddingBottom: "clamp(54px,8vw,100px)" }}>
            <div className="jaguar-two" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.35fr) minmax(260px,.65fr)", gap: "clamp(38px,8vw,110px)" }}>
              <SectionHead dark kicker="01_ MEET THE SPECIES" title="A predator built for connected landscapes." intro={profile.intro || profile.context} />
              <div>
                <Fact label="IDENTITY" value={`${profile.commonName} · ${profile.scientificName}`} boundary={`GBIF taxon ${profile.gbifKey} · ${profile.taxonomicStatus}`} />
                <Fact label="HABITAT CONTEXT" value={profile.habitat || "Source review pending"} boundary="Descriptive habitat context; not a range or presence claim." />
                <Fact label="LIVING SYSTEM" value="Tropical forest + wetland systems" boundary="4PLANET working relationship layer." />
                <Fact label="EVIDENCE BOUNDARY" value="Observation ≠ range ≠ population ≠ live tracking." />
              </div>
            </div>
          </div>
        </section>

        <div id="atlas-window"><SpeciesAtlasWindow gbifKey={profile.gbifKey} commonName={profile.commonName} scientificName={profile.scientificName} entityId={profile.id} journey={profile.journey} /></div>

        <SpeciesEvidence
          profile={profile}
          title="The evidence stays with the animal."
          intro="The first view remains life-first. When you go deeper, each material species-level statement carries a source, date and boundary — without turning the experience into a compliance wall."
        />

        <section id="ecosystem" style={{ background: "#eef5ed" }}>
          <div style={{ ...max, paddingTop: "clamp(60px,9vw,116px)", paddingBottom: "clamp(60px,9vw,116px)" }}>
            <SectionHead kicker="02_ ECOSYSTEM ENTRY" title="The jaguar does not exist alone." intro="A species profile becomes more useful when it opens outward: into place, habitat, prey, ecological functions, pressures and the people shaping those systems." />
            <Link to="/ecosystems/amazon-rainforest" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 20, alignItems: "end", marginTop: 44, padding: "clamp(26px,5vw,56px)", background: "#071009", color: "#fff", textDecoration: "none" }}>
              <div><div style={{ ...mono, color: T.acid }}>ECOSYSTEM REGION · BOUNDED PUBLIC ENTRY</div><h3 style={{ fontFamily: T.display, fontSize: "clamp(40px,7vw,92px)", letterSpacing: "-.055em", lineHeight: .9, fontWeight: 500, margin: "22px 0 0" }}>AMAZON<br />RAINFOREST</h3><p style={{ maxWidth: 620, margin: "24px 0 0", color: "rgba(255,255,255,.72)", lineHeight: 1.6 }}>Enter the larger living system: water, forest structure, biodiversity, carbon, change, pressures and routes toward solutions.</p></div><span aria-hidden style={{ fontSize: 42, color: T.acid }}>↗</span>
            </Link>
          </div>
        </section>

        <section id="food-web" style={{ background: "#fff" }}>
          <div style={{ ...max, paddingTop: "clamp(60px,9vw,116px)", paddingBottom: "clamp(60px,9vw,116px)" }}>
            <SectionHead kicker="03_ FOLLOW THE FOOD WEB" title="Predator becomes relationship." intro="The nodes below are documented prey examples, not a fixed menu or a claim about diet share at every place. Open a node to keep the scientific boundary visible." />
            <div className="jaguar-four" style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", marginTop: 46, borderTop: `1px solid ${T.lineStrong}`, borderLeft: `1px solid ${T.lineStrong}` }}>
              {PREY.map((node) => {
                const open = openNode === node.name;
                return <button key={node.name} type="button" onClick={() => setOpenNode(open ? null : node.name)} aria-expanded={open} style={{ minHeight: 260, padding: 22, textAlign: "left", background: open ? "#071009" : "#fff", color: open ? "#fff" : T.ink, border: 0, borderRight: `1px solid ${open ? "rgba(255,255,255,.18)" : T.lineStrong}`, borderBottom: `1px solid ${open ? "rgba(255,255,255,.18)" : T.lineStrong}`, cursor: "pointer" }}>
                  <div style={{ ...mono, color: open ? T.acid : T.blue }}>{node.kind}</div><div style={{ marginTop: 28, fontFamily: T.display, fontSize: "clamp(24px,3vw,36px)", letterSpacing: "-.03em" }}>{node.name}</div><div style={{ marginTop: 30, fontSize: 13, lineHeight: 1.55, color: open ? "rgba(255,255,255,.72)" : "rgba(8,8,8,.64)" }}>{open ? node.note : "OPEN RELATIONSHIP +"}</div>{open && <div style={{ ...mono, marginTop: 22, color: "rgba(255,255,255,.5)", fontSize: 8.5 }}>FULL 4PLANET SPECIES PROFILE NOT YET IN GOLD SET · NO DEAD LINK CREATED</div>}
                </button>;
              })}
            </div>
            <p style={{ margin: "20px 0 0", maxWidth: 760, fontSize: 12.5, color: "rgba(8,8,8,.58)", lineHeight: 1.6 }}>Diet examples are bounded to documented broad prey relationships. Source review: Panthera Jaguar Program / expert synthesis. Future nodes graduate to full internal Species identities only after taxon and source QA.</p>
            <a href="https://panthera.org/cat/jaguar" target="_blank" rel="noreferrer" style={{ ...mono, display: "inline-block", marginTop: 15, color: T.blue }}>OPEN JAGUAR SOURCE ↗</a>
          </div>
        </section>

        <section id="pressures" style={{ background: "#0b0b0b", color: "#fff" }}>
          <div style={{ ...max, paddingTop: "clamp(60px,9vw,116px)", paddingBottom: "clamp(60px,9vw,116px)" }}>
            <SectionHead dark kicker="04_ PRESSURES → HUMAN SYSTEMS" title="Threats have causes." intro="A pressure is not the end of the chain. 4PLANET uses it as a bridge toward the systems, incentives, actors and solutions that can change the outcome." />
            <div className="jaguar-two" style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", marginTop: 48, borderTop: "1px solid rgba(255,255,255,.18)", borderLeft: "1px solid rgba(255,255,255,.18)" }}>
              {PRESSURES.map(([title, copy], i) => <article key={title} style={{ minHeight: 240, padding: "clamp(22px,4vw,38px)", borderRight: "1px solid rgba(255,255,255,.18)", borderBottom: "1px solid rgba(255,255,255,.18)" }}><div style={{ ...mono, color: T.acid }}>P{String(i + 1).padStart(2, "0")}</div><h3 style={{ fontFamily: T.display, fontSize: "clamp(24px,3vw,38px)", letterSpacing: "-.03em", margin: "26px 0 0" }}>{title}</h3><p style={{ margin: "18px 0 0", maxWidth: 500, lineHeight: 1.6, color: "rgba(255,255,255,.70)" }}>{copy}</p></article>)}
            </div>
            <div style={{ marginTop: 24, fontSize: 12.5, lineHeight: 1.6, color: "rgba(255,255,255,.58)" }}>Source boundary: broad pressure framing from the current 4PLANET Jaguar profile and Panthera Jaguar Programme. Local pressure intensity, causal attribution and trend require place-specific evidence.</div>
          </div>
        </section>

        <section id="motion" style={{ background: "#050805", color: "#fff" }}>
          <div style={{ ...max, paddingTop: "clamp(60px,9vw,116px)", paddingBottom: "clamp(60px,9vw,116px)" }}>
            <SectionHead dark kicker="05_ LIFE IN MOTION" title="Not stock decoration. A living animal." intro="Motion is loaded only when you ask for it. The source, creator and licence remain visible, and the clip is context — not evidence of present location, range or population." />
            <div style={{ marginTop: 42, position: "relative", aspectRatio: "16/9", overflow: "hidden", border: "1px solid rgba(255,255,255,.18)", background: "#000" }}>
              {!motion ? <><img src={hero} alt="Jaguar video poster" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: .58 }} /><button type="button" onClick={() => setMotion(true)} aria-label="Load and play jaguar video" style={{ position: "absolute", inset: 0, margin: "auto", width: 110, height: 110, borderRadius: "50%", border: "1px solid rgba(255,255,255,.65)", color: "#fff", background: "rgba(0,0,0,.45)", cursor: "pointer", fontSize: 32 }}>▶</button><div style={{ position: "absolute", left: 16, bottom: 14, ...mono, color: "rgba(255,255,255,.72)" }}>LOAD MOTION · NO AUTOPLAY · ~32 MB ORIGINAL SOURCE</div></> : <video controls autoPlay playsInline preload="metadata" poster={hero} style={{ width: "100%", height: "100%", objectFit: "contain", background: "#000" }}><source src={VIDEO.src} type="video/webm" />Your browser does not support WebM video.</video>}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginTop: 14, ...mono, color: "rgba(255,255,255,.58)", lineHeight: 1.6 }}><span>VIDEO: {VIDEO.creator} · WIKIMEDIA COMMONS · {VIDEO.licence}</span><a href={VIDEO.source} target="_blank" rel="noreferrer" style={{ color: T.acid }}>SOURCE + LICENCE ↗</a></div>
          </div>
        </section>

        <section id="continue" style={{ background: T.acid, color: "#071009" }}>
          <div style={{ ...max, paddingTop: "clamp(58px,8vw,104px)", paddingBottom: "clamp(58px,8vw,104px)" }}>
            <div style={{ ...mono }}>06_ KEEP FOLLOWING THE LIVING PLANET</div><h2 style={{ margin: "18px 0 0", maxWidth: 1000, fontFamily: T.display, fontWeight: 500, fontSize: "clamp(46px,8vw,112px)", lineHeight: .85, letterSpacing: "-.06em" }}>Start anywhere.<br />Follow life wherever the evidence leads.</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 38 }}><Link to="/ecosystems/amazon-rainforest" style={{ background: "#071009", color: "#fff", padding: "13px 17px", textDecoration: "none", fontWeight: 650, fontSize: 13 }}>ENTER AMAZON RAINFOREST →</Link><Link to={`/atlas?entity=${encodeURIComponent(profile.id)}&journey=amazonia`} style={{ border: "1px solid #071009", color: "#071009", padding: "13px 17px", textDecoration: "none", fontWeight: 650, fontSize: 13 }}>OPEN FULL ATLAS →</Link><Link to="/living-systems" style={{ border: "1px solid #071009", color: "#071009", padding: "13px 17px", textDecoration: "none", fontWeight: 650, fontSize: 13 }}>LIVING SYSTEMS →</Link></div>
            <div style={{ marginTop: 42, paddingTop: 20, borderTop: "1px solid rgba(7,16,9,.35)", ...mono, lineHeight: 1.7 }}>PUBLIC TRUTH BOUNDARY · THIS PROFILE CONNECTS SOURCED IDENTITIES, REPORTED RECORDS AND BOUNDED INTERPRETATION. IT DOES NOT ASSERT LIVE TRACKING, COMPLETE RANGE, POPULATION SIZE, LOCAL PRESENCE, FIELD PARTNERSHIP OR ECOLOGICAL DELIVERY.</div>
          </div>
        </section>

        <section style={{ background: "#fff" }}><div style={{ ...max, paddingTop: 34, paddingBottom: 46 }}><div style={{ ...mono, color: T.faint }}>MEDIA RIGHTS · {media?.licence || "NO PHOTO LICENCE RECORDED"} · CHECKED {media?.checkedDate || "—"}</div><div style={{ marginTop: 10, fontSize: 11.5, lineHeight: 1.55, color: "rgba(8,8,8,.58)" }}>{media?.limitations}</div><a href={media?.sourcePage} target="_blank" rel="noreferrer" style={{ ...mono, display: "inline-block", marginTop: 12, color: T.blue }}>PHOTO SOURCE + LICENCE ↗</a><span style={{ ...mono, marginLeft: 14, color: T.faint }}>STABLE ENTRY · {profileHref}</span></div></section>
      </article>
      <style>{`@media(max-width:840px){.jaguar-two{grid-template-columns:1fr!important}.jaguar-four{grid-template-columns:1fr 1fr!important}}@media(max-width:540px){.jaguar-four{grid-template-columns:1fr!important}}@media(prefers-reduced-motion:reduce){video{scroll-behavior:auto!important}}`}</style>
    </PublicShell>
  );
}
