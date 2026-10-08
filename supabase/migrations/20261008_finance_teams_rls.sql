-- CAP-PLATFORM-01 / approved shared 4PLANET Supabase only
-- Shared-team PRIVATE UX state, not a funder/opportunity/source-of-truth database.
-- Universal 4PLANET ID accounts remain auth.users; organisation access is explicit, default-deny.
create table if not exists public.finance_team_spaces (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 120),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table if not exists public.finance_team_memberships (
  space_id uuid not null references public.finance_team_spaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','admin','editor','viewer')),
  created_at timestamptz not null default now(),
  primary key(space_id,user_id)
);
create index if not exists finance_team_memberships_user_idx on public.finance_team_memberships(user_id);
create table if not exists public.finance_team_state (
  space_id uuid primary key references public.finance_team_spaces(id) on delete cascade,
  app_state jsonb not null default '{"projects":[],"pipeline":[]}'::jsonb,
  revision bigint not null default 1 check (revision>0),
  updated_at timestamptz not null default now(),
  constraint finance_team_state_shape check(
    jsonb_typeof(app_state)='object'
    and jsonb_typeof(app_state->'projects')='array'
    and jsonb_typeof(app_state->'pipeline')='array'
    and pg_column_size(app_state)<1000000
  )
);
alter table public.finance_team_spaces enable row level security;
alter table public.finance_team_memberships enable row level security;
alter table public.finance_team_state enable row level security;
revoke all on public.finance_team_spaces, public.finance_team_memberships, public.finance_team_state from public, anon;
grant select, update on public.finance_team_spaces to authenticated;
grant select on public.finance_team_memberships to authenticated;
grant select, update on public.finance_team_state to authenticated;

-- Stable helper runs with definer privilege only to bypass memberships' own RLS and
-- prevent policy recursion. It returns no user data, only current caller's role.
create or replace function public.finance_team_role(p_space uuid)
returns text language sql stable security definer set search_path = ''
as $$
  select membership.role from public.finance_team_memberships membership
  where membership.space_id = p_space and membership.user_id = auth.uid()
  limit 1
$$;
revoke all on function public.finance_team_role(uuid) from public, anon;
grant execute on function public.finance_team_role(uuid) to authenticated;

drop policy if exists finance_team_space_read on public.finance_team_spaces;
drop policy if exists finance_team_space_update on public.finance_team_spaces;
drop policy if exists finance_team_membership_read on public.finance_team_memberships;
drop policy if exists finance_team_state_read on public.finance_team_state;
drop policy if exists finance_team_state_edit on public.finance_team_state;

create policy finance_team_space_read on public.finance_team_spaces
 for select to authenticated using (public.finance_team_role(id) is not null);
create policy finance_team_space_update on public.finance_team_spaces
 for update to authenticated using (public.finance_team_role(id)='owner')
 with check (public.finance_team_role(id)='owner' and owner_user_id=auth.uid());
create policy finance_team_membership_read on public.finance_team_memberships
 for select to authenticated using (user_id=auth.uid() or public.finance_team_role(space_id) in ('owner','admin'));
create policy finance_team_state_read on public.finance_team_state
 for select to authenticated using (public.finance_team_role(space_id) is not null);
create policy finance_team_state_edit on public.finance_team_state
 for update to authenticated using (public.finance_team_role(space_id) in ('owner','admin','editor'))
 with check (public.finance_team_role(space_id) in ('owner','admin','editor'));

-- Single atomic creation: caller automatically becomes OWNER. Other authenticated
-- users cannot directly add memberships or create another user's workspace.
create or replace function public.finance_create_team(p_title text)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare v_user uuid; v_id uuid;
begin
  v_user := auth.uid();
  if v_user is null then raise exception 'Unauthenticated' using errcode='28000'; end if;
  if p_title is null or char_length(trim(p_title)) not between 3 and 120 then
    raise exception 'Workspace title must be 3–120 characters' using errcode='22023';
  end if;
  insert into public.finance_team_spaces(title,owner_user_id) values(trim(p_title),v_user) returning id into v_id;
  insert into public.finance_team_memberships(space_id,user_id,role) values(v_id,v_user,'owner');
  insert into public.finance_team_state(space_id) values(v_id);
  return v_id;
end
$$;
revoke all on function public.finance_create_team(text) from public, anon;
grant execute on function public.finance_create_team(text) to authenticated;

comment on table public.finance_team_spaces is 'Finance-only member-space ACL metadata; shared user identities live in canonical 4PLANET ID.';
comment on table public.finance_team_state is 'Workspace-private project/CRM drafts; not BRAIN truth for funders, calls or awards.';
