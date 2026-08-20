import { useParams, Link, useLocation } from "react-router-dom";
import { T, DOMAIN_ACCENT, DOMAIN_DESC, DARK_MISSIONS } from "@/styles/tokens";
import { PublicShell } from "@/components/layout/PublicShell";
import { Section, Button } from "@/components/ui";
import { CinematicImage, Reveal } from "@/components/Cinematic";
import { MissionStrip } from "@/components/MissionStrip";
import { PRINTS } from "@/data/prints";
import { returnHrefFromSearch, withReturnTo } from "@/product/productContext";
import { Editorial } from "@/components/Editorial";
import { content } from "@/content/contentRepository";
import { missionArticle, type Block } from "@/content/narratives";
import { missionHero, missionSecondary, missionProcess, missionMagazine, domainHero } from "@/content/imageRegistry";
import { publicStatus, evidenceStatus } from "@/content/status";
import { NotFound } from "@/pages/system";

const dslug = (k: string) => k.replace("_", "").toLowerCase();
const strip = (s: string) => s.replace("_", "");
const mono = (color: string): React.CSSProperties => ({ fontFamily: T.mono, fontSize: 11.5, letterSpacing: ".14em", textTransform: "uppercase", color });
const display: React.CSSProperties = { fontFamily: T.display, fontWeight: 500, letterSpacing: "-.03em" };

const CULTURAL = new Set(["4play", "4film", "4rt", "m4gazine"]);
const SYSTEM = new Set(["food", "en4rgy", "circular-city", "f4shion"]);
const FLAGSHIP = new Set(["wh4les", "clim4te", "am4zonia", "cle4n"]);

function classify(slug: string): { label: string } {
  if (CULTURAL.has(slug)) return { label: "CULTURAL PROJECT" };
  if (SYSTEM.has(slug)) return { label: "SYSTEM DOSSIER" };
  return { label: "MISSION DOSSIER" };
}

function splitArticle(blocks: Block[]): [Block[], Block[]] {
  let subs = 0;
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i].k === "sub") { subs++; if (subs === 1 && i >= 2) return [blocks.slice(0, i), blocks.slice(i)]; }
  }
  const c = Math.max(2, Math.round(blocks.length * .4));
  return [blocks.slice(0, c), blocks.slice(c)];
}

export function MissionDetail() {
  const { slug } = useParams();
  const location = useLocation();
  const returnHref = returnHrefFromSearch(location.search);
  const m = slug ? content.getMission(slug) : undefined;
  if (!m) return <NotFound />;

  const acc = DOMAIN_ACCENT[m.domain];
  const missionAccent = (d: typeof m.domain) => DOMAIN_ACCENT[d];
  const allM = content.getMissions();
  const curIdx = allM.findIndex((x) => x.slug === m.slug);
  const prevM = curIdx > 0 ? allM[curIdx - 1] : allM[allM.length - 1];
  const nextM = curIdx < allM.length - 1 ? allM[curIdx + 1] : allM[0];
  const { label } = classify(m.slug);
  const flagship = FLAGSHIP.has(m.slug);
  const cultural = CULTURAL.has(m.slug);
  const dark = DARK_MISSIONS.has(m.slug);
  const base = "#000";
  const secBg = dark ? base : T.paper;
  const secText = dark ? "#fff" : T.ink;
  const secDim = dark ? "rgba(255,255,255,.60)" : T.dim;
  const secBody = dark ? "rgba(255,255,255,.86)" : T.ink;
  const article = missionArticle(m.slug);
  const [partA, partB] = splitArticle(article);
  const hero = missionHero(m.slug);
  const dhero = domainHero(m.domain);
  const second = missionSecondary(m.slug);
  const status = publicStatus(m.slug);
  const evidence = evidenceStatus(m.slug);
  const magazine = missionMagazine(m.slug);
  const magazineTo = magazine?.to.replace(/^\/stories/, "/magazine");

  const SIGNATURE: Record<string, string> = {
    wh4les: "drift", cor4l: "depth", cle4n: "flow", "rewild-marine": "depth",
    clim4te: "rise", am4zonia: "rise", species: "gallery", "rewild-land": "rise",
    food: "sweep", en4rgy: "pulse", "circular-city": "pulse", f4shion: "sweep",
    m4gazine: "scan", "4film": "scan", "4rt": "gallery", "4play": "pulse",
  };
  const signature = SIGNATURE[m.slug] ?? "depth";

  return (
    <PublicShell>
      {returnHref && (
        <Link to={returnHref} data-testid="return-to-atlas" style={{ position: "fixed", top: "calc(env(safe-area-inset-top,0px) + 70px)", left: 20, zIndex: 40, display: "inline-flex", alignItems: "center", gap: 8, fontFamily: T.mono, fontSize: 11, letterSpacing: ".12em", color: "#fff", background: acc, padding: "10px 14px", textDecoration: "none" }}>
          ← BACK TO OBSERVATION IN ATLAS
        </Link>
      )}

      <CinematicImage meta={hero} fallback={dhero} height="100svh" overlay={.54} priority kenburns signature={signature} accent={acc} align="end">
        <Reveal>
          <div style={{ ...mono("#fff"), marginBottom: 16 }}><Link to={"/domains/" + dslug(m.domain)} style={{ color: acc, textDecoration: "none" }}>{m.code}</Link></div>
          <h1 style={{ ...display, color: acc, fontSize: "clamp(40px,6.6vw,100px)", lineHeight: .9 }}>{strip(m.name)}</h1>
          {m.question && <p style={{ fontFamily: T.display, fontWeight: 500, color: "#fff", fontSize: "clamp(19px,2.4vw,32px)", lineHeight: 1.2, letterSpacing: "-.02em", marginTop: 18, maxWidth: "20ch" }}>{m.question}</p>}
          <p style={{ fontSize: "clamp(17px,1.8vw,23px)", color: "rgba(255,255,255,.94)", marginTop: m.question ? 12 : 18, maxWidth: 580, lineHeight: 1.38 }}>{m.hero}</p>
          <div style={{ ...mono("#fff"), fontSize: 10.5, marginTop: 22, display: "inline-flex", alignItems: "center", gap: 8, border: `1px solid ${acc}`, padding: "7px 12px" }}><span style={{ width: 6, height: 6, background: acc, display: "inline-block" }} />{status}</div>
        </Reveal>
      </CinematicImage>

      <section style={{ background: dark ? "#000" : acc, color: dark ? acc : "#fff", padding: "clamp(76px,12vw,190px) clamp(20px,6vw,120px)" }}>
        <Reveal>
          <div style={{ ...mono(dark ? acc : "rgba(255,255,255,.76)"), marginBottom: "clamp(24px,3vw,40px)" }}>{m.code} · THE STAKES</div>
          <p style={{ fontFamily: T.display, fontWeight: 500, fontSize: "clamp(30px,4.6vw,68px)", lineHeight: .98, letterSpacing: "-.04em", maxWidth: "15ch" }}>{m.thesis}</p>
        </Reveal>
      </section>

      <MissionStrip issue={m.issue} whyItMatters={m.whyItMatters} approach={m.whatCanHelp} contribution={m.fourPlanetRole} status={status} accent={acc} dark={dark} />

      <Section bg={secBg} pad="clamp(64px,8.5vw,124px)">
        <Reveal><div style={{ ...mono(dark ? acc : T.dim), marginBottom: "clamp(30px,4vw,48px)" }}>{label} · 01</div></Reveal>
        <Editorial blocks={partA} accent={acc} dark={dark} />
      </Section>

      <section style={{ background: acc, color: "#fff" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(72px,11vw,170px) clamp(20px,6vw,120px)" }}>
          <Reveal>
            <div style={{ ...mono("rgba(255,255,255,.7)"), marginBottom: 18 }}>THE RELATIONSHIP</div>
            <p style={{ ...display, fontSize: "clamp(34px,5.6vw,82px)", lineHeight: .94, maxWidth: "15ch" }}>{m.whyItMatters}</p>
          </Reveal>
        </div>
      </section>

      <CinematicImage meta={second ?? dhero} fallback={dhero} height="min(76vh, 780px)" accent={acc} />

      <Section bg={secBg} pad="clamp(64px,8.5vw,124px)">
        <Reveal><div style={{ ...mono(dark ? acc : T.dim), marginBottom: "clamp(30px,4vw,48px)" }}>{label} · 02</div></Reveal>
        {partB.length > 0 && <Editorial blocks={partB} accent={acc} dark={dark} />}

        <Reveal style={{ marginTop: "clamp(50px,7vw,86px)" }}>
          <div style={{ ...mono(dark ? acc : T.dim), marginBottom: 12 }}>THE LIVING SYSTEM</div>
          <p style={{ fontFamily: T.display, fontWeight: 500, fontSize: "clamp(20px,2.2vw,30px)", letterSpacing: "-.025em", color: secText, maxWidth: 900, lineHeight: 1.35 }}>{m.livingSystem.join(" · ")}</p>
        </Reveal>

        <Reveal delay={60} style={{ marginTop: "clamp(48px,7vw,84px)" }}>
          <div className="tw-plain" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(28px,4vw,64px)" }}>
            {([["WHAT CAN HELP", m.whatCanHelp], ["WHAT 4PLANET IS BUILDING", m.fourPlanetRole]] as [string, string][]).map(([h, b]) => (
              <div key={h} style={{ borderTop: `1px solid ${dark ? acc : T.ink}`, paddingTop: 16 }}>
                <div style={mono(dark ? acc : T.blue)}>{h}</div>
                <p style={{ fontSize: "clamp(15px,1.3vw,17.5px)", color: secBody, marginTop: 12, lineHeight: 1.62, maxWidth: 520 }}>{b}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal style={{ marginTop: "clamp(48px,7vw,84px)", borderTop: `1px solid ${dark ? "rgba(255,255,255,.18)" : T.lineStrong}`, paddingTop: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div style={mono(dark ? acc : T.blue)}>PROVENANCE</div>
            <div style={mono(secDim)}>PUBLIC EVIDENCE STATE · {evidence}</div>
          </div>
          <p style={{ color: secDim, marginTop: 14, fontSize: 13.5, lineHeight: 1.62, maxWidth: 760 }}>Narrative explains the Mission. Source records below bound the public evidence. A source does not turn a prototype pathway into delivered impact, and absence of local evidence remains absence of local evidence.</p>
        </Reveal>
      </Section>

      {flagship && <CinematicImage meta={dhero} height="min(62vh, 640px)" position="50% 45%" accent={acc} caption={`${strip(m.domain)} / ${DOMAIN_DESC[m.domain]}`} />}
      {!flagship && !dark && missionSecondary(m.slug) && <CinematicImage meta={missionSecondary(m.slug)!} height="min(66vh, 660px)" position="50% 50%" accent={acc} />}
      {missionProcess(m.slug) && <CinematicImage meta={missionProcess(m.slug)!} height="min(72vh, 740px)" position="50% 45%" accent={acc} caption={missionProcess(m.slug)!.alt} />}

      <section style={{ background: dark ? base : T.ink, color: "#fff" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(56px,8vw,110px) clamp(20px,5vw,72px)" }}>
          {m.slug === "4rt" && (
            <Reveal style={{ marginBottom: "clamp(56px,8vw,96px)" }}>
              <div style={{ ...mono(acc), marginBottom: 16 }}>PRINTS FOR PLANET · PROTOTYPE CATALOGUE</div>
              <h2 style={{ ...display, color: "#fff", fontSize: "clamp(24px,3.2vw,42px)", lineHeight: 1.05, maxWidth: 760 }}>Limited-edition prints with an honest split.</h2>
              <p style={{ fontSize: "clamp(14px,1.3vw,16px)", color: "rgba(255,255,255,.7)", marginTop: 14, maxWidth: 640, lineHeight: 1.6 }}>A prototype model. Nothing is for sale yet — no active store, no completed sale, no transferred Impact funds. Each work states its edition, rights, availability, an EXAMPLE proposed share split and the mission pathway it would support.</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))", gap: 1, marginTop: 32, background: "rgba(255,255,255,.16)", border: "1px solid rgba(255,255,255,.16)" }}>
                {PRINTS.map((pr) => (
                  <div key={pr.id} style={{ background: dark ? base : T.ink, padding: "clamp(22px,2.5vw,32px)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}><h3 style={{ ...display, color: "#fff", fontSize: "clamp(19px,2vw,26px)", letterSpacing: "-.02em" }}>{pr.title}</h3><span style={{ ...mono(acc), fontSize: 10 }}>{pr.availability}</span></div>
                    <div style={{ ...mono(acc), fontSize: 10.5, marginTop: 8 }}>ARTIST · <span style={{ color: "rgba(255,255,255,.86)" }}>{pr.artist}</span></div>
                    <p style={{ fontSize: 13.5, color: "rgba(255,255,255,.7)", marginTop: 10, lineHeight: 1.5 }}>{pr.artistNote}</p>
                    <dl style={{ margin: "16px 0 0", display: "grid", gap: 7, fontSize: 12.5 }}>
                      {[["Medium", pr.medium], ["Edition", pr.edition], ["Rights", pr.rights]].map(([k, v]) => <div key={k} style={{ display: "grid", gridTemplateColumns: "84px 1fr", gap: 8 }}><dt style={{ ...mono("rgba(255,255,255,.5)"), fontSize: 10 }}>{(k as string).toUpperCase()}</dt><dd style={{ margin: 0, color: "rgba(255,255,255,.82)", lineHeight: 1.45 }}>{v}</dd></div>)}
                    </dl>
                    <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,.14)" }}>
                      <div style={{ ...mono("rgba(255,255,255,.5)"), fontSize: 10, marginBottom: 8 }}>EXAMPLE SPLIT · PROPOSED · FOUNDER APPROVAL REQUIRED</div>
                      <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden" }}><span style={{ width: `${pr.share.artist}%`, background: acc }} /><span style={{ width: `${pr.share.production}%`, background: "rgba(255,255,255,.5)" }} /><span style={{ width: `${pr.share.fourPlanet}%`, background: "rgba(255,255,255,.28)" }} /></div>
                      <div style={{ ...mono("rgba(255,255,255,.6)"), fontSize: 10, marginTop: 8 }}>ARTIST {pr.share.artist}% · PRODUCTION {pr.share.production}% · 4PLANET {pr.share.fourPlanet}% · EXAMPLE ONLY</div>
                    </div>
                    <div style={{ marginTop: 14, ...mono(acc), fontSize: 10.5 }}>PATHWAY · <span style={{ color: "rgba(255,255,255,.86)" }}>{pr.pathway}</span></div>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,.55)", marginTop: 6, lineHeight: 1.5 }}>{pr.pathwayState}</p>
                  </div>
                ))}
              </div>
              <p style={{ ...mono("rgba(255,255,255,.5)"), fontSize: 10.5, marginTop: 20, letterSpacing: ".06em" }}>NO ACTIVE STORE · NO COMPLETED SALES · NO TRANSFERRED IMPACT FUNDS · NO PRINT-LICENCE AGREEMENT · EXAMPLE/PROPOSED SPLITS PENDING FOUNDER APPROVAL · PROTOTYPE MODEL ONLY</p>
            </Reveal>
          )}

          <Reveal>
            <div style={{ ...mono(acc), marginBottom: 20 }}>HOW TO TAKE PART</div>
            <h2 style={{ ...display, color: "#fff", fontSize: "clamp(28px,4vw,56px)", lineHeight: .98, maxWidth: 760 }}>Follow {strip(m.name)} as its evidence, partners and pathways come together.</h2>
            <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
              {m.slug === "m4gazine" ? <Button to="/magazine" primary accent={acc} arrow>ENTER M4GAZINE</Button> : <Button to={withReturnTo("/join", location.search)} primary accent={acc} arrow testId="mission-to-join">{m.joinLabel || "FOLLOW THIS MISSION"}</Button>}
              {m.impactPathwaySlug ? <Button to={"/impact/" + m.impactPathwaySlug} onDark accent="#fff">FOLLOW THE PATHWAY</Button> : <Button to="/impact" onDark accent="#fff">SEE THE IMPACT MODEL</Button>}
            </div>
          </Reveal>

          <Reveal delay={60} style={{ marginTop: "clamp(52px,7vw,92px)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "baseline", flexWrap: "wrap", marginBottom: 18 }}>
              <div style={{ ...mono(acc) }}>{cultural ? "WHAT OPENS NEXT" : "SOURCES / PUBLIC EVIDENCE"}</div>
              {!cultural && <div style={{ ...mono("rgba(255,255,255,.42)"), fontSize: 10 }}>{m.sources.length} SOURCE{m.sources.length === 1 ? "" : "S"} · {evidence}</div>}
            </div>
            {cultural ? (
              <div style={{ borderTop: "1px solid rgba(255,255,255,.18)", paddingTop: 16, maxWidth: 680 }}><p style={{ fontSize: "clamp(15px,1.4vw,18px)", color: "rgba(255,255,255,.86)", lineHeight: 1.62 }}>{m.fourPlanetRole}</p><p style={{ fontSize: 14, color: "rgba(255,255,255,.6)", marginTop: 12, lineHeight: 1.6 }}>A cultural project develops through formats, collaborators and first prototypes — connected back to the ecological Missions it supports.</p></div>
            ) : m.sources.length > 0 ? (
              <div style={{ display: "grid", maxWidth: 920, borderTop: "1px solid rgba(255,255,255,.18)" }}>
                {m.sources.map((s, i) => (
                  <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" style={{ display: "grid", gridTemplateColumns: "42px 1fr auto", gap: 16, alignItems: "center", borderBottom: "1px solid rgba(255,255,255,.15)", padding: "16px 0", color: "#fff", textDecoration: "none" }}>
                    <span style={{ ...mono(acc), fontSize: 10 }}>{String(i + 1).padStart(2, "0")}</span><span style={{ fontSize: 15.5, lineHeight: 1.4 }}>{s.title}</span><span style={{ ...mono(acc), fontSize: 10.5 }}>{(() => { try { return new URL(s.url).hostname.replace(/^www\./, ""); } catch { return "SOURCE"; } })()} ↗</span>
                  </a>
                ))}
              </div>
            ) : (
              <div style={{ borderTop: "1px solid rgba(255,255,255,.18)", paddingTop: 16, maxWidth: 620 }}><div style={{ ...display, fontSize: "clamp(19px,2vw,25px)", color: "#fff" }}>Research foundation in development.</div><p style={{ fontSize: 14.5, color: "rgba(255,255,255,.66)", marginTop: 12, lineHeight: 1.6 }}>The public interface does not substitute unsourced certainty for missing evidence.</p></div>
            )}
          </Reveal>

          {magazine && magazineTo && (
            <Reveal delay={80} style={{ marginTop: "clamp(52px,7vw,92px)" }}>
              <div style={{ ...mono(acc), marginBottom: 18 }}>FROM M4GAZINE</div>
              <Link to={magazineTo} className="mag-card" style={{ display: "block", border: "1px solid rgba(255,255,255,.18)", padding: "clamp(22px,3vw,34px)", textDecoration: "none", color: "#fff", maxWidth: 820 }}>
                <div style={{ ...mono(acc), fontSize: 10.5, marginBottom: 12 }}>{magazine.kicker}</div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 20, alignItems: "baseline" }}><h3 style={{ ...display, color: "#fff", fontSize: "clamp(20px,2.4vw,30px)", lineHeight: 1.1, letterSpacing: "-.02em" }}>{magazine.title}</h3><span className="mag-arr" style={{ ...mono(acc), fontSize: 12, flex: "none" }}>{magazine.readTime} →</span></div>
              </Link>
            </Reveal>
          )}

          <div className="mission-nav" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, marginTop: "clamp(52px,7vw,92px)", background: "rgba(255,255,255,.18)", border: "1px solid rgba(255,255,255,.18)" }}>
            {[prevM, nextM].map((nm, i) => nm ? (
              <Link key={nm.slug} to={"/missions/" + nm.slug} className="mnav" style={{ background: dark ? base : T.ink, padding: "clamp(20px,3vw,30px)", textDecoration: "none", color: "#fff", textAlign: i === 0 ? "left" : "right" }}><div style={{ ...mono(missionAccent(nm.domain)), fontSize: 10.5, marginBottom: 8 }}>{i === 0 ? "← PREVIOUS MISSION" : "NEXT MISSION →"}</div><div style={{ ...display, color: "#fff", fontSize: "clamp(20px,2.4vw,32px)", letterSpacing: "-.02em" }}>{strip(nm.name)}</div><div style={{ fontSize: 13, color: "rgba(255,255,255,.6)", marginTop: 6 }}>{strip(nm.domain)}</div></Link>
            ) : <div key={i} />)}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", borderTop: "1px solid rgba(255,255,255,.18)", marginTop: "clamp(40px,6vw,72px)", paddingTop: 22 }}><Link to={"/domains/" + dslug(m.domain)} className="link" style={{ fontSize: 14, color: acc }}>← {strip(m.domain)}</Link><Link to="/missions" className="mono link" style={{ fontSize: 12, color: "rgba(255,255,255,.7)", letterSpacing: ".06em" }}>ALL MISSIONS →</Link></div>
        </div>
      </section>

      <style>{`@media(max-width:760px){.tw-plain{grid-template-columns:1fr!important}.mission-nav{grid-template-columns:1fr!important}}`}</style>
    </PublicShell>
  );
}
