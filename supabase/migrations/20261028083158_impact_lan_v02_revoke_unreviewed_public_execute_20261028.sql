-- DOCTOR BRAIN / SECURITY: same repair applied to 4Planet_ OS 2026-10-28.
-- This data source includes linked nodes without explicit public publication status.
-- Untrusted clients must not call a postgres-owned SECURITY DEFINER function.
-- Leave service_role authorised for separately reviewed internal projections.
REVOKE ALL ON FUNCTION public.impact_lan_v02() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.impact_lan_v02() TO service_role;
