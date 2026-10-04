-- Applied runtime migration 20261004175812.
-- Canonical product name: NATUREBRAIN. The planetbrain schema/RPC name remains a legacy technical namespace.
-- Converges legacy/live GBIF records by provider identity instead of duplicating the source record.

CREATE OR REPLACE FUNCTION public.planetbrain_commit_gbif_run(p_run_id uuid, p_offset integer, p_items jsonb, p_end boolean)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
 f planetbrain.ingest_feeds%rowtype;
 j jsonb;n jsonb;k text;t text;lic text;ds text;pub text;sci text;rec text;fp text;
 ent uuid; old jsonb; added integer:=0;changed integer:=0;dupes integer:=0;skipped integer:=0;
 total integer;url text;
begin
 if p_items is null or jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items)>20 then
  raise exception 'invalid bounded batch';
 end if;
 total:=jsonb_array_length(p_items);

 select * into f from planetbrain.ingest_feeds
 where feed_id='gbif-orca-no-v01' and lease_id=p_run_id and lease_until>now() for update;

 if not found or p_offset<>f.cursor_offset
 or not exists(select 1 from planetbrain.ingest_runs where run_id=p_run_id and status='running')
 then raise exception 'run lease/cursor mismatch'; end if;

 for j in select value from jsonb_array_elements(p_items) loop
  k:=coalesce(j->>'key',j->>'gbifID');lic:=coalesce(j->>'license','');
  t:=coalesce(j->>'acceptedTaxonKey',j->>'taxonKey');
  sci:=coalesce(j->>'scientificName','');ds:=coalesce(j->>'datasetKey','');
  pub:=coalesce(j->>'publishingOrgKey','');

  if k is null or k!~'^[0-9]{1,20}$' or t is null or t!~'^[0-9]{1,20}$'
    or t<>'2440483' or ds='' or sci='' or pub='' or coalesce(j->>'eventDate','') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}'
    or not(lic ~* '^https?://creativecommons[.]org/(publicdomain/zero/1[.]0|licenses/by/4[.]0)(/legalcode)?/?$'
        or lic in ('CC0_1_0','CC_BY_4_0')) then
   skipped:=skipped+1;continue;
  end if;

  url:='https://www.gbif.org/occurrence/'||k;
  n:=jsonb_build_object(
    'gbif_key',k,'taxon_key',t,'scientific_name',sci,
    'dataset_key',ds,'publisher_key',pub,'license',lic,'source_url',url,
    'event_date',j->>'eventDate','last_interpreted',j->>'lastInterpreted',
    'basis_of_record',j->>'basisOfRecord','country_code',j->>'countryCode'
  );
  fp:=md5(n::text);

  insert into planetbrain.entities(canonical_id,entity_type,name,provenance)
   values('taxon:gbif:'||t,'taxon',sci,jsonb_build_object('source','GBIF','taxon_key',t))
   on conflict(canonical_id) do nothing;
  select id into ent from planetbrain.entities where canonical_id='taxon:gbif:'||t;

  insert into planetbrain.external_identifiers(entity_id,namespace,external_id,canonical_uri,provenance)
   select ent,'GBIF_TAXON',t,'https://www.gbif.org/species/'||t,'{"source":"GBIF"}'::jsonb
   where not exists(
     select 1 from planetbrain.external_identifiers
     where namespace='GBIF_TAXON' and external_id=t
   );

  -- Reuse a pre-existing canonical record for the same provider record.
  -- This safely converges older source-grounded fixture IDs with live ingest
  -- instead of attempting a second row for the same (dataset, external_record_id).
  select sr.record_id, sr.normalised_payload
    into rec, old
  from planetbrain.source_records sr
  where sr.dataset_id=f.dataset_id and sr.external_record_id=k
  limit 1;

  if not found then
   rec:='source_record:gbif:live:'||k;
   insert into planetbrain.source_records
    (record_id,dataset_id,external_record_id,fixture_class,raw_payload,normalised_payload,
     source_event_on,retrieved_at,rights,provenance)
   values(
     rec,f.dataset_id,k,null,null,n,left(j->>'eventDate',10)::date,now(),lic,
     jsonb_build_object('publisher',pub,'dataset_key',ds,'citation',url,
       'meaning','GBIF provider occurrence; no abundance inference')
   );
   added:=added+1;
  elsif md5(old::text)<>fp then
   update planetbrain.source_records
   set normalised_payload=n,
       source_event_on=left(j->>'eventDate',10)::date,
       retrieved_at=now(),
       rights=lic,
       fixture_class=null,
       provenance=jsonb_build_object(
         'publisher',pub,'dataset_key',ds,'citation',url,
         'meaning','GBIF provider occurrence; no abundance inference',
         'canonical_record_reused',true
       )
   where record_id=rec;
   changed:=changed+1;
   update planetbrain.claims
   set review_status='needs_review',
       interpretation_status='source_updated_pending_review',
       updated_at=now()
   where claim_id='claim:gbif:live:'||k;
  else
   -- Refresh retrieval/provenance even when the scientific payload is unchanged.
   update planetbrain.source_records
   set retrieved_at=now(),
       rights=lic,
       fixture_class=null,
       provenance=jsonb_build_object(
         'publisher',pub,'dataset_key',ds,'citation',url,
         'meaning','GBIF provider occurrence; no abundance inference',
         'canonical_record_reused',true
       )
   where record_id=rec;
   dupes:=dupes+1;
  end if;

  insert into planetbrain.source_record_revisions(record_id,fingerprint,normalised_payload)
   values(rec,fp,n) on conflict(record_id,fingerprint) do nothing;

  insert into planetbrain.evidence(
    evidence_id,evidence_type,source_id,dataset_id,source_record_id,citation,provenance
  )
   values(
     'evidence:gbif:live:'||k,'provider_occurrence','source:gbif',f.dataset_id,rec,url,
     jsonb_build_object('publisher',pub,'license',lic,'no_abundance_inference',true)
   )
   on conflict(evidence_id) do nothing;

  insert into planetbrain.claims(
    claim_id,subject_entity_id,statement,review_status,evidence_strength,interpretation_status,provenance
  )
   values(
     'claim:gbif:live:'||k,ent,
     'GBIF indexes occurrence record '||k||' under '||sci||'; not abundance or current presence.',
     'unreviewed','source_record','provider_record_only',
     jsonb_build_object('record_id',rec,'license',lic)
   )
   on conflict(claim_id) do nothing;

  insert into planetbrain.claim_evidence(claim_id,evidence_id,relation)
   values('claim:gbif:live:'||k,'evidence:gbif:live:'||k,'supports')
   on conflict(claim_id,evidence_id) do nothing;

  insert into planetbrain.observations(
    observation_id,entity_id,source_record_id,observation_type,observed_on,
    review_status,evidence_strength,interpretation_status,provenance
  )
   values(
     'observation:gbif:live:'||k,ent,rec,'provider_occurrence',left(j->>'eventDate',10)::date,
     'unreviewed','source_record','none',jsonb_build_object('citation',url)
   )
   on conflict do nothing;
 end loop;

 update planetbrain.ingest_runs
 set status='success',received_count=total,new_count=added,changed_count=changed,
     duplicate_count=dupes,skipped_count=skipped,completed_at=now()
 where run_id=p_run_id;

 update planetbrain.ingest_feeds
 set cursor_offset=case when p_end then 0 else p_offset+total end,
     scan_since=case when p_end then current_date-30 else f.scan_since end,
     lease_id=null,lease_until=null,last_success_at=now(),last_error=null,updated_at=now()
 where feed_id=f.feed_id and lease_id=p_run_id;

 return jsonb_build_object(
   'status','success','new',added,'changed',changed,'duplicates',dupes,'skipped',skipped,
   'received',total,'next_offset',case when p_end then 0 else p_offset+total end
 );
end
$function$

