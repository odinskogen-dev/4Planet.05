/* ═══════════════════════════════════════════════════════════════════════════
   4PLANET_ — PRODUCT ADAPTATION LAYER — TYPES
   ───────────────────────────────────────────────────────────────────────────
   STATUS: ADAPTATION. NOT CANON.

   Master Construction Brief §80 / Mandate "PRODUCT AND TECHNICAL BOUNDARY":
   Claude may not independently lock the final Ontology, Source Contract,
   Source Record Contract or Signal Contract. Those are locked in BUILD 02 by
   GPT synthesis under founder authority.

   This file is the *minimum* shared shape the v1 Earth interface needs in
   order to stop V36's four unrelated API blobs from behaving like four
   unrelated worlds. It is deliberately:

     - SMALL           (one file, no framework, no persistence engine)
     - HONEST          (every record carries source + status + time)
     - REPLACEABLE     (all UI reads these types; swap the impl, keep the UI)

   Where a concept below is weaker than the Brief, that is intentional and
   recorded in src/planet/ADAPTATION.md. Do not promote it to canon by reuse.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── IDENTITY ────────────────────────────────────────────────────────────── */

/** Canonical-shaped entity id. Brief §24: source ids are preserved, not replaced. */
export type EntityId = string; // "taxon:gbif:2440728" | "place:4p:bergen" | ...

export type EntityType =
  | "TAXON"
  | "PLACE"
  | "LIVING_SYSTEM"
  | "SIGNAL"
  | "OBSERVATION"
  | "PRESSURE"
  | "SOLUTION"
  | "MISSION"
  | "COORDINATE"
  | "UNKNOWN";

export interface EntityRef {
  id: EntityId;
  type: EntityType;
  /** Human-facing name. Common name where one exists. */
  label: string;
  /** Secondary line: scientific name, place type, system kind. */
  sub?: string;
}

/* ── TRUTH ARCHITECTURE ──────────────────────────────────────────────────── */

/**
 * Brief §29 "COVERAGE IS PART OF TRUTH" + §31 truth architecture.
 * Every section of every panel must be able to say which of these it is.
 * There is no default. Silence is not zero.
 */
export type DataStatus =
  | "LIVE" // fetched from a real source in this session
  | "LOADING"
  | "NO_RECORDS" // source answered, and returned nothing. NOT "nothing is there".
  | "NOT_CHECKED" // we did not ask. NOT zero.
  | "NO_COVERAGE" // no source in the system covers this question
  | "SOURCE_UNAVAILABLE" // we asked, the source failed
  | "SEEDED" // 4PLANET prototype content. NOT source data. NOT verified.
  | "PLANNED"; // connector designed, not wired

/** Brief §31: never silently collapse source data and 4PLANET interpretation. */
export type Interpretation =
  | "SOURCE_RECORD" // came from an external source, unmodified in meaning
  | "PRODUCT_ADAPTATION" // 4PLANET normalised/derived it for the interface
  | "SEEDED_PROTOTYPE"; // 4PLANET authored it. Evidence pending.

export type Confidence = "HIGH" | "MEDIUM" | "LOW" | "INSUFFICIENT";

export interface Provenance {
  /** Source id from src/planet/sources.ts */
  sourceId: string;
  /** The source's own record id, preserved. Brief §22 SOURCE RECORD. */
  sourceRecordId?: string;
  /** Deep link to the record at the source, where one exists. */
  sourceUrl?: string;
  interpretation: Interpretation;
  confidence?: Confidence;
  /** Brief §27: these are different times and must not be collapsed. */
  occurredAt?: string; // when the thing happened in the world
  sourcePublishedAt?: string; // when the source published it
  checkedAt: string; // when 4PLANET last asked
}

/** A section of a context panel, with its own honest status. */
export interface Field<T> {
  status: DataStatus;
  value: T | null;
  /** Why this status. Shown to the user when the status is not LIVE. */
  note?: string;
  provenance?: Provenance;
}

export const field = <T>(
  status: DataStatus,
  value: T | null = null,
  note?: string,
  provenance?: Provenance,
): Field<T> => ({ status, value, note, provenance });

/* ── SIGNAL (ADAPTATION SHAPE — Brief §38) ───────────────────────────────── */

/**
 * Only these signal classes are supported in v1, and only because a real event
 * feed backs each one. Brief §95 FIRST INTEGRATED PROOF names FIRE ACTIVITY,
 * FOREST/VEGETATION DISTURBANCE and SPECIES OBSERVATION.
 *
 * P0 (V38R): SPECIES OBSERVATION is NOT in this enum. Brief §31: OBSERVATION ≠
 * SIGNAL. A GBIF occurrence is an Observation and stays one (see ObservationItem
 * in the WATCH types). It is never minted as a Signal to fit the interface.
 *
 * FIRE + NATURAL_EVENT come from EONET; SEISMIC from USGS. FOREST_DISTURBANCE is
 * a raster layer (GFW) with no per-event feed, so it is not a Signal — a
 * documented §95 gap. See ADAPTATION.md.
 */
export type SignalClass =
  | "FIRE_ACTIVITY"
  | "NATURAL_EVENT"
  | "SEISMIC";

/**
 * Brief §39: ALERT is a promoted *state* of a Signal, not an entity.
 * v1 promotes nothing. We have no methodology, so we claim none.
 */
export type SignalSignificance = "UNCLASSIFIED";

export interface Signal {
  id: EntityId; // "signal:eonet:EONET_6234"
  cls: SignalClass;
  title: string;
  summary?: string;
  lat: number;
  lng: number;
  /** Brief §39. Always UNCLASSIFIED in v1. We do not manufacture alarm. */
  significance: SignalSignificance;
  provenance: Provenance;
  /** Entities this signal is *recorded against*, not inferred to affect. */
  about?: EntityRef;
}

/* ── OBSERVATION ─────────────────────────────────────────────────────────── */

/** Brief §22: an Observation is a record. It is not evidence of change. */
export interface Occurrence {
  lat: number;
  lng: number;
  scientificName: string;
  commonName?: string;
  eventDate?: string;
  sourceRecordId?: string;
  sourceUrl?: string;
}

/* ── PLACE ───────────────────────────────────────────────────────────────── */

export interface Place {
  id: EntityId;
  name: string;
  /** Brief §22: a city and a marine region are both Places. Not the same thing. */
  kind: "CITY" | "REGION" | "MARINE_AREA" | "FOREST" | "PROTECTED_AREA" | "COUNTRY";
  lat: number;
  lng: number;
  /** [W, S, E, N] */
  bbox: [number, number, number, number];
  zoom: number;
  /**
   * P0 (V38R): what geometry 4PLANET actually queries for this place.
   * v1 has ONLY bounding boxes. A bbox is a rectangle on a sphere — it is NOT
   * the ecological or administrative boundary of the place, and the UI must not
   * claim it is. A marine bbox necessarily contains coastline and therefore
   * terrestrial records; a city bbox contains surrounding countryside. This
   * field exists so the interface can state, per place, exactly what was asked.
   * When real polygons arrive, add "POLYGON" / "MARINE_POLYGON" and switch here.
   */
  geometryKind: "BOUNDING_BOX";
  /** Local-language / alternate names. Brief §71: global by architecture. */
  altNames?: string[];
  /** Seeded editorial line. Clearly labelled as such in the UI. */
  blurb?: string;
  /** Seeded link into the living-system graph. */
  livingSystemIds?: EntityId[];
  /** Seeded pressures. Labelled SEEDED in the UI. */
  pressureIds?: EntityId[];
}

/* ── LIVING SYSTEMS (SEEDED — Brief §25, §53, §89) ───────────────────────── */

/**
 * Brief §25: "THE GRAPH ITSELF MUST BE SOURCE-AWARE."
 * Every edge below carries an evidence-bearing envelope, even though v1's
 * evidence is a citation string rather than a resolved Evidence entity.
 * This is the seam. When BRAIN exists, Relation becomes a real record.
 */
export interface Relation {
  id: string;
  from: EntityId;
  type:
    | "PERFORMS"
    | "SUPPORTS"
    | "DEPENDS_ON"
    | "OCCURS_IN"
    | "AFFECTS"
    | "ADDRESSES"
    | "ACCELERATES";
  to: EntityId;
  /** Human sentence shown in the UI. */
  claim: string;
  /** Brief §31: status is mandatory. No unmarked ecological claim ships. */
  interpretation: Interpretation;
  confidence: Confidence;
  /** Citation string. v1 has no Evidence entity. Documented in ADAPTATION.md. */
  evidence?: string;
  /**
   * P0 (V38R): ORIGIN and REVIEW are different questions and must not be one field.
   *
   * `origin` answers "why does this edge exist / who constructed it". Odin choosing
   * a proof to build is a PRODUCT DIRECTION decision, not a scientific review.
   */
  origin: "FOUNDER_DIRECTED" | "AI_SEEDED" | "CANON_DERIVED";
  /**
   * `reviewStatus` answers ONLY "has the evidence been reviewed, and by whom".
   * For every prototype relation in v1 this is UNREVIEWED, because it is true.
   * Founder authority is deliberately NOT a value here — a founder directing a
   * proof is not a founder reviewing the science.
   */
  reviewStatus: "UNREVIEWED" | "LITERATURE_CHECKED" | "EXPERT_REVIEWED";
}

export interface Node {
  id: EntityId;
  type: EntityType | "FUNCTION" | "HUMAN_SYSTEM";
  label: string;
  sub?: string;
  /** One-paragraph plain-English explanation for an intelligent non-specialist. */
  body?: string;
}

export interface LivingSystem {
  id: EntityId;
  name: string;
  sub: string;
  body: string;
  /** The primary comprehensible chain. Brief §53: reality is a network; we show a path. */
  chain: EntityId[];
  /** Canonical taxa that anchor this system spatially. */
  anchorTaxa: EntityId[];
  pressureIds: EntityId[];
  /** Places where this system is represented in v1. */
  placeIds?: EntityId[];
}

export interface Pressure {
  id: EntityId;
  name: string;
  body: string;
  affects: EntityId[];
  solutionIds: EntityId[];
}

export interface Solution {
  id: EntityId;
  name: string;
  body: string;
  /** Brief §43: these are three different axes and must not collapse into one badge. */
  maturity: "IDEA" | "PILOT" | "DEPLOYED" | "SCALED";
  evidenceStrength: "INSUFFICIENT" | "EMERGING" | "MODERATE" | "STRONG";
  applicability: "GENERAL" | "CONTEXT_DEPENDENT" | "UNKNOWN";
  addresses: EntityId[];
  limitations: string;
  actors?: string[];
  /** 4PLANET missions that may accelerate this. A Mission is NOT the Solution. */
  missionIds?: EntityId[];
}

export interface Mission {
  id: EntityId;
  name: string;
  /** Route into the existing V36 editorial mission page. */
  href: string;
  /** Brief §56: how 4PLANET accelerates — not what it solves. */
  accelerates: string;
  status: "ARCHITECTURE" | "ACTIVE";
  /** Brief §57: no payment until implementation partner and proof path are real. */
  expectedOutcome: string;
  proofPath: string;
}

/* ── WATCH (Brief §40) ───────────────────────────────────────────────────── */

export interface Follow extends EntityRef {
  addedAt: string;
}

/** Brief §40: WATCH must always be able to answer "WHY AM I SEEING THIS?" */
export type MatchKind =
  | "DIRECT" // you follow this exact entity
  | "PLACE" // this happened in a place you follow
  | "LIVING_SYSTEM" // this is connected to a system you follow
  | "TAXON_IN_PLACE"; // a taxon you follow was recorded in a place you follow

/**
 * P0 (V38R): OBSERVATION ≠ SIGNAL (Brief §31). A WATCH item is one or the other,
 * never an observation dressed up as a signal. The interface can show both
 * classes in one list, but the model keeps them distinct, because a GBIF
 * occurrence ("someone looked and reported") is categorically not a signal
 * ("something changed"). A future aggregation of observations MAY become a
 * candidate signal — but a single occurrence never does.
 */
export type WatchItemClass = "SIGNAL" | "OBSERVATION";

/** An observation carried through WATCH. It stays an Occurrence, with provenance. */
export interface ObservationItem {
  id: EntityId; // "observation:gbif:<recordId>"
  taxon: EntityRef;
  occurrence: Occurrence;
  provenance: Provenance;
}

export interface WatchMatch {
  itemClass: WatchItemClass;
  /** Present when itemClass === "SIGNAL". */
  signal?: Signal;
  /** Present when itemClass === "OBSERVATION". Never converted into a Signal. */
  observation?: ObservationItem;
  follow: Follow;
  kind: MatchKind;
  /** The sentence shown under the item. Never omitted. */
  why: string;
  distanceKm?: number;
  /** When the underlying thing happened, for sorting — regardless of class. */
  occurredAt?: string;
  /** lat/lng for map painting, regardless of class. */
  lat: number;
  lng: number;
}
