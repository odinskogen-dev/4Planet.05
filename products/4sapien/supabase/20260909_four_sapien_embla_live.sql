-- 4SAPIEN / Ask Embla production schema
-- Personal product namespace. S4PIENS is reserved for Human Systems.
-- Shared identity authority: Supabase auth.users.

create extension if not exists pgcrypto;

create table if not exists public.four_sapien_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  household text,
  diet text not null default 'Alt',
  avoid text[] not null default '{}'::text[],
  default_store text,
  weekly_budget integer check (weekly_budget is null or weekly_budget >= 0),
  primary_priority text not null default 'balanced',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.four_sapien_list_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  gtin text,
  product jsonb,
  created_at timestamptz not null default now()
);
create index if not exists four_sapien_list_items_user_created_idx
  on public.four_sapien_list_items(user_id, created_at);

create table if not exists public.four_sapien_shops (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  store text not null,
  amount integer not null check (amount >= 0),
  purchased_on date not null default current_date,
  receipt_path text,
  ocr_state text not null default 'none' check (ocr_state in ('none','pending','parsed','failed')),
  created_at timestamptz not null default now()
);
create index if not exists four_sapien_shops_user_date_idx
  on public.four_sapien_shops(user_id, purchased_on desc);

create table if not exists public.four_sapien_shop_lines (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.four_sapien_shops(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  gtin text,
  qty numeric,
  price integer,
  created_at timestamptz not null default now()
);
create index if not exists four_sapien_shop_lines_user_shop_idx
  on public.four_sapien_shop_lines(user_id, shop_id);

alter table public.four_sapien_profiles enable row level security;
alter table public.four_sapien_list_items enable row level security;
alter table public.four_sapien_shops enable row level security;
alter table public.four_sapien_shop_lines enable row level security;

-- Idempotent owner-only RLS.
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='four_sapien_profiles' and policyname='four_sapien_profiles_owner') then
    create policy four_sapien_profiles_owner on public.four_sapien_profiles
      for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='four_sapien_list_items' and policyname='four_sapien_list_items_owner') then
    create policy four_sapien_list_items_owner on public.four_sapien_list_items
      for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='four_sapien_shops' and policyname='four_sapien_shops_owner') then
    create policy four_sapien_shops_owner on public.four_sapien_shops
      for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='four_sapien_shop_lines' and policyname='four_sapien_shop_lines_owner') then
    create policy four_sapien_shop_lines_owner on public.four_sapien_shop_lines
      for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
  end if;
end $$;

-- Private receipt storage. Bucket and object path are namespaced to the personal product.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('four-sapien-receipts','four-sapien-receipts',false,10485760,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='four_sapien_receipts_select') then
    create policy four_sapien_receipts_select on storage.objects for select to authenticated
      using (bucket_id='four-sapien-receipts' and (storage.foldername(name))[1] = auth.uid()::text);
  end if;
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='four_sapien_receipts_insert') then
    create policy four_sapien_receipts_insert on storage.objects for insert to authenticated
      with check (bucket_id='four-sapien-receipts' and (storage.foldername(name))[1] = auth.uid()::text);
  end if;
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='four_sapien_receipts_update') then
    create policy four_sapien_receipts_update on storage.objects for update to authenticated
      using (bucket_id='four-sapien-receipts' and (storage.foldername(name))[1] = auth.uid()::text)
      with check (bucket_id='four-sapien-receipts' and (storage.foldername(name))[1] = auth.uid()::text);
  end if;
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='four_sapien_receipts_delete') then
    create policy four_sapien_receipts_delete on storage.objects for delete to authenticated
      using (bucket_id='four-sapien-receipts' and (storage.foldername(name))[1] = auth.uid()::text);
  end if;
end $$;
