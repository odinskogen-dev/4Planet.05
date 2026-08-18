import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { SpeciesAtlasWindow } from "@/components/species/SpeciesAtlasWindow";
import { SpeciesEvidence } from "@/components/species/SpeciesEvidence";
import { SpeciesNodeCard, type SpeciesRelationshipNode } from "@/components/species/SpeciesNodeCard";
import { SpeciesPressurePath, type SpeciesPressureItem } from "@/components/species/SpeciesPressurePath";
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

const CAPYBARA_NODE: SpeciesRelationshipNode = {
  id: "taxon:gbif:2437610",
  commonName: "Capybara",
  scientificName: "Hydrochoerus hydrochaeris",
  relationshipLabel: "DOCUMENTED JAGUAR PREY · SOUTHERN PANTANAL STUDY CONTEXT",
  relationshipSummary: "Capybara is a documented jaguar prey taxon. A peer-reviewed Southern Pantanal diet study provides a bounded route into this relationship while also showing why jaguar diet must not be treated as fixed across places.",
  boundary: "The cited study is from the Southern Pantanal and its field data span November 2001–April 2004. This relationship card does not claim that capybara has the same dietary importance everywhere, does not diagnose a local Jaguar diet in the Amazon, and does not create a Capybara Species World before that profile is ready.",
  sourceLabel: "PERILLI ET AL. 2016 · PLOS ONE",
  sourceUrl: "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0151814",
  atlasHref: "/atlas?entity=taxon%3Agbif%3A2437610&journey=jaguar-living-web",
};

const JAGUAR_PRESSURES: SpeciesPressureItem[] = [
  {
    id: "jaguar-habitat-loss-fragmentation",
    label: "HABITAT LOSS + FRAGMENTATION",
    summary: "Loss and fragmentation of habitat are documented range-wide pressure categories for jaguars.",
    causeClass: "HUMAN_SYSTEM",
    causeLabel: "Human-driven habitat conversion and fragmentation.",
    sourceLabel: "PANTHERA — JAGUAR",
    sourceUrl: "https://www.panthera.org/cat/jaguar",
    boundary: "Range-wide pressure framing. Local intensity, mechanism, corridor function and population effect require place-specific evidence.",
  },
  {
    id: "jaguar-conflict-retaliatory-killing",
    label: "CONFLICT + RETALIATORY KILLING",
    summary: "Conflict with people and retaliatory killing are documented pressure categories for the species.",
    causeClass: "HUMAN_SYSTEM",
    causeLabel: "Human–wildlife conflict and retaliatory killing.",
    sourceLabel: "PANTHERA — JAGUAR",
    sourceUrl: "https://www.panthera.org/cat/jaguar",
    boundary: "This does not diagnose conflict, livestock loss or killing at a particular place or occurrence record.",
  },
  {
    id: "jaguar-prey-depletion",
    label: "PREY DEPLETION",
    summary: "Overhunting of jaguar prey is a documented pressure category within range-wide jaguar conservation.",
    causeClass: "HUMAN_SYSTEM",
    causeLabel: "Human hunting pressure on wild prey.",
    sourceLabel: "PANTHERA — JAGUAR",
    sourceUrl: "https://www.panthera.org/cat/jaguar",
    boundary: "Prey availability and hunting pressure are place-specific. No local food limitation or population effect is inferred here.",
  },
];

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
  const heroMobile = "/assets/species/jaguar/SP-005-mobile.jpg";
  const profileHref = useMemo(() => "/species/jaguar", []);

  if (!profile) return null;

  return (
    <PublicShell>
      <article style={{ background: "#fff", color: T.ink }}>
        <header style={{ position: "relative", minHeight: "min(880px,calc(100vh - 64px))", background: "#020603", color: "#fff", overflow: "hidden" }}>
          {hero && (
            <picture style={{ position: "absolute", inset: 0, display: "block" }}>
              <source media="(max-width: 640px)" srcSet={heroMobile} />
              <img src={hero} alt="Jaguar resting on a tree limb in the Pantanal" fetchPriority="high" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", opacity: .88 }} />
            </picture>
          )}
          <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,rgba(0,0,0,.78) 0%,rgba(0,0,0,.34) 50%,rgba(0,0,0,.10) 100%),linear-gradient(0deg,rgba(0,0,0,.70),transparent 58%)" }} />
          <div style={{ ...max, position: "relative", zIndex: 1, minHeight: "min(880px,calc(100vh - 64px))", display: "flex", flexDirection: "column", justifyContent: "flex-end", paddingTop: 100, paddingBottom: "clamp(42px,7vw,84px)" }}>
            <div style={{ ...mono, color: T.acid }}>4PLANET SPECIES_ · E4RTH_</div>
            <h1 style={{ margin: "18px 0 0", maxWidth: 930, fontFamily: T.display, fontSize: "clamp(72px,14vw,178px)", letterSpacing: "-.075em", fontWeight: 500, lineHeight: .77 }}>JAGUAR</h1>
            <div style={{ marginTop: 18, fontFamily: T.display, fontSize: "clamp(20px,3vw,34px)", fontStyle: "italic", opacity: .84 }}>{profile.scientificName}</div>
            <p style={{ margin: "28px 0 0", maxWidth: 760, fontSize: "clamp(18px,2.3vw,25px)", lineHeight: 1.5, color: "rgba(255,255,255,.9)" }}>The largest cat in the Western Hemisphere. Follow one living animal outward — into place, prey, ecosystems and the pressures shaping its future.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 30 }}><a href="/xr/jaguar/" style={{ color: "#071009", background: T.acid, padding: "12px 15px", textDecoration: "none", fontSize: 12, fontWeight: 700 }}>ENTER HABITAT · XR PROTOTYPE ↗</a><a href="#atlas-window" style={{ color: "#fff", border: "1px solid rgba(255,255,255,.56)", padding: "12px 15px", textDecoration: "none", fontSize: 12, fontWeight: 650 }}>EXPLORE WHERE IT'S BEEN RECORDED ↓</a><ShareButton /></div>
            <div style={{ ...mono, marginTop: 12, color: "rgba(255,255,255,.58)", maxWidth: 760 }}>XR v0.1 · IMMERSIVE LEARNING REPRESENTATION · NOT LIVE HABITAT / LIVE ANIMAL / ECOLOGICAL SIMULATION</div>
            {media?.attribution && <div style={{ ...mono, position: "absolute", right: "clamp(18px,5vw,72px)", bottom: 14, maxWidth: 600, textAlign: "right", color: "rgba(255,255,255,.62)", fontSize: 8.5 }}>PANTANAL · SPECIES PORTRAIT · {media.attribution}</div>}
          </div>
        </header>

        <section style={{ background: "#050805", color: "#fff" }}>
          <div style={{ ...max, paddingTop: "clamp(54px,8vw,100px)", paddingBottom: "clamp(54px,8vw,100px)" }}>
            <div className="jaguar-two" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.35fr) minmax(260px,.65fr)", gap: "clamp(38px,8vw,110px)" }}>
              <div>
                <SectionHead dark kicker="01_ MEET THE SPECIES" title="A predator built for connected landscapes." intro={profile.intro || profile.context} />
                <a href="#evidence" style={{ ...mono, display: "inline-block", marginTop: 28, color: T.acid }}>WHY WE SAY THIS ↓</a>
              </div>
              <div>
                <Fact label="IDENTITY" value={`${profile.commonName} · ${profile.scientificName}`} boundary={`GBIF taxon ${profile.gbifKey} · ${profile.taxonomicStatus}`} />
                <Fact label="RANGE-WIDE CONTEXT" value={profile.habitat || "Source review pending"} boundary="Descriptive species-level context; not a local range, presence or population claim." />
              </div>
            </div>
          </div>
        </section>

        <div id="atlas-window">
          <SpeciesAtlasWindow
            gbifKey={profile.gbifKey}
            commonName={profile.commonName}
            scientificName={profile.scientificName}
            entityId={profile.id}
            journey={profile.journey}
            ecosystems={[
              {
                label: "AMAZON RAINFOREST",
                href: "/ecosystems/amazon-rainforest",
                relationship: "CURATED REGIONAL LIVING-SYSTEM CONTEXT",
                boundary: "A bounded 4PLANET learning bridge. It is not inferred from GBIF occurrence points and does not assert ecosystem membership for a particular observation, animal or population.",
              },
            ]}
          />
        </div>

        <section id="ecosystem" style={{ background: "#eef5ed" }}>
          <div style={{ ...max, paddingTop: "clamp(60px,9vw,116px)", paddingBottom: "clamp(60px,9vw,116px)" }}>
            <SectionHead kicker="03_ ENTER THE ECOSYSTEM" title="The jaguar does not exist alone." intro="Follow the animal outward into the larger living system around it — place, habitat, other life, ecological processes and change." />
            <Link to="/ecosystems/amazon-rainforest" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 20, alignItems: "end", marginTop: 44, padding: "clamp(26px,5vw,56px)", background: "#071009", color: "#fff", textDecoration: "none" }}>
              <div><div style={{ ...mono, color: T.acid }}>ECOSYSTEM REGION · BOUNDED PUBLIC ENTRY</div><h3 style={{ fontFamily: T.display, fontSize: "clamp(40px,7vw,92px)", letterSpacing: "-.055em", lineHeight: .9, fontWeight: 500, margin: "22px 0 0" }}>AMAZON<br />RAINFOREST</h3><p style={{ maxWidth: 620, margin: "24px 0 0", color: "rgba(255,255,255,.72)", lineHeight: 1.6 }}>Enter a broader regional living system. Public ecosystem intelligence here does not imply field authority, representation or local mandate.</p></div><span aria-hidden style={{ fontSize: 42, color: T.acid }}>↗</span>
            </Link>
          </div>
        </section>

        <section id="food-web" style={{ background: "#fff" }}>
          <div style={{ ...max, paddingTop: "clamp(60px,9vw,116px)", paddingBottom: "clamp(60px,9vw,116px)" }}>
            <SectionHead kicker="04_ FOLLOW A RELATIONSHIP" title="Predator becomes relationship." intro="Open a prey node to see the relationship without pretending one diet applies everywhere. The next step is a real Species identity only when canonical identity and source review are ready." />
            <div className="jaguar-four" style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", marginTop: 46, borderTop: `1px solid ${T.lineStrong}`, borderLeft: `1px solid ${T.lineStrong}` }}>
              {PREY.map((node) => {
                const open = openNode === node.name;
                return <button key={node.name} type="button" onClick={() => setOpenNode(open ? null : node.name)} aria-expanded={open} style={{ minHeight: 260, padding: 22, textAlign: "left", background: open ? "#071009" : "#fff", color: open ? "#fff" : T.ink, border: 0, borderRight: `1px solid ${open ? "rgba(255,255,255,.18)" : T.lineStrong}`, borderBottom: `1px solid ${open ? "rgba(255,255,255,.18)" : T.lineStrong}`, cursor: "pointer" }}>
                  <div style={{ ...mono, color: open ? T.acid : T.blue }}>{node.kind}</div><div style={{ marginTop: 28, fontFamily: T.display, fontSize: "clamp(24px,3vw,36px)", letterSpacing: "-.03em" }}>{node.name}</div><div style={{ marginTop: 30, fontSize: 13, lineHeight: 1.55, color: open ? "rgba(255,255,255,.72)" : "rgba(8,8,8,.64)" }}>{open ? node.note : "OPEN RELATIONSHIP +"}</div>{open && <div style={{ ...mono, marginTop: 22, color: "rgba(255,255,255,.5)", fontSize: 8.5 }}>FULL 4PLANET SPECIES PROFILE NOT YET IN GOLD SET · NO DEAD LINK CREATED</div>}
                </button>;
              })}
            </div>
            {openNode === "CAPYBARAS" && <div style={{ marginTop: 18 }}><SpeciesNodeCard node={CAPYBARA_NODE} /></div>}
            <p style={{ margin: "20px 0 0", maxWidth: 760, fontSize: 12.5, color: "rgba(8,8,8,.58)", lineHeight: 1.6 }}>These are broad prey examples, not a local diet assessment or fixed food web. Relationship importance varies by place and prey availability.</p>
            <a href="https://panthera.org/cat/jaguar" target="_blank" rel="noreferrer" style={{ ...mono, display: "inline-block", marginTop: 15, color: T.blue }}>OPEN JAGUAR RANGE-WIDE SOURCE ↗</a>
          </div>
        </section>

        <div id="evidence">
          <SpeciesEvidence
            profile={profile}
            title="The evidence stays with the animal."
            intro="You can keep exploring first. When you inspect a material species-level statement, the source, date and boundary remain attached — without turning the main experience into a source wall."
          />
        </div>

        <SpeciesPressurePath
          items={JAGUAR_PRESSURES}
          title="Threats have causes."
          intro="For these current Jaguar pressure categories, the immediate cause path is human. That is evidence-specific, not a universal rule: the shared Species grammar also permits natural, mixed and unknown causes."
        />

        <section id="motion" style={{ background: "#050805", color: "#fff" }}>
          <div style={{ ...max, paddingTop: "clamp(60px,9vw,116px)", paddingBottom: "clamp(60px,9vw,116px)" }}>
            <SectionHead dark kicker="07_ LIFE IN MOTION" title="See the animal move." intro="Motion loads only when you ask for it. Source, creator and licence stay visible. The clip is species context — not evidence of present location, range or population." />
            <div style={{ marginTop: 42, position: "relative", aspectRatio: "16/9", overflow: "hidden", border: "1px solid rgba(255,255,255,.18)", background: "#000" }}>
              {!motion ? <><picture style={{ display: "block", width: "100%", height: "100%" }}><source media="(max-width: 640px)" srcSet={heroMobile} /><img src={hero} alt="Jaguar video poster" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: .62 }} /></picture><button type="button" onClick={() => setMotion(true)} aria-label="Load and play jaguar video" style={{ position: "absolute", inset: 0, margin: "auto", width: 110, height: 110, borderRadius: "50%", border: "1px solid rgba(255,255,255,.65)", color: "#fff", background: "rgba(0,0,0,.45)", cursor: "pointer", fontSize: 32 }}>▶</button><div style={{ position: "absolute", left: 16, bottom: 14, ...mono, color: "rgba(255,255,255,.72)" }}>LOAD MOTION · NO AUTOPLAY · ~32 MB ORIGINAL SOURCE</div></> : <video controls autoPlay playsInline preload="metadata" poster={heroMobile} style={{ width: "100%", height: "100%", objectFit: "contain", background: "#000" }}><source src={VIDEO.src} type="video/webm" />Your browser does not support WebM video.</video>}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginTop: 14, ...mono, color: "rgba(255,255,255,.58)", lineHeight: 1.6 }}><span>VIDEO: {VIDEO.creator} · WIKIMEDIA COMMONS · {VIDEO.licence}</span><a href={VIDEO.source} target="_blank" rel="noreferrer" style={{ color: T.acid }}>SOURCE + LICENCE ↗</a></div>
          </div>
        </section>

        <section id="continue" style={{ background: T.acid, color: "#071009" }}>
          <div style={{ ...max, paddingTop: "clamp(58px,8vw,104px)", paddingBottom: "clamp(58px,8vw,104px)" }}>
            <div style={{ ...mono }}>08_ KEEP FOLLOWING THE LIVING PLANET</div><h2 style={{ margin: "18px 0 0", maxWidth: 1000, fontFamily: T.display, fontWeight: 500, fontSize: "clamp(46px,8vw,112px)", lineHeight: .85, letterSpacing: "-.06em" }}>Start with one life.<br />Keep following the living planet.</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 38 }}><a href="/xr/jaguar/" style={{ background: "#071009", color: "#fff", padding: "13px 17px", textDecoration: "none", fontWeight: 700, fontSize: 13 }}>ENTER JAGUAR XR →</a><Link to="/ecosystems/amazon-rainforest" style={{ border: "1px solid #071009", color: "#071009", padding: "13px 17px", textDecoration: "none", fontWeight: 650, fontSize: 13 }}>ENTER AMAZON RAINFOREST →</Link><Link to={`/atlas?entity=${encodeURIComponent(profile.id)}&journey=amazonia`} style={{ border: "1px solid #071009", color: "#071009", padding: "13px 17px", textDecoration: "none", fontWeight: 650, fontSize: 13 }}>OPEN FULL ATLAS →</Link><Link to="/living-systems" style={{ border: "1px solid #071009", color: "#071009", padding: "13px 17px", textDecoration: "none", fontWeight: 650, fontSize: 13 }}>LIVING SYSTEMS →</Link></div>
            <div style={{ marginTop: 42, paddingTop: 20, borderTop: "1px solid rgba(7,16,9,.35)", ...mono, lineHeight: 1.7 }}>PUBLIC TRUTH BOUNDARY · THIS PROFILE CONNECTS SOURCED IDENTITIES, REPORTED RECORDS AND BOUNDED INTERPRETATION. IT DOES NOT ASSERT LIVE TRACKING, COMPLETE RANGE, POPULATION SIZE, LOCAL PRESENCE, FIELD PARTNERSHIP OR ECOLOGICAL DELIVERY.</div>
          </div>
        </section>

        <section style={{ background: "#fff" }}><div style={{ ...max, paddingTop: 34, paddingBottom: 46 }}><div style={{ ...mono, color: T.faint }}>MEDIA RIGHTS · {media?.licence || "NO PHOTO LICENCE RECORDED"} · CHECKED {media?.checkedDate || "—"}</div><div style={{ marginTop: 10, fontSize: 11.5, lineHeight: 1.55, color: "rgba(8,8,8,.58)" }}>{media?.limitations}</div><a href={media?.sourcePage} target="_blank" rel="noreferrer" style={{ ...mono, display: "inline-block", marginTop: 12, color: T.blue }}>PHOTO SOURCE + LICENCE ↗</a><span style={{ ...mono, marginLeft: 14, color: T.faint }}>STABLE ENTRY · {profileHref}</span></div></section>
      </article>
      <style>{`@media(max-width:840px){.jaguar-two{grid-template-columns:1fr!important}.jaguar-four{grid-template-columns:1fr 1fr!important}}@media(max-width:540px){.jaguar-four{grid-template-columns:1fr!important}}@media(prefers-reduced-motion:reduce){video{scroll-behavior:auto!important}}`}</style>
    </PublicShell>
  );
}
