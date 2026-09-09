/* ═══════════════════════════════════════════════════════════════════════════
   4PLANET_ BRAIN TAXON REGISTRY — TEST PERSISTENCE

   This is the thin identity/crosswalk layer between 4PLANET products and
   external taxonomic authorities. External authorities remain authoritative
   for taxonomy and biological facts. The registry owns only 4PLANET identity,
   crosswalks, provenance timestamps and continuity.

   Persistence boundary
   --------------------
   The current TEST implementation persists in browser localStorage because the
   repository has no shared BRAIN datastore binding yet. This is deliberately
   labelled TEST_BROWSER. The contract is datastore-agnostic so a future shared
   BRAIN service can replace this adapter without changing SPECIES/LENS/ATLAS.
   ═══════════════════════════════════════════════════════════════════════════ */

export type TaxonRegistryPersistenceScope = "TEST_BROWSER" | "BRAIN_SHARED";

export interface TaxonRegistryExternalIds {
  colXr?: string;
  legacyGbif?: number;
  artsdatabankenTaxonId?: number;
  artsdatabankenScientificNameId?: number;
  wormsAphiaId?: number;
  openTreeOttId?: number;
}

export interface TaxonRegistryRecord {
  id: string;
  schemaVersion: 1;
  persistenceScope: TaxonRegistryPersistenceScope;
  canonicalName: string;
  scientificName: string;
  rank: string;
  status?: string;
  externalIds: TaxonRegistryExternalIds;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterTaxonInput {
  canonicalName: string;
  scientificName: string;
  rank: string;
  status?: string;
  externalIds: TaxonRegistryExternalIds;
}

const STORAGE_KEY = "4planet.brain.taxon-registry.v1";

const hasWindow = () => typeof window !== "undefined" && Boolean(window.localStorage);

function makeId(): string {
  const uuid = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
  return `taxon:4p:${uuid}`;
}

function readAll(): TaxonRegistryRecord[] {
  if (!hasWindow()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((row): row is TaxonRegistryRecord =>
      Boolean(row && typeof row.id === "string" && row.schemaVersion === 1),
    );
  } catch {
    return [];
  }
}

function writeAll(records: TaxonRegistryRecord[]) {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // Fail closed: profile materialisation can continue with external identity.
  }
}

function sameTaxon(record: TaxonRegistryRecord, input: RegisterTaxonInput): boolean {
  if (input.externalIds.colXr && record.externalIds.colXr === input.externalIds.colXr) return true;
  return record.canonicalName.toLowerCase() === input.canonicalName.toLowerCase()
    && record.rank.toUpperCase() === input.rank.toUpperCase();
}

/**
 * Resolve or create one thin 4PLANET identity record.
 * Returns null outside a browser or when persistence is unavailable.
 */
export function registerOrResolveTaxon(input: RegisterTaxonInput): TaxonRegistryRecord | null {
  if (!hasWindow()) return null;
  const records = readAll();
  const existingIndex = records.findIndex((record) => sameTaxon(record, input));
  const timestamp = new Date().toISOString();

  if (existingIndex >= 0) {
    const previous = records[existingIndex];
    const next: TaxonRegistryRecord = {
      ...previous,
      canonicalName: input.canonicalName,
      scientificName: input.scientificName,
      rank: input.rank.toUpperCase(),
      status: input.status,
      externalIds: {
        ...previous.externalIds,
        ...Object.fromEntries(Object.entries(input.externalIds).filter(([, value]) => value !== undefined)),
      },
      updatedAt: timestamp,
    };
    records[existingIndex] = next;
    writeAll(records);
    return next;
  }

  const created: TaxonRegistryRecord = {
    id: makeId(),
    schemaVersion: 1,
    persistenceScope: "TEST_BROWSER",
    canonicalName: input.canonicalName,
    scientificName: input.scientificName,
    rank: input.rank.toUpperCase(),
    status: input.status,
    externalIds: input.externalIds,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  records.push(created);
  writeAll(records);
  return created;
}

export function getTaxonRegistryRecord(id: string): TaxonRegistryRecord | null {
  return readAll().find((record) => record.id === id) ?? null;
}

export function listTaxonRegistryRecords(): TaxonRegistryRecord[] {
  return readAll();
}

export function clearTestTaxonRegistry() {
  if (!hasWindow()) return;
  window.localStorage.removeItem(STORAGE_KEY);
}
