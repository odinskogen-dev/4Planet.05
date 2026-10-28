-- DOCTOR BRAIN / SECURE IMPACT PUBLIC PROJECTION 2026-10-28
-- Migration applied and role-tested in 4Planet_ OS ghvdzetmplqkdtfqiror.
-- Separates public approved output from protected NATUREBRAIN. This is a
-- DERIVED, automatically refreshed publication projection, never new authority.
-- Source: 4 curated gold projects in planetbrain. No source data copied to
-- organisational/private BRAIN; no unapproved projects introduced.

ALTER FUNCTION public.impact_lan_gold_v01() SET SCHEMA brain;
REVOKE ALL ON FUNCTION brain.impact_lan_gold_v01() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION brain.impact_lan_gold_v01() TO service_role;

CREATE TABLE public.impact_lan_gold_public_projection (
  publication_key text PRIMARY KEY CHECK (publication_key='impact-lan-gold-v01'),
  payload jsonb NOT NULL,
  refreshed_at timestamptz NOT NULL DEFAULT now(),
  source_type text NOT NULL DEFAULT 'DERIVED_PUBLIC_READ_PROJECTION'
    CHECK (source_type='DERIVED_PUBLIC_READ_PROJECTION')
);
ALTER TABLE public.impact_lan_gold_public_projection ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.impact_lan_gold_public_projection FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.impact_lan_gold_public_projection TO anon, authenticated, service_role;
CREATE POLICY impact_lan_gold_public_read_only
 ON public.impact_lan_gold_public_projection
 FOR SELECT TO anon, authenticated
 USING (publication_key='impact-lan-gold-v01');

INSERT INTO public.impact_lan_gold_public_projection(publication_key,payload)
SELECT 'impact-lan-gold-v01',brain.impact_lan_gold_v01()
WHERE jsonb_array_length(brain.impact_lan_gold_v01()->'projects') BETWEEN 1 AND 20;

CREATE FUNCTION brain.refresh_impact_lan_gold_public_projection()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $fn$
DECLARE p jsonb;
BEGIN
  p := brain.impact_lan_gold_v01();
  IF jsonb_typeof(p) <> 'object'
      OR p->>'version' <> 'impact-lan-gold-v01'
      OR jsonb_typeof(p->'projects') <> 'array'
      OR jsonb_array_length(p->'projects') NOT BETWEEN 1 AND 20 THEN
    RAISE EXCEPTION 'IMPACT public projection source rejected / FAIL CLOSED';
  END IF;
  INSERT INTO public.impact_lan_gold_public_projection
    (publication_key,payload,refreshed_at)
  VALUES('impact-lan-gold-v01',p,now())
  ON CONFLICT (publication_key) DO UPDATE
    SET payload=excluded.payload,refreshed_at=excluded.refreshed_at;
END
$fn$;
REVOKE ALL ON FUNCTION brain.refresh_impact_lan_gold_public_projection() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION brain.refresh_impact_lan_gold_public_projection() TO service_role;

CREATE FUNCTION public.impact_lan_gold_v01()
RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $fn$
 SELECT payload FROM public.impact_lan_gold_public_projection
 WHERE publication_key='impact-lan-gold-v01'
$fn$;
REVOKE ALL ON FUNCTION public.impact_lan_gold_v01() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.impact_lan_gold_v01() TO anon, authenticated, service_role;

SELECT cron.schedule(
 'impact-lan-gold-public-projection-refresh-15m',
 '*/15 * * * *',
 'select brain.refresh_impact_lan_gold_public_projection();'
);
