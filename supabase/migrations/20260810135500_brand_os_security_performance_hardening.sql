-- 4PLANET Brand OS security + performance hardening
-- Generated after Supabase database-advisor review on canonical 4planet-staging.
-- No API access is widened and no external publishing is enabled.

alter function public.brand_release_guard() set search_path = public, pg_temp;
alter function public.brand_receipt_guard() set search_path = public, pg_temp;

create index if not exists brand_founder_interventions_release_idx
  on public.brand_founder_interventions (release_id) where release_id is not null;
create index if not exists brand_incidents_story_idx
  on public.brand_incidents (story_id, opened_at desc);
create index if not exists brand_incidents_release_idx
  on public.brand_incidents (release_id) where release_id is not null;
create index if not exists brand_learning_decisions_story_idx
  on public.brand_learning_decisions (story_id, created_at desc);
create index if not exists brand_learning_decisions_release_idx
  on public.brand_learning_decisions (release_id) where release_id is not null;
create index if not exists brand_publish_jobs_release_idx
  on public.brand_publish_jobs (release_id);
create index if not exists publication_receipts_release_idx
  on public.publication_receipts (release_id);
create index if not exists publication_receipts_story_idx
  on public.publication_receipts (story_id, created_at desc);
