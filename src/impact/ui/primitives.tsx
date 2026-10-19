/* IMPACT shared template primitives — one grammar for Home / Issue / Project / Actor / Solution.
   Brand OS: White/Black master surfaces; one contextual accent shown as a marker (never as
   small text colour); DM Sans kickers; Fragment Mono only for proof/source metadata;
   ruled lists before containers; capsule actions; one soft radius family. */
import { type ReactNode, useEffect, useId, useState } from "react";
import { Link } from "react-router-dom";
import { trackEvent } from "@/analytics/Analytics";
import { useFollows } from "@/planet/follow";
import type { EntityType } from "@/planet/types";
import {
  hostOf,
  humanise,
  shortDate,
  type ImpactActor,
  type ImpactClaim,
  type ImpactDomain,
  type ImpactIndex,
  type ImpactMedia,
  type ImpactProject,
} from "@/impact/livingActionNetworkGraph";
import { impactRoutes } from "@/impact/livingActionNetworkClient";
import { REVIEW_STATES, recordLadderPosition, reviewStateLabel } from "@/impact/reviewModel";

export const DOMAIN_MARK: Record<ImpactDomain, string> = {
  "OCE4N_": "#2E2EFF",
  "E4RTH_": "#3AE86F",
  "S4PIENS_": "#FF4D22",
  "4CULTURE_": "#FF5ACD",
};
export const markOf = (domain: ImpactDomain | null | undefined) => (domain ? DOMAIN_MARK[domain] : "#2E2EFF");

export function Kicker({ children, mark, inverse = false }: { children: ReactNode; mark?: string; inverse?: boolean }) {
  return (
    <p className={"iu-kicker" + (inverse ? " iu-kicker--inverse" : "")}>
      {mark && <i aria-hidden style={{ background: mark }} />}
      {children}
    </p>
  );
}

/** Quiet proof metadata line. Mono by design: this is provenance, not reading copy. */
export function Meta({ children, inverse = false }: { children: ReactNode; inverse?: boolean }) {
  return <p className={"iu-meta" + (inverse ? " iu-meta--inverse" : "")}>{children}</p>;
}

export function SectionHead({ index, title, lead, id, action }: { index?: string; title: string; lead?: ReactNode; id?: string; action?: ReactNode }) {
  return (
    <header className="iu-section-head" id={id}>
      <div>
        {index && <span className="iu-section-head__index" aria-hidden>{index}</span>}
        <h2>{title}</h2>
      </div>
      {(lead || action) && (
        <div className="iu-section-head__side">
          {lead && <p>{lead}</p>}
          {action}
        </div>
      )}
    </header>
  );
}

/** Image module that always says what the image is — and what it is not. */
export function MediaFrame({ media, className = "", eager = false, sizes, compact = false }: { media: ImpactMedia | null; className?: string; eager?: boolean; sizes?: string; compact?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (!media || failed) {
    return (
      <div className={"iu-media iu-media--empty " + className} role="img" aria-label="No licensed image is recorded for this entry">
        <span>No licensed image recorded</span>
      </div>
    );
  }
  const label = media.isProjectEvidence
    ? [media.credit, media.licence].filter(Boolean).join(" · ")
    : compact ? "Issue visual" : "Issue visual · not project photography";
  return (
    <div className={"iu-media " + className}>
      <img
        src={media.path}
        alt={media.alt || label}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        sizes={sizes}
        fetchPriority={eager ? "high" : "auto"}
        onError={() => setFailed(true)}
      />
      <span className="iu-media__label" title={media.isProjectEvidence ? undefined : "Shows the issue, not this project"}>{label}</span>
    </div>
  );
}

export function ReviewMark({ state, inverse = false }: { state: string | null | undefined; inverse?: boolean }) {
  const position = recordLadderPosition(state);
  return (
    <span className={"iu-review" + (inverse ? " iu-review--inverse" : "")} title="Review state — see How records are reviewed">
      <span className="iu-review__steps" aria-hidden>
        {[0, 1, 2, 3].map((step) => <i key={step} className={step <= position ? "is-on" : ""} />)}
      </span>
      {reviewStateLabel(state)}
    </span>
  );
}

/** Compact index tile: image + title + actor + place + review state. Dense by design. */
export function ProjectTile({ project, idx, surface, eager = false }: { project: ImpactProject; idx: ImpactIndex; surface: string; eager?: boolean }) {
  const lead = idx.leadActorOf(project);
  const place = project.coverageNote || idx.placesOf(project).map((item) => item.name).join(", ");
  const issue = idx.issuesOf(project)[0];
  const href = impactRoutes.project(project.slug);
  const sources = idx.sourcesFor(project.evidence).length;
  const open = () => trackEvent(surface === "related" ? "related_project_open" : "impact_project_open", { project_id: project.id, surface });
  return (
    <article className="iu-tile">
      <Link to={href} className="iu-tile__media" tabIndex={-1} aria-hidden onClick={open}>
        <MediaFrame media={project.media} eager={eager} compact sizes="(max-width: 700px) 50vw, (max-width: 1100px) 33vw, 25vw" />
      </Link>
      <div className="iu-tile__body">
        <Kicker mark={markOf(project.domain)}>{project.issueLabel ? humanise(project.issueLabel.toLowerCase()) : issue?.name || "Ecological action"}</Kicker>
        <h3><Link to={href} onClick={open}>{project.name}</Link></h3>
        {lead && <p className="iu-tile__actor">{lead.name}</p>}
        {place && <p className="iu-tile__place">{place}</p>}
        <Meta>{reviewStateLabel(project.reviewState)}{sources ? ` · ${sources}\u00a0source${sources === 1 ? "" : "s"}` : ""}</Meta>
      </div>
    </article>
  );
}

export function ProjectGrid({ projects, idx, surface, eagerFirst = 0, label }: { projects: ImpactProject[]; idx: ImpactIndex; surface: string; eagerFirst?: number; label: string }) {
  return (
    <div className="iu-grid" role="list" aria-label={label}>
      {projects.map((project, i) => (
        <div role="listitem" key={project.id}>
          <ProjectTile project={project} idx={idx} surface={surface} eager={i < eagerFirst} />
        </div>
      ))}
    </div>
  );
}

/** Editorial ruled list row (actors, issues, solutions, search hits). */
export function RuledRow({ to, title, line, meta, mark, thumb, onOpen }: { to: string; title: string; line?: ReactNode; meta?: ReactNode; mark?: string; thumb?: ImpactMedia | null; onOpen?: () => void }) {
  return (
    <li className={"iu-row" + (thumb !== undefined ? " iu-row--thumb" : "")}>
      <Link to={to} onClick={onOpen}>
        {thumb !== undefined && (
          <span className="iu-row__thumb" aria-hidden>
            {thumb ? <img src={thumb.path} alt="" loading="lazy" decoding="async" /> : null}
          </span>
        )}
        <span className="iu-row__main">
          <strong>{mark && <i aria-hidden style={{ background: mark }} />}{title}</strong>
          {line && <small>{line}</small>}
        </span>
        {meta && <span className="iu-row__meta">{meta}</span>}
        <span className="iu-row__arrow" aria-hidden>→</span>
      </Link>
    </li>
  );
}

export function ActorRows({ actors, idx, surface }: { actors: { actor: ImpactActor; role?: string }[]; idx: ImpactIndex; surface: string }) {
  return (
    <ul className="iu-rows iu-rows--two">
      {actors.map(({ actor, role }) => {
        const projects = idx.projectsForActor(actor);
        const places = idx.placesForProjects(projects).map((place) => place.name);
        return (
          <RuledRow
            key={actor.id}
            to={impactRoutes.actor(actor.slug)}
            title={actor.name}
            line={[role, humanise(actor.actorType), places.slice(0, 3).join(", ")].filter(Boolean).join(" · ")}
            meta={`${projects.length} project${projects.length === 1 ? "" : "s"}`}
            onOpen={() => trackEvent("impact_actor_open", { actor_id: actor.id, surface })}
          />
        );
      })}
    </ul>
  );
}

/** Definition grid for "At a glance" — two columns on mobile, ruled. */
export function Facts({ rows, className = "" }: { rows: [string, ReactNode][]; className?: string }) {
  const visible = rows.filter(([, value]) => value !== null && value !== undefined && value !== "" && value !== false);
  return (
    <dl className={"iu-facts " + className}>
      {visible.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Claims with their own review status, strength, source and limitations. */
export function ClaimList({ claims, subjectId }: { claims: ImpactClaim[]; subjectId: string }) {
  if (!claims.length) {
    return <p className="iu-note">No claims are published for this record yet. That is not evidence that none exist.</p>;
  }
  return (
    <ol className="iu-claims">
      {claims.map((item) => (
        <li key={item.id} className="iu-claim">
          <p className="iu-claim__statement">{item.statement}</p>
          <Meta>
            {[humanise(item.reviewStatus), humanise(item.evidenceStrength), humanise(item.interpretation)].filter(Boolean).join(" · ")}
          </Meta>
          <div className="iu-claim__source">
            {item.sourceUrl ? (
              <a href={item.sourceUrl} target="_blank" rel="noreferrer" onClick={() => trackEvent("impact_source_open", { subject_id: subjectId, source_host: hostOf(item.sourceUrl) })}>
                {item.citation || item.sourceName || hostOf(item.sourceUrl)} <span aria-hidden>↗</span>
              </a>
            ) : (
              <span>{item.citation || item.sourceName || "Source record"}</span>
            )}
            {item.checkedAt && <span className="iu-claim__date">Checked {shortDate(item.checkedAt)}</span>}
          </div>
          {item.limitations.length > 0 && (
            <ul className="iu-claim__limits">
              {item.limitations.map((limit) => <li key={limit}>{limit}</li>)}
            </ul>
          )}
        </li>
      ))}
    </ol>
  );
}

/** Source records: authority, record, dates, rights. The audit trail a funder or journalist needs. */
export function SourceTable({ claims, subjectId }: { claims: ImpactClaim[]; subjectId: string }) {
  if (!claims.length) return <p className="iu-note">No source records are attached to this record yet.</p>;
  return (
    <div className="iu-sources" role="table" aria-label="Source records">
      <div className="iu-sources__head" role="row">
        <span role="columnheader">Source</span>
        <span role="columnheader">Authority</span>
        <span role="columnheader">Event</span>
        <span role="columnheader">Checked</span>
        <span role="columnheader">Rights</span>
      </div>
      {claims.map((item) => (
        <div className="iu-sources__row" role="row" key={item.sourceRecordId || item.id}>
          <span role="cell">
            {item.sourceUrl ? (
              <a href={item.sourceUrl} target="_blank" rel="noreferrer" onClick={() => trackEvent("impact_source_open", { subject_id: subjectId, source_host: hostOf(item.sourceUrl) })}>
                {item.citation || item.sourceName || hostOf(item.sourceUrl)} <span aria-hidden>↗</span>
              </a>
            ) : (item.citation || item.sourceName || "Source record")}
            {item.sourceRecordId && <small>{item.sourceRecordId}</small>}
          </span>
          <span role="cell" data-label="Authority">{item.sourceAuthority || item.sourceName || "—"}</span>
          <span role="cell" data-label="Event">{shortDate(item.sourceEventAt) || "Not stated"}</span>
          <span role="cell" data-label="Checked">{shortDate(item.checkedAt) || shortDate(item.retrievedAt) || "—"}</span>
          <span role="cell" data-label="Rights">{rightsLabel(item.sourceRights)}</span>
        </div>
      ))}
    </div>
  );
}

function rightsLabel(value: string | null) {
  if (!value) return "Not recorded";
  if (/reference_and_fact_extraction_only/.test(value)) return "Facts referenced · text not republished";
  if (/test_fixture/.test(value)) return "Test fixture";
  return humanise(value.split(";")[0]);
}

/** The four record states, with the current one marked and reserved states labelled. */
export function ProofLadder({ state, compact = false }: { state: string | null; compact?: boolean }) {
  const position = recordLadderPosition(state);
  const record = REVIEW_STATES.filter((item) => item.group === "RECORD");
  return (
    <ol className={"iu-ladder" + (compact ? " iu-ladder--compact" : "")} aria-label="Record review ladder">
      {record.map((item, i) => (
        <li key={item.key} className={(i === position ? "is-current" : i < position ? "is-passed" : "") + (item.reserved ? " is-reserved" : "")} aria-current={i === position ? "step" : undefined}>
          <span className="iu-ladder__step">{String(i + 1).padStart(2, "0")}</span>
          <strong>{reviewStateLabel(item.key)}{i === position && <em> · this record</em>}</strong>
          {!compact && <small>{item.reserved ?? item.meaning}</small>}
        </li>
      ))}
    </ol>
  );
}

export function NotEstablished({ lines }: { lines: string[] }) {
  if (!lines.length) return null;
  return (
    <aside className="iu-not" aria-label="What this record does not establish">
      <h3>What this record does not establish</h3>
      <ul>{lines.map((line) => <li key={line}>{line}</li>)}</ul>
    </aside>
  );
}

export function CapsuleLink({ href, children, onClick, tone = "blue", external = false }: { href: string; children: ReactNode; onClick?: () => void; tone?: "blue" | "white" | "ink" | "line"; external?: boolean }) {
  const className = "iu-capsule iu-capsule--" + tone;
  if (external || /^https?:/.test(href)) {
    return <a className={className} href={href} target="_blank" rel="noreferrer" onClick={onClick}>{children} <span aria-hidden>↗</span></a>;
  }
  return <Link className={className} to={href} onClick={onClick}>{children}</Link>;
}

/** Save to this device — the existing local-first follow store; nothing leaves the browser. */
export function SaveButton({ id, type, label, sub, inverse = false }: { id: string; type: EntityType | "ACTOR" | "PROJECT"; label: string; sub?: string; inverse?: boolean }) {
  const { toggle, following } = useFollows();
  const on = following(id);
  return (
    <button
      type="button"
      className={"iu-save" + (on ? " is-on" : "") + (inverse ? " iu-save--inverse" : "")}
      aria-pressed={on}
      onClick={() => {
        const followType: EntityType = type === "ACTOR" || type === "PROJECT" ? "UNKNOWN" : type;\n        toggle({ id, type: followType, label, sub });
        trackEvent("impact_save", { entity_id: id, saved: !on });
      }}
    >
      <span aria-hidden>{on ? "●" : "○"}</span> {on ? "Saved on this device" : "Save"}
    </button>
  );
}

/** In-page section navigation (static, horizontally scrollable on touch). */
export function OnThisPage({ items }: { items: [string, string][] }) {
  return (
    <nav className="iu-onpage" aria-label="On this page">
      <ul>
        {items.map(([id, label]) => <li key={id}><a href={"#" + id}>{label}</a></li>)}
      </ul>
    </nav>
  );
}

export function Provenance({ idx }: { idx: ImpactIndex }) {
  const { graph } = idx;
  return (
    <p className="iu-provenance">
      Read live from NATUREBRAIN · {graph.source}() · {graph.version}
      {graph.generatedAt ? ` · generated ${shortDate(graph.generatedAt)}` : ""} · <Link to={impactRoutes.method}>How records are reviewed</Link>
    </p>
  );
}

export function StateScreen({ kind, retry }: { kind: "LOADING" | "ERROR" | "NOT_FOUND"; retry?: () => void }) {
  const titleId = useId();
  useEffect(() => {
    if (kind === "NOT_FOUND") {
      const robots = document.head.querySelector('meta[name="robots"]');
      robots?.setAttribute("content", "noindex,follow");
    }
  }, [kind]);
  return (
    <section className={"iu iu-state iu-state--" + kind.toLowerCase()} aria-labelledby={titleId} aria-busy={kind === "LOADING"}>
      <div className="iu-wrap">
        <Kicker>4PLANET IMPACT</Kicker>
        {kind === "LOADING" && <h1 id={titleId}>Reading the live record from NATUREBRAIN…</h1>}
        {kind === "ERROR" && (
          <>
            <h1 id={titleId}>Impact records are temporarily unavailable.</h1>
            <p>The source could not be reached, so nothing is shown from a stale or parallel copy. Unavailable is not the same as zero.</p>
            <div className="iu-actions">
              {retry && <button type="button" className="iu-capsule iu-capsule--white" onClick={retry}>Try again</button>}
              <CapsuleLink href="/atlas" tone="line">Open ATLAS</CapsuleLink>
            </div>
          </>
        )}
        {kind === "NOT_FOUND" && (
          <>
            <h1 id={titleId}>This record is not in the published IMPACT graph.</h1>
            <p>It may not have passed the publication gate yet, or the address has changed. That does not mean the work does not exist.</p>
            <div className="iu-actions">
              <CapsuleLink href={impactRoutes.home} tone="white">Browse IMPACT</CapsuleLink>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
