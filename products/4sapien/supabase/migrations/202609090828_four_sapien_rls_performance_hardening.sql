-- 4SAPIEN / Ask Embla production hardening
-- Applied to production Supabase project ghvdzetmplqkdtfqiror on 2026-09-09.
-- Keeps personal 4SAPIEN data isolated from S4PIENS Human Systems.

create index if not exists four_sapien_shop_lines_shop_id_idx
  on public.four_sapien_shop_lines(shop_id);

drop policy if exists four_sapien_profiles_owner on public.four_sapien_profiles;
create policy four_sapien_profiles_owner
  on public.four_sapien_profiles
  for all
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists four_sapien_list_items_owner on public.four_sapien_list_items;
create policy four_sapien_list_items_owner
  on public.four_sapien_list_items
  for all
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists four_sapien_shops_owner on public.four_sapien_shops;
create policy four_sapien_shops_owner
  on public.four_sapien_shops
  for all
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists four_sapien_shop_lines_owner on public.four_sapien_shop_lines;
create policy four_sapien_shop_lines_owner
  on public.four_sapien_shop_lines
  for all
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
