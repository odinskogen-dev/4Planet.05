const DEMOTED_PATTERNS = [
  /\bBACKUP\b/i,
  /\bSNAPSHOT\b/i,
  /\bDR\s+SNAPSHOT\b/i,
  /\bSUPERSEDED\b/i,
  /\bARCHIVED?\b/i,
  /\bHISTORICAL\b/i,
];

export const AUTHORITY_ROLES = Object.freeze([
  'FOUNDER_DECISION',
  'PROJECT_LEAD_CURRENT',
  'ACTIVE_TASKS',
  'ATOMIC_CURRENT_STATE',
  'MANDATORY_OPERATING_RULES',
  'PRODUCT_AUTHORITY',
  'LIVE_MANIFEST',
]);

export const MUTABLE_ROLES = new Set([
  'PROJECT_LEAD_CURRENT',
  'ACTIVE_TASKS',
  'ATOMIC_CURRENT_STATE',
  'PRODUCT_AUTHORITY',
  'LIVE_MANIFEST',
  'GITHUB_HEIR',
  'GITHUB_SANDBOX',
  'FACTORY_RUNTIME',
]);

const ROLE_PRIORITY = Object.freeze({
  FOUNDER_DECISION: 1000,
  MANDATORY_OPERATING_RULES: 950,
  PROJECT_LEAD_CURRENT: 900,
  ACTIVE_TASKS: 875,
  ATOMIC_CURRENT_STATE: 850,
  PRODUCT_AUTHORITY: 825,
  LIVE_MANIFEST: 800,
  GIGA_CONSTITUTION: 775,
  PRODUCT_HOME: 700,
  GOLD_CONTRACT: 675,
  PROTOTYPE_SAFE: 650,
  GITHUB_HEIR: 900,
  GITHUB_SANDBOX: 850,
  FACTORY_RUNTIME: 850,
  SUPPORTING_EVIDENCE: 500,
  HISTORY: 100,
});

function text(value) {
  return typeof value === 'string' ? value : '';
}

function candidateText(candidate) {
  return [candidate.title, candidate.name, candidate.path, candidate.status, candidate.classification]
    .map(text)
    .filter(Boolean)
    .join(' ');
}

export function isDemotedCandidate(candidate) {
  if (candidate.authority === false || candidate.current === false || candidate.superseded === true || candidate.archived === true) return true;
  return DEMOTED_PATTERNS.some((pattern) => pattern.test(candidateText(candidate)));
}

export function authorityScore(candidate) {
  const role = candidate.role ?? 'SUPPORTING_EVIDENCE';
  const base = ROLE_PRIORITY[role] ?? 0;
  const demotion = isDemotedCandidate(candidate) ? -10000 : 0;
  const explicitCurrent = candidate.current === true ? 100 : 0;
  const explicitAuthority = candidate.authority === true ? 100 : 0;
  const semantic = Number.isFinite(candidate.semanticScore) ? Math.max(-1, Math.min(1, candidate.semanticScore)) : 0;
  // Semantic relevance can break ties inside the same authority class, never outrank authority/demotion.
  return base + explicitCurrent + explicitAuthority + semantic + demotion;
}

function compareCandidates(a, b) {
  const score = authorityScore(b) - authorityScore(a);
  if (score !== 0) return score;
  const aRevision = text(a.revision);
  const bRevision = text(b.revision);
  if (aRevision !== bRevision) return bRevision.localeCompare(aRevision);
  return text(a.id).localeCompare(text(b.id));
}

export function selectAuthorityCandidates(candidates) {
  const grouped = new Map();
  for (const candidate of candidates) {
    const role = candidate.role ?? 'SUPPORTING_EVIDENCE';
    if (!grouped.has(role)) grouped.set(role, []);
    grouped.get(role).push(candidate);
  }

  const selected = [];
  const demoted = [];
  const contradictions = [];

  for (const [role, items] of grouped) {
    const ordered = [...items].sort(compareCandidates);
    const winner = ordered[0];
    if (winner && !isDemotedCandidate(winner)) selected.push(winner);

    for (const item of ordered.slice(winner && !isDemotedCandidate(winner) ? 1 : 0)) demoted.push(item);

    const currentAuthorities = ordered.filter((item) => item.authority === true && item.current === true && !isDemotedCandidate(item));
    if (currentAuthorities.length > 1) {
      const fingerprints = new Set(currentAuthorities.map((item) => `${text(item.revision)}|${text(item.sha)}|${text(item.id)}`));
      if (fingerprints.size > 1) {
        contradictions.push({ role, code: 'MULTIPLE_CURRENT_AUTHORITIES', ids: currentAuthorities.map((item) => item.id) });
      }
    }
  }

  return { selected: selected.sort(compareCandidates), demoted, contradictions };
}

export function compileAuthorityContext({
  requestId,
  candidates,
  requiredRoles = AUTHORITY_ROLES,
  compiledAt,
  previousPack = null,
}) {
  if (!Array.isArray(candidates) || candidates.length === 0) throw new Error('CURRENT BRAIN READ REQUIRED');
  if (!text(compiledAt)) throw new Error('compiledAt is required for mutable-state revalidation');

  const { selected, demoted, contradictions } = selectAuthorityCandidates(candidates);
  const selectedByRole = new Map(selected.map((item) => [item.role ?? 'SUPPORTING_EVIDENCE', item]));
  const missing = requiredRoles.filter((role) => !selectedByRole.has(role));

  const staleMutable = selected.filter((item) => MUTABLE_ROLES.has(item.role) && item.freshVerifiedAt !== compiledAt);
  const unknowns = [
    ...missing.map((role) => ({ code: 'MISSING_REQUIRED_AUTHORITY', role })),
    ...staleMutable.map((item) => ({ code: 'MUTABLE_STATE_REVALIDATION_REQUIRED', role: item.role, id: item.id })),
  ];

  const pack = {
    schemaVersion: 1,
    status: missing.length || contradictions.length || staleMutable.length ? 'FAIL_CLOSED' : 'VERIFIED_CONTEXT_PACK',
    requestId,
    compiledAt,
    authority: selected.map((item) => ({
      id: item.id,
      role: item.role,
      title: item.title,
      revision: item.revision ?? null,
      sha: item.sha ?? null,
      source: item.source ?? null,
      contentRef: item.contentRef ?? null,
      freshVerifiedAt: item.freshVerifiedAt ?? null,
    })),
    contradictions,
    unknowns,
    demoted: demoted.map((item) => ({ id: item.id, role: item.role, title: item.title, reason: 'LOWER_AUTHORITY_OR_STALE' })),
    legalWriteTarget: selectedByRole.get('PRODUCT_AUTHORITY')?.legalWriteTarget ?? null,
    acceptanceGate: selectedByRole.get('PRODUCT_AUTHORITY')?.acceptanceGate ?? null,
    writebackPath: selectedByRole.get('PROJECT_LEAD_CURRENT')?.writebackPath ?? null,
  };

  const fullLoadChars = JSON.stringify(candidates).length;
  const packChars = JSON.stringify(pack).length;
  const previousFingerprints = new Map((previousPack?.authority ?? []).map((item) => [item.role, `${item.revision ?? ''}|${item.sha ?? ''}|${item.id ?? ''}`]));
  const deltaAuthority = pack.authority.filter((item) => {
    if (MUTABLE_ROLES.has(item.role)) return true;
    return previousFingerprints.get(item.role) !== `${item.revision ?? ''}|${item.sha ?? ''}|${item.id ?? ''}`;
  });

  pack.metrics = {
    inputCandidates: candidates.length,
    selectedAuthorities: pack.authority.length,
    demotedCandidates: pack.demoted.length,
    fullLoadChars,
    packChars,
    charReduction: fullLoadChars - packChars,
  };
  pack.delta = {
    status: previousPack ? 'DELTA_AVAILABLE' : 'BASELINE_PACK',
    authority: previousPack ? deltaAuthority : pack.authority,
    rule: 'Mutable Git/runtime/current-state roles are always revalidated; unchanged stable authority may be omitted from subsequent delta.',
  };

  return pack;
}
