/**
 * Candidate-only patch on reconstructed original Claude V53 source.
 * No changes to LIVE, original 39, or previously published 18.
 * Only exact, source-selected Premium V1 additions use signed-photo mode.
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const HERO_ANCHOR = '    if (page.hero !== "auto") add({ ...page.hero, source: "4PLANET" });';
const AUTHORITY_ANCHOR = '{page.identity.authorship ? <span> {page.identity.authorship}</span> : null}';
const DRAFT_ANCHOR = '  const draft = page.provenance.review === "DRAFT";';

export function patchClaudeCandidateRenderer(source) {
  assert.equal(source.split(HERO_ANCHOR).length, 2, 'Original Claude hero insertion anchor changed');
  assert.equal(source.split(AUTHORITY_ANCHOR).length, 2, 'Original Claude authority anchor changed');
  assert.equal(source.split(DRAFT_ANCHOR).length, 2, 'Original Claude source provenance anchor changed');
  assert.ok(source.includes('const slides: Slide[] = useMemo('), 'Original Claude premium slideshow missing');
  assert.ok(source.includes('for (const g of live?.gallery ?? [])'), 'Original Claude gallery path missing');

  const signed = '  const signedCandidate = (page.provenance as typeof page.provenance & { founderRelease?: string }).founderRelease === "PREMIUM_V1_2026-10-22";';
  const gate = [
    '    // SOURCE-SIGNED NEW PROFILE ONLY. Preserve original Claude media for every',
    '    // previous published profile. Never add external, unreviewed photos to new',
    '    // species: no Wikipedia lead image, no dynamic Wikicommons/observation gallery.',
    '    if (signedCandidate) {',
    '      return page.hero !== "auto" && !(page.gallery?.length) ? out.slice(0, 1) : [];',
    '    }',
  ].join('\n');
  const safeAuthority = '{page.identity.authorship && (!signedCandidate || !/^Pending authority citation$/i.test(page.identity.authorship.trim())) ? <span> {page.identity.authorship}</span> : null}';

  const patched = source.replace(DRAFT_ANCHOR, DRAFT_ANCHOR+'\n'+signed)
    .replace(HERO_ANCHOR, HERO_ANCHOR+'\n'+gate)
    .replace(AUTHORITY_ANCHOR, safeAuthority);
  assert.equal(patched.split('if (signedCandidate) {').length,2);
  assert.equal(patched.split('!signedCandidate ||').length,2);
  assert.ok(patched.includes('if (leadImage) add('), 'Existing premium lead photo logic removed');
  assert.ok(patched.includes('return out.slice(0, 10);'), 'Existing premium multi-photo experience removed');
  assert.ok(patched.includes('for (const g of page.gallery ?? []) add(g);'), 'Existing gallery path removed');
  return patched;
}

if (process.argv.includes('--apply')) {
  const root=process.env.SPECIES_V53_TREE_ROOT;
  assert.ok(root && path.isAbsolute(root), 'Isolated absolute Claude worktree root required');
  assert.ok(!root.endsWith('/4Planet.05') && !root.endsWith('/king/test'), 'Never modify active receiver');
  const file=path.join(root,'src/pages/integrated/SpeciesTemplate.tsx');
  assert.ok(fs.existsSync(file), 'Exact Claude V53 template absent');
  fs.writeFileSync(file,patchClaudeCandidateRenderer(fs.readFileSync(file,'utf8')));
  console.log('CLAUDE_PREMIUM_NEW_CANDIDATE_PHOTO_AND_AUTHORITY_PATCH_PASS');
}
