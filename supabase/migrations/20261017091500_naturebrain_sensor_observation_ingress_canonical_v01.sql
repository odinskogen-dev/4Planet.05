-- 4PLANET NATURE SENSOR — canonical sensor-agnostic observation ingress.
-- Canonical source snapshot of the already-applied production migrations
-- naturebrain_sensor_observation_ingress_v01 +
-- naturebrain_sensor_observation_postgis_schema_fix_v01.
--
-- Truth law:
-- measurement != ecological condition
-- point != area
-- missing observation != absence
-- unreviewed != publication-ready
-- item-level rights always travel with the record.

insert into planetbrain.sources(source_id,name,source_type,canonical_uri,rights,attribution,status,provenance)
values(
 'source:4planet-field-sensor-ingress',
 '4PLANET Field Sensor Ingress Protocol',
 'sensor_observation_ingress',
 'https://4planet.org/',
 'Ingress wrapper only. Every admitted observation must carry item-level source URI and rights state; this source record does not grant rights to underlying sensor data.',
 'Underlying provider/source must be preserved per record.',
 'active',
 jsonb_build_object('adapter_state','ACTIVE_PROTOCOL','version','v1','truth_boundary','sensor measurements are source observations, not ecological condition, cause or outcome claims')
)
on conflict(source_id) do update set
 rights=excluded.rights,attribution=excluded.attribution,status='active',
 provenance=planetbrain.sources.provenance||excluded.provenance,updated_at=now();

insert into planetbrain.datasets(dataset_id,source_id,name,version,canonical_uri,rights,temporal_coverage,spatial_coverage,provenance)
values(
 'dataset:4planet:field-sensor-observations-v01',
 'source:4planet-field-sensor-ingress',
 '4PLANET field sensor observations',
 'v1',
 'https://4planet.org/',
 'Item-level rights required. Ingress never upgrades UNKNOWN/RESTRICTED data to public reuse.',
 jsonb_build_object('semantics','event-time observations; no assumed cadence or continuity'),
 jsonb_build_object('scope','point observations with optional valid coordinates; no implied spatial representativeness'),
 jsonb_build_object(
   'consumers',jsonb_build_array('NATUREBRAIN','ATLAS','PLACE','SPECIES','S4PIENS'),
   'adapter_state','ACTIVE_PROTOCOL',
   'truth_boundary','measurement != ecological status; point != area; missing observation != absence'
 )
)
on conflict(dataset_id) do update set
 version=excluded.version,rights=excluded.rights,temporal_coverage=excluded.temporal_coverage,
 spatial_coverage=excluded.spatial_coverage,provenance=planetbrain.datasets.provenance||excluded.provenance,updated_at=now();

CREATE OR REPLACE FUNCTION public.planetbrain_stage_sensor_observation_v01(p_payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_event_id text;
  v_device_id text;
  v_provider text;
  v_source_uri text;
  v_rights text;
  v_type text;
  v_metric text;
  v_unit text;
  v_method text;
  v_calibration text;
  v_quality text;
  v_fixture text;
  v_observed_at timestamptz;
  v_value numeric;
  v_lat double precision;
  v_lon double precision;
  v_sensor_key text;
  v_record_id text;
  v_observation_id text;
  v_measurement_id text;
  v_evidence_id text;
  v_entity uuid;
  v_normalised jsonb;
begin
  if jsonb_typeof(p_payload)<>'object' then raise exception 'SENSOR_PAYLOAD_OBJECT_REQUIRED'; end if;

  if exists(
    select 1 from jsonb_object_keys(p_payload) k
    where k not in (
      'event_id','device_id','provider_name','source_uri','rights_state',
      'observation_type','metric_key','numeric_value','unit','observed_at',
      'lat','lon','calibration_state','method','quality_state','fixture_class'
    )
  ) then raise exception 'SENSOR_PAYLOAD_UNKNOWN_FIELD'; end if;

  v_event_id:=trim(coalesce(p_payload->>'event_id',''));
  v_device_id:=trim(coalesce(p_payload->>'device_id',''));
  v_provider:=trim(coalesce(p_payload->>'provider_name',''));
  v_source_uri:=trim(coalesce(p_payload->>'source_uri',''));
  v_rights:=upper(trim(coalesce(p_payload->>'rights_state','UNKNOWN')));
  v_type:=trim(coalesce(p_payload->>'observation_type','sensor_measurement'));
  v_metric:=trim(coalesce(p_payload->>'metric_key',''));
  v_unit:=trim(coalesce(p_payload->>'unit',''));
  v_method:=trim(coalesce(p_payload->>'method',''));
  v_calibration:=upper(trim(coalesce(p_payload->>'calibration_state','UNKNOWN')));
  v_quality:=upper(trim(coalesce(p_payload->>'quality_state','UNREVIEWED')));
  v_fixture:=nullif(trim(coalesce(p_payload->>'fixture_class','')),'');

  if v_event_id !~ '^[A-Za-z0-9_.:-]{1,160}$' then raise exception 'SENSOR_EVENT_ID_INVALID'; end if;
  if v_device_id !~ '^[A-Za-z0-9_.:-]{1,120}$' then raise exception 'SENSOR_DEVICE_ID_INVALID'; end if;
  if length(v_provider)<2 or length(v_provider)>180 then raise exception 'SENSOR_PROVIDER_INVALID'; end if;
  if v_source_uri !~ '^https://[^[:space:]]+$' then raise exception 'SENSOR_SOURCE_URI_HTTPS_REQUIRED'; end if;
  if v_rights not in ('OPEN','ATTRIBUTION','RESTRICTED_INTERNAL','UNKNOWN') then raise exception 'SENSOR_RIGHTS_STATE_INVALID'; end if;
  if v_metric !~ '^[a-z][a-z0-9_.:-]{1,100}$' then raise exception 'SENSOR_METRIC_INVALID'; end if;
  if length(v_unit)<1 or length(v_unit)>40 then raise exception 'SENSOR_UNIT_INVALID'; end if;
  if v_fixture is not null and v_fixture not in ('SOURCE_GROUNDED_FIXTURE','DEMONSTRATION_FIXTURE','TEST_RECORD') then raise exception 'SENSOR_FIXTURE_INVALID'; end if;

  begin v_observed_at:=(p_payload->>'observed_at')::timestamptz; exception when others then raise exception 'SENSOR_OBSERVED_AT_INVALID'; end;
  begin v_value:=(p_payload->>'numeric_value')::numeric; exception when others then raise exception 'SENSOR_NUMERIC_VALUE_INVALID'; end;

  if (p_payload ? 'lat') <> (p_payload ? 'lon') then raise exception 'SENSOR_COORDINATES_REQUIRE_PAIR'; end if;
  if p_payload ? 'lat' then
    begin v_lat:=(p_payload->>'lat')::double precision; v_lon:=(p_payload->>'lon')::double precision; exception when others then raise exception 'SENSOR_COORDINATES_INVALID'; end;
    if v_lat < -90 or v_lat > 90 or v_lon < -180 or v_lon > 180 then raise exception 'SENSOR_COORDINATES_OUT_OF_RANGE'; end if;
  end if;

  v_sensor_key:='sensor:field:'||md5(lower(v_provider)||'|'||v_device_id);
  v_record_id:='source_record:sensor:'||md5(lower(v_provider)||'|'||v_device_id||'|'||v_event_id);
  v_observation_id:='observation:sensor:'||md5(lower(v_provider)||'|'||v_device_id||'|'||v_event_id);
  v_measurement_id:='measurement:sensor:'||md5(lower(v_provider)||'|'||v_device_id||'|'||v_event_id||'|'||v_metric);
  v_evidence_id:='evidence:sensor:'||md5(lower(v_provider)||'|'||v_device_id||'|'||v_event_id);

  v_normalised:=jsonb_build_object(
    'event_id',v_event_id,'device_id',v_device_id,'provider_name',v_provider,
    'source_uri',v_source_uri,'rights_state',v_rights,'observation_type',v_type,
    'metric_key',v_metric,'numeric_value',v_value,'unit',v_unit,'observed_at',v_observed_at,
    'lat',v_lat,'lon',v_lon,'calibration_state',v_calibration,'method',nullif(v_method,''),
    'quality_state',v_quality
  );

  insert into planetbrain.entities(canonical_id,entity_type,name,description,provenance)
  values(
    v_sensor_key,'sensor_device',v_provider||' · '||v_device_id,
    'Field sensor device identity admitted through the 4PLANET sensor observation protocol.',
    jsonb_build_object('provider',v_provider,'device_id',v_device_id,'identity_scope','provider + device id only; no manufacturer/ownership inference')
  )
  on conflict(canonical_id) do update set
    name=excluded.name,provenance=planetbrain.entities.provenance||excluded.provenance,updated_at=now();
  select id into v_entity from planetbrain.entities where canonical_id=v_sensor_key;

  insert into planetbrain.source_records(
    record_id,dataset_id,external_record_id,fixture_class,normalised_payload,raw_payload,
    source_event_at,retrieved_at,rights,limitations,provenance
  ) values(
    v_record_id,'dataset:4planet:field-sensor-observations-v01',v_event_id,v_fixture,
    v_normalised,null,v_observed_at,now(),
    'ITEM_RIGHTS_STATE='||v_rights||'; source='||v_source_uri,
    jsonb_build_array(
      'sensor measurement only; not ecological condition/cause/outcome',
      'point observation does not represent an area without a validated sampling design',
      'quality/calibration states must travel with downstream use'
    ),
    jsonb_build_object(
      'provider',v_provider,'source_uri',v_source_uri,'rights_state',v_rights,
      'calibration_state',v_calibration,'quality_state',v_quality,
      'truth_boundary','measurement != ecological condition; point != area; missing != absence'
    )
  )
  on conflict(dataset_id,external_record_id) do update set
    normalised_payload=excluded.normalised_payload,source_event_at=excluded.source_event_at,
    retrieved_at=excluded.retrieved_at,rights=excluded.rights,limitations=excluded.limitations,
    provenance=planetbrain.source_records.provenance||excluded.provenance;

  insert into planetbrain.observations(
    observation_id,entity_id,source_record_id,observation_type,observed_at,geom,
    review_status,evidence_strength,interpretation_status,provenance
  ) values(
    v_observation_id,v_entity,v_record_id,v_type,v_observed_at,
    case when v_lat is null then null else gis.st_setsrid(gis.st_makepoint(v_lon,v_lat),4326) end,
    'unreviewed','source_record','measurement_only',
    jsonb_build_object(
      'metric_key',v_metric,'unit',v_unit,'calibration_state',v_calibration,'quality_state',v_quality,
      'rights_state',v_rights,'product_publication_ready',false,
      'truth_boundary','unreviewed sensor observation candidate'
    )
  )
  on conflict(observation_id) do update set
    observed_at=excluded.observed_at,geom=excluded.geom,provenance=excluded.provenance;

  insert into planetbrain.measurements(
    measurement_id,subject_entity_id,metric_key,numeric_value,unit,observed_at,source_record_id,provenance
  ) values(
    v_measurement_id,v_entity,v_metric,v_value,v_unit,v_observed_at,v_record_id,
    jsonb_build_object(
      'observation_id',v_observation_id,'calibration_state',v_calibration,'quality_state',v_quality,
      'rights_state',v_rights,'source_uri',v_source_uri,
      'truth_boundary','numeric measurement is not an ecological interpretation'
    )
  )
  on conflict(measurement_id) do update set
    numeric_value=excluded.numeric_value,unit=excluded.unit,observed_at=excluded.observed_at,
    source_record_id=excluded.source_record_id,provenance=excluded.provenance;

  insert into planetbrain.evidence(
    evidence_id,evidence_type,source_id,dataset_id,source_record_id,citation,provenance
  ) values(
    v_evidence_id,'sensor_source_record','source:4planet-field-sensor-ingress',
    'dataset:4planet:field-sensor-observations-v01',v_record_id,v_source_uri,
    jsonb_build_object(
      'rights_state',v_rights,'calibration_state',v_calibration,'quality_state',v_quality,
      'rights_boundary','ITEM_LEVEL_RIGHTS_REQUIRED',
      'review_state','UNREVIEWED_SENSOR_EVIDENCE'
    )
  )
  on conflict(evidence_id) do update set
    source_record_id=excluded.source_record_id,citation=excluded.citation,
    provenance=planetbrain.evidence.provenance||excluded.provenance;

  return jsonb_build_object(
    'status','staged','sensor_entity',v_sensor_key,'source_record_id',v_record_id,
    'observation_id',v_observation_id,'measurement_id',v_measurement_id,
    'review_status','unreviewed','product_publication_ready',false
  );
end $function$


revoke all on function public.planetbrain_stage_sensor_observation_v01(jsonb) from public,anon,authenticated;
grant execute on function public.planetbrain_stage_sensor_observation_v01(jsonb) to service_role;
