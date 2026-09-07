#!/usr/bin/env node

import fs from 'node:fs';

const REGISTRY = 'docs/control/PRODUCT_SURFACE_REGISTRY.json';
const HEIR = 'ce532830640817f83c11923bdfb4c394f222baad';
const ATLAS = '118abbb1695b072fe3d6687a3c51ed984d510243';

const spec = {
  '4PLANET': { slug: '', branch: 'sandbox/4planet', sha: HEIR, liveReview: '/live', liveOrigin: '/', heirCanonical: '/heir', sandboxReview: '/sandbox' },
  'ATLAS': { slug: 'atlas', branch: 'sandbox/atlas', sha: ATLAS, liveReview: '/atlas/live', liveOrigin: '/atlas', heirCanonical: '/atlas/heir', sandboxReview: '/atlas/sandbox', donor: { donor_pr: 263, donor_branch: 'work/atlas-zero-loss-gold-convergence-01' } },
  'SPECIES': { slug: 'species', branch: 'sandbox/species', sha: HEIR, liveReview: '/species/live', liveOrigin: '/species', heirCanonical: '/species/heir', sandboxReview: '/species/sandbox' },
  'LIVING_SYSTEMS': { slug: 'living-systems', branch: 'sandbox/living-systems', sha: HEIR, liveReview: '/living-systems/live', liveOrigin: '/living-systems', heirCanonical: '/living-systems/heir', sandboxReview: '/living-systems/sandbox' },
  'ORCA': { slug: 'orca', branch: 'sandbox/orca', sha: HEIR, liveReview: '/orca/live', liveOrigin: '/species/orca', heirCanonical: '/orca/heir', sandboxReview: '/orca/sandbox' },
  'AMAZONIA': { slug: 'amazonia', branch: 'sandbox/amazonia', sha: HEIR, liveReview: '/amazonia/live', liveOrigin: '/missions/am4zonia', heirCanonical: '/amazonia/heir', sandboxReview: '/amazonia/sandbox' },
  'OSLOFJORD': { slug: 'oslofjord', branch: 'sandbox/oslofjord', sha: HEIR, liveReview: '/oslofjord/live', liveOrigin: '/living-systems/oslofjord', heirCanonical: '/oslofjord/heir', sandboxReview: '/oslofjord/sandbox' },
  'IMPACT': { slug: 'impact', branch: 'sandbox/impact', sha: HEIR, liveReview: '/impact/live', liveOrigin: '/impact', heirCanonical: '/impact/heir', sandboxReview: '/impact/sandbox' },
  'MAGAZINE': { slug: 'magazine', branch: 'sandbox/magazine', sha: HEIR, liveReview: '/magazine/live', liveOrigin: '/', heirCanonical: '/magazine/heir', sandboxReview: '/magazine/sandbox', donor: { zero_loss_donors: [{ branch: 'recovery/testking-magazine', sha: '17e5c96c0ba2bb10ca2d02690fc44d43ed62e1f0', pr: 162, state: 'READ_ONLY_DONOR_RECONCILIATION_REQUIRED' }] } },
  'S4PIENS': { slug: 's4piens', branch: 'sandbox/s4piens', sha: HEIR, liveReview: '/s4piens/live', liveOrigin: '/', heirCanonical: '/s4piens/heir', sandboxReview: '/s4piens/sandbox' },
  '4SAPIEN': { slug: '4sapien', branch: 'sandbox/4sapien', sha: HEIR, liveReview: '/4sapien/live', liveOrigin: null, heirCanonical: '/4sapien/heir', sandboxReview: '/4sapien/sandbox' },
  'FOOD': { slug: 'food', branch: 'sandbox/food', sha: HEIR, liveReview: '/food/live', liveOrigin: '/food', heirCanonical: '/food/heir', sandboxReview: '/food/sandbox' },
  'CRE4TORS': { slug: 'cre4tors', branch: 'sandbox/cre4tors', sha: HEIR, liveReview: '/cre4tors/live', liveOrigin: '/', heirCanonical: '/cre4tors/heir', sandboxReview: '/cre4tors/sandbox' },
  'MARKET': { slug: 'market', branch: 'sandbox/market', sha: HEIR, liveReview: '/market/live', liveOrigin: '/', heirCanonical: '/market/heir', sandboxReview: '/market/sandbox' },
  'ACTORS': { slug: 'actors', branch: 'sandbox/actors', sha: HEIR, liveReview: '/actors/live', liveOrigin: '/actors', heirCanonical: '/actors/heir', sandboxReview: '/actors/sandbox' }
};

const registry = JSON.parse(fs.readFileSync(REGISTRY, 'utf8'));
const actual = Object.keys(registry.products || {}).sort();
const expected = Object.keys(spec).sort();
if (JSON.stringify(actual) !== JSON.stringify(expected)) {
  throw new Error(`Product registry scope changed. expected=${expected.join(',')} actual=${actual.join(',')}`);
}

registry.effective_date = '2026-09-07';
registry.control_state = 'UNIVERSAL_LIVE_HEIR_SANDBOX_ZERO_LOSS';
registry.route_law = {
  canonical_pattern: 'https://test.4planet.org/<product>/{live|heir|sandbox}',
  legacy_heir_shortcuts_preserved: true,
  root_product_paths: { live: '/live', heir: '/heir', sandbox: '/sandbox' },
  unreleased_live_behavior: 'VISIBLE_TRUTHFUL_UNRELEASED_STATE_NEVER_MIRROR_OR_FAKE'
};
registry.activation = {
  ...(registry.activation || {}),
  control_branch: 'control/universal-live-heir-sandbox-01',
  control_parent_sha: HEIR,
  all_unregistered_user_facing_branches: 'QUARANTINE_PENDING_ARCHIVE_READ_ONLY_DONOR_ZERO_AUTHORITY',
  new_user_facing_sandbox_requires_registry_entry_before_first_material_mutation: true,
  new_user_facing_idea_requires_registry_entry_before_first_material_mutation: true,
  sandbox_sha_rule: 'REGISTRY_SHA_IS_REGISTRATION_EVIDENCE_NOT_SELF_REFERENTIAL_MOVING_HEAD; CURRENT_HEAD_COMES_FROM_GIT_AND_DEPLOY_READBACK',
  zero_loss_cleanup_rule: 'NO_BRANCH_DELETION_BEFORE_PRODUCT_SCOPED_UNIQUE_VALUE_DISPOSITION_AND_ROLLBACK_PRESERVATION'
};

for (const [product, cfg] of Object.entries(spec)) {
  const record = registry.products[product];
  record.live = { ...(record.live || {}), review_path: cfg.liveReview, origin_path: cfg.liveOrigin };
  record.heir = { ...(record.heir || {}), canonical_review_path: cfg.heirCanonical };
  record.sandbox = {
    branch: cfg.branch,
    sha_at_registration: cfg.sha,
    pr: null,
    review_path: cfg.sandboxReview,
    origin_path: record.heir.origin_path,
    lineage_state: product === 'ATLAS'
      ? 'CANONICAL_SANDBOX_ADOPTED_FROM_REGISTERED_ZERO_LOSS_CANDIDATE'
      : product === 'MAGAZINE'
        ? 'CANONICAL_SANDBOX_BASELINE_FROM_HEIR_RECOVERY_BRANCH_PRESERVED_AS_DONOR'
        : 'CANONICAL_SANDBOX_BASELINE_FROM_HEIR',
    live_authority: false,
    ...(cfg.donor || {})
  };
}

const branches = new Set();
const paths = new Set();
for (const [product, record] of Object.entries(registry.products)) {
  if (!record.sandbox?.branch || !record.sandbox?.review_path) throw new Error(`${product} missing sandbox`);
  if (branches.has(record.sandbox.branch)) throw new Error(`duplicate sandbox branch ${record.sandbox.branch}`);
  branches.add(record.sandbox.branch);
  for (const p of [record.live.review_path, record.heir.canonical_review_path, record.sandbox.review_path]) {
    if (!p) throw new Error(`${product} missing canonical review path`);
    if (paths.has(p)) throw new Error(`duplicate canonical review path ${p}`);
    paths.add(p);
  }
}

fs.writeFileSync(REGISTRY, JSON.stringify(registry, null, 2) + '\n');
console.log(`Universal product surface registry written: ${Object.keys(registry.products).length} products / ${branches.size} sandboxes`);
