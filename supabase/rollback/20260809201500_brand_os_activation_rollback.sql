-- Rollback: 4PLANET Brand OS Activation transactional layer.
-- Does not alter the pre-existing truth spine.

drop trigger if exists publication_receipts_guard on public.publication_receipts;
drop function if exists public.brand_receipt_guard();

drop trigger if exists brand_releases_guard on public.brand_releases;
drop function if exists public.brand_release_guard();

drop table if exists public.brand_incidents;
drop table if exists public.brand_founder_interventions;
drop table if exists public.brand_learning_decisions;
drop table if exists public.brand_metric_events;
drop table if exists public.publication_receipts;
drop table if exists public.brand_publish_jobs;
drop table if exists public.brand_releases;
drop table if exists public.brand_story_asset_refs;
drop table if exists public.brand_stories;
