import crypto from 'node:crypto';

export const SCHEMA_VERSION = '4planet-okf-1.0';
export const TERMINAL_MIGRATION_STATES = new Set([
  'MIGRATED',
  'UNCHANGED_BY_DESIGN',
  'SUPERSEDED_WITH_LINK',
  'NON_KNOWLEDGE_EXCLUDED_WITH_REASON',
  'BLOCKED_WITH_EXACT_REASON'
]);

export function stableKnowledgeId(record) {
  if (record.knowledge_id) return record.knowledge_id;
  if (record.drive_id) return `kp:gdrive:${record.drive_id}`;
  if (record.github_repo && record.path) return `kp:github:${record.github_repo}:${record.path}`.toLowerCase();
  const basis = JSON.stringify([record.storage || '', record.provider_id || '', record.path || '', record.title || '']);
  return `kp:derived:${crypto.createHash('sha256').update(basis).digest('hex').slice(0, 24)}`;
}

export function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

export function splitFrontmatter(text) {
  const bom = text.startsWith('\uFEFF') ? '\uFEFF' : '';
  const input = bom ? text.slice(1) : text;
  if (!input.startsWith('---\n') && !input.startsWith('---\r\n')) {
    return { bom, hasFrontmatter: false, frontmatter: '', body: input };
  }
  const newline = input.startsWith('---\r\n') ? '\r\n' : '\n';
  const close = input.indexOf(`${newline}---${newline}`, 3 + newline.length);
  if (close < 0) return { bom, hasFrontmatter: false, frontmatter: '', body: input };
  return {
    bom,
    hasFrontmatter: true,
    frontmatter: input.slice(3 + newline.length, close),
    body: input.slice(close + newline.length + 3 + newline.length),
    newline
  };
}

function scalar(value) {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'boolean' || typeof value === 'number') return String(value);
  const s = String(value);
  if (/^[A-Za-z0-9_.:/@+-]+$/.test(s) && !['null', 'true', 'false', 'yes', 'no'].includes(s.toLowerCase())) return s;
  return JSON.stringify(s);
}

function yamlLines(value, indent = 0) {
  const pad = ' '.repeat(indent);
  if (Array.isArray(value)) {
    if (!value.length) return [`${pad}[]`];
    const lines = [];
    for (const item of value) {
      if (item && typeof item === 'object') {
        const entries = Object.entries(item);
        if (!entries.length) { lines.push(`${pad}- {}`); continue; }
        const [firstKey, firstVal] = entries[0];
        if (firstVal && typeof firstVal === 'object') {
          lines.push(`${pad}- ${firstKey}:`);
          lines.push(...yamlLines(firstVal, indent + 4));
        } else {
          lines.push(`${pad}- ${firstKey}: ${scalar(firstVal)}`);
        }
        for (const [k, v] of entries.slice(1)) {
          if (v && typeof v === 'object') {
            lines.push(`${pad}  ${k}:`);
            lines.push(...yamlLines(v, indent + 4));
          } else {
            lines.push(`${pad}  ${k}: ${scalar(v)}`);
          }
        }
      } else {
        lines.push(`${pad}- ${scalar(item)}`);
      }
    }
    return lines;
  }
  if (value && typeof value === 'object') {
    const lines = [];
    for (const [k, v] of Object.entries(value)) {
      if (v && typeof v === 'object') {
        lines.push(`${pad}${k}:`);
        lines.push(...yamlLines(v, indent + 2));
      } else {
        lines.push(`${pad}${k}: ${scalar(v)}`);
      }
    }
    return lines;
  }
  return [`${pad}${scalar(value)}`];
}

export function renderFrontmatter(metadata, newline = '\n') {
  return `---${newline}${yamlLines(metadata).join(newline)}${newline}---${newline}`;
}

export function migrateText(text, metadata, { replaceExisting = false } = {}) {
  const split = splitFrontmatter(text);
  const newline = split.newline || (text.includes('\r\n') ? '\r\n' : '\n');
  if (split.hasFrontmatter && !replaceExisting) {
    return { changed: false, reason: 'EXISTING_FRONTMATTER_REQUIRES_MERGE_REVIEW', output: text, bodyHashBefore: sha256(split.body), bodyHashAfter: sha256(split.body) };
  }
  const body = split.hasFrontmatter ? split.body : split.body;
  const output = `${split.bom}${renderFrontmatter(metadata, newline)}${body}`;
  return {
    changed: output !== text,
    reason: split.hasFrontmatter ? 'REPLACED_EXISTING_FRONTMATTER' : 'ADDED_FRONTMATTER',
    output,
    bodyHashBefore: sha256(body),
    bodyHashAfter: sha256(splitFrontmatter(output).body)
  };
}

export function metadataFromInventory(record, now = new Date().toISOString()) {
  return {
    type: record.document_class || 'Knowledge Article',
    title: record.title,
    description: record.description || '',
    status: record.okf_status || (record.lifecycle_state === 'SUPERSEDED' || record.lifecycle_state === 'ARCHIVED' ? 'deprecated' : 'stable'),
    stale_after: record.stale_after ?? null,
    generated: record.generated || null,
    verified: record.verified || [],
    sources: record.sources || [],
    brain: {
      knowledge_id: stableKnowledgeId(record),
      schema_version: SCHEMA_VERSION,
      authority: record.authority || 'UNCLASSIFIED_FAIL_CLOSED',
      authority_level: record.authority_level || 'NONE',
      canon_state: record.canon_state || 'NON_CANON',
      current_state_rev: record.current_state_rev ?? null,
      effective_at: record.effective_at ?? null,
      supersedes: record.supersedes || [],
      superseded_by: record.superseded_by || [],
      review_status: record.review_status || 'UNREVIEWED',
      evidence_strength: record.evidence_strength || 'UNAVAILABLE',
      interpretation_status: record.interpretation_status || 'NOT_APPLICABLE',
      provenance_state: record.provenance_state || 'PARTIAL',
      writeback_state: record.writeback_state || 'WRITEBACK_PENDING',
      sensitivity: record.sensitivity || 'INTERNAL',
      lifecycle_state: record.lifecycle_state || 'DRAFT',
      project: record.project ?? null,
      domain: record.domain ?? null,
      product: record.product ?? null,
      owner: record.owner ?? null,
      source_ids: record.source_ids || [],
      related_entities: record.related_entities || [],
      related_decisions: record.related_decisions || [],
      related_claims: record.related_claims || [],
      related_tasks: record.related_tasks || [],
      last_validated: record.last_validated || now,
      migration_status: record.migration_status || 'BLOCKED_WITH_EXACT_REASON',
      migration_note: record.migration_note || ''
    }
  };
}

export function extractFlatControlFields(frontmatter) {
  const get = (key) => {
    const match = frontmatter.match(new RegExp(`^\\s*${key}:\\s*["']?([^\\r\\n"']+)["']?\\s*$`, 'm'));
    return match ? match[1].trim() : null;
  };
  return {
    type: get('type'),
    title: get('title'),
    status: get('status'),
    knowledge_id: get('knowledge_id'),
    schema_version: get('schema_version'),
    authority: get('authority'),
    authority_level: get('authority_level'),
    canon_state: get('canon_state'),
    review_status: get('review_status'),
    evidence_strength: get('evidence_strength'),
    interpretation_status: get('interpretation_status'),
    provenance_state: get('provenance_state'),
    writeback_state: get('writeback_state'),
    sensitivity: get('sensitivity'),
    lifecycle_state: get('lifecycle_state'),
    migration_status: get('migration_status'),
    last_validated: get('last_validated')
  };
}
