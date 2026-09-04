\set ON_ERROR_STOP on

begin;

-- The public cache is a one-way release surface. service_role may read it but
-- must not be able to bypass the governed activation function with direct writes.
do $$
begin
  if has_table_privilege('service_role','public.superbrain_public_v1','INSERT')
     or has_table_privilege('service_role','public.superbrain_public_v1','UPDATE')
     or has_table_privilege('service_role','public.superbrain_public_v1','DELETE')
     or has_table_privilege('service_role','public.superbrain_public_v1','TRUNCATE') then
    raise exception 'TEST_FAIL_SERVICE_ROLE_CAN_MUTATE_PUBLIC_CACHE';
  end if;
  if not has_table_privilege('service_role','public.superbrain_public_v1','SELECT') then
    raise exception 'TEST_FAIL_SERVICE_ROLE_CANNOT_READ_PUBLIC_CACHE';
  end if;
end $$;

-- Exact sensitive nature must never reach the public cache, even if every
-- manual verification flag is accidentally set true.
insert into cns.entities(
  entity_id,entity_type,canonical_name,lifecycle,metadata,
  visibility_state,nature_sensitivity_state,review_state,evidence_strength,revision
) values(
  'TEST-SENSITIVE-ENTITY','SPECIES','Sensitive test species','ACTIVE',
  '{"exact_coordinate":"59.9139,10.7522"}'::jsonb,
  'PUBLIC_VERIFIED','SENSITIVE_NATURE','INDEPENDENTLY_VERIFIED','STRONG',1
);

insert into cns.public_projections(
  projection_id,object_type,object_id,object_revision,payload,source_refs,
  rights_state,nature_sensitivity_state,truth_checked,evidence_checked,
  rights_checked,sensitivity_checked,verified_by,verification_authority,verified_at,state
) values(
  'TEST-SENSITIVE-PROJECTION','ENTITY','TEST-SENSITIVE-ENTITY',1,
  '{"exact_coordinate":"59.9139,10.7522"}'::jsonb,'[]'::jsonb,
  'ALLOW','SENSITIVE_NATURE',true,true,true,true,
  'independent-red-team','TEST_QA',clock_timestamp(),'CANDIDATE'
);

do $$
begin
  begin
    perform cns.activate_public_projection('TEST-SENSITIVE-PROJECTION');
    raise exception 'TEST_FAIL_SENSITIVE_PROJECTION_ACTIVATED';
  exception when others then
    if sqlerrm not like 'CNS_PUBLIC_PROJECTION_SENSITIVE_NATURE_FORBIDDEN%' then
      raise;
    end if;
  end;

  if exists(select 1 from public.superbrain_public_v1 where projection_id='TEST-SENSITIVE-PROJECTION') then
    raise exception 'TEST_FAIL_SENSITIVE_DATA_REACHED_PUBLIC_CACHE';
  end if;
end $$;

-- A projection cannot lie about the canonical object's sensitivity.
update cns.public_projections
set nature_sensitivity_state='NONE'
where projection_id='TEST-SENSITIVE-PROJECTION';

do $$
begin
  begin
    perform cns.activate_public_projection('TEST-SENSITIVE-PROJECTION');
    raise exception 'TEST_FAIL_SENSITIVITY_LIE_ACTIVATED';
  exception when others then
    if sqlerrm not like 'CNS_PUBLIC_PROJECTION_SENSITIVE_NATURE_FORBIDDEN%' then
      raise;
    end if;
  end;
end $$;

-- A genuinely non-sensitive, explicitly classified and fully verified object
-- still preserves the existing public-release capability.
insert into cns.entities(
  entity_id,entity_type,canonical_name,lifecycle,metadata,
  visibility_state,nature_sensitivity_state,review_state,evidence_strength,revision
) values(
  'TEST-PUBLIC-ENTITY','PLACE','Public test place','ACTIVE','{}'::jsonb,
  'PUBLIC_VERIFIED','NONE','INDEPENDENTLY_VERIFIED','STRONG',1
);

insert into cns.public_projections(
  projection_id,object_type,object_id,object_revision,payload,source_refs,
  rights_state,nature_sensitivity_state,truth_checked,evidence_checked,
  rights_checked,sensitivity_checked,verified_by,verification_authority,verified_at,state
) values(
  'TEST-PUBLIC-PROJECTION','ENTITY','TEST-PUBLIC-ENTITY',1,
  '{"name":"Public test place"}'::jsonb,'[]'::jsonb,
  'ALLOW','NONE',true,true,true,true,
  'independent-red-team','TEST_QA',clock_timestamp(),'CANDIDATE'
);

select cns.activate_public_projection('TEST-PUBLIC-PROJECTION');

do $$
begin
  if not exists(
    select 1 from public.superbrain_public_v1
    where projection_id='TEST-PUBLIC-PROJECTION'
      and state='ACTIVE'
      and nature_sensitivity_state='NONE'
  ) then
    raise exception 'TEST_FAIL_SAFE_PUBLIC_PROJECTION_DID_NOT_ACTIVATE';
  end if;
end $$;

rollback;
