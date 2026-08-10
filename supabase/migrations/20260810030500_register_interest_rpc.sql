create or replace function public.register_interest_server(
  p_email_norm text,
  p_display_name text,
  p_organisation text,
  p_interest_type text,
  p_message text,
  p_source_route text,
  p_source_channel text,
  p_source_detail jsonb,
  p_privacy_notice_version text,
  p_marketing_consent boolean
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_actor_id uuid;
  v_enquiry_id uuid;
  v_recent_count integer;
begin
  if p_email_norm is null or p_email_norm <> lower(btrim(p_email_norm)) then
    raise exception 'invalid_email_normalization';
  end if;

  select a.actor_id into v_actor_id
  from public.actors a
  where a.email_norm = p_email_norm
  for update;

  if v_actor_id is null then
    insert into public.actors (
      email_norm, display_name, organisation, role_type
    ) values (
      p_email_norm,
      p_display_name,
      nullif(p_organisation, ''),
      case when nullif(p_organisation, '') is null then 'PERSON' else 'ORG_CONTACT' end
    )
    returning actor_id into v_actor_id;
  else
    update public.actors
    set display_name = p_display_name,
        organisation = coalesce(nullif(p_organisation, ''), organisation),
        role_type = case when coalesce(nullif(p_organisation, ''), organisation) is null then 'PERSON' else 'ORG_CONTACT' end
    where actor_id = v_actor_id;
  end if;

  select count(*) into v_recent_count
  from public.interest_enquiries e
  where e.actor_id = v_actor_id
    and e.created_at >= now() - interval '1 hour';

  if v_recent_count >= 5 then
    return jsonb_build_object('stored', false, 'rate_limited', true);
  end if;

  insert into public.interest_enquiries (
    actor_id,
    interest_type,
    message,
    source_route,
    source_channel,
    source_detail,
    privacy_notice_version,
    privacy_acknowledged_at,
    request_basis,
    status
  ) values (
    v_actor_id,
    p_interest_type,
    nullif(p_message, ''),
    p_source_route,
    p_source_channel,
    coalesce(p_source_detail, '{}'::jsonb),
    p_privacy_notice_version,
    now(),
    'USER_REQUESTED_CONTACT',
    'RECEIVED'
  )
  returning enquiry_id into v_enquiry_id;

  if p_marketing_consent is true then
    update public.actors
    set marketing_consent = true,
        marketing_consent_at = now(),
        marketing_consent_version = p_privacy_notice_version,
        marketing_consent_source = p_source_route
    where actor_id = v_actor_id;

    insert into public.consent_events (
      actor_id,
      enquiry_id,
      consent_type,
      granted,
      notice_version,
      source_route
    ) values (
      v_actor_id,
      v_enquiry_id,
      'MARKETING_UPDATES',
      true,
      p_privacy_notice_version,
      p_source_route
    );
  end if;

  return jsonb_build_object(
    'stored', true,
    'rate_limited', false,
    'enquiry_id', v_enquiry_id
  );
end;
$$;

revoke all on function public.register_interest_server(text,text,text,text,text,text,text,jsonb,text,boolean) from public, anon, authenticated;
grant execute on function public.register_interest_server(text,text,text,text,text,text,text,jsonb,text,boolean) to service_role;

comment on function public.register_interest_server(text,text,text,text,text,text,text,jsonb,text,boolean)
is 'Server-only atomic register-interest transaction. Deduplicates actor email, records a bounded enquiry, rate-limits repeated submissions by actor, and records optional marketing consent separately.';
