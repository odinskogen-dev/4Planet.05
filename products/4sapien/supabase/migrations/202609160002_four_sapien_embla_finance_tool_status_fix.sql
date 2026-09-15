-- Align deterministic Finance tool audit writes with the existing Embla Core status constraint.
create or replace function public.four_sapien_embla_finance_tool(p_tool text,p_arguments jsonb default '{}'::jsonb)
returns jsonb language plpgsql volatile set search_path to 'public'
as $function$
declare
  v_uid uuid:=auth.uid(); v_result jsonb; v_id uuid:=gen_random_uuid(); v_started timestamptz:=clock_timestamp(); v_year int;
begin
  if v_uid is null then return jsonb_build_object('state','UNAUTHENTICATED'); end if;
  v_year:=coalesce(nullif(p_arguments->>'year','')::int,extract(year from current_date)::int);
  if p_tool='finance_twin' then
    v_result:=public.four_sapien_finance_twin(v_year);
  elsif p_tool='monthly_timeline' then
    v_result:=public.four_sapien_finance_monthly_timeline(v_year);
  elsif p_tool='food_until_payday' then
    v_result:=public.four_sapien_plan_food_until_payday_context();
  else
    raise exception 'UNKNOWN_FINANCE_TOOL';
  end if;
  insert into public.four_sapien_embla_tool_calls(id,user_id,tool_name,arguments_redacted,result_summary,status,started_at,completed_at,latency_ms)
  values(v_id,v_uid,'finance.'||p_tool,coalesce(p_arguments,'{}'::jsonb),jsonb_build_object('state',v_result->>'state','truth',coalesce(v_result->>'truth',v_result->'liquidity'->>'truth')),'succeeded',v_started,clock_timestamp(),greatest(0,(extract(epoch from (clock_timestamp()-v_started))*1000)::int));
  return v_result;
exception when others then
  if v_uid is not null then
    insert into public.four_sapien_embla_tool_calls(id,user_id,tool_name,arguments_redacted,result_summary,status,error_code,started_at,completed_at)
    values(v_id,v_uid,'finance.'||coalesce(p_tool,'unknown'),coalesce(p_arguments,'{}'::jsonb),'{}'::jsonb,'failed',sqlstate,v_started,clock_timestamp());
  end if;
  raise;
end;
$function$;

revoke all on function public.four_sapien_embla_finance_tool(text,jsonb) from public,anon;
grant execute on function public.four_sapien_embla_finance_tool(text,jsonb) to authenticated;
