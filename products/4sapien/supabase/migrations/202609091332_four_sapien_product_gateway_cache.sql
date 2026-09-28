-- 4SAPIEN / Ask Embla product gateway cache
-- Service-only cache. Browser users receive product responses via the authenticated Edge Function.

create table if not exists public.four_sapien_product_cache (
  cache_key text primary key,
  kind text not null check (kind in ('search','ean')),
  query_text text not null,
  payload jsonb not null,
  source_state text not null,
  fetched_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists four_sapien_product_cache_expires_idx
  on public.four_sapien_product_cache(expires_at);

alter table public.four_sapien_product_cache enable row level security;

comment on table public.four_sapien_product_cache is
  'Service-only cache for 4SAPIEN product gateway. No browser policies; Edge Function service role only.';
