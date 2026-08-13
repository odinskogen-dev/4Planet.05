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
import { missionHero, missionSecondary, domainHero } from "@/content/imageRegistry";
import { publicStatus, evidenceStatus } from "@/content/status";
import { NotFound } from "@/pages/system";

const dslug = (k: string) => k.replace("_", "").toLowerCase();
const strip = (s: string) => s.replace("_", "");
const mono = (color: string): React.CSSProperties => ({ fontFamily: T.mono, fontSize: 11.5, letterSpacing: ".14em", textTransform: "uppercase", color });
const display: React.CSSProperties = { fontFamily: T.display, fontWeight: 500, letterSpacing: "-.03em" };

const CULTURAL = new Set(["4play", "4film", "4rt", "m4gazine"]);
const SYSTEM = new Set(["food", "en4rgy", "circular-city", "f4shion"]);
const FLAGSHIP = new Set(["wh4les", "clim4te", "am4zonia", "cle4n"]);
// dark-world missions live in tokens (DARK_MISSIONS) so the header can share them
function classify(slug: string): { label: string } {
  if (CULTURAL.has(slug)) return { label: "CULTURAL PROJECT" };
  if (SYSTEM.has(slug)) return { label: "SYSTEM DOSSIER" };
  return { label: "MISSION DOSSIER" };
}

// split the article at the first section label after the opening movement (story-led, not by %)
function splitArticle(blocks: Block[]): [Block[], Block[]] {
  let subs = 0;
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i].k === "sub") { subs++; if (subs === 1 && i >= 2) return [blocks.slice(0, i), blocks.slice(i)]; }
  }
  const c = Math.max(2, Math.round(blocks.length * 0.4));
  return [blocks.slice(0, c), blocks.slice(c)];
}

export function MissionDetail() {
  const { slug } = useParams();
  const location = useLocation();
  const returnHref = returnHrefFromSearch(location.search);
  const m = slug ? content.getMission(slug) : undefined;
  if (!m) return <NotFound />;

  const acc = DOMAIN_ACCENT[m.domain];
  const { label } = classify(m.slug);
  const flagship = FLAGSHIP.has(m.slug);
  const cultural = CULTURAL.has(m.slug);
  const dark = DARK_MISSIONS.has(m.slug);
  const base = "#000";                              // §2 — pure black world
  const secBg = dark ? base : T.paper;              // reading planes: black on dark missions, white on light
  const secText = dark ? "#fff" : T.ink;
  const secDim = dark ? "rgba(255,255,255,.60)" : T.dim;
  const secBody = dark ? "rgba(255,255,255,.86)" : T.ink;
  const secLine = dark ? "rgba(255,255,255,.24)" : T.ink;
  const article = missionArticle(m.slug);
  const [partA, partB] = splitArticle(article);
  const hero = missionHero(m.slug);
  const dhero = domainHero(m.domain);
  const second = missionSecondary(m.slug);
  const status = publicStatus(m.slug);

  return (
    <PublicShell>
      {returnHref && (
        <Link to={returnHref} data-testid="return-to-atlas" style={{ position: "fixed", top: "calc(env(safe-area-inset-top,0px) + 70px)", left: 20, zIndex: 40, display: "inline-flex", alignItems: "center", gap: 8, fontFamily: T.mono, fontSize: 11, letterSpacing: ".12em", color: "#fff", background: acc, padding: "10px 14px", textDecoration: "none" }}>
          ← BACK TO OBSERVATION IN ATLAS
        </Link>
      )}
      {/* ── immersive entry (dark) ── */}
      <CinematicImage meta={hero} fallback={dhero} height="100svh" overlay={0.54} priority accent={acc} align="end">
        <Reveal>
          <div style={{ ...mono("#fff"), marginBottom: 16 }}>
            <Link to={"/domains/" + dslug(m.domain)} style={{ color: acc, textDecoration: "none" }}>{m.code}</Link>
          </div>
          <h1 style={{ ...display, color: acc, fontSize: "clamp(40px,6.6vw,100px)", lineHeight: .9 }}>{strip(m.name)}</h1>
          <p style={{ fontSize: "clamp(17px,1.8vw,23px)", color: "rgba(255,255,255,.94)", marginTop: 18, maxWidth: 580, lineHeight: 1.38 }}>{m.hero}</p>
          <div style={{ ...mono("#fff"), fontSize: 10.5, marginTop: 22, display: "inline-flex", alignItems: "center", gap: 8, border: `1px solid ${acc}`, padding: "7px 12px" }}>
            <span style={{ width: 6, height: 6, background: acc, display: "inline-block" }} />{status}
          </div>
        </Reveal>
      </CinematicImage>

      {/* ── thesis chapter — each mission opens into its own world ── */}
      <section style={{ background: dark ? "#000" : acc, color: dark ? acc : "#fff", padding: "clamp(72px,12vw,180px) clamp(20px,6vw,120px)" }}>
        <Reveal>
          <div style={{ ...mono(dark ? acc : "rgba(255,255,255,.8)"), marginBottom: "clamp(24px,3vw,40px)" }}>{m.code} · THE STAKES</div>
          <p style={{ fontFamily: T.display, fontWeight: 500, fontSize: "clamp(24px,3.4vw,52px)", lineHeight: 1.08, letterSpacing: "-.03em", maxWidth: "18ch" }}>
            {m.thesis}
          </p>
        </Reveal>
      </section>

      {/* ── WS-B Technical Mission Strip: after cinematic opening, before article ── */}
      <MissionStrip
        issue={m.issue}
        whyItMatters={m.whyItMatters}
        approach={m.whatCanHelp}
        contribution={m.fourPlanetRole}
        status={status}
        accent={acc}
        dark={dark}
      />

      {/* ── editorial reading plane (dark or white per mission) ── */}
      <Section bg={secBg} pad="clamp(64px,8.5vw,124px)">
        <Reveal><div style={{ ...mono(dark ? acc : T.dim), marginBottom: "clamp(30px,4vw,48px)" }}>{label}</div></Reveal>
        <Editorial blocks={partA} accent={acc} dark={dark} />
      </Section>

      {/* ── large documentary image ── */}
      <CinematicImage meta={second ?? dhero} fallback={dhero} height="min(72vh, 720px)" accent={acc} />

      {/* ── case material (dark or white per mission) ── */}
      <Section bg={secBg} pad="clamp(64px,8.5vw,124px)">
        {partB.length > 0 && <Editorial blocks={partB} accent={acc} dark={dark} />}

        {/* living system — a quiet enumeration, not a chip wall */}
        <Reveal style={{ marginTop: "clamp(44px,6vw,76px)" }}>
          <div style={{ ...mono(dark ? acc : T.dim), marginBottom: 12 }}>The living system</div>
          <p style={{ fontFamily: T.display, fontWeight: 500, fontSize: "clamp(18px,1.8vw,24px)", letterSpacing: "-.02em", color: secText, maxWidth: 820, lineHeight: 1.4 }}>
            {m.livingSystem.join(" · ")}
          </p>
        </Reveal>

        {/* what can help / what 4planet is building */}
        <Reveal delay={60} style={{ marginTop: "clamp(44px,6vw,76px)" }}>
          <div className="tw-plain" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(28px,4vw,64px)" }}>
            {([["WHAT CAN HELP", m.whatCanHelp], ["WHAT 4PLANET IS BUILDING", m.fourPlanetRole]] as [string, string][]).map(([h, b]) => (
              <div key={h} style={{ borderTop: `1px solid ${dark ? acc : T.ink}`, paddingTop: 16 }}>
                <div style={mono(dark ? acc : T.blue)}>{h}</div>
                <p style={{ fontSize: "clamp(15px,1.3vw,17.5px)", color: secBody, marginTop: 12, lineHeight: 1.62, maxWidth: 520 }}>{b}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </Section>

      {/* ── flagship: a second story/evidence image ── */}
      {flagship && (
        <CinematicImage meta={dhero} height="min(58vh, 560px)" position="50% 45%" accent={acc}
          caption={`${strip(m.domain)} / ${DOMAIN_DESC[m.domain]}`} />
      )}

      {/* v25: the white→dark fade is gone (not premium). Where a white plane precedes the dark
          ending, a real image carries the transition instead of a gradient. */}
      {!flagship && !dark && missionSecondary(m.slug) && (
        <CinematicImage meta={missionSecondary(m.slug)!} height="min(66vh, 660px)" position="50% 50%" accent={acc} />
      )}
      {/* ── action + evidence ending ── */}
      <section style={{ background: dark ? base : T.ink, color: "#fff" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(56px,8vw,110px) clamp(20px,5vw,72px)" }}>
          {m.slug === "4rt" && (
            <Reveal style={{ marginBottom: "clamp(56px,8vw,96px)" }}>
              <div style={{ ...mono(acc), marginBottom: 16 }}>PRINTS FOR PLANET · PROTOTYPE CATALOGUE</div>
              <h2 style={{ ...display, color: "#fff", fontSize: "clamp(24px,3.2vw,42px)", lineHeight: 1.05, maxWidth: 760 }}>
                Limited-edition prints with an honest split.
              </h2>
              <p style={{ fontSize: "clamp(14px,1.3vw,16px)", color: "rgba(255,255,255,.7)", marginTop: 14, maxWidth: 640, lineHeight: 1.6 }}>
                A prototype model. Nothing is for sale yet — no active store, no completed sale, no transferred Impact
                funds. Each work states its edition, rights, availability, an EXAMPLE proposed share split (founder approval required) and the mission pathway it would support.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: 1, marginTop: 32, background: "rgba(255,255,255,.16)", border: "1px solid rgba(255,255,255,.16)" }}>
                {PRINTS.map((pr) => (
                  <div key={pr.id} style={{ background: dark ? base : T.ink, padding: "clamp(22px,2.5vw,32px)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
                      <h3 style={{ ...display, color: "#fff", fontSize: "clamp(19px,2vw,26px)", letterSpacing: "-.02em" }}>{pr.title}</h3>
                      <span style={{ ...mono(acc), fontSize: 10 }}>{pr.availability}</span>
                    </div>
                    <div style={{ ...mono(acc), fontSize: 10.5, marginTop: 8 }}>ARTIST · <span style={{ color: "rgba(255,255,255,.86)" }}>{pr.artist}</span></div>
                    <p style={{ fontSize: 13.5, color: "rgba(255,255,255,.7)", marginTop: 10, lineHeight: 1.5 }}>{pr.artistNote}</p>
                    <dl style={{ margin: "16px 0 0", display: "grid", gap: 7, fontSize: 12.5 }}>
                      {[["Medium", pr.medium], ["Edition", pr.edition], ["Rights", pr.rights]].map(([k, v]) => (
                        <div key={k} style={{ display: "grid", gridTemplateColumns: "84px 1fr", gap: 8 }}>
                          <dt style={{ ...mono("rgba(255,255,255,.5)"), fontSize: 10 }}>{(k as string).toUpperCase()}</dt>
                          <dd style={{ margin: 0, color: "rgba(255,255,255,.82)", lineHeight: 1.45 }}>{v}</dd>
                        </div>
                      ))}
                    </dl>
                    <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,.14)" }}>
                      <div style={{ ...mono("rgba(255,255,255,.5)"), fontSize: 10, marginBottom: 8 }}>EXAMPLE SPLIT · PROPOSED · FOUNDER APPROVAL REQUIRED</div>
                      <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden" }}>
                        <span style={{ width: `${pr.share.artist}%`, background: acc }} title={`Artist ${pr.share.artist}% (example)`} />
                        <span style={{ width: `${pr.share.production}%`, background: "rgba(255,255,255,.5)" }} title={`Production ${pr.share.production}% (example)`} />
                        <span style={{ width: `${pr.share.fourPlanet}%`, background: "rgba(255,255,255,.28)" }} title={`4PLANET ${pr.share.fourPlanet}% (example)`} />
                      </div>
                      <div style={{ ...mono("rgba(255,255,255,.6)"), fontSize: 10, marginTop: 8 }}>
                        ARTIST {pr.share.artist}% · PRODUCTION {pr.share.production}% · 4PLANET {pr.share.fourPlanet}% · EXAMPLE ONLY
                      </div>
                    </div>
                    <div style={{ marginTop: 14, ...mono(acc), fontSize: 10.5 }}>PATHWAY · <span style={{ color: "rgba(255,255,255,.86)" }}>{pr.pathway}</span></div>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,.55)", marginTop: 6, lineHeight: 1.5 }}>{pr.pathwayState}</p>
                  </div>
                ))}
              </div>
              <p style={{ ...mono("rgba(255,255,255,.5)"), fontSize: 10.5, marginTop: 20, letterSpacing: ".06em" }}>
                NO ACTIVE STORE · NO COMPLETED SALES · NO TRANSFERRED IMPACT FUNDS · NO PRINT-LICENCE AGREEMENT · EXAMPLE/PROPOSED SPLITS PENDING FOUNDER APPROVAL · PROTOTYPE MODEL ONLY
              </p>
            </Reveal>
          )}
          <Reveal>
            <div style={{ ...mono(acc), marginBottom: 20 }}>HOW TO TAKE PART</div>
            <h2 style={{ ...display, color: "#fff", fontSize: "clamp(26px,3.6vw,48px)", lineHeight: 1.04, maxWidth: 760 }}>
              Follow {strip(m.name)} as its evidence, partners and pathways come together.
            </h2>
            <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
              <Button to={withReturnTo("/join", location.search)} primary accent={acc} arrow testId="mission-to-join">{m.joinLabel || "FOLLOW THIS MISSION"}</Button>
              {m.impactPathwaySlug
                ? <Button to={"/impact/" + m.impactPathwaySlug} onDark accent="#fff">FOLLOW THE PATHWAY</Button>
                : <Button to="/partners" onDark accent="#fff">EXPLORE PARTNERSHIP</Button>}
            </div>
          </Reveal>

          <Reveal delay={60} style={{ marginTop: "clamp(48px,7vw,88px)" }}>
            <div style={{ ...mono(acc), marginBottom: 18 }}>{cultural ? "WHAT OPENS NEXT" : "EVIDENCE AND NEXT STEPS"}</div>
            {cultural ? (
              <div style={{ borderTop: `1px solid rgba(255,255,255,.18)`, paddingTop: 16, maxWidth: 620 }}>
                <p style={{ fontSize: "clamp(15px,1.4vw,18px)", color: "rgba(255,255,255,.86)", lineHeight: 1.62 }}>{m.fourPlanetRole}</p>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,.6)", marginTop: 12, lineHeight: 1.6 }}>A cultural project develops through formats, collaborators and first prototypes — connected back to the ecological Missions it supports.</p>
              </div>
            ) : m.sources.length > 0 ? (
              <div style={{ display: "grid", gap: 14, maxWidth: 820 }}>
                {m.sources.map((s) => (
                  <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="link"
                    style={{ display: "block", borderTop: `1px solid rgba(255,255,255,.18)`, paddingTop: 12, color: "#fff", textDecoration: "none" }}>
                    <span style={{ fontSize: 15.5 }}>{s.title}</span>
                    <span className="mono" style={{ display: "block", fontSize: 11, letterSpacing: ".08em", color: acc, marginTop: 6 }}>{(() => { try { return new URL(s.url).hostname.replace(/^www\./, ""); } catch { return "source"; } })()} ↗</span>
                  </a>
                ))}
              </div>
            ) : (
              <div style={{ borderTop: `1px solid rgba(255,255,255,.18)`, paddingTop: 16, maxWidth: 560 }}>
                <div style={{ ...display, fontSize: "clamp(17px,1.6vw,21px)", color: "#fff" }}>Research foundation in development.</div>
                <p style={{ fontSize: 14.5, color: "rgba(255,255,255,.72)", marginTop: 12, lineHeight: 1.6 }}>
                  Currently validating the source foundation, partner suitability and public proof model before anything is cited or opened.
                </p>
              </div>
            )}
          </Reveal>

          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", borderTop: `1px solid rgba(255,255,255,.18)`, marginTop: "clamp(40px,6vw,72px)", paddingTop: 22 }}>
            <Link to={"/domains/" + dslug(m.domain)} className="link" style={{ fontSize: 14, color: acc }}>← {strip(m.domain)}</Link>
            <Link to="/missions" className="mono link" style={{ fontSize: 12, color: "rgba(255,255,255,.7)", letterSpacing: ".06em" }}>ALL MISSIONS →</Link>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
