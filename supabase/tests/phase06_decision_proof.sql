\set ON_ERROR_STOP on

-- Bounded staging state.
do $$
declare b public.brain_import_batches%rowtype;
begin
  select * into b from public.brain_import_batches where batch_key='PHASE06_DECISION_PROOFS';
  if b.id is null then raise exception 'Phase06 import batch missing'; end if;
  if b.status <> 'VALIDATED' then raise exception 'Expected VALIDATED batch, got %',b.status; end if;
  if b.founder_release then raise exception 'Founder release must remain false in staging proof'; end if;
  if (b.counts->>'quarantined_rows')::int <> 4 then raise exception 'Expected 4 unresolved actor candidates in quarantine'; end if;
end $$;

-- Promotion must fail closed without founder release.
do $$
begin
  begin
    perform public.promote_brain_import_batch('PHASE06_DECISION_PROOFS','phase06-ci');
    raise exception 'Promotion unexpectedly succeeded without founder release';
  exception when others then
    if position('Founder release required' in sqlerrm)=0 then raise; end if;
  end;
end $$;

-- Corpus integrity.
do $$
declare n int;
begin
  select count(*) into n from public.brain_objects where lifecycle_state='STAGING' and public_ref like '4P-PROB-%';
  if n < 3 then raise exception 'Expected at least 3 staged problem frames, got %',n; end if;
  select count(*) into n from public.brain_objects where lifecycle_state='STAGING' and public_ref like '4P-SOL-%';
  if n <> 24 then raise exception 'Expected 24 staged solution identities, got %',n; end if;
  select count(*) into n from public.claims c join public.brain_objects o on o.id=c.object_id where o.public_ref like 'P5-CLM-%';
  if n <> 19 then raise exception 'Expected 19 Phase05 decision-proof claims, got %',n; end if;
  select count(*) into n from public.implementations i join public.brain_objects o on o.id=i.object_id where o.public_ref like 'P5-IMP-%';
  if n <> 3 then raise exception 'Expected 3 real Phase05 implementation records, got %',n; end if;
end $$;

-- Parry Sound correction must be preserved, not silently overwritten.
do $$
begin
  if not exists (
    select 1 from public.brain_legacy_mappings m
    where m.legacy_ref='4P-IMP-040008'
      and m.migration_rule like '%4P-SOL-000325 -> 4P-SOL-000321%'
  ) then raise exception 'Parry Sound superseded mapping audit missing'; end if;
end $$;

-- Evidence lanes remain distinct.
do $$
declare s int; q int; c int;
begin
  select count(*) filter(where ce.direction='SUPPORTS'),
         count(*) filter(where ce.direction='QUALIFIES'),
         count(*) filter(where ce.direction='CHALLENGES')
  into s,q,c
  from public.claim_evidence ce
  join public.brain_objects o on o.id=ce.claim_id
  where o.public_ref like 'P5-CLM-%';
  if s < 1 or q < 1 or c < 1 then raise exception 'Expected SUPPORTS + QUALIFIES + CHALLENGES; got %,%,%',s,q,c; end if;
end $$;

-- Context Pack v4: microfibre gets evidence + implementation + economics + transferability + gap.
do $$
declare p jsonb;
begin
  p := public.brain_context_pack_v4('4P-PROB-00082');
  if p->>'status' <> 'OK' then raise exception 'Microfibre pack not OK'; end if;
  if jsonb_array_length(p->'claims') < 5 then raise exception 'Microfibre evidence too sparse'; end if;
  if jsonb_array_length(p->'implementations') < 2 then raise exception 'Microfibre implementation retrieval failed'; end if;
  if jsonb_array_length(p->'economics') < 1 then raise exception 'Microfibre economics retrieval failed'; end if;
  if jsonb_array_length(p->'transferability') < 1 then raise exception 'Norway transferability retrieval failed'; end if;
  if jsonb_array_length(p->'gaps') < 1 then raise exception 'Microfibre gap retrieval failed'; end if;
  if (p#>>'{truth_boundary,qualifies_is_challenges}')::boolean then raise exception 'QUALIFIES collapsed into CHALLENGES'; end if;
end $$;

-- Coral must preserve positive/qualifying/challenging evidence together.
do $$
declare p jsonb;
begin
  p := public.brain_context_pack_v4('4P-PROB-00045');
  if (p#>>'{evidence_lanes,supports}')::int < 1 then raise exception 'Coral SUPPORTS missing'; end if;
  if (p#>>'{evidence_lanes,qualifies}')::int < 1 then raise exception 'Coral QUALIFIES missing'; end if;
  if (p#>>'{evidence_lanes,challenges}')::int < 1 then raise exception 'Coral CHALLENGES missing'; end if;
  if jsonb_array_length(p->'implementations') < 1 then raise exception 'Coral implementation retrieval failed'; end if;
end $$;

-- Cooling: successful abstention signal. No implementation is invented in this bounded cohort.
do $$
declare p jsonb;
begin
  p := public.brain_context_pack_v4('4P-PROB-00013');
  if jsonb_array_length(p->'implementations') <> 0 then raise exception 'Cooling pack invented/loaded an implementation unexpectedly'; end if;
  if jsonb_array_length(p->'economics') < 1 then raise exception 'Cooling modelled economics missing'; end if;
  if jsonb_array_length(p->'gaps') < 1 then raise exception 'Cooling implementation evidence gap missing'; end if;
end $$;

-- Places preserve uncertainty: named places are not fabricated as exact geometry.
do $$
begin
  if exists(select 1 from public.places where object_id in (
    select id from public.brain_objects where public_ref in ('P6-PLACE-PARRY-SOUND','P6-PLACE-FLORIDA-KEYS')
  ) and geom is not null) then
    raise exception 'Named-site/region geometry must remain NULL until coordinate verification';
  end if;
end $$;

-- Entity resolution: exact IDs work; unresolved actors stay quarantined rather than merged.
do $$
declare n int;
begin
  select count(*) into n from public.brain_resolve_objects('4P-SOL-000321',10);
  if n <> 1 then raise exception 'Exact solution ID resolution failed'; end if;
  select count(*) into n from public.brain_quarantine_records q
    join public.brain_staging_records s on s.id=q.staging_record_id
    where s.record_family='ACTOR_CANDIDATE';
  if n <> 4 then raise exception 'Expected unresolved actor quarantine=4, got %',n; end if;
end $$;

-- Public read model fails closed for internal staging cohort.
set local role anon;
do $$
declare n int;
begin
  select count(*) into n from public.brain_objects
  where public_ref like 'P5-%' or public_ref like 'P6-%'
     or public_ref in ('4P-PROB-00013','4P-PROB-00045','4P-PROB-00082');
  if n <> 0 then raise exception 'Internal staging objects leaked through public RLS: %',n; end if;
end $$;
reset role;

select 'PHASE06_DECISION_PROOF_SQL_GATE_PASS' as result;
