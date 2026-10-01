create or replace function public.four_brands_company_brain_sync_value_cell(
  p_company_id uuid,
  p_opportunity jsonb,
  p_state text default 'REVIEWED',
  p_baseline jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
set search_path to 'public'
as $function$
declare
  v_user uuid := auth.uid();
  v_role text;
  v_opportunity_id uuid;
  v_decision_id uuid;
  v_title text := nullif(btrim(coalesce(p_opportunity->>'title','')),'');
  v_key text := left(regexp_replace(lower(coalesce(p_opportunity->>'id','value-cell')), '[^a-z0-9_-]+', '-', 'g'), 120);
  v_cell text := upper(coalesce(p_opportunity->>'valueCell',''));
  v_state text := upper(coalesce(p_state,'REVIEWED'));
  v_truth text := upper(coalesce(p_opportunity->>'truthClass','INTERPRETATION'));
begin
  if v_user is null then raise exception 'AUTH_REQUIRED' using errcode='42501'; end if;
  v_role := public.four_brands_member_role(p_company_id);
  if v_role is null or v_role='viewer' then raise exception 'COMPANY_WRITE_MEMBERSHIP_REQUIRED' using errcode='42501'; end if;
  if v_title is null then raise exception 'OPPORTUNITY_TITLE_REQUIRED' using errcode='22023'; end if;
  if v_cell not in ('MAKE MORE','SPEND BETTER') then raise exception 'VALUE_CELL_REQUIRED' using errcode='22023'; end if;
  if v_truth not in ('FACT','CALCULATION','ESTIMATE','ASSUMPTION','INTERPRETATION','UNKNOWN') then v_truth := 'INTERPRETATION'; end if;
  if v_state not in ('OPPORTUNITY','REVIEWED','CHOSEN','BASELINE LOCKED','INTERVENTION STARTED','MEASURED','VALUE ATTRIBUTION REVIEWED','REALISED','NOT REALISED','LEARNING') then v_state := 'REVIEWED'; end if;

  select id into v_opportunity_id from public.four_brands_opportunities
  where company_id=p_company_id and detector_key='company_twin:'||v_key and coalesce(provenance->>'surface','')='4brand'
  order by updated_at desc limit 1;

  if v_opportunity_id is null then
    insert into public.four_brands_opportunities(
      company_id,title,detector_key,status,why,calculation,assumptions,evidence,confidence,
      falsifier,possible_intervention,time_to_value,truth_class,provenance,created_by
    ) values (
      p_company_id,v_title,'company_twin:'||v_key,'identified',nullif(p_opportunity->>'why',''),
      jsonb_build_object('value_cell',v_cell,'value_low',nullif(p_opportunity->>'valueLow',''),'value_high',nullif(p_opportunity->>'valueHigh',''),'currency',nullif(p_opportunity->>'currency',''),'calculation',coalesce(p_opportunity->>'calculation','')),
      coalesce(p_opportunity->'assumptions','[]'::jsonb),coalesce(p_opportunity->'evidence','[]'::jsonb),
      nullif(p_opportunity->>'confidence',''),nullif(p_opportunity->>'falsifier',''),nullif(p_opportunity->>'intervention',''),
      nullif(p_opportunity->>'timeToValue',''),v_truth,
      jsonb_build_object('surface','4brand','source_class','COMPANY_TWIN_VALUE_CELL','value_cell',v_cell,'detector',coalesce(p_opportunity->>'detector','')),v_user
    ) returning id into v_opportunity_id;
  else
    update public.four_brands_opportunities
    set title=v_title,why=nullif(p_opportunity->>'why',''),
        calculation=jsonb_build_object('value_cell',v_cell,'value_low',nullif(p_opportunity->>'valueLow',''),'value_high',nullif(p_opportunity->>'valueHigh',''),'currency',nullif(p_opportunity->>'currency',''),'calculation',coalesce(p_opportunity->>'calculation','')),
        assumptions=coalesce(p_opportunity->'assumptions','[]'::jsonb),evidence=coalesce(p_opportunity->'evidence','[]'::jsonb),
        confidence=nullif(p_opportunity->>'confidence',''),falsifier=nullif(p_opportunity->>'falsifier',''),
        possible_intervention=nullif(p_opportunity->>'intervention',''),time_to_value=nullif(p_opportunity->>'timeToValue',''),
        truth_class=v_truth,provenance=jsonb_build_object('surface','4brand','source_class','COMPANY_TWIN_VALUE_CELL','value_cell',v_cell,'detector',coalesce(p_opportunity->>'detector','')),updated_at=now()
    where id=v_opportunity_id;
  end if;

  select id into v_decision_id from public.four_brands_decisions
  where company_id=p_company_id and opportunity_id=v_opportunity_id order by updated_at desc limit 1;

  if v_decision_id is null then
    insert into public.four_brands_decisions(company_id,opportunity_id,title,state,attribution_strength,baseline,evidence,provenance,created_by,decided_at)
    values (p_company_id,v_opportunity_id,v_title,v_state,'IDENTIFIED',coalesce(p_baseline,'{}'::jsonb),
      coalesce(p_opportunity->'evidence','[]'::jsonb),jsonb_build_object('surface','4brand','source_class','VALUE_CELL_DECISION','value_cell',v_cell),v_user,
      case when v_state in ('CHOSEN','BASELINE LOCKED','INTERVENTION STARTED','MEASURED','VALUE ATTRIBUTION REVIEWED','REALISED','NOT REALISED','LEARNING') then now() else null end)
    returning id into v_decision_id;
  else
    update public.four_brands_decisions
    set title=v_title,state=v_state,baseline=case when coalesce(p_baseline,'{}'::jsonb)='{}'::jsonb then baseline else p_baseline end,
        evidence=coalesce(p_opportunity->'evidence','[]'::jsonb),
        provenance=jsonb_build_object('surface','4brand','source_class','VALUE_CELL_DECISION','value_cell',v_cell),
        decided_at=case when v_state in ('CHOSEN','BASELINE LOCKED','INTERVENTION STARTED','MEASURED','VALUE ATTRIBUTION REVIEWED','REALISED','NOT REALISED','LEARNING') then coalesce(decided_at,now()) else null end,
        updated_at=now()
    where id=v_decision_id;
  end if;

  return jsonb_build_object('opportunity_id',v_opportunity_id,'decision_id',v_decision_id,'value_cell',v_cell,'state',v_state);
end;
$function$;

revoke all on function public.four_brands_company_brain_sync_value_cell(uuid,jsonb,text,jsonb) from public, anon;
grant execute on function public.four_brands_company_brain_sync_value_cell(uuid,jsonb,text,jsonb) to authenticated, service_role;
