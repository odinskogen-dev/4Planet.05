-- 4PLANET SUPERBRAIN — FRESH-SESSION GIGA RECOVERY PROOF
-- Run only after migration 08 is installed. SHADOW evidence only.
-- It does not authorise CNS cutover or retire legacy Drive/BRAIN authority.
\set ON_ERROR_STOP on

begin;

do $$
declare
  r record;
begin
  select
    constitution_source_id,
    constitution_revision,
    constitution_sha256,
    constitution_mandatory,
    authority_mode,
    cutover_authorized,
    giga_goal_count,
    jsonb_array_length(recovery_sources) as recovery_source_count,
    recovery_surface_complete
  into strict r
  from cns.v_giga_recovery_bootstrap;

  if r.constitution_source_id <> 'giga-constitution-2026-09-02' then
    raise exception 'GIGA Constitution source missing/wrong';
  end if;
  if not r.constitution_mandatory then
    raise exception 'GIGA Constitution is not mandatory rehydration';
  end if;
  if r.constitution_sha256 <> '4123d80ea3903ba9a6a0706e4a8b11892c1b67861ea8b4d21e071a935b4b56db' then
    raise exception 'GIGA Constitution hash mismatch';
  end if;
  if r.authority_mode <> 'SHADOW' or r.cutover_authorized then
    raise exception 'Authority boundary changed during recovery proof';
  end if;
  if r.giga_goal_count < 24 then
    raise exception 'Full GIGA goal scope not recoverable';
  end if;
  if r.recovery_source_count < 8 or not r.recovery_surface_complete then
    raise exception 'Recovery source surface incomplete';
  end if;
end $$;

insert into cns.system_meta(key,value)
values(
  'giga_recovery_bootstrap',
  jsonb_build_object(
    'verified',true,
    'state','PASS_SHADOW_FRESH_READBACK',
    'view','cns.v_giga_recovery_bootstrap',
    'constitution_source_id','giga-constitution-2026-09-02',
    'constitution_sha256','4123d80ea3903ba9a6a0706e4a8b11892c1b67861ea8b4d21e071a935b4b56db',
    'giga_goal_count',(select giga_goal_count from cns.v_giga_recovery_bootstrap),
    'recovery_source_count',(select jsonb_array_length(recovery_sources) from cns.v_giga_recovery_bootstrap),
    'authority','SHADOW_READ_ONLY',
    'cutover_authorized',false,
    'verified_at',clock_timestamp()
  )
)
on conflict(key) do update set value=excluded.value,updated_at=clock_timestamp();

insert into cns.system_meta(key,value)
values(
  'fresh_session',
  jsonb_build_object(
    'verified',true,
    'state','PASS_SHADOW_GIGA_RECOVERY',
    'scope','A stateless recovery read reconstructs mandatory GIGA Constitution identity plus full 24-goal scope and eight authority/recovery pointers without chat memory.',
    'authority','SHADOW_ONLY',
    'cutover_authorized',false,
    'evidence_view','cns.v_giga_recovery_bootstrap',
    'verified_at',clock_timestamp()
  )
)
on conflict(key) do update set value=excluded.value,updated_at=clock_timestamp();

commit;
