-- 4PLANET Source Record public-surface hardening
-- Preserve the canonical Source Record table and RLS policy, but do not expose raw provider
-- payloads or integrity hashes through public Data API credentials.

revoke select on public.source_records from anon, authenticated;

grant select (
  id,
  source_id,
  source_record_id,
  source_url,
  dataset_id,
  retrieved_at,
  licence,
  attribution,
  rights_status,
  visibility,
  sensitivity
) on public.source_records to anon, authenticated;

comment on column public.source_records.raw_payload is
  'Audit/raw provider payload. Server-side only; not part of the public Data API projection.';
comment on column public.source_records.content_sha256 is
  'Internal integrity metadata. Server-side only; not required by the public product surface.';
