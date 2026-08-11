import { Link, useLocation, useParams } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { T } from "@/styles/tokens";
import { contextHref } from "@/product/ProductNav";
import { IMPACT_UNITS, findImpactUnit, DELIVERY_LABEL, type ImpactUnit } from "@/data/impactUnits";
import { NotFound } from "@/pages/system";

const mono: React.CSSProperties = { fontFamily: T.mono };

/* ── IMPACT home: full-frame hero → four-unit menu on black → four unit worlds ── */
export function ImpactPublicHome() {
  const location = useLocation();
  const href = (slug: string) => contextHref(`/impact/${slug}`, location.search);
  return (
    <PublicShell>
      <div className="impact">
        {/* 1 — full-frame opening hero */}
        <section className="impact-hero">
          <img className="impact-hero__img" src="/assets/brand/story-hero.jpg" alt="A single figure crossing a vast landscape" />
          <div className="impact-hero__scrim" />
          <div className="impact-hero__inner">
            <div className="impact-eyebrow">4PLANET IMPACT_ · FOR A LIVING PLANET</div>
            <h1 className="impact-hero__title">Action for the planet, made credible.</h1>
            <p className="impact-hero__lede">
              Four ways to act for living systems — each one grounded in real ecology and delivered by a chosen field
              partner. We are the mission owner and initiator; the science is sourced, and nothing is counted as done
              until the evidence supports it.
            </p>
          </div>
          <div className="impact-scroll-cue">SCROLL ↓</div>
        </section>

        {/* 2 — four-unit menu, pure black */}
        <section className="impact-menu">
          <div className="impact-eyebrow" style={{ marginBottom: 22 }}>THE FOUR ACTIONS</div>
          <div className="impact-menu__grid">
            {IMPACT_UNITS.map((u) => (
              <Link key={u.slug} to={href(u.slug)} className={`impact-menu__cell${u.imagePending ? " pending" : ""}`}>
                {!u.imagePending && <img src={u.image} alt={u.imageAlt} loading="lazy" />}
                <div className="impact-menu__meta">
                  <div className="impact-menu__no">{u.index} · {u.missionName}</div>
                  <div>
                    <div className="impact-menu__ttl">{u.action}</div>
                    <div className="impact-menu__sub">{u.unitLabel} · {DELIVERY_LABEL[u.delivery.status]}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 3 — the four full-frame unit worlds */}
        {IMPACT_UNITS.map((u) => <ImpactUnitWorld key={u.slug} unit={u} href={href(u.slug)} />)}

        {/* honest footer */}
        <section style={{ background: "#000", padding: "clamp(40px,6vw,80px) clamp(20px,5vw,96px) 120px" }}>
          <p style={{ ...mono, fontSize: 12, lineHeight: 1.7, color: "rgba(255,255,255,.72)", maxWidth: "74ch", borderLeft: `2px solid ${T.acid}`, paddingLeft: 16 }}>
            The ecological facts on every page are sourced to FAO, IPCC, UNEP and IUCN. The delivery model — field
            partner, price and proof — is shown at its true status and is not yet open. When a pathway becomes real, it
            will say so, with sources. 4PLANET is the mission owner and initiator; a field partner is who we choose to
            carry the work out.
          </p>
        </section>
      </div>
    </PublicShell>
  );
}

function ImpactUnitWorld({ unit: u, href }: { unit: ImpactUnit; href: string }) {
  const corners = (
    <>
      <div className="impact-corner tl"><b>{u.index} · {u.missionName}</b>{u.standfirst}</div>
      <div className="impact-corner tr"><b>FIELD PARTNER</b>{u.delivery.fieldPartner}<br />{u.delivery.where}</div>
      <div className="impact-corner bl"><b>WHAT YOU GET (PLANNED)</b>{u.delivery.proof}</div>
      <div className="impact-corner br"><b>STATUS</b>{DELIVERY_LABEL[u.delivery.status]}<br />NOT OPEN</div>
    </>
  );
  return (
    <section className={`impact-unit${u.imagePending ? " pending" : ""}`}>
      {!u.imagePending && <img className="impact-unit__img" src={u.image} alt={u.imageAlt} loading="lazy" />}
      <div className="impact-unit__scrim" />
      <div className="impact-unit__no">{u.index} / 04</div>
      {/* desktop corners overlay the image */}
      <div className="hide-mobile">{corners}</div>
      <div className="impact-unit__center">
        <div className="impact-eyebrow">{u.missionName} · {u.unitLabel}</div>
        <div className="impact-unit__action">{u.action}</div>
        <p className="impact-unit__stand">{u.standfirst}</p>
        {u.imagePending && (
          <p style={{ ...mono, marginTop: 16, fontSize: 10, letterSpacing: ".08em", color: "rgba(255,255,255,.6)" }}>
            PHOTOGRAPH PENDING — no cleared reef image yet; none is shown rather than mislabel another photo.
          </p>
        )}
        <Link to={href} className="impact-unit__cta" style={{ background: u.accent }}>READ WHY · {u.action} →</Link>
      </div>
      {/* mobile: corners stack below the frame */}
      <div className="impact-unit__corners-mobile show-mobile">{corners}</div>
    </section>
  );
}

/* ── The premium "Why …" article ── */
export function ImpactStory() {
  const { slug } = useParams();
  const location = useLocation();
  const u = slug ? findImpactUnit(slug) : undefined;
  if (!u) return <NotFound />;
  const backHref = contextHref("/impact", location.search);
  const statusAcid = u.delivery.status === "PARTNER_VALIDATION_PENDING";
  return (
    <PublicShell>
      <article className="impact-article">
        <div className="impact-article__hero">
          {!u.imagePending && <img src={u.image} alt={u.imageAlt} />}
          <div className="impact-hero__scrim" />
          <div className="impact-hero__inner" style={{ maxWidth: 1000 }}>
            <Link to={backHref} style={{ ...mono, fontSize: 11, letterSpacing: ".12em", color: T.acid, textDecoration: "none" }}>← IMPACT</Link>
            <div className="impact-eyebrow" style={{ marginTop: 18 }}>{u.index} · {u.missionName} · {u.unitLabel}</div>
            <h1 className="impact-hero__title">Why {u.action.toLowerCase()}</h1>
            <p className="impact-hero__lede">{u.standfirst}</p>
          </div>
        </div>

        <div className="impact-article__body">
          <h2 className="impact-h first">Why {u.action.toLowerCase()}</h2>
          <p className="impact-p">{u.whyPlant}</p>

          <h2 className="impact-h">Why we chose this mission</h2>
          <p className="impact-p">{u.whyWeChose}</p>
          <p className="impact-p" style={{ color: "rgba(255,255,255,.66)", fontSize: 14.5 }}>
            4PLANET is the mission owner and initiator. Delivery is carried out by a chosen field partner — see the
            status below.
          </p>

          <h2 className="impact-h">Why it helps Earth</h2>
          <p className="impact-p">{u.whyEarth}</p>

          <h2 className="impact-h">Why it matters to ecosystems</h2>
          <p className="impact-p">{u.whyEcosystems}</p>

          <h2 className="impact-h">Why it matters to humanity</h2>
          <p className="impact-p">{u.whyHumanity}</p>

          {/* Source-backed fact boxes (KNOWN) */}
          <h2 className="impact-h">The evidence</h2>
          {u.whyFacts.map((f) => (
            <div className="impact-factbox" key={f.head}>
              <div className="impact-factbox__k">KNOWN · SOURCE-BACKED</div>
              <div className="impact-factbox__h">{f.head}</div>
              <div className="impact-factbox__b">{f.body}</div>
              <a className="impact-factbox__s" href={f.sourceUrl} target="_blank" rel="noreferrer">{f.source} · CHECKED {f.checkedAt} ↗</a>
            </div>
          ))}

          {/* Supporting photographs (real, verified) */}
          {u.detailImages && u.detailImages.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 2, marginTop: 30 }}>
              {u.detailImages.map((d) => (
                <figure key={d.src} style={{ margin: 0, aspectRatio: "4/3", overflow: "hidden", background: "#05070f" }}>
                  <img src={d.src} alt={d.alt} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </figure>
              ))}
            </div>
          )}

          {/* Field partner + honest delivery status */}
          <h2 className="impact-h">The field partner</h2>
          <p className="impact-p">{u.delivery.whyPartner}</p>
          <div className="impact-status">
            <span className={`impact-status__badge${statusAcid ? " acid" : ""}`}>{DELIVERY_LABEL[u.delivery.status]} · NOT OPEN</span>
            <dl className="impact-def">
              <dt>MISSION OWNER</dt><dd>4PLANET — initiator</dd>
              <dt>FIELD PARTNER</dt><dd>{u.delivery.fieldPartner}</dd>
              <dt>WHERE</dt><dd>{u.delivery.where}</dd>
              <dt>PROOF</dt><dd>{u.delivery.proof}</dd>
            </dl>
            <p style={{ ...mono, marginTop: 16, fontSize: 10.5, lineHeight: 1.6, color: "rgba(255,255,255,.6)" }}>
              This pathway is not open. Nothing here takes payment, requests a provider or claims physical delivery.
              The ecological facts above are source-backed; the delivery model is shown at its true status.
            </p>
          </div>

          <div style={{ marginTop: 40 }}>
            <Link to={backHref} style={{ ...mono, fontSize: 12, letterSpacing: ".1em", color: "#000", background: u.accent, padding: "13px 20px", textDecoration: "none" }}>← ALL FOUR ACTIONS</Link>
          </div>
        </div>
      </article>
    </PublicShell>
  );
}
