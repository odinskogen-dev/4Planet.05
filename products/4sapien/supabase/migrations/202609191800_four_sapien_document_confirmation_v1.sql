-- 4SAPIEN DOCUMENT INTAKE 01 — additive, reversible, no new truth store
-- A single atomic bridge from PRIVATE existing Finance Storage to canonical Finance events.
-- Only explicit user confirmation creates the event; never infer paid from a bill.
create unique index if not exists four_sapien_finance_document_sha_owner_uniq
on public.four_sapien_finance_events (user_id,(meta->>'document_sha256'))
where meta ? 'document_sha256' and state <> 'deleted';

create or replace function public.four_sapien_finance_confirm_document(
  p_doc_path text,
  p_doc_sha256 text,
  p_kind text,
  p_name text,
  p_amount integer,
  p_occurred_on date,
  p_category text default null,
  p_extracted_text text default null
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $function$
declare
  v_uid uuid := auth.uid();
  v_event uuid;
  v_existing uuid;
  v_result jsonb;
  v_kind text := lower(trim(coalesce(p_kind,'')));
  v_meta jsonb;
begin
  if v_uid is null then raise exception 'UNAUTHENTICATED'; end if;
  if v_kind not in ('bill','receipt') then raise exception 'INVALID_DOCUMENT_KIND'; end if;
  if p_doc_sha256 is null or p_doc_sha256 !~ '^[a-f0-9]{64}$' then raise exception 'INVALID_DOCUMENT_SHA'; end if;
  if p_doc_path is null or left(p_doc_path,length(v_uid::text)+1) <> v_uid::text||'/' or length(p_doc_path)>500
    then raise exception 'DOCUMENT_PATH_NOT_OWNED'; end if;
  if nullif(trim(coalesce(p_name,'')),'') is null or length(p_name)>180 then raise exception 'INVALID_DOCUMENT_NAME'; end if;
  if p_amount is null or p_amount<=0 or p_amount>1000000000 then raise exception 'INVALID_DOCUMENT_AMOUNT'; end if;
  if p_occurred_on is null then raise exception 'DOCUMENT_DATE_REQUIRED'; end if;
  if length(coalesce(p_extracted_text,''))>12000 then raise exception 'DOCUMENT_TEXT_TOO_LONG'; end if;
  if not exists(
    select 1 from storage.objects
    where bucket_id='four-sapien-finance-docs' and name=p_doc_path
  ) then raise exception 'DOCUMENT_NOT_IN_PRIVATE_STORAGE'; end if;

  perform pg_advisory_xact_lock(hashtext(v_uid::text), hashtext(p_doc_sha256));
  select id into v_existing from public.four_sapien_finance_events
    where user_id=v_uid and meta->>'document_sha256'=p_doc_sha256 and state<>'deleted'
    limit 1;
  if v_existing is not null then
    return jsonb_build_object('state','DUPLICATE','id',v_existing,'saved',false);
  end if;

  v_meta := jsonb_build_object(
    'document_sha256',p_doc_sha256,
    'document_kind',v_kind,
    'document_review','user_confirmed',
    'confirmed',true,
    'payment_state',case when v_kind='bill' then 'NOT_MARKED_PAID' else 'RECORDED_SPENT' end,
    'extracted_text',coalesce(p_extracted_text,'')
  );
  v_result:=public.four_sapien_finance_save_event(
    null,
    jsonb_build_object(
      'type',case when v_kind='bill' then 'bill' else 'spend' end,
      'name',trim(p_name),
      'amount',p_amount,
      'currency','NOK',
      'category',nullif(trim(coalesce(p_category,'')),''),
      'occurred_on',p_occurred_on,
      'recurring','once',
      'state',case when v_kind='bill' then 'upcoming' else 'active' end,
      'source',case when v_kind='bill' then 'manual' else 'receipt' end,
      'truth','user_confirmed',
      'meta',v_meta
    )
  );
  v_event:=(v_result->>'id')::uuid;
  update public.four_sapien_finance_events
  set doc_path=p_doc_path,updated_at=now()
  where id=v_event and user_id=v_uid;
  if not found then raise exception 'DOCUMENT_LINK_FAILED'; end if;

  return jsonb_build_object('state','SAVED','id',v_event,'saved',true,
    'payment_state',case when v_kind='bill' then 'NOT_MARKED_PAID' else 'RECORDED_SPENT' end);
end;
$function$;

revoke all on function public.four_sapien_finance_confirm_document(text,text,text,text,integer,date,text,text) from public,anon;
grant execute on function public.four_sapien_finance_confirm_document(text,text,text,text,integer,date,text,text) to authenticated,service_role;
