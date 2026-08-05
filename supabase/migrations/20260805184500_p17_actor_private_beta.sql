-- P17 Actor Atlas private beta. Schema only; no public activation or partner status.
create table if not exists public.actors (
  id text primary key,
  slug text unique not null,
  display_name text not null,
  legal_name text,
  actor_type text not null check (actor_type in ('OPERATIONAL_CONSERVATION','DATA_INFRASTRUCTURE','RIGHTS_BASED_NGO','RESEARCH_INSTITUTION','PUBLIC_INSTITUTION','NETWORK','OTHER')),
  profile_status text not null default 'INDEXED' check (profile_status in ('INDEXED','PROFILE_CLAIMED','INFORMATION_VERIFIED','SUSPENDED','DISPUTED','REMOVED')),
  publication_status text not null default 'PRIVATE_BETA' check (publication_status in ('PRIVATE_BETA','NOINDEX','PUBLIC','BLOCKED')),
  official_url text not null check (official_url ~ '^https://'),
  summary text not null,
  last_reviewed_at timestamptz,
  visibility text not null default 'INTERNAL' check (visibility in ('PUBLIC','INTERNAL','RESTRICTED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.actor_aliases (
  id text primary key,
  actor_id text not null references public.actors(id) on delete cascade,
  alias text not null,
  alias_type text not null check (alias_type in ('LEGAL_NAME','FORMER_NAME','ACRONYM','TRANSLATION','PUBLIC_BRAND')),
  source_record_ids text[] not null default '{}',
  unique (actor_id, alias, alias_type)
);

create table if not exists public.actor_sources (
  id text primary key,
  actor_id text not null references public.actors(id) on delete cascade,
  source_record_id text references public.source_records(id),
  source_url text not null check (source_url ~ '^https://'),
  source_class text not null,
  retrieved_at timestamptz not null,
  rights_status text not null check (rights_status in ('ACCEPTABLE','CONDITIONAL','EXPERIMENTAL','BLOCKED')),
  visibility text not null check (visibility in ('PUBLIC','INTERNAL','RESTRICTED')),
  unique (actor_id, source_url, retrieved_at)
);

create table if not exists public.actor_claims (
  id text primary key,
  actor_id text not null references public.actors(id) on delete cascade,
  section text not null,
  body text not null,
  claim_state text not null check (claim_state in ('SOURCE_STATEMENT','PRODUCT_CONTEXT','4PLANET_ASSESSMENT','PUBLIC_SAFE_INTERPRETATION')),
  evidence_state text not null check (evidence_state in ('LIMITED','MODERATE','STRONG')),
  source_ids text[] not null,
  limitation text,
  review_status text not null default 'LITERATURE_CHECKED' check (review_status in ('UNREVIEWED','LITERATURE_CHECKED','EXPERT_REVIEWED','DISPUTED')),
  visibility text not null default 'INTERNAL' check (visibility in ('PUBLIC','INTERNAL','RESTRICTED')),
  created_at timestamptz not null default now(),
  check (cardinality(source_ids) > 0)
);

create table if not exists public.actor_actions (
  id text primary key,
  actor_id text not null references public.actors(id) on delete cascade,
  action_type text not null check (action_type in ('DONATE','EXPLORE_DATA','FOLLOW','LEARN','CONTACT','PARTNER_OFFICIALLY')),
  label text not null,
  destination_url text not null check (destination_url ~ '^https://'),
  is_official_destination boolean not null default true,
  payment_handled_by_4planet boolean not null default false,
  visibility text not null default 'INTERNAL' check (visibility in ('PUBLIC','INTERNAL','RESTRICTED')),
  check (payment_handled_by_4planet = false)
);

create table if not exists public.actor_geographies (
  id text primary key,
  actor_id text not null references public.actors(id) on delete cascade,
  geography_role text not null check (geography_role in ('HEADQUARTERS_REFERENCE','OPERATING_GEOGRAPHY','PROGRAMME_GEOGRAPHY','DOCUMENTED_PROJECT_SITE')),
  label text not null,
  description text not null,
  geom geography(point, 4326),
  precision text not null check (precision in ('CITY_REFERENCE','COUNTRY','REGION','DOCUMENTED_SITE')),
  sensitivity text not null default 'GENERALIZED' check (sensitivity in ('NONE','GENERALIZED','RESTRICTED')),
  source_ids text[] not null,
  visibility text not null default 'INTERNAL' check (visibility in ('PUBLIC','INTERNAL','RESTRICTED')),
  check (cardinality(source_ids) > 0)
);
create index if not exists actor_geographies_geom_idx on public.actor_geographies using gist (geom);

create table if not exists public.actor_relationships (
  id text primary key,
  actor_id text not null references public.actors(id) on delete cascade,
  target_entity_id text not null,
  relationship_type text not null check (relationship_type in ('RELATED_ACTOR','MISSION','SPECIES','PLACE','ISSUE','SOLUTION','PROGRAMME')),
  relationship_state text not null default 'EDITORIAL' check (relationship_state in ('SOURCE_ASSERTED','EDITORIAL','VERIFIED')),
  source_ids text[] not null default '{}',
  visibility text not null default 'INTERNAL' check (visibility in ('PUBLIC','INTERNAL','RESTRICTED')),
  unique (actor_id, target_entity_id, relationship_type)
);

create table if not exists public.actor_profile_requests (
  id uuid primary key default gen_random_uuid(),
  actor_id text not null references public.actors(id),
  request_type text not null check (request_type in ('CLAIM','CORRECTION','APPEAL','REMOVAL','URGENT_CORRECTION')),
  requester_name text not null,
  requester_role text not null,
  requester_email text not null,
  organisation_domain text not null,
  proposed_change text not null,
  evidence_references text,
  consent boolean not null check (consent = true),
  status text not null default 'RECEIVED' check (status in ('RECEIVED','IDENTITY_REVIEW','EDITORIAL_REVIEW','NEEDS_EVIDENCE','ACCEPTED','PARTIALLY_ACCEPTED','REJECTED','SUSPENDED')),
  environment text not null default 'PRIVATE_BETA' check (environment in ('PRIVATE_BETA','PRODUCTION')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid
);

create table if not exists public.actor_review_events (
  id uuid primary key default gen_random_uuid(),
  actor_id text not null references public.actors(id),
  request_id uuid references public.actor_profile_requests(id),
  event_type text not null,
  previous_state text,
  next_state text,
  reason text not null,
  actor_statement text,
  fourplanet_assessment text,
  created_at timestamptz not null default now(),
  created_by uuid
);

alter table public.actors enable row level security;
alter table public.actor_aliases enable row level security;
alter table public.actor_sources enable row level security;
alter table public.actor_claims enable row level security;
alter table public.actor_actions enable row level security;
alter table public.actor_geographies enable row level security;
alter table public.actor_relationships enable row level security;
alter table public.actor_profile_requests enable row level security;
alter table public.actor_review_events enable row level security;

-- Private beta: no anonymous public read policy is created. Public activation requires a later reviewed migration.
revoke all on public.actors, public.actor_aliases, public.actor_sources, public.actor_claims,
  public.actor_actions, public.actor_geographies, public.actor_relationships,
  public.actor_profile_requests, public.actor_review_events from anon;

comment on table public.actors is 'P17 actor identities. Indexing is separate from verification and partnership.';
comment on table public.actor_geographies is 'Headquarters, operating geography and project sites are different roles; geometry never upgrades role semantics.';
comment on table public.actor_profile_requests is 'A claim request verifies a representative only after review; it never verifies every profile claim or creates partner status.';
