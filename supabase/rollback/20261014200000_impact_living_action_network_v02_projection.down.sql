-- Rollback for IMPACT LAN v02 projection. Read-only function; removing it restores
-- the web client's automatic fallback to public.impact_lan_gold_v01().
begin;
drop function if exists public.impact_lan_v02();
commit;
