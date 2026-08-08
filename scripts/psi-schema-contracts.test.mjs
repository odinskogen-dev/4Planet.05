import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const sql = readFileSync(new URL("../supabase/migrations-pending-founder/20260808171300_psi_production_convergence.sql", import.meta.url), "utf8");
const down = readFileSync(new URL("../supabase/rollback-pending-founder/20260808171300_psi_production_convergence.down.sql", import.meta.url), "utf8");

test("PSI uses one registry, typed graph and claim evidence", () => {
  for (const token of ["public.object_registry","public.graph_edges","public.claims","public.claim_evidence","public.assessment_runs","public.assessments","public.places","public.measurements"]) assert.match(sql, new RegExp(token.replace(".", "\\."), "i"));
  assert.match(sql, /subject_id uuid not null references public\.object_registry/i);
  assert.match(sql, /object_id uuid not null references public\.object_registry/i);
  assert.match(sql, /support_direction in \('SUPPORTS','CHALLENGES','QUALIFIES'\)/i);
});

test("claim values are object-or-value XOR", () => {
  assert.match(sql, /\(\(object_id is not null\)::int[\s\S]+\(value_json is not null\)::int\) = 1/i);
});

test("severity and leverage remain versioned assessments, not one global score", () => {
  assert.match(sql, /ordinal_label text not null check \(ordinal_label in \('UNKNOWN','LOW','MEDIUM','HIGH','VERY_HIGH'\)\)/i);
  assert.doesNotMatch(sql, /global_problem_score|universal_problem_score/i);
});

test("M:N relevance cannot imply effectiveness", () => {
  assert.match(sql, /create table if not exists public\.psi_staging_solution_problem/i);
  assert.match(sql, /effectiveness_implication text not null default 'NONE' check \(effectiveness_implication = 'NONE'\)/i);
  assert.match(sql, /founder_gate text not null default 'REQUIRED'/i);
});

test("pending founder semantics are explicitly held", () => {
  assert.doesNotMatch(sql, /create table if not exists public\.solutions?\b/i);
  assert.doesNotMatch(sql, /create table if not exists public\.needs\b/i);
  assert.doesNotMatch(sql, /\bexecution_phase\b/i);
  assert.match(sql, /FD-03 solution identity, FD-04 NEED and FD-05 implementation lifecycle/i);
});

test("locked truth axes replace legacy vocabulary with audit preservation", () => {
  assert.match(sql, /legacy_interpretation_status/);
  assert.match(sql, /evidence_strength='LIMITED' where evidence_strength='EMERGING'/i);
  assert.match(sql, /SOURCE_REPORTED','4PLANET_INTERPRETATION','INFERENCE/);
  assert.match(sql, /UNASSESSED','INSUFFICIENT','LIMITED','MODERATE','STRONG/);
});

test("new intelligence tables are private by default", () => {
  assert.match(sql, /alter table public\.object_registry enable row level security/i);
  assert.match(sql, /revoke all on public\.object_registry[\s\S]+from anon,authenticated/i);
  assert.doesNotMatch(sql, /create policy[\s\S]+object_registry/i);
});

test("rollback leaves the existing truth spine intact", () => {
  for (const existing of ["source_records","taxon_observations","signals","interpretations","impact_unit_definitions","contributions","deliveries","outcomes","impacts","product_contexts"]) assert.doesNotMatch(down, new RegExp(`drop table if exists public\\.${existing}\\b`, "i"));
  assert.doesNotMatch(down, /drop schema|drop database/i);
});
