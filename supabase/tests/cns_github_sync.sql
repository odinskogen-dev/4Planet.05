\set ON_ERROR_STOP on
begin;

insert into cns.projects(project_id, slug, name, lifecycle, authority)
values ('GITHUB-SYNC-TEST','github-sync-test','GitHub Sync Test','ACTIVE','TEST');

insert into cns.code_lines(
  code_line_id, project_id, seam, role, repository, branch, pr_number, exact_sha, observed_sha
) values (
  'GITHUB-SYNC-LINE','GITHUB-SYNC-TEST','default','ACTIVE_DEVELOPMENT',
  'odinskogen-dev/4Planet.05','king/test',131,'old-sha','old-sha'
);

select cns.observe_code_state(
  'GITHUB-SYNC-LINE',
  '0123456789abcdef0123456789abcdef01234567',
  'OPEN',
  'MERGEABLE',
  'SUCCESS',
  'deployment-1',
  'github:test-revision',
  'github-sync-test-event',
  300
);

do $$
declare
  v_line cns.code_lines%rowtype;
  v_event cns.events%rowtype;
begin
  select * into v_line from cns.code_lines where code_line_id='GITHUB-SYNC-LINE';
  if v_line.exact_sha <> '0123456789abcdef0123456789abcdef01234567' then
    raise exception 'GITHUB_SYNC_SHA_NOT_PROJECTED';
  end if;
  if v_line.pr_state <> 'OPEN' or v_line.merge_state <> 'MERGEABLE' or v_line.deployment_state <> 'SUCCESS' then
    raise exception 'GITHUB_SYNC_STATE_NOT_PROJECTED';
  end if;
  if v_line.github_verified_at is null or v_line.stale_after <= now() then
    raise exception 'GITHUB_SYNC_FRESHNESS_NOT_SET';
  end if;
  select * into v_event from cns.events where idempotency_key='github-sync-test-event';
  if v_event.event_type <> 'CODE_STATE_CHANGED' then
    raise exception 'GITHUB_SYNC_EVENT_NOT_APPENDED';
  end if;
end;
$$;

-- Idempotent replay must not duplicate the event.
select cns.observe_code_state(
  'GITHUB-SYNC-LINE',
  '0123456789abcdef0123456789abcdef01234567',
  'OPEN',
  'MERGEABLE',
  'SUCCESS',
  'deployment-1',
  'github:test-revision',
  'github-sync-test-event',
  300
);

do $$
begin
  if (select count(*) from cns.events where idempotency_key='github-sync-test-event') <> 1 then
    raise exception 'GITHUB_SYNC_IDEMPOTENCY_BROKEN';
  end if;
end;
$$;

rollback;
