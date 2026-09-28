create or replace function public.four_brands_company_brain_create_workspace(
  p_display_name text,
  p_legal_name text default null::text
)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_user uuid := auth.uid();
  v_company_id uuid;
  v_name text := nullif(btrim(coalesce(p_display_name,'')),'');
begin
  if v_user is null then
    raise exception 'AUTH_REQUIRED' using errcode='42501';
  end if;
  if v_name is null or length(v_name) < 2 then
    raise exception 'COMPANY_NAME_REQUIRED' using errcode='22023';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(v_user::text || ':' || lower(v_name), 0)
  );

  select c.id into v_company_id
  from public.four_brands_companies c
  join public.four_brands_memberships m on m.company_id=c.id
  where m.user_id=v_user
    and m.status='active'
    and lower(c.display_name)=lower(v_name)
  order by c.created_at asc
  limit 1;

  if v_company_id is null then
    insert into public.four_brands_companies(display_name,legal_name,created_by,public_model)
    values(
      v_name,
      nullif(btrim(coalesce(p_legal_name,'')),''),
      v_user,
      jsonb_build_object('created_via','4brand_company_brain','source_class','USER_CREATED_WORKSPACE')
    )
    returning id into v_company_id;

    -- four_brands_companies_bootstrap_owner already creates the owner row.
    -- Keep this path idempotent so the RPC remains correct if the trigger is
    -- present, absent, retried or restored from a migration boundary.
    insert into public.four_brands_memberships(company_id,user_id,role,status)
    values(v_company_id,v_user,'owner','active')
    on conflict (company_id,user_id) do update
      set role='owner',
          status='active',
          updated_at=now();
  end if;

  return jsonb_build_object('company_id',v_company_id,'created_or_existing',true);
end;
$function$;