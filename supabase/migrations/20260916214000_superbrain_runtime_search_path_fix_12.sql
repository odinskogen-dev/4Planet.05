-- 4PLANET SUPERBRAIN — RUNTIME SEARCH PATH FIX 12
-- Append-only corrective migration. Restores Supabase pgcrypto-safe search path
-- after runtime health migration 11 replaced doctor_scan().

begin;

alter function cns.doctor_scan()
  set search_path = cns, extensions, pg_temp;

-- New runtime functions that use cryptographic helpers are explicit as well.
alter function cns.verify_actor_state_readback_v1(bigint)
  set search_path = cns, extensions, pg_temp;

alter function cns.compile_actor_context_v1(text,text,text,text,smallint,integer,integer)
  set search_path = cns, extensions, pg_temp;

commit;
