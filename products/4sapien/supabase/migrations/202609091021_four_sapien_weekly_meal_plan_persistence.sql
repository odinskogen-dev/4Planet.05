-- 4SAPIEN / Ask Embla weekly meal-plan persistence
-- Applied to production Supabase project ghvdzetmplqkdtfqiror on 2026-09-09.
-- Shared identity authority remains auth.users. S4PIENS remains Human Systems.

create table if not exists public.four_sapien_meal_plans (
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  meal_names text[] not null default '{}'::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, week_start)
);

alter table public.four_sapien_meal_plans enable row level security;

drop policy if exists four_sapien_meal_plans_owner on public.four_sapien_meal_plans;
create policy four_sapien_meal_plans_owner
  on public.four_sapien_meal_plans
  for all
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
