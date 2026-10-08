-- CAP-PLATFORM-01: explicit owner-controlled membership only for existing 4PLANET ID accounts.
-- No invitations/emails sent; authorised workspace owner grants or revokes access.
create or replace function public.finance_add_team_member(p_space uuid,p_email text,p_role text)
returns boolean language plpgsql security definer set search_path=''
as $$
declare v_actor uuid; v_other uuid;
begin
 v_actor:=auth.uid();
 if v_actor is null or public.finance_team_role(p_space) <> 'owner' then
  raise exception 'Not authorised' using errcode='42501';
 end if;
 if p_email is null or length(p_email)>254 or p_role not in ('editor','viewer') then
  raise exception 'Invalid membership request' using errcode='22023';
 end if;
 select id into v_other from auth.users where lower(email)=lower(trim(p_email)) limit 1;
 if v_other is null then return false; end if;
 if v_other=v_actor then return false; end if;
 insert into public.finance_team_memberships(space_id,user_id,role)
 values(p_space,v_other,p_role)
 on conflict(space_id,user_id) do update set role=excluded.role;
 return true;
end
$$;
revoke all on function public.finance_add_team_member(uuid,text,text) from public, anon;
grant execute on function public.finance_add_team_member(uuid,text,text) to authenticated;
create or replace function public.finance_remove_team_member(p_space uuid,p_user uuid)
returns boolean language plpgsql security definer set search_path=''
as $$
begin
 if auth.uid() is null or public.finance_team_role(p_space)<>'owner' then
  raise exception 'Not authorised' using errcode='42501';
 end if;
 if p_user=auth.uid() then raise exception 'Workspace owner cannot be removed' using errcode='42501'; end if;
 delete from public.finance_team_memberships where space_id=p_space and user_id=p_user and role <> 'owner';
 return found;
end
$$;
revoke all on function public.finance_remove_team_member(uuid,uuid) from public, anon;
grant execute on function public.finance_remove_team_member(uuid,uuid) to authenticated;
