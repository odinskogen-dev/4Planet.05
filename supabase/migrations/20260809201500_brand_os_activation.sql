-- 4PLANET Brand OS Activation
-- Internal transactional layer only. BRAIN remains authority for canon, sources and durable rights decisions.
-- This migration does not enable external publishing.

create table if not exists public.brand_stories (
  id text primary key,
  title text not null,
  slug text not null unique,
  state text not null check (state in (
    'IDEA','RESEARCHING','SOURCE_READY','RIGHTS_READY','MASTER_READY','IN_PRODUCTION',
    'QA_READY','FOUNDER_REVIEW','APPROVED','SCHEDULED','PUBLISHED','MEASURED','LEARNED',
    'ARCHIVED','RETURN','BLOCKED'
  )),
  risk text not null check (risk in ('LOW','MEDIUM','HIGH','CRITICAL')),
  truth_core text not null,
  audience_job text not null,
  canonical_refs text[] not null default '{}',
  source_gate text not null default 'OPEN' check (source_gate in ('PASS','OPEN','BLOCKED','NOT_APPLICABLE')),
  rights_gate text not null default 'OPEN' check (rights_gate in ('PASS','OPEN','BLOCKED','NOT_APPLICABLE')),
  qa_gate text not null default 'OPEN' check (qa_gate in ('PASS','OPEN','BLOCKED','NOT_APPLICABLE')),
  founder_gate text not null default 'OPEN' check (founder_gate in ('PASS','OPEN','BLOCKED','NOT_APPLICABLE')),
  product_gate text not null default 'OPEN' check (product_gate in ('PASS','OPEN','BLOCKED','NOT_APPLICABLE')),
  public_release_eligible boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.brand_story_asset_refs (
  story_id text not null references public.brand_stories(id) on delete cascade,
  asset_id text not null,
  rights_decision_id text,
  rights_state text not null check (rights_state in ('PASS','OPEN','BLOCKED','NOT_APPLICABLE')),
  source_system text not null default 'BRAIN_RIGHTS_INVENTORY',
  last_verified_at timestamptz,
  primary key (story_id, asset_id)
);

create table if not exists public.brand_releases (
  id text primary key,
  story_id text not null references public.brand_stories(id) on delete restrict,
  channel text not null check (channel in ('web','instagram','youtube','linkedin','tiktok','newsletter')),
  version integer not null check (version > 0),
  state text not null default 'FOUNDER_REVIEW' check (state in (
    'DRAFT','QA_READY','FOUNDER_REVIEW','APPROVED','SCHEDULED','PUBLISHED','BLOCKED','WITHDRAWN'
  )),
  founder_decision text not null default 'OPEN' check (founder_decision in ('OPEN','APPROVED','EDIT','HOLD','KILL')),
  content_fingerprint text not null,
  content_payload jsonb not null default '{}'::jsonb,
  idempotency_key text not null unique,
  scheduled_for timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (story_id, channel, version)
);

create table if not exists public.brand_publish_jobs (
  id text primary key,
  release_id text not null references public.brand_releases(id) on delete restrict,
  idempotency_key text not null unique,
  state text not null default 'QUEUED' check (state in ('QUEUED','RUNNING','RETRY_WAIT','SUCCEEDED','DEAD_LETTER','CANCELLED')),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  max_attempts integer not null default 3 check (max_attempts between 1 and 10),
  next_attempt_at timestamptz,
  last_error text,
  locked_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (attempt_count <= max_attempts)
);
create index if not exists brand_publish_jobs_ready_idx
  on public.brand_publish_jobs (state, next_attempt_at, created_at);

create table if not exists public.publication_receipts (
  id text primary key,
  release_id text not null references public.brand_releases(id) on delete restrict,
  story_id text not null references public.brand_stories(id) on delete restrict,
  channel text not null check (channel in ('web','instagram','youtube','linkedin','tiktok','newsletter')),
  idempotency_key text not null unique,
  environment text not null check (environment in ('DRY_RUN','TEST','PRODUCTION')),
  status text not null check (status in (
    'DRY_RUN_CREATED','DUPLICATE_SUPPRESSED','SUBMITTED','PUBLISHED','FAILED','BLOCKED','WITHDRAWN'
  )),
  platform_post_id text,
  platform_url text,
  provider_response jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.brand_metric_events (
  id text primary key,
  release_id text not null references public.brand_releases(id) on delete restrict,
  story_id text not null references public.brand_stories(id) on delete restrict,
  channel text not null check (channel in ('web','instagram','youtube','linkedin','tiktok','newsletter')),
  metric text not null,
  value numeric not null,
  observed_at timestamptz not null,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists brand_metric_events_story_time_idx
  on public.brand_metric_events (story_id, observed_at desc);
create index if not exists brand_metric_events_release_time_idx
  on public.brand_metric_events (release_id, observed_at desc);

create table if not exists public.brand_learning_decisions (
  id text primary key,
  story_id text not null references public.brand_stories(id) on delete restrict,
  release_id text references public.brand_releases(id) on delete set null,
  hypothesis text,
  evidence_refs text[] not null default '{}',
  evidence_summary text not null,
  decision text not null,
  canon_effect text not null default 'NONE' check (canon_effect in ('NONE','FOUNDER_PROPOSED')),
  founder_decision_required boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.brand_founder_interventions (
  id text primary key,
  story_id text not null references public.brand_stories(id) on delete restrict,
  release_id text references public.brand_releases(id) on delete set null,
  interaction_type text not null check (interaction_type in (
    'APPROVE','EDIT','HOLD','KILL','CLAIM_ATTESTATION','RIGHTS_ATTESTATION','RELATIONSHIP'
  )),
  duration_seconds numeric not null check (duration_seconds >= 0),
  reason text not null,
  outcome text not null,
  created_at timestamptz not null default now()
);
create index if not exists brand_founder_interventions_story_idx
  on public.brand_founder_interventions (story_id, created_at desc);

create table if not exists public.brand_incidents (
  id text primary key,
  story_id text not null references public.brand_stories(id) on delete restrict,
  release_id text references public.brand_releases(id) on delete set null,
  severity text not null check (severity in ('LOW','MEDIUM','HIGH','CRITICAL')),
  status text not null check (status in ('OPEN','MITIGATED','RESOLVED')),
  reason text not null,
  correction text,
  public_correction_required boolean not null default false,
  opened_at timestamptz not null default now(),
  resolved_at timestamptz
);

create or replace function public.brand_release_guard()
returns trigger language plpgsql as $$
declare
  story public.brand_stories%rowtype;
begin
  if new.state in ('APPROVED','SCHEDULED','PUBLISHED') or new.published_at is not null then
    select * into story from public.brand_stories where id = new.story_id;

    if story.id is null then
      raise exception 'Brand release requires an existing story';
    end if;

    if story.source_gate not in ('PASS','NOT_APPLICABLE')
       or story.rights_gate not in ('PASS','NOT_APPLICABLE')
       or story.qa_gate not in ('PASS','NOT_APPLICABLE')
       or story.product_gate not in ('PASS','NOT_APPLICABLE')
       or story.founder_gate not in ('PASS','NOT_APPLICABLE')
       or story.public_release_eligible is not true
       or new.founder_decision <> 'APPROVED' then
      raise exception 'Brand release blocked: source, rights, QA, product, founder and public eligibility gates must pass';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists brand_releases_guard on public.brand_releases;
create trigger brand_releases_guard
before insert or update on public.brand_releases
for each row execute function public.brand_release_guard();

create or replace function public.brand_receipt_guard()
returns trigger language plpgsql as $$
declare
  release_row public.brand_releases%rowtype;
begin
  select * into release_row from public.brand_releases where id = new.release_id;

  if release_row.id is null then
    raise exception 'Publication receipt requires an existing release';
  end if;

  if new.story_id <> release_row.story_id
     or new.channel <> release_row.channel
     or new.idempotency_key <> release_row.idempotency_key then
    raise exception 'Publication receipt authority mismatch';
  end if;

  return new;
end;
$$;

drop trigger if exists publication_receipts_guard on public.publication_receipts;
create trigger publication_receipts_guard
before insert or update on public.publication_receipts
for each row execute function public.brand_receipt_guard();

alter table public.brand_stories enable row level security;
alter table public.brand_story_asset_refs enable row level security;
alter table public.brand_releases enable row level security;
alter table public.brand_publish_jobs enable row level security;
alter table public.publication_receipts enable row level security;
alter table public.brand_metric_events enable row level security;
alter table public.brand_learning_decisions enable row level security;
alter table public.brand_founder_interventions enable row level security;
alter table public.brand_incidents enable row level security;

-- Internal service-only tables until a dedicated founder-auth policy is accepted.
-- No anon/authenticated read or write policies are created here.
revoke all on public.brand_stories from anon, authenticated;
revoke all on public.brand_story_asset_refs from anon, authenticated;
revoke all on public.brand_releases from anon, authenticated;
revoke all on public.brand_publish_jobs from anon, authenticated;
revoke all on public.publication_receipts from anon, authenticated;
revoke all on public.brand_metric_events from anon, authenticated;
revoke all on public.brand_learning_decisions from anon, authenticated;
revoke all on public.brand_founder_interventions from anon, authenticated;
revoke all on public.brand_incidents from anon, authenticated;

comment on table public.brand_stories is 'Transactional Brand OS state. BRAIN remains authority for canon; this table must not silently rewrite canon.';
comment on table public.brand_story_asset_refs is 'References canonical BRAIN rights/media IDs without replacing the rights inventory.';
comment on table public.brand_releases is 'Founder-gated release objects. Approval cannot bypass story source/rights/QA/product/public-eligibility gates.';
comment on table public.brand_publish_jobs is 'Bounded retry queue for approved release work. Exhausted jobs enter DEAD_LETTER rather than retrying forever.';
comment on table public.publication_receipts is 'Idempotent publication/dry-run receipts bound to one release, story and channel.';
comment on table public.brand_learning_decisions is 'Performance may inform canon. canon_effect=FOUNDER_PROPOSED requires a separate founder/canon decision.';
comment on table public.brand_founder_interventions is 'Measures actual founder seconds and intervention reasons so autonomy is optimized against observed founder burden.';
