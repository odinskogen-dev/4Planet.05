-- Applied runtime migration: NATUREBRAIN internal product read seam.
-- This is not a second truth store. It exposes the existing planetbrain.api_entity_context
-- only to server-side service_role consumers. Direct anon/authenticated execution is revoked.

CREATE OR REPLACE FUNCTION public.naturebrain_entity_context_internal(p_canonical_id text)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select to_jsonb(c)
  from planetbrain.api_entity_context c
  where c.canonical_id = p_canonical_id
    and length(p_canonical_id) between 3 and 180
    and p_canonical_id ~ '^[A-Za-z0-9:_./-]+$'
  limit 1
$function$


revoke all on function public.naturebrain_entity_context_internal(text) from public;
revoke all on function public.naturebrain_entity_context_internal(text) from anon;
revoke all on function public.naturebrain_entity_context_internal(text) from authenticated;
grant execute on function public.naturebrain_entity_context_internal(text) to service_role;
