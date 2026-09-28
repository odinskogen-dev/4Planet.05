-- 4SAPIEN REAL DATA 03: optional user-confirmed receipt → Food bridge.
-- No new ledger / copies of cost. The canonical Finance event remains the only spend.
-- The Food shop records shopping context only; the Finance event owns original doc.
create unique index if not exists four_sapien_receipt_food_shop_owner_uniq
on public.four_sapien_finance_events (user_id,(meta->>'food_shop_id'))
where meta ? 'food_shop_id' and state<>'deleted' and type='spend';

create or replace function public.four_sapien_link_receipt_to_food(
  p_finance_event_id uuid,
  p_shop_id uuid default null,
  p_store text default null,
  p_item_lines jsonb default '[]'::jsonb
) returns jsonb
language plpgsql volatile security invoker set search_path=public
as $fn$
declare
  v_uid uuid:=auth.uid();
  v_event public.four_sapien_finance_events%rowtype;
  v_shop public.four_sapien_shops%rowtype;
  v_store text:=trim(coalesce(p_store,''));
  v_line jsonb;
  v_existing_shop uuid;
  v_candidate_count integer;
  v_candidates jsonb;
  v_created boolean:=false;
begin
  if v_uid is null then raise exception 'UNAUTHENTICATED'; end if;
  if p_finance_event_id is null then raise exception 'FINANCE_EVENT_REQUIRED'; end if;
  if p_item_lines is null or jsonb_typeof(p_item_lines)<>'array'
    or jsonb_array_length(p_item_lines)>30 then raise exception 'INVALID_CONFIRMED_LINE_ITEMS'; end if;
  for v_line in select value from jsonb_array_elements(p_item_lines) loop
    if jsonb_typeof(v_line)<>'object' or
      nullif(trim(coalesce(v_line->>'name','')),'') is null or
      length(v_line->>'name')>140 or
      (v_line ? 'price_kr' and (v_line->>'price_kr' !~ '^[0-9]{1,9}$'))
      then raise exception 'INVALID_CONFIRMED_LINE_ITEM'; end if;
  end loop;
  select * into v_event from public.four_sapien_finance_events
  where id=p_finance_event_id and user_id=v_uid for update;
  if not found then raise exception 'FINANCE_EVENT_NOT_FOUND'; end if;
  if v_event.type<>'spend' or v_event.state='deleted'
    or v_event.doc_path is null
    or v_event.meta->>'document_kind'<>'receipt'
    or v_event.meta->>'document_review'<>'user_confirmed'
    or lower(v_event.truth) not in ('user_confirmed','confirmed','source_verified')
    then raise exception 'CONFIRMED_RECEIPT_REQUIRED'; end if;
  if v_event.amount<=0 or v_event.currency<>'NOK' then raise exception 'RECEIPT_AMOUNT_CURRENCY_INVALID'; end if;
  v_existing_shop:=nullif(v_event.meta->>'food_shop_id','')::uuid;
  if v_existing_shop is not null then
    return jsonb_build_object('state','ALREADY_LINKED','finance_event_id',v_event.id,
      'shop_id',v_existing_shop,'shop_created',false,'no_second_finance_event',true);
  end if;
  perform pg_advisory_xact_lock(hashtext(v_uid::text),hashtext(v_event.id::text));
  if p_shop_id is not null then
    select * into v_shop from public.four_sapien_shops
      where id=p_shop_id and user_id=v_uid for update;
    if not found then raise exception 'FOOD_SHOP_NOT_FOUND_OR_FORBIDDEN'; end if;
    if v_shop.purchased_on<>v_event.occurred_on or v_shop.amount<>abs(v_event.amount)
      then raise exception 'FOOD_SHOP_AMOUNT_DATE_MISMATCH'; end if;
    if v_store<>'' and lower(v_store)<>lower(v_shop.store)
      then raise exception 'FOOD_SHOP_STORE_MISMATCH'; end if;
    if exists(select 1 from public.four_sapien_finance_events e
      where e.user_id=v_uid and e.state<>'deleted' and e.id<>v_event.id
        and e.meta->>'food_shop_id'=v_shop.id::text)
      then raise exception 'FOOD_SHOP_ALREADY_LINKED_TO_ANOTHER_RECEIPT'; end if;
    if v_shop.receipt_path is not null
      then raise exception 'FOOD_SHOP_HAS_EXISTING_RECEIPT_REVIEW_REQUIRED'; end if;
  else
    if v_store='' or length(v_store)>120 then raise exception 'STORE_CONFIRMATION_REQUIRED'; end if;
    select count(*),coalesce(jsonb_agg(id),'[]'::jsonb)
    into v_candidate_count,v_candidates
    from public.four_sapien_shops s where s.user_id=v_uid
      and s.amount=abs(v_event.amount)
      and s.purchased_on=v_event.occurred_on
      and lower(trim(s.store))=lower(v_store);
    if v_candidate_count>0 then
      return jsonb_build_object('state','FOOD_SHOP_MATCH_REVIEW_REQUIRED',
        'matching_shop_ids',v_candidates,'no_second_finance_event',true);
    end if;
    insert into public.four_sapien_shops(user_id,store,amount,purchased_on,receipt_path,ocr_state)
    values(v_uid,v_store,abs(v_event.amount),v_event.occurred_on,null,'none')
    returning * into v_shop;
    v_created:=true;
  end if;
  update public.four_sapien_finance_events e
  set meta=e.meta || jsonb_build_object('food_shop_id',v_shop.id::text,
      'food_receipt_confirmed_at',now(),'food_item_lines',p_item_lines,
      'food_item_confirmation','user_confirmed',
      'no_additional_finance_spend',true),
      updated_at=now()
  where e.user_id=v_uid and e.id=v_event.id;
  if not found then raise exception 'FOOD_LINK_READBACK_FAILED'; end if;
  return jsonb_build_object('state','LINKED','finance_event_id',v_event.id,
    'shop_id',v_shop.id,'shop_created',v_created,
    'confirmed_item_lines',jsonb_array_length(p_item_lines),
    'no_second_finance_event',true,'finance_document_bucket','four-sapien-finance-docs');
end
$fn$;

revoke all on function public.four_sapien_link_receipt_to_food(uuid,uuid,text,jsonb) from public,anon;
grant execute on function public.four_sapien_link_receipt_to_food(uuid,uuid,text,jsonb) to authenticated,service_role;
