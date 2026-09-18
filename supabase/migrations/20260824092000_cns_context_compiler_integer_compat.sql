begin;

-- Compatibility wrapper for SQL callers that pass integer literals.
-- Canonical compiler remains the smallint-depth implementation.
create or replace function cns.compile_project_context(
  p_project_id text,
  p_intent text,
  p_depth integer,
  p_token_budget integer,
  p_ttl_seconds integer
) returns uuid
language plpgsql
security definer
set search_path=cns,public
as $$
begin
  if p_depth < 0 or p_depth > 4 then
    raise exception 'CNS_CONTEXT_DEPTH_INVALID';
  end if;
  return cns.compile_project_context(
    p_project_id,
    p_intent,
    p_depth::smallint,
    p_token_budget,
    p_ttl_seconds
  );
end;
$$;

revoke all on function cns.compile_project_context(text,text,integer,integer,integer) from public, anon, authenticated;
grant execute on function cns.compile_project_context(text,text,integer,integer,integer) to service_role;

commit;
