create table if not exists public.four_planet_atlas_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  follows jsonb not null default '[]'::jsonb,
  saved_views jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  constraint four_planet_atlas_state_follows_array check (jsonb_typeof(follows) = 'array'),
  constraint four_planet_atlas_state_saved_views_array check (jsonb_typeof(saved_views) = 'array')
);

alter table public.four_planet_atlas_state enable row level security;

drop policy if exists four_planet_atlas_state_owner on public.four_planet_atlas_state;
create policy four_planet_atlas_state_owner
on public.four_planet_atlas_state
for all
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

revoke all on public.four_planet_atlas_state from anon;
grant select, insert, update, delete on public.four_planet_atlas_state to authenticated;

comment on table public.four_planet_atlas_state is
'User-owned ATLAS follows and saved views for 4PLANET ID sync. Anonymous ATLAS remains local-first.';
