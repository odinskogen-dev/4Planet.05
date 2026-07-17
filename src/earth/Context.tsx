/* ═══════════════════════════════════════════════════════════════════════════
   4PLANET_ — EARTH — SHARED CONTEXT LAYER
   ───────────────────────────────────────────────────────────────────────────
   Mandate: "OPEN THE SAME WORLD DEEPER. Do not create five unrelated drawers or
   five unrelated microsites."

   One component. Every canonical object opens here, in the same place, with the
   same grammar: KIND → IDENTITY → what we know → WHERE IT CAME FROM → FOLLOW.
   The information *hierarchy* changes per object; the container never does.

   The one rule that is enforced everywhere below:

       NO SECTION RENDERS WITHOUT A STATUS.

   Every block of content states whether it is LIVE source data, SEEDED 4PLANET
   prototype reasoning, NOT CHECKED, NO COVERAGE or a failed source. There is no
   unmarked content in this panel. That is Brief §31 and §99, and it is the
   single most important thing this file does.
   ═══════════════════════════════════════════════════════════════════════════ */

import React from "react";
import { Link } from "react-router-dom";
import type {
  DataStatus,
  EntityId,
  EntityRef,
  EntityType,
  Field,
  LivingSystem,
  Mission,
  Occurrence,
  ObservationItem,
  Place,
  Pressure,
  Relation,
  Signal,
  Solution,
} from "@/planet/types";
import {
  MISSIONS,
  PRESSURES,
  SOLUTIONS,
  dependsUpon,
  directDependents,
  missionById,
  nodeById,
  pressureById,
  pressuresOn,
  primaryChain,
  solutionById,
  systemById,
  systemsContaining,
} from "@/planet/livingSystems";
import { CLASS_CAVEAT, CLASS_LABEL, OBSERVATION_CAVEAT, OBSERVATION_LABEL, timeAgo } from "@/planet/signals";
import { placeById } from "@/planet/places";
import { src } from "@/planet/sources";
import { typeOf } from "@/planet/ids";
import type { TaxonPhoto } from "@/planet/connectors";

/* ── palette by entity type ──────────────────────────────────────────────── */
export const TYPE_COLOR: Record<string, string> = {
  TAXON: "#3AE86F",
  PLACE: "#2E2EFF",
  LIVING_SYSTEM: "#3CD6CE",
  SIGNAL: "#FF7D50",
  OBSERVATION: "#3AE86F",
  PRESSURE: "#FF4D22",
  SOLUTION: "#2E2EFF",
  MISSION: "#FFFFFF",
  COORDINATE: "#FFFFFF",
  LEGACY_POINT: "#8A94A6",
  FUNCTION: "#3CD6CE",
  HUMAN_SYSTEM: "#FF4D22",
};

const KIND_LABEL: Record<string, string> = {
  TAXON: "TAXON · LIFE",
  PLACE: "PLACE",
  LIVING_SYSTEM: "LIVING SYSTEM",
  SIGNAL: "SIGNAL",
  OBSERVATION: "OBSERVATION",
  PRESSURE: "PRESSURE",
  SOLUTION: "SOLUTION PATHWAY",
  MISSION: "4PLANET MISSION",
  COORDINATE: "COORDINATE",
  LEGACY_POINT: "MAP RECORD",
  FUNCTION: "ECOLOGICAL FUNCTION",
  HUMAN_SYSTEM: "HUMAN SYSTEM",
};

/* ── context state ───────────────────────────────────────────────────────── */

export type ContextState =
  | {
      kind: "TAXON";
      ref: EntityRef;
      photo: TaxonPhoto | null;
      occ: Field<{ rows: Occurrence[]; total: number }>;
    }
  | {
      kind: "PLACE";
      place: Place;
      life: Field<{ total: number; names: string[] }>;
      signals: Field<Array<Signal & { distanceKm: number }>>;
    }
  | { kind: "LIVING_SYSTEM"; system: LivingSystem }
  | { kind: "SIGNAL"; signal: Signal }
  | { kind: "OBSERVATION"; observation: ObservationItem }
  | { kind: "PRESSURE"; pressure: Pressure }
  | { kind: "SOLUTION"; solution: Solution }
  | { kind: "MISSION"; mission: Mission }
  | {
      kind: "COORDINATE";
      lat: number;
      lng: number;
      life: Field<{ total: number; names: string[] }>;
      signals: Field<Array<Signal & { distanceKm: number }>>;
    }
  | {
      /**
       * V39.1 Scope 01 — a thin PRESENTATION envelope for a point from a legacy
       * V36 map layer that carries no canonical id. It routes that click into the
       * one Shared Context surface instead of a floating popup. It is display-only:
       * it does NOT create canonical identity, scientific meaning, evidence status
       * or place membership, and it says so plainly. No new domain record exists.
       */
      kind: "LEGACY_POINT";
      title: string;
      sub?: string;
      scientificName?: string;
      commonName?: string;
      observedDate?: string;
      lat: number;
      lng: number;
      sourceLabel: string;
      /** Source identity for the record (GBIF / OBIS / EONET / USGS / ISS). */
      sourceId?: string;
      /** Preserved source-rendered preview (parity with the old V36 popup). */
      previewHtml?: string;
      /** For source links only — not a canonical identity. */
      gbifKey?: string;
      aphiaId?: string;
      /** Classify planetary-context layers (ISS, seismic) explicitly. */
      planetaryContext?: boolean;
      accent?: string;
    };

/* ── status token ────────────────────────────────────────────────────────── */

const STATUS_TEXT: Record<DataStatus, string> = {
  LIVE: "LIVE",
  LOADING: "···",
  NO_RECORDS: "NO RECORDS",
  NOT_CHECKED: "NOT CHECKED",
  NO_COVERAGE: "NO COVERAGE",
  SOURCE_UNAVAILABLE: "SOURCE DOWN",
  SEEDED: "SEEDED",
  PLANNED: "PLANNED",
};

const STATUS_CLASS: Record<DataStatus, string> = {
  LIVE: "live",
  LOADING: "load",
  NO_RECORDS: "none",
  NOT_CHECKED: "none",
  NO_COVERAGE: "none",
  SOURCE_UNAVAILABLE: "bad",
  SEEDED: "seeded",
  PLANNED: "none",
};

/**
 * The sentence a user gets when a section is not LIVE.
 * Brief §29: "NO RECORDS ≠ ENTITY ABSENT. NOT CHECKED ≠ ZERO."
 * These strings are the product's whole credibility. Do not soften them.
 */
const STATUS_MEANING: Partial<Record<DataStatus, string>> = {
  NO_RECORDS:
    "The source answered and held nothing for this query. That is a statement about the records, not about the world.",
  NOT_CHECKED:
    "4PLANET did not ask. No connector for this question is wired yet. Do not read this as zero.",
  NO_COVERAGE:
    "No source in the system currently covers this question. Absence here is our gap, not the planet's.",
  SOURCE_UNAVAILABLE: "The source did not respond. We are showing nothing rather than guessing.",
  SEEDED:
    "4PLANET prototype content. This is our reasoning, not a source record, and it has not been reviewed by a domain expert.",
  PLANNED: "Designed, not yet built.",
};

export const Stat = ({ s }: { s: DataStatus }) => (
  <span className={`stat ${STATUS_CLASS[s]}`}>{STATUS_TEXT[s]}</span>
);

const Section: React.FC<{
  title: string;
  status: DataStatus;
  children?: React.ReactNode;
  /** Force the meaning note even when LIVE (used for caveats). */
  note?: string;
}> = ({ title, status, children, note }) => {
  const meaning = note ?? STATUS_MEANING[status];
  return (
    <div className="sec">
      <div className="sec-h">
        <span>{title}</span>
        <Stat s={status} />
      </div>
      <div className="sec-body">
        {status === "LIVE" || status === "SEEDED" ? children : null}
        {meaning && (
          <div
            className="note-box"
            style={{ color: status === "SEEDED" ? "#FF7D50" : undefined }}
          >
            {meaning}
          </div>
        )}
      </div>
    </div>
  );
};

const Source: React.FC<{ ids: string[] }> = ({ ids }) => (
  <div className="src-line">
    SOURCE ·{" "}
    {ids.map((id, i) => {
      const s = src(id);
      return (
        <React.Fragment key={id}>
          {i > 0 && " · "}
          {s.home.startsWith("http") ? (
            <a href={s.home} target="_blank" rel="noopener noreferrer">
              {s.attribution}
            </a>
          ) : (
            s.attribution
          )}
        </React.Fragment>
      );
    })}
  </div>
);

/* ── evidence envelope on a seeded relationship (Brief §25) ──────────────── */

const Evidence: React.FC<{ r: Relation }> = ({ r }) => (
  <>
    <div className="ev">
      {/* V40 truth-axis correction: no generic CONFIDENCE badge. The canonical
          axes are Review Status (real here), Evidence Strength and Interpretation
          Status. The latter two have no assessed value on a seeded prototype
          relation, so they read NOT YET ASSESSED — never back-translated from the
          old confidence field. Origin is construction context, not a truth axis. */}
      <span>REVIEW · {r.reviewStatus.replace(/_/g, " ")}</span>
      <span>EVIDENCE STRENGTH · NOT YET ASSESSED</span>
      <span>INTERPRETATION · NOT YET ASSESSED</span>
      <span>ORIGIN · {r.origin.replace(/_/g, " ")}</span>
    </div>
    {r.evidence && <div className="ev-cite">{r.evidence}</div>}
  </>
);

/* ── the relationship chain ──────────────────────────────────────────────── */

const Chain: React.FC<{ rels: Relation[]; startId: EntityId; onOpen: (id: EntityId) => void }> = ({
  rels,
  startId,
  onOpen,
}) => {
  const ids = [startId, ...rels.map((r) => r.to)];
  return (
    <div className="chain">
      {ids.map((id, i) => {
        const n = nodeById(id);
        const rel = i > 0 ? rels[i - 1] : null;
        const last = i === ids.length - 1;
        const color = TYPE_COLOR[String(n?.type ?? typeOf(id))] ?? "#fff";
        return (
          <div key={id} className="chain-node" onClick={() => onOpen(id)} style={{ color }}>
            <div className="chain-rail">
              <span className="chain-dot" />
              {!last && <span className="chain-line" />}
            </div>
            <div className="chain-txt">
              <div className="chain-name" style={{ color: "inherit" }}>
                {n?.label ?? id}
              </div>
              <div className="chain-type">
                {KIND_LABEL[String(n?.type)] ?? String(n?.type ?? "")}
                {n?.sub ? ` · ${n.sub}` : ""}
              </div>
              {rel && <div className="chain-claim">{rel.claim}</div>}
              {rel && <Evidence r={rel} />}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ── list item ───────────────────────────────────────────────────────────── */

const Li: React.FC<{
  color: string;
  name: string;
  sub?: string;
  why?: string;
  end?: string;
  onClick?: () => void;
}> = ({ color, name, sub, why, end, onClick }) => (
  <div
    className="li"
    onClick={onClick}
    role={onClick ? "button" : undefined}
    tabIndex={onClick ? 0 : undefined}
    onKeyDown={
      onClick
        ? (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onClick();
            }
          }
        : undefined
    }
  >
    <span className="lidot" style={{ background: color }} />
    <span className="limain">
      <span className="liname">{name}</span>
      {sub && <div className="lisub">{sub}</div>}
      {why && <div className="liwhy">{why}</div>}
    </span>
    {end && <span className="liend">{end}</span>}
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   THE CONTEXT LAYER
   ═══════════════════════════════════════════════════════════════════════════ */

export interface ContextProps {
  ctx: ContextState;
  onClose: () => void;
  onOpen: (id: EntityId) => void;
  following: (id: string) => boolean;
  onFollow: (ref: EntityRef) => void;
}

const refOf = (ctx: ContextState): EntityRef | null => {
  switch (ctx.kind) {
    case "TAXON":
      return ctx.ref;
    case "PLACE":
      return { id: ctx.place.id, type: "PLACE", label: ctx.place.name, sub: ctx.place.kind };
    case "LIVING_SYSTEM":
      return {
        id: ctx.system.id,
        type: "LIVING_SYSTEM",
        label: ctx.system.name,
        sub: ctx.system.sub,
      };
    default:
      return null; // Brief §40/§51: v1 Follow targets are TAXON, PLACE, LIVING SYSTEM. Only.
  }
};

export const ContextLayer: React.FC<ContextProps> = ({
  ctx,
  onClose,
  onOpen,
  following,
  onFollow,
}) => {
  const color = TYPE_COLOR[ctx.kind] ?? "#fff";
  const ref = refOf(ctx);
  const isOn = ref ? following(ref.id) : false;

  /* ── PROGRESSIVE CONTEXT (V39.1 Scope 04) ─────────────────────────────────
     Three levels of disclosure — GLANCE, UNDERSTAND, GO DEEPER. This is
     progressive DISCLOSURE, not removal of evidence: every section still exists,
     truth-critical status is never hidden, and one tap reveals the next depth.
     GLANCE answers what/where/what-was-recorded/status + the primary action.
     UNDERSTAND adds relationships, temporal and place context, why it matters.
     GO DEEPER adds full source/methods, evidence + review status, solutions,
     mission and expected-outcome pathways. */
  const GLANCE = 0, UNDERSTAND = 1, DEEPER = 2;
  const [level, setLevel] = React.useState<number>(GLANCE);
  // Reset to GLANCE whenever the object being viewed changes identity.
  const identity =
    ref?.id ??
    (ctx.kind === "COORDINATE" ? `coord:${ctx.lat},${ctx.lng}` :
     ctx.kind === "OBSERVATION" ? ctx.observation.id :
     ctx.kind === "SIGNAL" ? ctx.signal.id : ctx.kind);
  React.useEffect(() => { setLevel(GLANCE); }, [identity]);

  /** Render children only once the reader has chosen to go this deep. */
  const Tier: React.FC<{ min: number; children: React.ReactNode }> = ({ min, children }) =>
    level >= min ? <>{children}</> : null;

  /** The one control that carries the reader deeper, plus FOLLOW at GLANCE. */
  const tierControls = (opts?: { hasUnderstand?: boolean; hasDeeper?: boolean }) => {
    const hasUnderstand = opts?.hasUnderstand ?? true;
    const hasDeeper = opts?.hasDeeper ?? true;
    return (
      <div className="tier-controls">
        {level < UNDERSTAND && hasUnderstand && (
          <button className="tier-btn" style={{ color }} onClick={() => setLevel(UNDERSTAND)}>
            UNDERSTAND →
          </button>
        )}
        {level >= UNDERSTAND && level < DEEPER && hasDeeper && (
          <button className="tier-btn" style={{ color }} onClick={() => setLevel(DEEPER)}>
            GO DEEPER →
          </button>
        )}
        {level >= UNDERSTAND && (
          <button className="tier-btn ghost" onClick={() => setLevel(GLANCE)}>
            LESS
          </button>
        )}
      </div>
    );
  };

  const head = (title: string, sub?: string, id?: string) => (
    <div className="ctx-head">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div className="ctx-kind" style={{ color }}>
          <span
            style={{ width: 7, height: 7, borderRadius: "50%", background: color, display: "inline-block" }}
          />
          {KIND_LABEL[ctx.kind]}
        </div>
        <button className="ctx-close" onClick={onClose}>
          CLOSE
        </button>
      </div>
      <div className="ctx-title">{title}</div>
      {sub && <div className="ctx-sub">{sub}</div>}
      {id && <div className="ctx-id">{id}</div>}
    </div>
  );

  const followBtn = () =>
    ref ? (
      <button
        className={`follow-btn ${isOn ? "on" : ""}`}
        style={!isOn ? { color } : undefined}
        onClick={() => onFollow(ref)}
      >
        <span>{isOn ? "✓ FOLLOWING" : "FOLLOW"}</span>
      </button>
    ) : null;

  /* ── TAXON ─────────────────────────────────────────────────────────────── */
  if (ctx.kind === "TAXON") {
    const { ref: r, photo, occ } = ctx;
    const systems = systemsContaining(r.id);
    const performs = directDependents(r.id);
    const pressures = pressuresOn(r.id);
    const chain = primaryChain(r.id);

    return (
      <div className="ctx">
        {head(r.label, r.sub, r.id)}
        <div className="ctx-body">
          {photo && (
            <>
              <img className="ctx-hero" src={photo.url} alt={r.sub ?? r.label} style={{ marginTop: 14 }} />
              <div className="src-line" style={{ marginTop: 5 }}>
                PHOTO · {photo.attribution}
              </div>
            </>
          )}

          <Section
            title="RECORDED OBSERVATIONS"
            status={occ.status}
            note={
              occ.status === "LIVE"
                ? "Records show where people have looked and reported. Sparse dots mean sparse observers — not absent life. This is not a range map."
                : undefined
            }
          >
            {occ.value && (
              <>
                <div className="hrow">
                  <span>Records held by GBIF</span>
                  <span style={{ color }}>{occ.value.total.toLocaleString()}</span>
                </div>
                <div className="hrow">
                  <span>Plotted on Earth</span>
                  <span style={{ color }}>{occ.value.rows.length}</span>
                </div>
                <Tier min={DEEPER}><Source ids={["gbif"]} /></Tier>
              </>
            )}
          </Section>

          {/* GLANCE always shows the primary action. Deeper tiers reveal the graph. */}
          {followBtn()}
          {tierControls({ hasDeeper: pressures.length > 0 })}

          <Tier min={UNDERSTAND}>
            {chain.length > 0 && (
              <Section title="WHY IT MAY MATTER" status="SEEDED">
                <Chain rels={chain} startId={r.id} onOpen={onOpen} />
              </Section>
            )}

            {performs.length === 0 && chain.length === 0 && (
              <Section title="ROLE IN THE LIVING SYSTEM" status="NOT_CHECKED" />
            )}

            {systems.length > 0 && (
              <Section title="LIVING SYSTEMS" status="SEEDED">
                {systems.map((s) => (
                  <Li
                    key={s.id}
                    color={TYPE_COLOR.LIVING_SYSTEM}
                    name={s.name}
                    sub={s.sub}
                    onClick={() => onOpen(s.id)}
                  />
                ))}
              </Section>
            )}
          </Tier>

          <Tier min={DEEPER}>
            {pressures.length > 0 && (
              <Section title="PRESSURES" status="SEEDED">
                {pressures.map((p) => {
                  const pr = pressureById(p.from);
                  return (
                    <div key={p.id} style={{ marginBottom: 10 }}>
                      <Li
                        color={TYPE_COLOR.PRESSURE}
                        name={pr?.name ?? p.from}
                        why={p.claim}
                        onClick={() => onOpen(p.from)}
                      />
                      <Evidence r={p} />
                    </div>
                  );
                })}
              </Section>
            )}
          </Tier>
        </div>
      </div>
    );
  }

  /* ── PLACE ─────────────────────────────────────────────────────────────── */
  if (ctx.kind === "PLACE") {
    const { place, life, signals } = ctx;
    const systems = (place.livingSystemIds ?? [])
      .map(systemById)
      .filter(Boolean) as LivingSystem[];
    const pressures = (place.pressureIds ?? []).map(pressureById).filter(Boolean) as Pressure[];

    return (
      <div className="ctx">
        {head(
          place.name,
          `${place.kind.replace(/_/g, " ")} · ${Math.abs(place.lat).toFixed(2)}°${
            place.lat >= 0 ? "N" : "S"
          } ${Math.abs(place.lng).toFixed(2)}°${place.lng >= 0 ? "E" : "W"}`,
          place.id,
        )}
        <div className="ctx-body">
          {place.blurb && (
            <div className="sec">
              <div className="sec-h">
                <span>PLACE</span>
                <Stat s="SEEDED" />
              </div>
              <div className="sec-body">
                <p className="prose">{place.blurb}</p>
              </div>
            </div>
          )}

          <Section
            title="RECORDS IN THIS MAP AREA"
            status={life.status}
            note={
              life.status === "LIVE"
                ? `These are the biodiversity records GBIF returned for a rectangular area around ${place.name} — not records verified as belonging to it. A bounding box is a box on a map, not the boundary of the place.${
                    place.kind === "MARINE_AREA"
                      ? " Because this is a marine area, the box unavoidably includes nearby coastline, so land-dwelling species can appear here. They are inside the query area; they are not marine life."
                      : place.kind === "CITY"
                        ? " The box also covers land around the city, so this is the wider area, not the streets."
                        : ""
                  } 4PLANET does not yet hold a real polygon for this place.`
                : undefined
            }
          >
            {life.value && (
              <>
                <div className="hrow">
                  <span>Records returned for the area</span>
                  <span style={{ color }}>{life.value.total.toLocaleString()}</span>
                </div>
                <div className="hrow">
                  <span>Query geometry</span>
                  <span style={{ opacity: 0.7 }}>BOUNDING BOX</span>
                </div>
                <div className="hrow">
                  <span>Distinct names in sample</span>
                  <span style={{ color }}>{life.value.names.length}</span>
                </div>
                {life.value.names.length > 0 && (
                  <div className="foot" style={{ marginTop: 8, lineHeight: 1.7 }}>
                    {life.value.names.slice(0, 12).join(" · ")}
                  </div>
                )}
                <Source ids={["gbif"]} />
              </>
            )}
          </Section>

          {followBtn()}
          {tierControls()}

          <Tier min={UNDERSTAND}>
            <Section
              title="RECENT SIGNALS"
              status={signals.status}
              note={
                signals.status === "NO_RECORDS"
                  ? "No fire, natural event or seismic record from NASA EONET or USGS falls within range of this area right now. Those are the only event feeds 4PLANET currently reads. Quiet feeds are not a quiet planet."
                  : undefined
              }
            >
              {signals.value?.map((s) => (
                <Li
                  key={s.id}
                  color={TYPE_COLOR.SIGNAL}
                  name={s.title}
                  sub={`${CLASS_LABEL[s.cls]} · ${src(s.provenance.sourceId).name}`}
                  why={s.summary}
                  end={timeAgo(s.provenance.occurredAt)}
                  onClick={() => onOpen(s.id)}
                />
              ))}
              {signals.value && signals.value.length > 0 && <Source ids={["eonet", "usgs"]} />}
            </Section>

            {systems.length > 0 && (
              <Section title="LIVING SYSTEM CONTEXT" status="SEEDED">
                {systems.map((s) => (
                  <Li
                    key={s.id}
                    color={TYPE_COLOR.LIVING_SYSTEM}
                    name={s.name}
                    sub={s.sub}
                    onClick={() => onOpen(s.id)}
                  />
                ))}
              </Section>
            )}
          </Tier>

          <Tier min={DEEPER}>
            {pressures.length > 0 && (
              <Section title="PRESSURES" status="SEEDED">
                {pressures.map((p) => (
                  <Li
                    key={p.id}
                    color={TYPE_COLOR.PRESSURE}
                    name={p.name}
                    onClick={() => onOpen(p.id)}
                  />
                ))}
              </Section>
            )}

            {/* Brief §29: this section exists precisely BECAUSE we cannot answer it. */}
            <Section title="PROTECTED AREAS" status="NOT_CHECKED" />

            <Section title="PUBLIC DECISIONS" status="NO_COVERAGE" />
          </Tier>
        </div>
      </div>
    );
  }

  /* ── LIVING SYSTEM ─────────────────────────────────────────────────────── */
  if (ctx.kind === "LIVING_SYSTEM") {
    const { system } = ctx;
    const chain = primaryChain(system.chain[0]);
    const pressures = system.pressureIds.map(pressureById).filter(Boolean) as Pressure[];
    const places = (system.placeIds ?? []).map(placeById).filter(Boolean) as Place[];

    return (
      <div className="ctx">
        {head(system.name, system.sub, system.id)}
        <div className="ctx-body">
          <div className="sec">
            <div className="sec-h">
              <span>WHAT THIS IS</span>
              <Stat s="SEEDED" />
            </div>
            <div className="sec-body">
              <p className="prose">{system.body}</p>
              <div className="note-box" style={{ color: "#FF7D50" }}>
                4PLANET prototype relationship model. The chain below is a comprehensible path
                through a system that is really a network. It is not a claim that ecological
                causality is linear, and it has not been reviewed by a domain expert.
              </div>
            </div>
          </div>

          {followBtn()}
          {tierControls()}

          <Tier min={UNDERSTAND}>
            {chain.length > 0 && (
              <Section title="WHAT SUPPORTS WHAT" status="SEEDED" note=" ">
                <Chain rels={chain} startId={system.chain[0]} onOpen={onOpen} />
              </Section>
            )}
          </Tier>

          <Tier min={DEEPER}>
            {pressures.length > 0 && (
              <Section title="PRESSURES ON THIS SYSTEM" status="SEEDED" note=" ">
                {pressures.map((p) => (
                  <Li
                    key={p.id}
                    color={TYPE_COLOR.PRESSURE}
                    name={p.name}
                    why={p.body}
                    onClick={() => onOpen(p.id)}
                  />
                ))}
              </Section>
            )}

            {places.length > 0 && (
              <Section title="REPRESENTED IN" status="SEEDED" note=" ">
                {places.map((p) => (
                  <Li
                    key={p.id}
                    color={TYPE_COLOR.PLACE}
                    name={p.name}
                    sub={p.kind.replace(/_/g, " ")}
                    onClick={() => onOpen(p.id)}
                  />
                ))}
              </Section>
            )}

            {system.anchorTaxa.length > 0 && (
              <Section title="LIFE IN THIS SYSTEM" status="SEEDED" note=" ">
                {system.anchorTaxa.map((t) => {
                  const n = nodeById(t);
                  return (
                    <Li
                      key={t}
                      color={TYPE_COLOR.TAXON}
                      name={n?.label ?? t}
                      sub={n?.sub}
                      onClick={() => onOpen(t)}
                    />
                  );
                })}
              </Section>
            )}
          </Tier>
        </div>
      </div>
    );
  }

  /* ── SIGNAL ────────────────────────────────────────────────────────────── */
  if (ctx.kind === "SIGNAL") {
    const s = ctx.signal;
    const d = src(s.provenance.sourceId);
    return (
      <div className="ctx">
        {head(s.title, CLASS_LABEL[s.cls], s.id)}
        <div className="ctx-body">
          {s.summary && (
            <div className="sec">
              <div className="sec-h">
                <span>WHAT HAPPENED</span>
                <Stat s="LIVE" />
              </div>
              <div className="sec-body">
                <p className="prose">{s.summary}</p>
              </div>
            </div>
          )}

          <div className="sec">
            <div className="sec-h">
              <span>RECORD</span>
              <Stat s="LIVE" />
            </div>
            <div className="sec-body">
              <div className="hrow">
                <span>Occurred</span>
                <span style={{ color }}>{timeAgo(s.provenance.occurredAt)}</span>
              </div>
              <div className="hrow">
                <span>Location</span>
                <span style={{ color }}>
                  {Math.abs(s.lat).toFixed(2)}°{s.lat >= 0 ? "N" : "S"}{" "}
                  {Math.abs(s.lng).toFixed(2)}°{s.lng >= 0 ? "E" : "W"}
                </span>
              </div>
              <div className="hrow">
                <span>Significance</span>
                <span style={{ opacity: 0.7 }}>{s.significance}</span>
              </div>
              <div className="hrow">
                <span>4PLANET checked</span>
                <span style={{ opacity: 0.7 }}>{timeAgo(s.provenance.checkedAt)}</span>
              </div>

              <div className="note-box" style={{ color }}>
                {CLASS_CAVEAT[s.cls]}
              </div>

              {/* Brief §39. We say this out loud rather than implying urgency by design. */}
              <div className="foot" style={{ marginTop: 10 }}>
                4PLANET has not promoted this signal to an alert. It has no methodology for doing
                so, and will not manufacture one.
              </div>

              {s.provenance.sourceUrl && (
                <div className="src-line">
                  <a href={s.provenance.sourceUrl} target="_blank" rel="noopener noreferrer">
                    See this record at {d.name} ↗
                  </a>
                </div>
              )}
              <Source ids={[s.provenance.sourceId]} />
            </div>
          </div>

          {followBtn()}
          {s.about && tierControls({ hasDeeper: false })}

          <Tier min={UNDERSTAND}>
            {s.about && (
              <Section title="RECORDED AGAINST" status="LIVE" note=" ">
                <Li
                  color={TYPE_COLOR.TAXON}
                  name={s.about.label}
                  sub={s.about.sub}
                  onClick={() => onOpen(s.about!.id)}
                />
              </Section>
            )}
          </Tier>
        </div>
      </div>
    );
  }

  /* ── OBSERVATION (first-class object — Brief §22, V38R integration finding) ─
     An observation is a record that somebody looked and reported. It is NOT a
     signal, and this panel keeps it distinct: what was recorded, which taxon,
     when, where, from which source, and a route from observation → taxon. It
     shows only fields GBIF actually returns; it invents nothing. */
  if (ctx.kind === "OBSERVATION") {
    const { observation: ob } = ctx;
    const o = ob.occurrence;
    const p = ob.provenance;
    return (
      <div className="ctx">
        {head(o.commonName || ob.taxon.label, OBSERVATION_LABEL, ob.id)}
        <div className="ctx-body">
          <div className="sec">
            <div className="sec-h">
              <span>WHAT WAS RECORDED</span>
              <Stat s="LIVE" />
            </div>
            <div className="sec-body">
              <div className="hrow">
                <span>Taxon (as recorded)</span>
                <span style={{ color }}>{o.scientificName}</span>
              </div>
              <div className="hrow">
                <span>Observed</span>
                <span style={{ color }}>{o.eventDate || "DATE NOT GIVEN"}</span>
              </div>
              <div className="hrow">
                <span>Location</span>
                <span style={{ color }}>
                  {Math.abs(o.lat).toFixed(3)}°{o.lat >= 0 ? "N" : "S"}{" "}
                  {Math.abs(o.lng).toFixed(3)}°{o.lng >= 0 ? "E" : "W"}
                </span>
              </div>
              <div className="hrow">
                <span>4PLANET checked</span>
                <span style={{ opacity: 0.7 }}>{timeAgo(p.checkedAt)}</span>
              </div>
              <div className="note-box" style={{ color }}>
                {OBSERVATION_CAVEAT}
              </div>
              {p.sourceUrl && (
                <div className="src-line">
                  <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer">
                    See this record at GBIF ↗
                  </a>
                </div>
              )}
              <Source ids={["gbif"]} />
              {/* Honest about what we do NOT have from the source. Brief §29. */}
              <div className="foot" style={{ marginTop: 10, lineHeight: 1.7 }}>
                COORDINATE UNCERTAINTY · NOT CHECKED — SENSITIVITY / OBFUSCATION ·
                NOT CHECKED. 4PLANET does not yet read these fields from the source
                record.
              </div>
            </div>
          </div>

          {tierControls({ hasDeeper: false })}

          {/* observation → taxon → relationship context */}
          <Tier min={UNDERSTAND}>
            <Section title="THIS IS A RECORD OF" status="LIVE" note=" ">
              <Li
                color={TYPE_COLOR.TAXON}
                name={ob.taxon.label}
                sub={ob.taxon.sub}
                onClick={() => onOpen(ob.taxon.id)}
              />
            </Section>
          </Tier>
        </div>
      </div>
    );
  }

  /* ── PRESSURE → SOLUTION → MISSION ─────────────────────────────────────── */
  if (ctx.kind === "PRESSURE") {
    const p = ctx.pressure;
    const sols = p.solutionIds.map(solutionById).filter(Boolean) as Solution[];
    return (
      <div className="ctx">
        {head(p.name, "Pressure", p.id)}
        <div className="ctx-body">
          <div className="sec">
            <div className="sec-h">
              <span>WHAT THIS IS</span>
              <Stat s="SEEDED" />
            </div>
            <div className="sec-body">
              <p className="prose">{p.body}</p>
            </div>
          </div>

          <Section title="WHAT IT AFFECTS" status="SEEDED" note=" ">
            {p.affects.map((id) => {
              const n = nodeById(id) ?? systemById(id);
              const label = (n as any)?.label ?? (n as any)?.name ?? id;
              return (
                <Li
                  key={id}
                  color={TYPE_COLOR[typeOf(id)] ?? "#fff"}
                  name={label}
                  sub={KIND_LABEL[typeOf(id)]}
                  onClick={() => onOpen(id)}
                />
              );
            })}
          </Section>

          <Section
            title="WHAT MAY HELP"
            status={sols.length ? "SEEDED" : "NO_COVERAGE"}
            note={
              sols.length
                ? "Solution pathways 4PLANET has seeded against this pressure. A pathway is not a proven solution, and 4PLANET has not run an evidence assessment. Maturity, evidence strength and applicability are three separate axes and are shown separately."
                : undefined
            }
          >
            {sols.map((s) => (
              <Li
                key={s.id}
                color={TYPE_COLOR.SOLUTION}
                name={s.name}
                sub={`${s.maturity} · EVIDENCE ${s.evidenceStrength}`}
                why={s.body}
                onClick={() => onOpen(s.id)}
              />
            ))}
          </Section>
        </div>
      </div>
    );
  }

  if (ctx.kind === "SOLUTION") {
    const s = ctx.solution;
    const missions = (s.missionIds ?? []).map(missionById).filter(Boolean) as Mission[];
    return (
      <div className="ctx">
        {head(s.name, "Solution pathway", s.id)}
        <div className="ctx-body">
          <div className="sec">
            <div className="sec-h">
              <span>HOW IT WORKS</span>
              <Stat s="SEEDED" />
            </div>
            <div className="sec-body">
              <p className="prose">{s.body}</p>
              {/* Brief §43: never collapse three axes into one badge. */}
              <div className="axes">
                <div className="axis">
                  <div className="ak">MATURITY</div>
                  <div className="av" style={{ color: TYPE_COLOR.SOLUTION }}>
                    {s.maturity}
                  </div>
                </div>
                <div className="axis">
                  <div className="ak">EVIDENCE</div>
                  <div className="av" style={{ color: "#FF7D50" }}>
                    {s.evidenceStrength}
                  </div>
                </div>
                <div className="axis">
                  <div className="ak">APPLICABILITY</div>
                  <div className="av" style={{ opacity: 0.8 }}>
                    {s.applicability.replace(/_/g, " ")}
                  </div>
                </div>
              </div>
              <div className="note-box" style={{ color: "#FF7D50" }}>
                These labels are 4PLANET's seeded assessment. They require a published methodology
                before they can carry authority, and they do not have one yet.
              </div>
            </div>
          </div>

          <Section title="KNOWN LIMITATIONS" status="SEEDED" note=" ">
            <p className="prose" style={{ fontSize: 12.5 }}>
              {s.limitations}
            </p>
          </Section>

          {s.actors && s.actors.length > 0 && (
            <Section title="WHO IMPLEMENTS IT" status="SEEDED" note=" ">
              {s.actors.map((a) => (
                <Li key={a} color="#fff" name={a} />
              ))}
            </Section>
          )}

          {missions.length > 0 && (
            <Section
              title="4PLANET MISSION CONNECTION"
              status="SEEDED"
              note="A MISSION IS NOT THE SOLUTION. 4PLANET does not implement this pathway. A mission exists to accelerate, fund, connect or make visible work that other actors do."
            >
              {missions.map((m) => (
                <div key={m.id} style={{ marginTop: 4 }}>
                  <Li
                    color="#fff"
                    name={m.name}
                    sub={`4PLANET MISSION · ${m.status}`}
                    why={m.accelerates}
                    onClick={() => onOpen(m.id)}
                  />
                </div>
              ))}
            </Section>
          )}
        </div>
      </div>
    );
  }

  if (ctx.kind === "MISSION") {
    const m = ctx.mission;
    return (
      <div className="ctx">
        {head(m.name, "4PLANET mission", m.id)}
        <div className="ctx-body">
          <Section title="HOW 4PLANET ACCELERATES" status="SEEDED" note=" ">
            <p className="prose">{m.accelerates}</p>
          </Section>

          {/* Brief §57 + §58. This is the honest end of the chain, and it stops here. */}
          <Section title="EXPECTED OUTCOME" status="NOT_CHECKED" note={m.expectedOutcome} />
          <Section title="PROOF PATH" status="NOT_CHECKED" note={m.proofPath} />

          <div className="note-box" style={{ color: "#FF4D22", marginTop: 16 }}>
            No payment is available for this mission and none will be until an implementation
            partner and a proof pathway are real. The architecture from pressure to solution to
            mission exists. The outcome does not, and 4PLANET will not invent one to make the
            interface feel finished.
          </div>

          <Link to={m.href}>
            <button className="follow-btn" style={{ color: "#fff" }}>
              <span>OPEN MISSION →</span>
            </button>
          </Link>
        </div>
      </div>
    );
  }

  /* ── LEGACY_POINT (V39.1 Scope 01 / V40 — legacy layer click, one surface) ─ */
  if (ctx.kind === "LEGACY_POINT") {
    const c = ctx.accent || color;
    return (
      <div className="ctx">
        {head(ctx.title, ctx.sub, undefined)}
        <div className="ctx-body">
          <div className="sec">
            <div className="sec-h">
              <span>ON THE MAP</span>
              {/* V40 temporal correction: a legacy record is NOT labelled LIVE.
                  A successful request is not a live or recent record. */}
              <span className="stat" style={{ opacity: 0.75 }}>RETRIEVED</span>
            </div>
            <div className="sec-body">
              {ctx.commonName && (
                <div className="hrow"><span>Common name</span><span style={{ color: c }}>{ctx.commonName}</span></div>
              )}
              {ctx.scientificName && (
                <div className="hrow"><span>As recorded</span><span style={{ color: c }}>{ctx.scientificName}</span></div>
              )}
              <div className="hrow">
                <span>Location</span>
                <span style={{ color: c }}>
                  {Math.abs(ctx.lat).toFixed(3)}°{ctx.lat >= 0 ? "N" : "S"}{" "}
                  {Math.abs(ctx.lng).toFixed(3)}°{ctx.lng >= 0 ? "E" : "W"}
                </span>
              </div>
              <div className="hrow"><span>Source</span><span style={{ opacity: 0.7 }}>{ctx.sourceLabel}</span></div>
              {ctx.planetaryContext && (
                <div className="hrow"><span>Class</span><span style={{ opacity: 0.7 }}>PLANETARY CONTEXT</span></div>
              )}
            </div>
          </div>

          {/* V40 temporal correction: source access, recorded time and retrieval
              are separate facts. None of them is "live". */}
          <div className="sec">
            <div className="sec-h"><span>WHEN</span></div>
            <div className="sec-body">
              <div className="hrow"><span>Source access</span><span style={{ opacity: 0.75 }}>REQUEST RETURNED</span></div>
              <div className="hrow">
                <span>Recorded / observed</span>
                <span style={{ color: ctx.observedDate ? c : undefined, opacity: ctx.observedDate ? 1 : 0.6 }}>
                  {ctx.observedDate || "UNKNOWN FROM SOURCE"}
                </span>
              </div>
              <div className="hrow"><span>Retrieved</span><span style={{ opacity: 0.75 }}>THIS SESSION</span></div>
              <div className="note-box">
                A successful network request does not make the underlying record live or
                recent. 4PLANET is showing what the source returned, when it happened
                (where the source says so), and that it was fetched this session — nothing more.
              </div>
            </div>
          </div>

          {/* Legacy preview parity: preserve the source-rendered detail the old V36
              popup showed (dates, magnitude, altitude, velocity, links) — verbatim
              from the source layer, inventing nothing. */}
          {ctx.previewHtml && (
            <div className="sec">
              <div className="sec-h"><span>FROM THE SOURCE</span></div>
              <div className="sec-body">
                <div className="legacy-preview" dangerouslySetInnerHTML={{ __html: ctx.previewHtml }} />
              </div>
            </div>
          )}

          {(ctx.gbifKey || ctx.aphiaId) && (
            <div className="sec">
              <div className="sec-h"><span>SOURCE LINKS</span></div>
              <div className="sec-body">
                {ctx.gbifKey && (
                  <div className="src-line">
                    <a href={`https://www.gbif.org/species/${ctx.gbifKey}`} target="_blank" rel="noopener noreferrer">
                      GBIF species record ↗
                    </a>
                  </div>
                )}
                {ctx.aphiaId && (
                  <div className="src-line">
                    <a
                      href={`https://www.marinespecies.org/aphia.php?p=taxdetails&id=${ctx.aphiaId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      WoRMS / AphiaID authority ↗
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="sec">
            <div className="sec-body">
              <div className="note-box">
                This is a point drawn from a source layer, shown here rather than in a
                floating popup so the whole product stays one surface. 4PLANET has not
                resolved it to a canonical entity — no reviewed identity, evidence status
                or place membership yet.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── COORDINATE (V36's "WHAT IS HAPPENING HERE", now a first-class object) ─ */
  if (ctx.kind === "COORDINATE") {
    const { lat, lng, life, signals } = ctx;
    return (
      <div className="ctx">
        {head(
          `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? "N" : "S"} ${Math.abs(lng).toFixed(2)}°${
            lng >= 0 ? "E" : "W"
          }`,
          "What is happening here",
        )}
        <div className="ctx-body">
          <Section
            title="LIFE RECORDED NEARBY"
            status={life.status}
            note={
              life.status === "LIVE"
                ? "GBIF records within roughly 40 km of this point."
                : undefined
            }
          >
            {life.value && (
              <>
                <div className="hrow">
                  <span>Occurrence records</span>
                  <span style={{ color: TYPE_COLOR.TAXON }}>
                    {life.value.total.toLocaleString()}
                  </span>
                </div>
                {life.value.names.length > 0 && (
                  <div className="foot" style={{ marginTop: 8, lineHeight: 1.7 }}>
                    {life.value.names.slice(0, 8).join(" · ")}
                  </div>
                )}
                <Source ids={["gbif"]} />
              </>
            )}
          </Section>

          <Section
            title="SIGNALS NEARBY"
            status={signals.status}
            note={
              signals.status === "NO_RECORDS"
                ? "No open natural event or recorded earthquake within 400 km. Nothing here does not mean nothing is here — it means no source 4PLANET reads reported anything in this window."
                : undefined
            }
          >
            {signals.value?.map((s) => (
              <Li
                key={s.id}
                color={TYPE_COLOR.SIGNAL}
                name={s.title}
                sub={`${CLASS_LABEL[s.cls]} · ${Math.round(s.distanceKm)} km`}
                why={s.summary}
                end={timeAgo(s.provenance.occurredAt)}
                onClick={() => onOpen(s.id)}
              />
            ))}
          </Section>
        </div>
      </div>
    );
  }

  return null;
};

/* Re-exported so World can build lists without importing the whole graph. */
export { PRESSURES, SOLUTIONS, MISSIONS, KIND_LABEL };
