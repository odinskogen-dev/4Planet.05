import { expect, test } from '@playwright/test';
import { searchPlaces } from '@/planet/places';
import { searchSystems } from '@/planet/livingSystems';
import { authorityOf, sourceKeyOf, typeOf } from '@/planet/ids';

/**
 * AUTO-PROOF-01B / ATLAS-04
 * Bounded regression proof for the existing typed universal search primitives.
 * This deliberately tests only canonical local entity classes. Live GBIF taxa
 * remain connector-backed and must not be represented as locally complete.
 */
test.describe('ATLAS-04 typed universal search — Proof 01B', () => {
  test('returns canonical PLACE results with stable identity/source semantics', () => {
    const hit = searchPlaces('Oslo')[0];
    expect(hit).toBeTruthy();
    expect(hit.id).toBeTruthy();
    expect(typeOf(hit.id)).toBe('place');
    expect(sourceKeyOf(hit.id)).toBeTruthy();
    expect(authorityOf(hit.id)).toBeTruthy();
  });

  test('returns canonical LIVING_SYSTEM results without collapsing their type', () => {
    const candidates = ['forest', 'ocean', 'reef', 'fjord', 'river', 'wetland'];
    const hit = candidates.flatMap((q) => searchSystems(q))[0];
    expect(hit).toBeTruthy();
    expect(hit.id).toBeTruthy();
    expect(typeOf(hit.id)).not.toBe('place');
    expect(sourceKeyOf(hit.id)).toBeTruthy();
    expect(authorityOf(hit.id)).toBeTruthy();
  });

  test('does not fabricate local coverage for unsupported queries', () => {
    const impossible = '__4planet_proof01b_unsupported_entity__';
    expect(searchPlaces(impossible)).toEqual([]);
    expect(searchSystems(impossible)).toEqual([]);
  });
});
