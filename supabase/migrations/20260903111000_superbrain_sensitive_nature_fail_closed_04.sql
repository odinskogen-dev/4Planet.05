-- 4PLANET SUPERBRAIN — SENSITIVE NATURE PUBLIC RELEASE FAIL-CLOSED 04
-- P0 correction after remote red-team proved a SENSITIVE_NATURE projection could
-- reach the public cache when manual gate flags were all true.
--
-- Law:
--   * public products never receive raw SENSITIVE_NATURE objects;
--   * nature sensitivity must be explicitly classified for every public-projection object;
--   * a generalized public derivative must itself be classified GENERALIZED;
--   * service_role may stage/activate through governed CNS functions, but may not
--     write the public cache directly.

begin;

-- Public-eligible object classes that previously lacked an explicit nature
-- sensitivity field are nullable on purpose: NULL = UNCLASSIFIED = fail closed.
alter table cns.relationships
  add column if not exists nature_sensitivity_state cns.nature_sensitivity_state;
alter table cns.signals
  add column if not exists nature_sensitivity_state cns.nature_sensitivity_state;
alter table cns.claims
  add column if not exists nature_sensitivity_state cns.nature_sensitivity_state;
alter table cns.evidence
  add column if not exists nature_sensitivity_state cns.nature_sensitivity_state;
alter table cns.interpretations
  add column if not exists nature_sensitivity_state cns.nature_sensitivity_state;

create or replace function cns.object_nature_sensitivity(
  p_object_type text,
  p_object_id text
) returns cns.nature_sensitivity_state
language plpgsql
security definer
set search_path=cns,public,pg_temp
as $$
declare
  v cns.nature_sensitivity_state;
  v_direct cns.nature_sensitivity_state;
  v_linked cns.nature_sensitivity_state;
begin
  case upper(p_object_type)
    when 'ENTITY' then
      select nature_sensitivity_state into v
      from cns.entities where entity_id=p_object_id;

    when 'OBSERVATION' then
      select nature_sensitivity_class into v
      from cns.observations where observation_id=p_object_id;

    when 'SOURCE_RECORD' then
      select nature_sensitivity_state into v
      from cns.source_records where source_record_id=p_object_id;

    when 'RELATIONSHIP' then
      select r.nature_sensitivity_state,
             case
               when bool_or(e.nature_sensitivity_state='SENSITIVE_NATURE'::cns.nature_sensitivity_state)
                 then 'SENSITIVE_NATURE'::cns.nature_sensitivity_state
               when bool_or(e.nature_sensitivity_state='GENERALIZED'::cns.nature_sensitivity_state)
                 then 'GENERALIZED'::cns.nature_sensitivity_state
               else 'NONE'::cns.nature_sensitivity_state
             end
        into v_direct,v_linked
      from cns.relationships r
      left join cns.entities e
        on e.entity_id in (r.subject_entity_id,r.object_entity_id)
      where r.relationship_id=p_object_id
      group by r.nature_sensitivity_state;
      if v_direct is null then
        v:=null;
      elsif v_direct='SENSITIVE_NATURE'::cns.nature_sensitivity_state
         or v_linked='SENSITIVE_NATURE'::cns.nature_sensitivity_state then
        v:='SENSITIVE_NATURE'::cns.nature_sensitivity_state;
      elsif v_direct='GENERALIZED'::cns.nature_sensitivity_state
         or v_linked='GENERALIZED'::cns.nature_sensitivity_state then
        v:='GENERALIZED'::cns.nature_sensitivity_state;
      else
        v:='NONE'::cns.nature_sensitivity_state;
      end if;

    when 'SIGNAL' then
      select s.nature_sensitivity_state,
             e.nature_sensitivity_state
        into v_direct,v_linked
      from cns.signals s
      left join cns.entities e on e.entity_id=s.entity_id
      where s.signal_id=p_object_id;
      if v_direct is null then v:=null;
      elsif v_direct='SENSITIVE_NATURE'::cns.nature_sensitivity_state
         or v_linked='SENSITIVE_NATURE'::cns.nature_sensitivity_state then
        v:='SENSITIVE_NATURE'::cns.nature_sensitivity_state;
      elsif v_direct='GENERALIZED'::cns.nature_sensitivity_state
         or v_linked='GENERALIZED'::cns.nature_sensitivity_state then
        v:='GENERALIZED'::cns.nature_sensitivity_state;
      else v:='NONE'::cns.nature_sensitivity_state;
      end if;

    when 'CLAIM' then
      select c.nature_sensitivity_state,
             case when upper(c.subject_type)='ENTITY' then e.nature_sensitivity_state else null end
        into v_direct,v_linked
      from cns.claims c
      left join cns.entities e
        on upper(c.subject_type)='ENTITY' and e.entity_id=c.subject_id
      where c.claim_id=p_object_id;
      if v_direct is null then v:=null;
      elsif v_direct='SENSITIVE_NATURE'::cns.nature_sensitivity_state
         or v_linked='SENSITIVE_NATURE'::cns.nature_sensitivity_state then
        v:='SENSITIVE_NATURE'::cns.nature_sensitivity_state;
      elsif v_direct='GENERALIZED'::cns.nature_sensitivity_state
         or v_linked='GENERALIZED'::cns.nature_sensitivity_state then
        v:='GENERALIZED'::cns.nature_sensitivity_state;
      else v:='NONE'::cns.nature_sensitivity_state;
      end if;

    when 'INTERPRETATION' then
      select i.nature_sensitivity_state,
             case when upper(i.subject_type)='ENTITY' then e.nature_sensitivity_state else null end
        into v_direct,v_linked
      from cns.interpretations i
      left join cns.entities e
        on upper(i.subject_type)='ENTITY' and e.entity_id=i.subject_id
      where i.interpretation_id=p_object_id;
      if v_direct is null then v:=null;
      elsif v_direct='SENSITIVE_NATURE'::cns.nature_sensitivity_state
         or v_linked='SENSITIVE_NATURE'::cns.nature_sensitivity_state then
        v:='SENSITIVE_NATURE'::cns.nature_sensitivity_state;
      elsif v_direct='GENERALIZED'::cns.nature_sensitivity_state
         or v_linked='GENERALIZED'::cns.nature_sensitivity_state then
        v:='GENERALIZED'::cns.nature_sensitivity_state;
      else v:='NONE'::cns.nature_sensitivity_state;
      end if;

    when 'EVIDENCE' then
      select nature_sensitivity_state into v
      from cns.evidence where evidence_id=p_object_id;

    else
      raise exception 'CNS_PUBLIC_PROJECTION_OBJECT_TYPE_UNSUPPORTED:%',p_object_type;
  end case;

  -- object_visibility() is called by activation first and establishes existence.
  -- NULL here therefore means sensitivity has not been explicitly classified.
  return v;
end;
$$;

-- Defence in depth: even a direct table write cannot create an ACTIVE sensitive
-- projection/cache row.
do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conrelid='cns.public_projections'::regclass
      and conname='cns_public_projection_no_sensitive_active'
  ) then
    alter table cns.public_projections
      add constraint cns_public_projection_no_sensitive_active
      check (state<>'ACTIVE' or nature_sensitivity_state<>'SENSITIVE_NATURE'::cns.nature_sensitivity_state);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conrelid='public.superbrain_public_v1'::regclass
      and conname='superbrain_public_no_sensitive_active'
  ) then
    alter table public.superbrain_public_v1
      add constraint superbrain_public_no_sensitive_active
      check (state<>'ACTIVE' or nature_sensitivity_state<>'SENSITIVE_NATURE');
  end if;
end $$;

create or replace function cns.activate_public_projection(p_projection_id text)
returns boolean
language plpgsql
security definer
set search_path=cns,public,pg_temp
as $$
declare
  p cns.public_projections%rowtype;
  v_sensitivity cns.nature_sensitivity_state;
begin
  select * into p
  from cns.public_projections
  where projection_id=p_projection_id
  for update;

  if not found then raise exception 'CNS_PUBLIC_PROJECTION_NOT_FOUND'; end if;

  if cns.object_visibility(p.object_type,p.object_id) <> 'PUBLIC_VERIFIED'::cns.visibility_state then
    raise exception 'CNS_CANONICAL_OBJECT_NOT_PUBLIC_VERIFIED';
  end if;

  v_sensitivity:=cns.object_nature_sensitivity(p.object_type,p.object_id);
  if v_sensitivity is null then
    raise exception 'CNS_PUBLIC_PROJECTION_NATURE_SENSITIVITY_UNCLASSIFIED';
  end if;
  if v_sensitivity='SENSITIVE_NATURE'::cns.nature_sensitivity_state then
    raise exception 'CNS_PUBLIC_PROJECTION_SENSITIVE_NATURE_FORBIDDEN';
  end if;
  if p.nature_sensitivity_state='SENSITIVE_NATURE'::cns.nature_sensitivity_state then
    raise exception 'CNS_PUBLIC_PROJECTION_SENSITIVE_NATURE_FORBIDDEN';
  end if;
  if p.nature_sensitivity_state is distinct from v_sensitivity then
    raise exception 'CNS_PUBLIC_PROJECTION_SENSITIVITY_MISMATCH:canonical=% projection=%',v_sensitivity,p.nature_sensitivity_state;
  end if;

  if p.rights_state <> 'ALLOW'::cns.rights_state
     or not p.truth_checked
     or not p.evidence_checked
     or not p.rights_checked
     or not p.sensitivity_checked
     or p.verified_by is null
     or p.verification_authority is null
     or p.verified_at is null then
    raise exception 'CNS_PUBLIC_PROJECTION_GATES_INCOMPLETE';
  end if;

  update cns.public_projections
  set state='ACTIVE',updated_at=now()
  where projection_id=p_projection_id;

  insert into public.superbrain_public_v1(
    projection_id,object_type,object_id,object_revision,payload,source_refs,
    nature_sensitivity_state,verified_at,expires_at,state,published_at,updated_at
  ) values(
    p.projection_id,p.object_type,p.object_id,p.object_revision,p.payload,p.source_refs,
    p.nature_sensitivity_state::text,p.verified_at,p.expires_at,'ACTIVE',now(),now()
  )
  on conflict(projection_id) do update
  set object_type=excluded.object_type,
      object_id=excluded.object_id,
      object_revision=excluded.object_revision,
      payload=excluded.payload,
      source_refs=excluded.source_refs,
      nature_sensitivity_state=excluded.nature_sensitivity_state,
      verified_at=excluded.verified_at,
      expires_at=excluded.expires_at,
      state='ACTIVE',
      updated_at=now();

  return true;
end;
$$;

-- service_role can call governed activation/withdrawal functions but cannot bypass
-- them by mutating the public cache directly.
revoke insert,update,delete,truncate,references,trigger
  on public.superbrain_public_v1 from service_role;
grant select on public.superbrain_public_v1 to service_role;

revoke all on function cns.object_nature_sensitivity(text,text) from public,anon,authenticated;
grant execute on function cns.object_nature_sensitivity(text,text) to service_role;
revoke all on function cns.activate_public_projection(text) from public,anon,authenticated;
grant execute on function cns.activate_public_projection(text) to service_role;

insert into cns.system_meta(key,value)
values(
  'sensitive_nature_public_boundary',
  '{"version":1,"verified":false,"state":"PENDING_CERTIFICATION","policy":"SENSITIVE_NATURE_NEVER_PUBLIC; GENERALIZED_REQUIRES_EXPLICIT_GENERALIZED_CANONICAL_CLASSIFICATION","direct_public_cache_service_write":false}'::jsonb
)
on conflict(key) do update
set value=excluded.value,updated_at=clock_timestamp();

commit;
