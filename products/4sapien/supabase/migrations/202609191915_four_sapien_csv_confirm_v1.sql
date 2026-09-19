-- 4SAPIEN CSV IMPORT 01: reuse canonical Finance events and existing import batches.
-- User reviews every row; no bank connection, inferred category, or destructive update.
create unique index if not exists four_sapien_finance_csv_row_owner_uniq
on public.four_sapien_finance_events (user_id,(meta->>'csv_import_fingerprint'))
where meta ? 'csv_import_fingerprint' and state <> 'deleted';

create or replace function public.four_sapien_finance_confirm_csv_import(
  p_sha256 text, p_filename text, p_rows jsonb
) returns jsonb
language plpgsql
security invoker
set search_path = public
as $function$
declare
  v_uid uuid := auth.uid();
  v_row jsonb;
  v_date date;
  v_kind text;
  v_name text;
  v_amt integer;
  v_index int;
  v_fingerprint text;
  v_existing uuid;
  v_batch uuid;
  v_created int := 0;
  v_duplicates int := 0;
  v_review int := 0;
  v_list jsonb := '[]'::jsonb;
  v_saved jsonb;
begin
  if v_uid is null then raise exception 'UNAUTHENTICATED'; end if;
  if p_sha256 !~ '^[a-f0-9]{64}$' then raise exception 'INVALID_CSV_SHA'; end if;
  if nullif(trim(coalesce(p_filename,'')),'') is null or length(p_filename)>180 then raise exception 'INVALID_FILENAME'; end if;
  if p_rows is null or jsonb_typeof(p_rows)<>'array' or jsonb_array_length(p_rows)<1 or jsonb_array_length(p_rows)>100
    then raise exception 'CSV_ROWS_REQUIRED_1_TO_100'; end if;
  perform pg_advisory_xact_lock(hashtext(v_uid::text),hashtext(p_sha256));
  for v_row in select value from jsonb_array_elements(p_rows) loop
    if jsonb_typeof(v_row)<>'object' then raise exception 'INVALID_CSV_ROW'; end if;
    v_kind:=v_row->>'type';
    v_name:=trim(coalesce(v_row->>'name',''));
    if v_kind not in ('income','spend') or v_name='' or length(v_name)>180
      then raise exception 'INVALID_CSV_ROW_DESCRIPTION'; end if;
    if coalesce(v_row->>'amount','') !~ '^[1-9][0-9]{0,8}$'
      then raise exception 'INVALID_CSV_AMOUNT'; end if;
    v_amt:=(v_row->>'amount')::integer;
    if coalesce(v_row->>'row_index','') !~ '^[0-9]{1,6}$'
      then raise exception 'INVALID_CSV_ROW_INDEX'; end if;
    v_index:=(v_row->>'row_index')::integer;
    if coalesce(v_row->>'date','') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}
      then raise exception 'INVALID_CSV_DATE'; end if;
    begin v_date:=(v_row->>'date')::date; exception when others then raise exception 'INVALID_CSV_DATE'; end;
    if to_char(v_date,'YYYY-MM-DD')<>(v_row->>'date') then raise exception 'INVALID_CSV_DATE';end if;
    v_fingerprint:=p_sha256||':'||v_index::text;
    select e.id into v_existing from public.four_sapien_finance_events e
      where e.user_id=v_uid and e.state<>'deleted'
        and e.meta->>'csv_import_fingerprint'=v_fingerprint limit 1;
    if v_existing is not null then
      v_duplicates:=v_duplicates+1;
      v_list:=v_list||jsonb_build_array(jsonb_build_object('row_index',v_index,'state','DUPLICATE'));
      continue;
    end if;
    -- Fail closed on potential overlap with manual receipts, bills and older imports.
    if exists(
      select 1 from public.four_sapien_finance_events e
      where e.user_id=v_uid and e.state<>'deleted'
        and e.type in (v_kind,case when v_kind='spend' then 'bill' else 'income' end)
        and abs(e.amount)=v_amt
        and e.occurred_on between v_date-1 and v_date+1
        and lower(trim(e.name))=lower(v_name)
    ) then
      v_review:=v_review+1;
      v_list:=v_list||jsonb_build_array(jsonb_build_object('row_index',v_index,'state','POSSIBLE_EXISTING'));
      continue;
    end if;
    v_saved:=public.four_sapien_finance_save_event(null,jsonb_build_object(
      'type',v_kind,'name',v_name,'amount',v_amt,'currency','NOK',
      'occurred_on',v_date,'recurring','once','state','active',
      'source','import','truth','user_confirmed',
      'meta',jsonb_build_object('confirmed',true,'csv_import_fingerprint',v_fingerprint,
        'csv_import_sha256',p_sha256,'csv_row_index',v_index,
        'bank_origin','USER_REVIEWED_CSV','category_review',true)
    ));
    v_created:=v_created+1;
    v_list:=v_list||jsonb_build_array(jsonb_build_object('row_index',v_index,'state','SAVED','id',v_saved->>'id'));
  end loop;
  insert into public.four_sapien_finance_import_batches(user_id,filename,rows,matched,duplicates,status,meta)
  values(v_uid,p_filename,jsonb_array_length(p_rows),v_review,v_duplicates,'review',
    jsonb_build_object('csv_sha256',p_sha256,'source','user_reviewed_csv','inserted',v_created,
      'review_required',v_review,'no_auto_reconciliation',true)) returning id into v_batch;
  return jsonb_build_object('state','REVIEWED','batch_id',v_batch,
    'inserted',v_created,'duplicates',v_duplicates,'review_required',v_review,'results',v_list);
end;
$function$;

revoke all on function public.four_sapien_finance_confirm_csv_import(text,text,jsonb) from public,anon;
grant execute on function public.four_sapien_finance_confirm_csv_import(text,text,jsonb) to authenticated,service_role;

      then raise exception 'INVALID_CSV_DATE'; end if;
    begin v_date:=(v_row->>'date')::date; exception when others then raise exception 'INVALID_CSV_DATE'; end;
    if to_char(v_date,'YYYY-MM-DD')<>(v_row->>'date') then raise exception 'INVALID_CSV_DATE';end if;
    v_fingerprint:=p_sha256||':'||v_index::text;
    select e.id into v_existing from public.four_sapien_finance_events e
      where e.user_id=v_uid and e.state<>'deleted'
        and e.meta->>'csv_import_fingerprint'=v_fingerprint limit 1;
    if v_existing is not null then
      v_duplicates:=v_duplicates+1;
      v_list:=v_list||jsonb_build_array(jsonb_build_object('row_index',v_index,'state','DUPLICATE'));
      continue;
    end if;
    -- Fail closed on potential overlap with manual receipts, bills and older imports.
    if exists(
      select 1 from public.four_sapien_finance_events e
      where e.user_id=v_uid and e.state<>'deleted'
        and e.type in (v_kind,case when v_kind='spend' then 'bill' else 'income' end)
        and abs(e.amount)=v_amt
        and e.occurred_on between v_date-1 and v_date+1
        and lower(trim(e.name))=lower(v_name)
    ) then
      v_review:=v_review+1;
      v_list:=v_list||jsonb_build_array(jsonb_build_object('row_index',v_index,'state','POSSIBLE_EXISTING'));
      continue;
    end if;
    v_saved:=public.four_sapien_finance_save_event(null,jsonb_build_object(
      'type',v_kind,'name',v_name,'amount',v_amt,'currency','NOK',
      'occurred_on',v_date,'recurring','once','state','active',
      'source','import','truth','user_confirmed',
      'meta',jsonb_build_object('confirmed',true,'csv_import_fingerprint',v_fingerprint,
        'csv_import_sha256',p_sha256,'csv_row_index',v_index,
        'bank_origin','USER_REVIEWED_CSV','category_review',true)
    ));
    v_created:=v_created+1;
    v_list:=v_list||jsonb_build_array(jsonb_build_object('row_index',v_index,'state','SAVED','id',v_saved->>'id'));
  end loop;
  insert into public.four_sapien_finance_import_batches(user_id,filename,rows,matched,duplicates,status,meta)
  values(v_uid,p_filename,jsonb_array_length(p_rows),v_review,v_duplicates,'review',
    jsonb_build_object('csv_sha256',p_sha256,'source','user_reviewed_csv','inserted',v_created,
      'review_required',v_review,'no_auto_reconciliation',true)) returning id into v_batch;
  return jsonb_build_object('state','REVIEWED','batch_id',v_batch,
    'inserted',v_created,'duplicates',v_duplicates,'review_required',v_review,'results',v_list);
end;
$function$;

revoke all on function public.four_sapien_finance_confirm_csv_import(text,text,jsonb) from public,anon;
grant execute on function public.four_sapien_finance_confirm_csv_import(text,text,jsonb) to authenticated,service_role;
