-- 4PLANET BRAIN PROFILES PRODUCT CLOSURE 01
-- Applied to 4Planet_ OS on 2026-09-17. This file source-controls the canonical
-- tenant-memory conflict guard and expands the existing tenant_objects adapter.
-- No new truth store, vector store, BRAIN, or orchestration layer.

create or replace function public.brain_profile_memory_key(p_type text, p_title text, p_value jsonb)
returns text language sql immutable set search_path = public, pg_temp as $$
  select lower(regexp_replace(trim(coalesce(p_value->>'identity_key',p_title,p_type,'')),'\s+',' ','g'))
$$;

create or replace function public.brain_profile_person_memory_guard()
returns trigger language plpgsql security invoker set search_path = public, pg_temp as $$
declare prior public.four_sapien_embla_memories%rowtype; new_key text;
begin
  if coalesce(new.value->>'brain_profile','false') <> 'true' then return new; end if;
  new_key := public.brain_profile_memory_key(new.memory_type,new.value->>'title',new.value);
  select * into prior from public.four_sapien_embla_memories m
   where m.user_id=new.user_id and m.deleted_at is null and m.state='active'
     and m.memory_type=new.memory_type
     and public.brain_profile_memory_key(m.memory_type,m.value->>'title',m.value)=new_key
   order by m.updated_at desc limit 1;
  if prior.id is null then return new; end if;
  if lower(trim(prior.content))=lower(trim(new.content)) then return null; end if;
  if new.state='active' and new.confirmation_state='user_confirmed' then
    new.supersedes_id:=prior.id;
    new.provenance:=coalesce(new.provenance,'{}'::jsonb)||jsonb_build_object('conflict_resolution','supersede_confirmed','supersedes',prior.id,'identity_key',new_key);
    update public.four_sapien_embla_memories set state='superseded',updated_at=now() where id=prior.id;
  else
    new.provenance:=coalesce(new.provenance,'{}'::jsonb)||jsonb_build_object('conflict_state','needs_confirmation','conflicts_with',prior.id,'identity_key',new_key);
  end if;
  return new;
end $$;

drop trigger if exists brain_profile_person_memory_guard on public.four_sapien_embla_memories;
create trigger brain_profile_person_memory_guard before insert on public.four_sapien_embla_memories
for each row execute function public.brain_profile_person_memory_guard();

create or replace function public.brain_profile_company_memory_guard()
returns trigger language plpgsql security invoker set search_path = public, pg_temp as $$
declare prior public.four_brands_memories%rowtype; new_key text;
begin
  if coalesce(new.value->>'brain_profile','false') <> 'true' then return new; end if;
  new_key:=public.brain_profile_memory_key(new.memory_type,new.title,new.value);
  select * into prior from public.four_brands_memories m
   where m.company_id=new.company_id and m.deleted_at is null and m.state='active'
     and m.memory_type=new.memory_type
     and public.brain_profile_memory_key(m.memory_type,m.title,m.value)=new_key
   order by m.updated_at desc limit 1;
  if prior.id is null then return new; end if;
  if lower(trim(prior.content))=lower(trim(new.content)) then return null; end if;
  if new.state='active' and new.confirmation_state='user_confirmed' then
    new.supersedes_id:=prior.id;
    new.provenance:=coalesce(new.provenance,'{}'::jsonb)||jsonb_build_object('conflict_resolution','supersede_confirmed','supersedes',prior.id,'identity_key',new_key);
    update public.four_brands_memories set state='superseded',updated_at=now() where id=prior.id;
  else
    new.provenance:=coalesce(new.provenance,'{}'::jsonb)||jsonb_build_object('conflict_state','needs_confirmation','conflicts_with',prior.id,'identity_key',new_key);
  end if;
  return new;
end $$;

drop trigger if exists brain_profile_company_memory_guard on public.four_brands_memories;
create trigger brain_profile_company_memory_guard before insert on public.four_brands_memories
for each row execute function public.brain_profile_company_memory_guard();

create or replace view brain.tenant_objects as
select 'person'::text tenant_type,m.user_id tenant_ref,'memory'::text object_type,m.id::text object_id,
       coalesce(m.value->>'title',m.memory_type) title,m.content,m.state status,
       coalesce(m.provenance,'{}'::jsonb)||jsonb_build_object('brain_state',m.state,'confirmation_state',m.confirmation_state,'confidence',m.confidence) provenance,m.updated_at
from public.four_sapien_embla_memories m where m.deleted_at is null and m.state in ('active','proposed')
union all
select 'person',d.user_id,'decision',d.id::text,d.title,coalesce(d.question,''),d.status,d.provenance,d.updated_at from public.four_sapien_decisions d
union all
select 'person',g.user_id,'goal',g.id::text,g.title,coalesce(g.description,''),g.status,g.provenance,g.updated_at from public.four_sapien_goals g
union all
select 'person',a.user_id,'finance_account',a.id::text,a.name,
       concat_ws(' · ',coalesce(a.kind,'account'),case when a.balance is null then 'unknown balance' else a.balance::text end),
       case when a.archived_at is null then 'active' else 'archived' end,
       jsonb_build_object('source',coalesce(a.source,'4SAPIEN Finance'),'truth_state',coalesce(a.truth,'UNKNOWN'),'as_of',a.as_of,'canonical_source','four_sapien_finance_accounts'),a.updated_at
from public.four_sapien_finance_accounts a where a.archived_at is null
union all
select 'person',e.user_id,'finance_event',e.id::text,coalesce(e.name,e.type),
       concat_ws(' · ',e.type,case when e.amount is null then 'unknown amount' else e.amount::text end,e.currency,e.category,e.occurred_on::text),
       coalesce(e.state,'active'),jsonb_build_object('source',coalesce(e.source,'4SAPIEN Finance'),'truth_state',coalesce(e.truth,'UNKNOWN'),'canonical_source','four_sapien_finance_events'),e.updated_at
from public.four_sapien_finance_events e where coalesce(e.state,'active') not in ('deleted','archived')
union all
select 'company',m.company_id,'memory',m.id::text,m.title,m.content,m.state,
       coalesce(m.provenance,'{}'::jsonb)||jsonb_build_object('brain_state',m.state,'confirmation_state',m.confirmation_state,'confidence',m.confidence),m.updated_at
from public.four_brands_memories m where m.deleted_at is null and m.state in ('active','proposed')
union all
select 'company',d.company_id,'decision',d.id::text,d.title,coalesce(d.evidence::text,''),d.state,d.provenance,d.updated_at from public.four_brands_decisions d
union all
select 'company',o.company_id,'opportunity',o.id::text,o.title,coalesce(o.why,''),o.status,o.provenance,o.updated_at from public.four_brands_opportunities o
union all
select 'company',l.company_id,'learning',l.id::text,l.title,l.learning,'active',l.provenance,l.updated_at from public.four_brands_learning l
union all
select 'company',m.company_id,'metric',m.id::text,m.metric_key,
       coalesce(m.text_value,concat_ws(' ',m.value::text,m.unit,m.currency)),'active',
       coalesce(m.provenance,'{}'::jsonb)||jsonb_build_object('source',m.source,'truth_class',m.truth_class,'confidence',m.confidence,'canonical_source','four_brands_metrics'),m.updated_at
from public.four_brands_metrics m
union all
select 'company',a.company_id,'account',a.id::text,a.name,
       concat_ws(' · ',a.kind,case when a.balance is null then 'unknown balance' else a.balance::text end,a.currency),
       case when a.archived_at is null then 'active' else 'archived' end,
       coalesce(a.provenance,'{}'::jsonb)||jsonb_build_object('source',a.source,'truth_class',a.truth_class,'canonical_source','four_brands_accounts'),a.updated_at
from public.four_brands_accounts a where a.archived_at is null
union all
select 'company',i.company_id,'intervention',i.id::text,i.title,
       concat_ws(' · ',i.status,i.expected_value_low::text,i.expected_value_high::text,i.currency,i.measurement_window::text),i.status,
       coalesce(i.provenance,'{}'::jsonb)||jsonb_build_object('canonical_source','four_brands_interventions'),i.updated_at
from public.four_brands_interventions i
union all
select 'company',r.company_id,'result',r.id::text,r.metric_key,
       concat_ws(' · ',r.conclusion,r.baseline_value::text,r.measured_value::text,r.attributable_value::text,r.currency),'active',
       coalesce(r.provenance,'{}'::jsonb)||jsonb_build_object('attribution_strength',r.attribution_strength,'canonical_source','four_brands_results'),r.updated_at
from public.four_brands_results r;

revoke all on function public.brain_profile_memory_key(text,text,jsonb) from public;
grant execute on function public.brain_profile_memory_key(text,text,jsonb) to authenticated;
