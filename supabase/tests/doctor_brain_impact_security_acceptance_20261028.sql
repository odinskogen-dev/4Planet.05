-- DOCTOR BRAIN: fail-closed security regression.
-- Execute against target 4Planet_ OS after replaying BOTH 2026-10-28
-- IMPACT migrations. Read-only, rollback-free assertions.
DO $test$
DECLARE n integer; project_count integer;
BEGIN
 SELECT count(*) INTO n FROM pg_proc p JOIN pg_namespace ns ON ns.oid=p.pronamespace
 WHERE ns.nspname='public' AND p.prosecdef
   AND has_function_privilege('anon',p.oid,'EXECUTE');
 IF n<>0 THEN RAISE EXCEPTION 'UNAUTHORISED ANON SECURITY DEFINER: %',n; END IF;

 IF has_function_privilege('anon','public.impact_lan_v02()'::regprocedure,'EXECUTE')
 OR has_function_privilege('authenticated','public.impact_lan_v02()'::regprocedure,'EXECUTE')
 THEN RAISE EXCEPTION 'V02 PUBLIC EXECUTE REGRESSION'; END IF;

 IF (SELECT p.prosecdef FROM pg_proc p WHERE p.oid='public.impact_lan_gold_v01()'::regprocedure)
 THEN RAISE EXCEPTION 'V01 PUBLIC DEFINER REGRESSION'; END IF;

 IF has_schema_privilege('anon','brain','USAGE')
 THEN RAISE EXCEPTION 'PRIVATE BRAIN SCHEMA PUBLICLY ACCESSIBLE'; END IF;

 IF NOT (SELECT c.relrowsecurity FROM pg_class c
          WHERE c.oid='public.impact_lan_gold_public_projection'::regclass)
 THEN RAISE EXCEPTION 'PUBLIC PROJECTION RLS DISABLED'; END IF;

 IF has_table_privilege('anon','public.impact_lan_gold_public_projection','INSERT')
 OR has_table_privilege('anon','public.impact_lan_gold_public_projection','UPDATE')
 OR has_table_privilege('authenticated','public.impact_lan_gold_public_projection','DELETE')
 THEN RAISE EXCEPTION 'PUBLIC PROJECTION WRITABLE'; END IF;

 SELECT jsonb_array_length(public.impact_lan_gold_v01()->'projects')
 INTO project_count;
 IF project_count NOT BETWEEN 1 AND 20 THEN
   RAISE EXCEPTION 'PUBLIC IMPACT PAYLOAD MISSING/OVERSIZE: %',project_count;
 END IF;

 IF NOT EXISTS (
  SELECT 1 FROM cron.job
  WHERE jobname='impact-lan-gold-public-projection-refresh-15m' AND active)
 THEN RAISE EXCEPTION 'PUBLIC IMPACT SOURCE REFRESH INACTIVE'; END IF;

 IF NOT EXISTS (
  SELECT 1 FROM public.impact_lan_gold_public_projection
  WHERE publication_key='impact-lan-gold-v01'
    AND refreshed_at>now()-interval '45 minutes')
 THEN RAISE EXCEPTION 'PUBLIC IMPACT SOURCE STALE'; END IF;
END
$test$;
