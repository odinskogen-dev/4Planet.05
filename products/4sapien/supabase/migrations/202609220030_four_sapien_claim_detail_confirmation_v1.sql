-- 4SAPIEN KRAVSVAKT 01 — confirmed document details on the existing Finance event.
-- Additive: no new table, ledger, balance, auth system, payment action or backfill.
-- Text extraction alone must NEVER call this RPC; user confirmation is mandatory.
create or replace function public.four_sapien_finance_confirm_claim_details(
  p_event_id uuid,
  p_details jsonb,
  p_user_confirmed boolean default false
) returns jsonb
language plpgsql volatile security invoker set search_path=public as $fn$
declare
  v_uid uuid := auth.uid();
  v_event public.four_sapien_finance_events%rowtype;
  v_input jsonb := coalesce(p_details, '{}'::jsonb);
  v_claim jsonb;
  v_meta jsonb;
  v_value text;
begin
  if v_uid is null then raise exception 'UNAUTHENTICATED'; end if;
  if p_user_confirmed is distinct from true then raise exception 'EXPLICIT_USER_CONFIRMATION_REQUIRED'; end if;
  if p_event_id is null then raise exception 'FINANCE_EVENT_REQUIRED'; end if;
  if jsonb_typeof(v_input) <> 'object' or v_input = '{}'::jsonb then
    raise exception 'CLAIM_DETAILS_OBJECT_REQUIRED';
  end if;
  if exists (
    select 1 from jsonb_object_keys(v_input) as field(key)
    where field.key not in ('kid', 'account', 'claim_stage')
  ) then raise exception 'UNRECOGNISED_CLAIM_FIELD'; end if;

  select * into v_event from public.four_sapien_finance_events
  where id = p_event_id and user_id = v_uid for update;
  if not found then raise exception 'FINANCE_EVENT_NOT_FOUND_OR_FORBIDDEN'; end if;
  if v_event.type <> 'bill' or v_event.state = 'deleted'
    or v_event.doc_path is null
    or coalesce(v_event.meta->>'document_kind','') <> 'bill'
    or coalesce(v_event.meta->>'document_review','') <> 'user_confirmed'
    or coalesce(v_event.meta->>'document_sha256','') !~ '^[a-f0-9]{64}$'
  then raise exception 'USER_CONFIRMED_DOCUMENT_BILL_REQUIRED'; end if;

  v_meta := coalesce(v_event.meta,'{}'::jsonb);
  v_claim := coalesce(v_meta->'claim_details','{}'::jsonb);
  if jsonb_typeof(v_claim) <> 'object' then raise exception 'CLAIM_DETAILS_INVALID_EXISTING_STATE'; end if;

  if v_input ? 'kid' then
    if v_input->'kid' = 'null'::jsonb then v_claim := v_claim - 'kid';
    else
      if jsonb_typeof(v_input->'kid') <> 'string' then raise exception 'KID_STRING_REQUIRED'; end if;
      v_value := regexp_replace(trim(v_input->>'kid'),'[[:space:]]','','g');
      if v_value !~ '^[0-9]{2,25}$' then raise exception 'KID_FORMAT_INVALID'; end if;
      v_claim := jsonb_set(v_claim,'{kid}',to_jsonb(v_value),true);
    end if;
  end if;
  if v_input ? 'account' then
    if v_input->'account' = 'null'::jsonb then v_claim := v_claim - 'account';
    else
      if jsonb_typeof(v_input->'account') <> 'string' then raise exception 'ACCOUNT_STRING_REQUIRED'; end if;
      v_value := regexp_replace(trim(v_input->>'account'),'[[:space:].]','','g');
      if v_value !~ '^[0-9]{11}$' then raise exception 'ACCOUNT_FORMAT_INVALID'; end if;
      v_claim := jsonb_set(v_claim,'{account}',to_jsonb(v_value),true);
    end if;
  end if;
  if v_input ? 'claim_stage' then
    if v_input->'claim_stage' = 'null'::jsonb then v_claim := v_claim - 'claim_stage';
    else
      if jsonb_typeof(v_input->'claim_stage') <> 'string' then raise exception 'CLAIM_STAGE_STRING_REQUIRED'; end if;
      v_value := lower(trim(v_input->>'claim_stage'));
      if v_value not in ('faktura','purring','inkassovarsel','betalingsoppfordring')
        then raise exception 'CLAIM_STAGE_INVALID'; end if;
      v_claim := jsonb_set(v_claim,'{claim_stage}',to_jsonb(v_value),true);
    end if;
  end if;

  if v_claim = coalesce(v_meta->'claim_details','{}'::jsonb) then
    return jsonb_build_object('state','ALREADY_CONFIRMED','finance_event_id',v_event.id,
      'no_second_finance_event',true,'payment_action_performed',false);
  end if;
  if v_claim = '{}'::jsonb then
    v_meta := v_meta - 'claim_details' - 'claim_details_review' - 'claim_details_updated_at';
  else
    v_meta := jsonb_set(v_meta,'{claim_details}',v_claim,true) ||
      jsonb_build_object('claim_details_review','USER_CONFIRMED_TRANSCRIPTION_NOT_PAYMENT_VALIDATION',
        'claim_details_updated_at',now());
  end if;
  update public.four_sapien_finance_events
  set meta=v_meta, updated_at=now()
  where id=v_event.id and user_id=v_uid;
  if not found then raise exception 'CLAIM_DETAILS_WRITE_FAILED'; end if;
  return jsonb_build_object('state',case when v_claim='{}'::jsonb then 'CLEARED' else 'SAVED' end,
    'finance_event_id',v_event.id,'kid_present',v_claim ? 'kid',
    'account_present',v_claim ? 'account','claim_stage_present',v_claim ? 'claim_stage',
    'review','USER_CONFIRMED_TRANSCRIPTION_NOT_PAYMENT_VALIDATION',
    'no_second_finance_event',true,'payment_action_performed',false);
end $fn$;
revoke all on function public.four_sapien_finance_confirm_claim_details(uuid,jsonb,boolean) from public,anon;
grant execute on function public.four_sapien_finance_confirm_claim_details(uuid,jsonb,boolean) to authenticated,service_role;
