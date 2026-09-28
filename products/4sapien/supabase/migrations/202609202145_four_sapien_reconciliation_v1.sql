-- 4SAPIEN REAL DATA 03 — RLS-scoped, user-confirmed reconciliation on canonical events.
-- Invoice/receipt + observed bank import = one counted spend, two preserved source records.
-- No auto match, no extra ledger, no hard delete, no external financial action.

create or replace function public.four_sapien_finance_reconciliation_candidates(
  p_import_event_id uuid default null,
  p_limit integer default 25
) returns jsonb language plpgsql stable security invoker set search_path=public as $fn$
declare
  v_uid uuid:=auth.uid(); v_matches jsonb;
begin
  if v_uid is null then return jsonb_build_object('state','UNAUTHENTICATED'); end if;
  if p_limit not between 1 and 100 then raise exception 'INVALID_LIMIT'; end if;
  select coalesce(jsonb_agg(z.item order by z.day_distance,z.import_date), '[]'::jsonb)
  into v_matches
  from (
    select jsonb_build_object(
      'prior_event_id',e.id,'import_event_id',b.id,
      'prior_type',e.type,'prior_name',e.name,'import_name',b.name,
      'amount',abs(b.amount),'prior_date',e.occurred_on,
      'import_date',b.occurred_on,'day_distance',abs(b.occurred_on-e.occurred_on),
      'original_present',e.doc_path is not null,
      'match_state','POSSIBLE_REVIEW_REQUIRED',
      'same_name',lower(trim(e.name))=lower(trim(b.name))
    ) item,abs(b.occurred_on-e.occurred_on) day_distance,b.occurred_on import_date
    from public.four_sapien_finance_events b
    join public.four_sapien_finance_events e
      on e.user_id=b.user_id and e.id<>b.id
      and e.state in ('active','upcoming')
      and (e.type='bill' or (e.type='spend' and e.source='receipt'))
      and e.recurring='once' and b.recurring='once'
      and e.currency='NOK' and b.currency='NOK'
      and abs(e.amount)=abs(b.amount)
      and abs(e.occurred_on-b.occurred_on)<=14
      and e.meta->>'reconciled_bank_event_id' is null
    where b.user_id=v_uid and (p_import_event_id is null or b.id=p_import_event_id)
      and b.source='import' and b.type='spend' and b.state='active'
      and b.meta ? 'csv_import_fingerprint'
      and lower(b.truth) in ('user_confirmed','confirmed','source_verified')
      and b.meta->>'reconciled_prior_event_id' is null
    order by abs(b.occurred_on-e.occurred_on),b.occurred_on
    limit p_limit
  ) z;
  return jsonb_build_object('state','REVIEW_ONLY','user_id',v_uid,'matches',v_matches,
    'auto_reconciled',false,'date_tolerance_days',14);
end $fn$;

create or replace function public.four_sapien_finance_confirm_reconciliation(
  p_prior_event_id uuid,
  p_import_event_id uuid
) returns jsonb language plpgsql volatile security invoker set search_path=public as $fn$
declare
  v_uid uuid:=auth.uid();
  v_prior public.four_sapien_finance_events%rowtype;
  v_import public.four_sapien_finance_events%rowtype;
begin
 if v_uid is null then raise exception 'UNAUTHENTICATED'; end if;
 if p_prior_event_id is null or p_import_event_id is null
   or p_prior_event_id=p_import_event_id then raise exception 'TWO_DISTINCT_EVENTS_REQUIRED'; end if;
 perform pg_advisory_xact_lock(hashtext(v_uid::text),hashtext(p_import_event_id::text));
 select * into v_import from public.four_sapien_finance_events
  where id=p_import_event_id and user_id=v_uid for update;
 if not found then raise exception 'IMPORT_EVENT_NOT_FOUND_OR_FORBIDDEN'; end if;
 select * into v_prior from public.four_sapien_finance_events
  where id=p_prior_event_id and user_id=v_uid for update;
 if not found then raise exception 'PRIOR_EVENT_NOT_FOUND_OR_FORBIDDEN'; end if;
 if v_prior.meta->>'reconciled_bank_event_id'=v_import.id::text
   and v_import.meta->>'reconciled_prior_event_id'=v_prior.id::text
   then return jsonb_build_object('state','ALREADY_RECONCILED',
     'prior_event_id',v_prior.id,'import_event_id',v_import.id,
     'additional_finance_event_created',false);end if;
 if v_import.source<>'import' or v_import.type<>'spend' or v_import.state<>'active'
   or v_import.recurring<>'once' or
   not (v_import.meta ? 'csv_import_fingerprint')
   or lower(v_import.truth) not in ('user_confirmed','confirmed','source_verified')
   then raise exception 'CONFIRMED_BANK_IMPORT_REQUIRED';end if;
 if v_prior.state not in ('active','upcoming')
   or v_prior.recurring<>'once' or
   not (v_prior.type='bill' or (v_prior.type='spend' and v_prior.source='receipt'))
   or lower(v_prior.truth) not in ('user_confirmed','confirmed','source_verified')
   then raise exception 'CONFIRMED_PRIOR_BILL_OR_RECEIPT_REQUIRED';end if;
 if v_prior.currency<>'NOK' or v_import.currency<>'NOK'
   or v_prior.amount<>v_import.amount or v_prior.amount<=0
   or abs(v_prior.occurred_on-v_import.occurred_on)>14
   then raise exception 'MATCH_REQUIRES_SEPARATE_REVIEW';end if;
 if v_import.meta->>'reconciled_prior_event_id' is not null
   or v_prior.meta->>'reconciled_bank_event_id' is not null
   then raise exception 'ALREADY_RECONCILED_DIFFERENT_EVENT';end if;
 update public.four_sapien_finance_events e
 set state='reconciled',
     meta=e.meta||jsonb_build_object(
       'reconciled_bank_event_id',v_import.id::text,
       'reconciled_at',now(),
       'reconciliation_state','USER_CONFIRMED',
       'payment_state','PAID_SOURCE_MATCHED',
       'paid_observed_on',v_import.occurred_on),
     updated_at=now()
 where e.id=v_prior.id and e.user_id=v_uid;
 if not found then raise exception 'PRIOR_RECONCILIATION_WRITE_FAILED';end if;
 update public.four_sapien_finance_events e
 set meta=e.meta||jsonb_build_object(
       'reconciled_prior_event_id',v_prior.id::text,
       'reconciled_at',now(),
       'reconciliation_state','USER_CONFIRMED',
       'linked_document_path',v_prior.doc_path,
       'document_kind',v_prior.meta->>'document_kind',
       'one_spend_only',true),
     updated_at=now()
 where e.id=v_import.id and e.user_id=v_uid;
 if not found then raise exception 'BANK_RECONCILIATION_WRITE_FAILED';end if;
 return jsonb_build_object('state','RECONCILED','prior_event_id',v_prior.id,
   'import_event_id',v_import.id,'canonical_counted_event_id',v_import.id,
   'amount',v_import.amount,'paid_observed_on',v_import.occurred_on,
   'additional_finance_event_created',false,'original_retained',true);
end $fn$;

revoke all on function public.four_sapien_finance_reconciliation_candidates(uuid,integer) from public,anon;
revoke all on function public.four_sapien_finance_confirm_reconciliation(uuid,uuid) from public,anon;
grant execute on function public.four_sapien_finance_reconciliation_candidates(uuid,integer) to authenticated,service_role;
grant execute on function public.four_sapien_finance_confirm_reconciliation(uuid,uuid) to authenticated,service_role;
