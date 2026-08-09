\set ON_ERROR_STOP on
begin;

insert into public.brain_import_batches(batch_key,source_release,package_sha256,status,founder_release,counts)
values('PHASE06_DECISION_PROOFS','PSI_PHASE05_DECISION_PROOFS',repeat('a',64),'CREATED',false,'{}'::jsonb)
on conflict(batch_key) do nothing;

-- Source registry + immutable source records. Links/metadata only; no copyrighted full text mirrored.


insert into public.sources(source_id,title,publisher,source_type,canonical_url,licence,machine_access,visibility) values
('P5SRC-001','Washing Machine Filters Reduce Microfiber Emissions: Evidence From a Community-Scale Pilot in Parry Sound, Ontario','Frontiers in Marine Science','PEER_REVIEWED_FIELD_PILOT','https://www.frontiersin.org/journals/marine-science/articles/10.3389/fmars.2021.777865/full','LINK_ONLY_INTERNAL_RESEARCH_REFERENCE','MANUAL_REFERENCE','INTERNAL'),
('P5SRC-002','The efficiency of devices intended to reduce microfibre release during clothes washing','Science of the Total Environment / PubMed record','PEER_REVIEWED_CONTROLLED_STUDY','https://pubmed.ncbi.nlm.nih.gov/32682545/','LINK_ONLY_INTERNAL_RESEARCH_REFERENCE','MANUAL_REFERENCE','INTERNAL'),
('P5SRC-003','Mikroplast','Miljødirektoratet','NORWEGIAN_GOVERNMENT_INFORMATION','https://www.miljodirektoratet.no/ansvarsomrader/avfall/plast-i-havet/mikroplast/','LINK_ONLY_INTERNAL_RESEARCH_REFERENCE','MANUAL_REFERENCE','INTERNAL'),
('P5SRC-004','Økodesign for vaskemaskiner','Regjeringen.no / EØS-notatbasen','NORWEGIAN_GOVERNMENT_REGULATORY_PROCESS','https://www.regjeringen.no/no/sub/eos-notatbasen/notatene/2024/sep/okodesign-for-vaskemaskiner/id3098356/','LINK_ONLY_INTERNAL_RESEARCH_REFERENCE','MANUAL_REFERENCE','INTERNAL'),
('P5SRC-005','Global Cooling Watch 2025','UN Environment Programme','AUTHORITATIVE_ASSESSMENT_AND_MODELLING','https://www.unep.org/resources/global-cooling-watch-2025','LINK_ONLY_INTERNAL_RESEARCH_REFERENCE','MANUAL_REFERENCE','INTERNAL'),
('P5SRC-006','Coral restoration – A systematic review of current methods, successes, failures and future directions','PLOS ONE','SYSTEMATIC_REVIEW','https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0226631','LINK_ONLY_INTERNAL_RESEARCH_REFERENCE','MANUAL_REFERENCE','INTERNAL'),
('P5SRC-007','NOAA and Partners Launch Next-Generation Coral Restoration Following Florida Coral Bleaching','NOAA Fisheries','GOVERNMENT_PROGRAMME_ASSESSMENT','https://www.fisheries.noaa.gov/feature-story/noaa-and-partners-launch-next-generation-coral-restoration-following-florida-coral','LINK_ONLY_INTERNAL_RESEARCH_REFERENCE','MANUAL_REFERENCE','INTERNAL'),
('P5SRC-008','Coral Reef Restoration Monitoring Guide','NOAA NCCOS / Coral Restoration Consortium','GOVERNMENT_TECHNICAL_GUIDANCE','https://coastalscience.noaa.gov/data_reports/coral-reef-restoration-monitoring-guide-methods-to-evaluate-restoration-success-from-local-to-ecosystem-scales/','LINK_ONLY_INTERNAL_RESEARCH_REFERENCE','MANUAL_REFERENCE','INTERNAL')
on conflict(source_id) do update set title=excluded.title,publisher=excluded.publisher,canonical_url=excluded.canonical_url;

insert into public.source_records(id,source_id,source_record_id,source_url,retrieved_at,licence,attribution,rights_status,visibility,sensitivity,content_sha256,raw_payload) values
('P6-SR-P5SRC-001','P5SRC-001','P5SRC-001','https://www.frontiersin.org/journals/marine-science/articles/10.3389/fmars.2021.777865/full','2026-08-09T00:30:00Z'::timestamptz,'LINK_ONLY_INTERNAL_RESEARCH_REFERENCE','Frontiers in Marine Science','CONDITIONAL','INTERNAL','NONE','d6b94fa39b184918532211cb618c402727e65336be8068f7a8a78f650023c09f','{"title":"Washing Machine Filters Reduce Microfiber Emissions: Evidence From a Community-Scale Pilot in Parry Sound, Ontario","publisher":"Frontiers in Marine Science","type":"PEER_REVIEWED_FIELD_PILOT","independence":"INDEPENDENT_RESEARCH","use":"microfibre implementation/outcome/economics/limitations","truth_boundary":"link-only internal research reference"}'::jsonb),
('P6-SR-P5SRC-002','P5SRC-002','P5SRC-002','https://pubmed.ncbi.nlm.nih.gov/32682545/','2026-08-09T00:30:00Z'::timestamptz,'LINK_ONLY_INTERNAL_RESEARCH_REFERENCE','Science of the Total Environment / PubMed record','CONDITIONAL','INTERNAL','NONE','b186bc7391f99a86d61e3d04da36e1a3c5b5c3e0361146f69ccf38f329a2a340','{"title":"The efficiency of devices intended to reduce microfibre release during clothes washing","publisher":"Science of the Total Environment / PubMed record","type":"PEER_REVIEWED_CONTROLLED_STUDY","independence":"INDEPENDENT_RESEARCH","use":"device comparison","truth_boundary":"link-only internal research reference"}'::jsonb),
('P6-SR-P5SRC-003','P5SRC-003','P5SRC-003','https://www.miljodirektoratet.no/ansvarsomrader/avfall/plast-i-havet/mikroplast/','2026-08-09T00:30:00Z'::timestamptz,'LINK_ONLY_INTERNAL_RESEARCH_REFERENCE','Miljødirektoratet','CONDITIONAL','INTERNAL','NONE','25454122fc9d8c1d783641aa106701e7273774355cc20d20a04737b2ed27425a','{"title":"Mikroplast","publisher":"Miljødirektoratet","type":"NORWEGIAN_GOVERNMENT_INFORMATION","independence":"GOVERNMENT","use":"Norway problem context","truth_boundary":"link-only internal research reference"}'::jsonb),
('P6-SR-P5SRC-004','P5SRC-004','P5SRC-004','https://www.regjeringen.no/no/sub/eos-notatbasen/notatene/2024/sep/okodesign-for-vaskemaskiner/id3098356/','2026-08-09T00:30:00Z'::timestamptz,'LINK_ONLY_INTERNAL_RESEARCH_REFERENCE','Regjeringen.no / EØS-notatbasen','CONDITIONAL','INTERNAL','NONE','5f5044c2a79f9c84cc5e0edc2dfbfc3229c72a1b22906fc85099ce203aa70b2c','{"title":"Økodesign for vaskemaskiner","publisher":"Regjeringen.no / EØS-notatbasen","type":"NORWEGIAN_GOVERNMENT_REGULATORY_PROCESS","independence":"GOVERNMENT","use":"Norway regulatory context","truth_boundary":"link-only internal research reference"}'::jsonb),
('P6-SR-P5SRC-005','P5SRC-005','P5SRC-005','https://www.unep.org/resources/global-cooling-watch-2025','2026-08-09T00:30:00Z'::timestamptz,'LINK_ONLY_INTERNAL_RESEARCH_REFERENCE','UN Environment Programme','CONDITIONAL','INTERNAL','NONE','f60fc627b8cf05dfcd011c2d68b3a4e399332e23e8ff4ca4add6e6b5804b66f4','{"title":"Global Cooling Watch 2025","publisher":"UN Environment Programme","type":"AUTHORITATIVE_ASSESSMENT_AND_MODELLING","independence":"MULTILATERAL","use":"cooling pathway/scenario/economics","truth_boundary":"link-only internal research reference"}'::jsonb),
('P6-SR-P5SRC-006','P5SRC-006','P5SRC-006','https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0226631','2026-08-09T00:30:00Z'::timestamptz,'LINK_ONLY_INTERNAL_RESEARCH_REFERENCE','PLOS ONE','CONDITIONAL','INTERNAL','NONE','72da50bf3d06f2be2cc80932f4a88c191d3fde7586c5757060979cdf073f2064','{"title":"Coral restoration – A systematic review of current methods, successes, failures and future directions","publisher":"PLOS ONE","type":"SYSTEMATIC_REVIEW","independence":"PEER_REVIEWED","use":"coral evidence synthesis/scaling limitations","truth_boundary":"link-only internal research reference"}'::jsonb),
('P6-SR-P5SRC-007','P5SRC-007','P5SRC-007','https://www.fisheries.noaa.gov/feature-story/noaa-and-partners-launch-next-generation-coral-restoration-following-florida-coral','2026-08-09T00:30:00Z'::timestamptz,'LINK_ONLY_INTERNAL_RESEARCH_REFERENCE','NOAA Fisheries','CONDITIONAL','INTERNAL','NONE','2e2993d0ba3675dc7d1419762f20f8547e81adf28204b049780e7e1a275099f4','{"title":"NOAA and Partners Launch Next-Generation Coral Restoration Following Florida Coral Bleaching","publisher":"NOAA Fisheries","type":"GOVERNMENT_PROGRAMME_ASSESSMENT","independence":"GOVERNMENT_IMPLEMENTER","use":"Florida heat-event outcomes / adaptive redesign","truth_boundary":"link-only internal research reference"}'::jsonb),
('P6-SR-P5SRC-008','P5SRC-008','P5SRC-008','https://coastalscience.noaa.gov/data_reports/coral-reef-restoration-monitoring-guide-methods-to-evaluate-restoration-success-from-local-to-ecosystem-scales/','2026-08-09T00:30:00Z'::timestamptz,'LINK_ONLY_INTERNAL_RESEARCH_REFERENCE','NOAA NCCOS / Coral Restoration Consortium','CONDITIONAL','INTERNAL','NONE','25bb549ddc17939afc77eb9674c0001b6b08a8ef141032b515142c336f616634','{"title":"Coral Reef Restoration Monitoring Guide","publisher":"NOAA NCCOS / Coral Restoration Consortium","type":"GOVERNMENT_TECHNICAL_GUIDANCE","independence":"GOVERNMENT_TECHNICAL","use":"monitoring/outcome chain","truth_boundary":"link-only internal research reference"}'::jsonb)
on conflict(id) do nothing;

do $$
declare r jsonb;
begin
  for r in select value from jsonb_array_elements('[{"family":"SOURCE_RECORD","ref":"P6-SR-P5SRC-001","payload":{"source_id":"P5SRC-001","title":"Washing Machine Filters Reduce Microfiber Emissions: Evidence From a Community-Scale Pilot in Parry Sound, Ontario"}},{"family":"SOURCE_RECORD","ref":"P6-SR-P5SRC-002","payload":{"source_id":"P5SRC-002","title":"The efficiency of devices intended to reduce microfibre release during clothes washing"}},{"family":"SOURCE_RECORD","ref":"P6-SR-P5SRC-003","payload":{"source_id":"P5SRC-003","title":"Mikroplast"}},{"family":"SOURCE_RECORD","ref":"P6-SR-P5SRC-004","payload":{"source_id":"P5SRC-004","title":"Økodesign for vaskemaskiner"}},{"family":"SOURCE_RECORD","ref":"P6-SR-P5SRC-005","payload":{"source_id":"P5SRC-005","title":"Global Cooling Watch 2025"}},{"family":"SOURCE_RECORD","ref":"P6-SR-P5SRC-006","payload":{"source_id":"P5SRC-006","title":"Coral restoration – A systematic review of current methods, successes, failures and future directions"}},{"family":"SOURCE_RECORD","ref":"P6-SR-P5SRC-007","payload":{"source_id":"P5SRC-007","title":"NOAA and Partners Launch Next-Generation Coral Restoration Following Florida Coral Bleaching"}},{"family":"SOURCE_RECORD","ref":"P6-SR-P5SRC-008","payload":{"source_id":"P5SRC-008","title":"Coral Reef Restoration Monitoring Guide"}},{"family":"PROBLEM_FRAME","ref":"4P-PROB-00013","payload":{"title":"Sustainable cooling in tropical and hot climates","statement":"Scoped intelligence frame for delivering safe cooling while limiting energy, grid and climate burdens in hot-climate contexts."}},{"family":"PROBLEM_FRAME","ref":"4P-PROB-00045","payload":{"title":"Coral restoration under warming","statement":"Scoped intelligence frame for active coral restoration under recurrent marine heat stress and interacting local pressures."}},{"family":"PROBLEM_FRAME","ref":"4P-PROB-00082","payload":{"title":"Textile microfibre pollution","statement":"Scoped intelligence frame for washing-related textile microfibre release, capture, wastewater pathways and downstream environmental exposure."}},{"family":"SOLUTION_PATHWAY","ref":"4P-SOL-000037","payload":{"title":"Pathway — reduce or prevent: cooling","parent":null,"problem":"4P-PROB-00013"}},{"family":"INTERVENTION","ref":"4P-SOL-000038","payload":{"title":"Passive cooling: shading, ventilation and reflective surfaces","parent":"4P-SOL-000037","problem":"4P-PROB-00013"}},{"family":"INTERVENTION","ref":"4P-SOL-000039","payload":{"title":"High-efficiency cooling systems with low-GWP refrigerants","parent":"4P-SOL-000037","problem":"4P-PROB-00013"}},{"family":"SOLUTION_PATHWAY","ref":"4P-SOL-000133","payload":{"title":"Pathway — reduce or prevent: coral degradation","parent":null,"problem":"4P-PROB-00045"}},{"family":"INTERVENTION","ref":"4P-SOL-000134","payload":{"title":"Reduce local stressors and improve habitat quality","parent":"4P-SOL-000133","problem":"4P-PROB-00045"}},{"family":"INTERVENTION","ref":"4P-SOL-000135","payload":{"title":"Targeted coral propagation/outplanting within adaptive restoration plans","parent":"4P-SOL-000133","problem":"4P-PROB-00045"}},{"family":"SOLUTION_PATHWAY","ref":"4P-SOL-000244","payload":{"title":"Pathway — reduce or prevent: microfibres","parent":null,"problem":"4P-PROB-00082"}},{"family":"INTERVENTION","ref":"4P-SOL-000245","payload":{"title":"Washing-machine microfibre capture","parent":"4P-SOL-000244","problem":"4P-PROB-00082"}},{"family":"INTERVENTION","ref":"4P-SOL-000282","payload":{"title":"Active restoration using reference ecosystems and long-term monitoring","parent":null,"problem":null}},{"family":"INTERVENTION","ref":"4P-SOL-000306","payload":{"title":"External shading and solar-control design","parent":"4P-SOL-000037","problem":"4P-PROB-00013"}},{"family":"INTERVENTION","ref":"4P-SOL-000307","payload":{"title":"Natural ventilation and mixed-mode cooling","parent":"4P-SOL-000037","problem":"4P-PROB-00013"}},{"family":"INTERVENTION","ref":"4P-SOL-000308","payload":{"title":"Reflective/cool roofs","parent":"4P-SOL-000037","problem":"4P-PROB-00013"}},{"family":"INTERVENTION","ref":"4P-SOL-000309","payload":{"title":"District or shared cooling networks","parent":"4P-SOL-000037","problem":"4P-PROB-00013"}},{"family":"INTERVENTION","ref":"4P-SOL-000310","payload":{"title":"Thermal energy storage for cooling load shifting","parent":"4P-SOL-000037","problem":"4P-PROB-00013"}},{"family":"INTERVENTION","ref":"4P-SOL-000321","payload":{"title":"External washing-machine microfibre filters","parent":"4P-SOL-000244","problem":"4P-PROB-00082"}},{"family":"INTERVENTION","ref":"4P-SOL-000322","payload":{"title":"Integrated washing-machine filtration","parent":"4P-SOL-000244","problem":"4P-PROB-00082"}},{"family":"INTERVENTION","ref":"4P-SOL-000323","payload":{"title":"Low-shedding yarn/fabric engineering","parent":"4P-SOL-000244","problem":"4P-PROB-00082"}},{"family":"INTERVENTION","ref":"4P-SOL-000324","payload":{"title":"Laundry process optimisation to reduce fibre shedding","parent":"4P-SOL-000244","problem":"4P-PROB-00082"}},{"family":"INTERVENTION","ref":"4P-SOL-000325","payload":{"title":"Wastewater tertiary microplastic capture","parent":"4P-SOL-000244","problem":"4P-PROB-00082"}},{"family":"INTERVENTION","ref":"4P-SOL-000346","payload":{"title":"Coral nurseries and outplanting","parent":"4P-SOL-000133","problem":"4P-PROB-00045"}},{"family":"INTERVENTION","ref":"4P-SOL-000347","payload":{"title":"Microfragmentation for selected massive corals","parent":"4P-SOL-000133","problem":"4P-PROB-00045"}},{"family":"INTERVENTION","ref":"4P-SOL-000348","payload":{"title":"Larval propagation and assisted recruitment","parent":"4P-SOL-000133","problem":"4P-PROB-00045"}},{"family":"INTERVENTION","ref":"4P-SOL-000349","payload":{"title":"Heat-tolerant genotype selection / assisted adaptation research","parent":"4P-SOL-000133","problem":"4P-PROB-00045"}},{"family":"INTERVENTION","ref":"4P-SOL-000350","payload":{"title":"Local water-quality and habitat-quality improvement alongside restoration","parent":"4P-SOL-000133","problem":"4P-PROB-00045"}},{"family":"CLAIM","ref":"P5-CLM-001","payload":{"claim_id":"P5-CLM-001","case_id":"CASE-05","subject_id":"4P-SOL-000321","direction":"SUPPORTS","claim":"In a controlled comparison, the XFiltra external washing-machine filter reduced microfibre release to wastewater by approximately 78% under the study conditions.","source_id":"P5SRC-002","measurement":"MEASURED_CONTROLLED","directness":"DIRECT_SOLUTION_LEVEL","independence":"INDEPENDENT_RESEARCH","limitations":"One device/protocol; does not establish class-wide effectiveness or whole-life environmental benefit."}},{"family":"CLAIM","ref":"P5-CLM-002","payload":{"claim_id":"P5-CLM-002","case_id":"CASE-05","subject_id":"4P-SOL-000324","direction":"SUPPORTS","claim":"In the same controlled comparison, use of a Guppyfriend washing bag reduced microfibre release by approximately 54%, with evidence that part of the effect came from reduced fibre shedding.","source_id":"P5SRC-002","measurement":"MEASURED_CONTROLLED","directness":"DIRECT_SOLUTION_LEVEL","independence":"INDEPENDENT_RESEARCH","limitations":"One experimental protocol; bag use and garment mix affect generalisability."}},{"family":"CLAIM","ref":"P5-CLM-003","payload":{"claim_id":"P5-CLM-003","case_id":"CASE-05","subject_id":"4P-SOL-000321","direction":"SUPPORTS","claim":"A 97-home Parry Sound pilot reported an average 41% reduction in microfibre counts in treated final wastewater effluent after household filter deployment.","source_id":"P5SRC-001","measurement":"MEASURED_PRE_POST_FIELD","directness":"IMPLEMENTATION_OUTCOME","independence":"INDEPENDENT_RESEARCH","limitations":"Pre/post community study; only ~10% of WWTP-connected households participated and behavioural factors may have contributed."}},{"family":"CLAIM","ref":"P5-CLM-004","payload":{"claim_id":"P5-CLM-004","case_id":"CASE-05","subject_id":"4P-SOL-000321","direction":"QUALIFIES","claim":"Twenty interested Parry Sound households were not included because their homes could not readily accommodate or operate the filter installation.","source_id":"P5SRC-001","measurement":"MEASURED_IMPLEMENTATION_PROCESS","directness":"IMPLEMENTATION_REQUIREMENT","independence":"INDEPENDENT_RESEARCH","limitations":"Single Canadian pilot context; constraints may differ by housing and appliance configuration."}},{"family":"CLAIM","ref":"P5-CLM-005","payload":{"claim_id":"P5-CLM-005","case_id":"CASE-05","subject_id":"4P-SOL-000321","direction":"QUALIFIES","claim":"The Parry Sound study described the aftermarket filter as costing roughly US$150, but the pilot supplied the filter and professional installation at no cost to participants.","source_id":"P5SRC-001","measurement":"REPORTED_ECONOMICS","directness":"DIRECT_IMPLEMENTATION_ECONOMICS","independence":"INDEPENDENT_RESEARCH","limitations":"Historic approximate device price; full installation, maintenance and current lifecycle costs were not established."}},{"family":"CLAIM","ref":"P5-CLM-006","payload":{"claim_id":"P5-CLM-006","case_id":"NORWAY-01","subject_id":"4P-PROB-00082","direction":"SUPPORTS","claim":"The Norwegian Environment Agency estimates that microplastics from textiles contribute roughly 1,000 tonnes of microplastic emissions per year in Norway, with private washing-machine use thought to be the largest source within the textile category.","source_id":"P5SRC-003","measurement":"GOVERNMENT_ESTIMATE","directness":"NORWAY_PROBLEM_CONTEXT","independence":"GOVERNMENT","limitations":"Preserve agency wording and uncertainty; not a measurement of a specific intervention or direct ecosystem outcome."}},{"family":"CLAIM","ref":"P5-CLM-007","payload":{"claim_id":"P5-CLM-007","case_id":"NORWAY-01","subject_id":"4P-SOL-000322","direction":"SUPPORTS","claim":"Norway supports evaluating microplastic-filter requirements as part of the EU ecodesign revision process for household washing machines.","source_id":"P5SRC-004","measurement":"REGULATORY_PROCESS_RECORD","directness":"NORWAY_POLICY_CONTEXT","independence":"GOVERNMENT","limitations":"Participation/support in an EU process is not the same as an enacted current Norwegian filter mandate."}},{"family":"CLAIM","ref":"P5-CLM-008","payload":{"claim_id":"P5-CLM-008","case_id":"NORWAY-01","subject_id":"4P-SOL-000322","direction":"QUALIFIES","claim":"The Norwegian EEA note describes possible future product requirements and states that it is too early to quantify economic and administrative consequences.","source_id":"P5SRC-004","measurement":"REGULATORY_PROCESS_RECORD","directness":"NORWAY_POLICY_LIMITATION","independence":"GOVERNMENT","limitations":"Do not present a draft/process-stage requirement as current law."}},{"family":"CLAIM","ref":"P5-CLM-009","payload":{"claim_id":"P5-CLM-009","case_id":"CASE-02","subject_id":"4P-SOL-000037","direction":"SUPPORTS","claim":"UNEP Global Cooling Watch 2025 models cooling demand as capable of more than tripling by 2050 under a business-as-usual pathway.","source_id":"P5SRC-005","measurement":"MODELLED_SCENARIO","directness":"SYSTEM_PATHWAY","independence":"MULTILATERAL_ASSESSMENT","limitations":"Forward scenario, not observed future demand."}},{"family":"CLAIM","ref":"P5-CLM-010","payload":{"claim_id":"P5-CLM-010","case_id":"CASE-02","subject_id":"4P-SOL-000037","direction":"SUPPORTS","claim":"UNEP's 2025 Sustainable Cooling Pathway models a portfolio capable of reducing 2050 cooling emissions by 64% relative to business as usual while expanding cooling access.","source_id":"P5SRC-005","measurement":"MODELLED_PORTFOLIO_SCENARIO","directness":"PATHWAY_LEVEL","independence":"MULTILATERAL_ASSESSMENT","limitations":"Integrated global model; effect cannot be attributed to any single intervention and depends on policy and implementation assumptions."}},{"family":"CLAIM","ref":"P5-CLM-011","payload":{"claim_id":"P5-CLM-011","case_id":"CASE-02","subject_id":"4P-SOL-000038","direction":"SUPPORTS","claim":"UNEP's sustainable cooling pathway treats passive and nature-based cooling measures as a first-line route to reduce cooling demand before meeting residual demand efficiently.","source_id":"P5SRC-005","measurement":"AUTHORITATIVE_PATHWAY_SYNTHESIS","directness":"INTERVENTION_FAMILY","independence":"MULTILATERAL_ASSESSMENT","limitations":"Specific thermal, health, cost and energy outcomes depend on local climate, building form, occupancy and implementation quality."}},{"family":"CLAIM","ref":"P5-CLM-012","payload":{"claim_id":"P5-CLM-012","case_id":"CASE-02","subject_id":"4P-SOL-000037","direction":"QUALIFIES","claim":"The large emission and economic benefits in UNEP's Sustainable Cooling Pathway are results of an integrated portfolio scenario and are not measured savings attributable to an individual cool-roof, shading or ventilation retrofit.","source_id":"P5SRC-005","measurement":"MODEL_INTERPRETATION_LIMIT","directness":"PATHWAY_LIMITATION","independence":"MULTILATERAL_ASSESSMENT","limitations":"Individual intervention economics and performance still require local evidence."}},{"family":"CLAIM","ref":"P5-CLM-013","payload":{"claim_id":"P5-CLM-013","case_id":"CASE-02","subject_id":"4P-SOL-000037","direction":"SUPPORTS","claim":"UNEP reports that its Sustainable Cooling Pathway could avoid up to US$43 trillion in electricity and infrastructure costs under the modelled global pathway.","source_id":"P5SRC-005","measurement":"MODELLED_ECONOMICS","directness":"PATHWAY_ECONOMICS","independence":"MULTILATERAL_ASSESSMENT","limitations":"Global cumulative scenario value; not a project cost, intervention payback or locally transferable business case."}},{"family":"CLAIM","ref":"P5-CLM-014","payload":{"claim_id":"P5-CLM-014","case_id":"CASE-10","subject_id":"4P-SOL-000346","direction":"SUPPORTS","claim":"A global systematic review of coral restoration studies reported an average survival of restored corals of approximately 66% across reported projects.","source_id":"P5SRC-006","measurement":"SYSTEMATIC_REVIEW_SYNTHESIS","directness":"SOLUTION_FAMILY","independence":"PEER_REVIEWED","limitations":"High methodological and taxonomic heterogeneity; survival is not equivalent to self-sustaining ecosystem recovery."}},{"family":"CLAIM","ref":"P5-CLM-015","payload":{"claim_id":"P5-CLM-015","case_id":"CASE-10","subject_id":"4P-SOL-000346","direction":"QUALIFIES","claim":"In the same systematic review, 60% of projects monitored restoration for less than 18 months and the median spatial scale was only about 100 square metres.","source_id":"P5SRC-006","measurement":"SYSTEMATIC_REVIEW_SYNTHESIS","directness":"EVIDENCE_BASE_LIMITATION","independence":"PEER_REVIEWED","limitations":"Shows why short-term survival cannot be generalised to large-scale, long-term restoration success."}},{"family":"CLAIM","ref":"P5-CLM-016","payload":{"claim_id":"P5-CLM-016","case_id":"CASE-10","subject_id":"4P-SOL-000346","direction":"CHALLENGES","claim":"After the 2023 Florida Keys marine heat event, NOAA reported that a 2024 assessment found less than 22% of staghorn and less than 5% of elkhorn corals from the Mission: Iconic Reefs outplanting programme remained alive.","source_id":"P5SRC-007","measurement":"MEASURED_PROGRAMME_OUTCOME","directness":"IMPLEMENTATION_OUTCOME","independence":"GOVERNMENT_IMPLEMENTER","limitations":"Extreme heat event, Florida geography and branching-coral programme; challenges robustness under severe warming but does not universally invalidate restoration."}},{"family":"CLAIM","ref":"P5-CLM-017","payload":{"claim_id":"P5-CLM-017","case_id":"CASE-10","subject_id":"4P-SOL-000349","direction":"SUPPORTS","claim":"NOAA's post-bleaching Florida programme is testing selective breeding, heat-adapted crosses and symbiont strategies intended to improve future coral thermal resilience.","source_id":"P5SRC-007","measurement":"ACTIVE_R_AND_D_PROGRAMME","directness":"EMERGING_INTERVENTION","independence":"GOVERNMENT_IMPLEMENTER","limitations":"Ongoing research and adaptive programme design; not proof of long-term or ecosystem-scale effectiveness."}},{"family":"CLAIM","ref":"P5-CLM-018","payload":{"claim_id":"P5-CLM-018","case_id":"CASE-10","subject_id":"4P-SOL-000133","direction":"QUALIFIES","claim":"The systematic review explicitly cautions that coral restoration should not be treated as a replacement for meaningful action on climate change.","source_id":"P5SRC-006","measurement":"SYSTEMATIC_REVIEW_CONCLUSION","directness":"PATHWAY_LIMITATION","independence":"PEER_REVIEWED","limitations":"Restoration can address selected local recovery objectives but cannot remove the global warming driver."}},{"family":"CLAIM","ref":"P5-CLM-019","payload":{"claim_id":"P5-CLM-019","case_id":"CASE-10","subject_id":"4P-SOL-000282","direction":"SUPPORTS","claim":"NOAA/Coral Restoration Consortium guidance recommends standardised monitoring that links restoration goals to metrics from colony to ecosystem scales.","source_id":"P5SRC-008","measurement":"TECHNICAL_GUIDANCE","directness":"IMPLEMENTATION_MONITORING","independence":"GOVERNMENT_TECHNICAL","limitations":"Monitoring guidance improves evaluation consistency but does not by itself establish restoration effectiveness."}},{"family":"IMPLEMENTATION","ref":"P5-IMP-001","payload":{"implementation_id":"P5-IMP-001","solution_id":"4P-SOL-000321","actor":"Parry Sound households / study team","place":"Parry Sound, Ontario, Canada","start":"2019","scale":"97 household after-market filters","status":"COMPLETED_FIELD_PILOT","outcome_ids":["P5-OUT-001","P5-OUT-002"],"source_id":"P5SRC-001","independent_evaluation":true}},{"family":"IMPLEMENTATION","ref":"P5-IMP-002","payload":{"implementation_id":"P5-IMP-002","solution_id":"4P-SOL-000321","actor":"Independent research team","place":"Controlled laboratory comparison","start":"2020","scale":"Six devices compared","status":"COMPLETED_CONTROLLED_STUDY","outcome_ids":["P5-OUT-003","P5-OUT-004"],"source_id":"P5SRC-002","independent_evaluation":true}},{"family":"IMPLEMENTATION","ref":"P5-IMP-003","payload":{"implementation_id":"P5-IMP-003","solution_id":"4P-SOL-000346","actor":"Mission: Iconic Reefs / NOAA and partners","place":"Florida Keys, USA","start":"2020s","scale":"Seven target reef sites; branching-coral programme affected by 2023 heat event","status":"ADAPTIVE_REDESIGN_AFTER_HEAT_EVENT","outcome_ids":["P5-OUT-007","P5-OUT-008"],"source_id":"P5SRC-007","independent_evaluation":false,"notes":"Government programme assessment; severe heat event provides negative/qualifying implementation evidence."}},{"family":"ACTOR_CANDIDATE","ref":"P6-PENDING-ACTOR-PARRY","payload":{"name":"Parry Sound households / study team / WWTP","status":"PENDING_ENTITY_RESOLUTION","source_id":"P5SRC-001"}},{"family":"ACTOR_CANDIDATE","ref":"P6-PENDING-ACTOR-NOAA","payload":{"name":"Mission: Iconic Reefs / NOAA and partners","status":"PENDING_ENTITY_RESOLUTION","source_id":"P5SRC-007"}},{"family":"ACTOR_CANDIDATE","ref":"P6-PENDING-ACTOR-UNEP","payload":{"name":"UNEP Cool Coalition","status":"PENDING_ENTITY_RESOLUTION","source_id":"P5SRC-005"}},{"family":"ACTOR_CANDIDATE","ref":"P6-PENDING-ACTOR-MILJO","payload":{"name":"Miljødirektoratet","status":"PENDING_ENTITY_RESOLUTION","source_id":"P5SRC-003"}}]'::jsonb) loop
    perform public.stage_brain_record(
      'PHASE06_DECISION_PROOFS',
      r->>'family',
      r->>'ref',
      r->'payload',
      encode(digest((r->'payload')::text,'sha256'),'hex')
    );
  end loop;
end $$;


insert into public.brain_objects(public_ref,object_type,title,lifecycle_state,review_status,visibility) values
('4P-PROB-00013','PROBLEM_FRAME','Sustainable cooling in tropical and hot climates','STAGING','SOURCE_CHECKED','INTERNAL'),
('4P-PROB-00045','PROBLEM_FRAME','Coral restoration under warming','STAGING','SOURCE_CHECKED','INTERNAL'),
('4P-PROB-00082','PROBLEM_FRAME','Textile microfibre pollution','STAGING','SOURCE_CHECKED','INTERNAL')
on conflict(public_ref) do nothing;

insert into public.problem_frames(object_id,statement,scope,framing_version)
select o.id,v.statement,v.scope,v.framing_version from (values
('4P-PROB-00013','Scoped intelligence frame for delivering safe cooling while limiting energy, grid and climate burdens in hot-climate contexts.','PHASE06_DECISION_PROOF','1.0'),
('4P-PROB-00045','Scoped intelligence frame for active coral restoration under recurrent marine heat stress and interacting local pressures.','PHASE06_DECISION_PROOF','1.0'),
('4P-PROB-00082','Scoped intelligence frame for washing-related textile microfibre release, capture, wastewater pathways and downstream environmental exposure.','PHASE06_DECISION_PROOF','1.0')
) v(public_ref,statement,scope,framing_version)
join public.brain_objects o on o.public_ref=v.public_ref
on conflict(object_id) do nothing;

insert into public.brain_objects(public_ref,object_type,title,lifecycle_state,review_status,visibility) values
('4P-SOL-000037','SOLUTION_PATHWAY','Pathway — reduce or prevent: cooling','STAGING','SOURCE_CHECKED','INTERNAL'),
('4P-SOL-000038','INTERVENTION','Passive cooling: shading, ventilation and reflective surfaces','STAGING','SOURCE_CHECKED','INTERNAL'),
('4P-SOL-000039','INTERVENTION','High-efficiency cooling systems with low-GWP refrigerants','STAGING','SOURCE_CHECKED','INTERNAL'),
('4P-SOL-000133','SOLUTION_PATHWAY','Pathway — reduce or prevent: coral degradation','STAGING','SOURCE_CHECKED','INTERNAL'),
('4P-SOL-000134','INTERVENTION','Reduce local stressors and improve habitat quality','STAGING','SOURCE_CHECKED','INTERNAL'),
('4P-SOL-000135','INTERVENTION','Targeted coral propagation/outplanting within adaptive restoration plans','STAGING','SOURCE_CHECKED','INTERNAL'),
('4P-SOL-000244','SOLUTION_PATHWAY','Pathway — reduce or prevent: microfibres','STAGING','SOURCE_CHECKED','INTERNAL'),
('4P-SOL-000245','INTERVENTION','Washing-machine microfibre capture','STAGING','SOURCE_CHECKED','INTERNAL'),
('4P-SOL-000282','INTERVENTION','Active restoration using reference ecosystems and long-term monitoring','STAGING','SOURCE_CHECKED','INTERNAL'),
('4P-SOL-000306','INTERVENTION','External shading and solar-control design','STAGING','SOURCE_CHECKED','INTERNAL'),
('4P-SOL-000307','INTERVENTION','Natural ventilation and mixed-mode cooling','STAGING','SOURCE_CHECKED','INTERNAL'),
('4P-SOL-000308','INTERVENTION','Reflective/cool roofs','STAGING','SOURCE_CHECKED','INTERNAL'),
('4P-SOL-000309','INTERVENTION','District or shared cooling networks','STAGING','SOURCE_CHECKED','INTERNAL'),
('4P-SOL-000310','INTERVENTION','Thermal energy storage for cooling load shifting','STAGING','SOURCE_CHECKED','INTERNAL'),
('4P-SOL-000321','INTERVENTION','External washing-machine microfibre filters','STAGING','SOURCE_CHECKED','INTERNAL'),
('4P-SOL-000322','INTERVENTION','Integrated washing-machine filtration','STAGING','SOURCE_CHECKED','INTERNAL'),
('4P-SOL-000323','INTERVENTION','Low-shedding yarn/fabric engineering','STAGING','SOURCE_CHECKED','INTERNAL'),
('4P-SOL-000324','INTERVENTION','Laundry process optimisation to reduce fibre shedding','STAGING','SOURCE_CHECKED','INTERNAL'),
('4P-SOL-000325','INTERVENTION','Wastewater tertiary microplastic capture','STAGING','SOURCE_CHECKED','INTERNAL'),
('4P-SOL-000346','INTERVENTION','Coral nurseries and outplanting','STAGING','SOURCE_CHECKED','INTERNAL'),
('4P-SOL-000347','INTERVENTION','Microfragmentation for selected massive corals','STAGING','SOURCE_CHECKED','INTERNAL'),
('4P-SOL-000348','INTERVENTION','Larval propagation and assisted recruitment','STAGING','SOURCE_CHECKED','INTERNAL'),
('4P-SOL-000349','INTERVENTION','Heat-tolerant genotype selection / assisted adaptation research','STAGING','SOURCE_CHECKED','INTERNAL'),
('4P-SOL-000350','INTERVENTION','Local water-quality and habitat-quality improvement alongside restoration','STAGING','SOURCE_CHECKED','INTERNAL')
on conflict(public_ref) do nothing;

insert into public.solution_pathways(object_id,mechanism,applicability,limitations)
select o.id,v.mechanism,v.applicability,v.limitations from (values
('4P-SOL-000037','Pathway — reduce or prevent: cooling','CONTEXT_DEPENDENT','Evidence must be attached at claim/implementation level.'),
('4P-SOL-000133','Pathway — reduce or prevent: coral degradation','CONTEXT_DEPENDENT','Evidence must be attached at claim/implementation level.'),
('4P-SOL-000244','Pathway — reduce or prevent: microfibres','CONTEXT_DEPENDENT','Evidence must be attached at claim/implementation level.')
) v(public_ref,mechanism,applicability,limitations)
join public.brain_objects o on o.public_ref=v.public_ref
on conflict(object_id) do nothing;

insert into public.interventions(object_id,primary_pathway_id,intervention_type,mechanism,maturity,applicability,limitations)
select o.id,p.id,v.intervention_type,v.mechanism,v.maturity,v.applicability,v.limitations
from (values
('4P-SOL-000038','4P-SOL-000037','PHASE06_DECISION_PROOF','Passive cooling: shading, ventilation and reflective surfaces','UNASSESSED','CONTEXT_DEPENDENT','No effectiveness inheritance.'),
('4P-SOL-000039','4P-SOL-000037','PHASE06_DECISION_PROOF','High-efficiency cooling systems with low-GWP refrigerants','UNASSESSED','CONTEXT_DEPENDENT','No effectiveness inheritance.'),
('4P-SOL-000134','4P-SOL-000133','PHASE06_DECISION_PROOF','Reduce local stressors and improve habitat quality','UNASSESSED','CONTEXT_DEPENDENT','No effectiveness inheritance.'),
('4P-SOL-000135','4P-SOL-000133','PHASE06_DECISION_PROOF','Targeted coral propagation/outplanting within adaptive restoration plans','UNASSESSED','CONTEXT_DEPENDENT','No effectiveness inheritance.'),
('4P-SOL-000245','4P-SOL-000244','PHASE06_DECISION_PROOF','Washing-machine microfibre capture','UNASSESSED','CONTEXT_DEPENDENT','No effectiveness inheritance.'),
('4P-SOL-000282',null,'PHASE06_DECISION_PROOF','Active restoration using reference ecosystems and long-term monitoring','UNASSESSED','CONTEXT_DEPENDENT','No effectiveness inheritance.'),
('4P-SOL-000306','4P-SOL-000037','PHASE06_DECISION_PROOF','External shading and solar-control design','UNASSESSED','CONTEXT_DEPENDENT','No effectiveness inheritance.'),
('4P-SOL-000307','4P-SOL-000037','PHASE06_DECISION_PROOF','Natural ventilation and mixed-mode cooling','UNASSESSED','CONTEXT_DEPENDENT','No effectiveness inheritance.'),
('4P-SOL-000308','4P-SOL-000037','PHASE06_DECISION_PROOF','Reflective/cool roofs','UNASSESSED','CONTEXT_DEPENDENT','No effectiveness inheritance.'),
('4P-SOL-000309','4P-SOL-000037','PHASE06_DECISION_PROOF','District or shared cooling networks','UNASSESSED','CONTEXT_DEPENDENT','No effectiveness inheritance.'),
('4P-SOL-000310','4P-SOL-000037','PHASE06_DECISION_PROOF','Thermal energy storage for cooling load shifting','UNASSESSED','CONTEXT_DEPENDENT','No effectiveness inheritance.'),
('4P-SOL-000321','4P-SOL-000244','PHASE06_DECISION_PROOF','External washing-machine microfibre filters','UNASSESSED','CONTEXT_DEPENDENT','No effectiveness inheritance.'),
('4P-SOL-000322','4P-SOL-000244','PHASE06_DECISION_PROOF','Integrated washing-machine filtration','UNASSESSED','CONTEXT_DEPENDENT','No effectiveness inheritance.'),
('4P-SOL-000323','4P-SOL-000244','PHASE06_DECISION_PROOF','Low-shedding yarn/fabric engineering','UNASSESSED','CONTEXT_DEPENDENT','No effectiveness inheritance.'),
('4P-SOL-000324','4P-SOL-000244','PHASE06_DECISION_PROOF','Laundry process optimisation to reduce fibre shedding','UNASSESSED','CONTEXT_DEPENDENT','No effectiveness inheritance.'),
('4P-SOL-000325','4P-SOL-000244','PHASE06_DECISION_PROOF','Wastewater tertiary microplastic capture','UNASSESSED','CONTEXT_DEPENDENT','No effectiveness inheritance.'),
('4P-SOL-000346','4P-SOL-000133','PHASE06_DECISION_PROOF','Coral nurseries and outplanting','UNASSESSED','CONTEXT_DEPENDENT','No effectiveness inheritance.'),
('4P-SOL-000347','4P-SOL-000133','PHASE06_DECISION_PROOF','Microfragmentation for selected massive corals','UNASSESSED','CONTEXT_DEPENDENT','No effectiveness inheritance.'),
('4P-SOL-000348','4P-SOL-000133','PHASE06_DECISION_PROOF','Larval propagation and assisted recruitment','UNASSESSED','CONTEXT_DEPENDENT','No effectiveness inheritance.'),
('4P-SOL-000349','4P-SOL-000133','PHASE06_DECISION_PROOF','Heat-tolerant genotype selection / assisted adaptation research','UNASSESSED','CONTEXT_DEPENDENT','No effectiveness inheritance.'),
('4P-SOL-000350','4P-SOL-000133','PHASE06_DECISION_PROOF','Local water-quality and habitat-quality improvement alongside restoration','UNASSESSED','CONTEXT_DEPENDENT','No effectiveness inheritance.')
) v(public_ref,parent_ref,intervention_type,mechanism,maturity,applicability,limitations)
join public.brain_objects o on o.public_ref=v.public_ref
left join public.brain_objects p on p.public_ref=v.parent_ref
on conflict(object_id) do nothing;

insert into public.brain_relationships(subject_id,predicate,object_id,review_status,interpretation_status,visibility,relation_basis,effectiveness_implication)
select s.id,'ADDRESSES',p.id,'SOURCE_CHECKED','4PLANET_INTERPRETATION','INTERNAL','Phase05 Decision-Proof relevance; not effectiveness.','NONE'
from (values
('4P-SOL-000037','4P-PROB-00013'),('4P-SOL-000038','4P-PROB-00013'),('4P-SOL-000039','4P-PROB-00013'),
('4P-SOL-000306','4P-PROB-00013'),('4P-SOL-000307','4P-PROB-00013'),('4P-SOL-000308','4P-PROB-00013'),('4P-SOL-000309','4P-PROB-00013'),('4P-SOL-000310','4P-PROB-00013'),
('4P-SOL-000133','4P-PROB-00045'),('4P-SOL-000134','4P-PROB-00045'),('4P-SOL-000135','4P-PROB-00045'),('4P-SOL-000346','4P-PROB-00045'),('4P-SOL-000347','4P-PROB-00045'),('4P-SOL-000348','4P-PROB-00045'),('4P-SOL-000349','4P-PROB-00045'),('4P-SOL-000350','4P-PROB-00045'),
('4P-SOL-000244','4P-PROB-00082'),('4P-SOL-000245','4P-PROB-00082'),('4P-SOL-000321','4P-PROB-00082'),('4P-SOL-000322','4P-PROB-00082'),('4P-SOL-000323','4P-PROB-00082'),('4P-SOL-000324','4P-PROB-00082'),('4P-SOL-000325','4P-PROB-00082')
) v(solution_ref,problem_ref)
join public.brain_objects s on s.public_ref=v.solution_ref
join public.brain_objects p on p.public_ref=v.problem_ref
on conflict(subject_id,predicate,object_id) do nothing;

insert into public.brain_relationships(subject_id,predicate,object_id,review_status,interpretation_status,visibility,relation_basis,effectiveness_implication)
select i.id,'IMPLEMENTS_PATHWAY',p.id,'SOURCE_CHECKED','4PLANET_INTERPRETATION','INTERNAL','Canonical hierarchy; no effectiveness inheritance.','NONE'
from public.interventions x
join public.brain_objects i on i.id=x.object_id
join public.brain_objects p on p.id=x.primary_pathway_id
where x.primary_pathway_id is not null
on conflict(subject_id,predicate,object_id) do nothing;

insert into public.brain_relationships(subject_id,predicate,object_id,review_status,interpretation_status,visibility,relation_basis,effectiveness_implication)
select a.id,'SPECIALISES',b.id,'SOURCE_CHECKED','4PLANET_INTERPRETATION','INTERNAL','Device form-factor specialisation; no effectiveness inheritance.','NONE'
from (values ('4P-SOL-000321','4P-SOL-000245'),('4P-SOL-000322','4P-SOL-000245')) v(child_ref,parent_ref)
join public.brain_objects a on a.public_ref=v.child_ref
join public.brain_objects b on b.public_ref=v.parent_ref
on conflict(subject_id,predicate,object_id) do nothing;

insert into public.brain_objects(public_ref,object_type,title,lifecycle_state,review_status,visibility) values
('P5-CLM-001','CLAIM','XFiltra reduced microfibre release by approximately 78% under controlled study conditions.','STAGING','LITERATURE_CHECKED','INTERNAL'),
('P5-CLM-002','CLAIM','Guppyfriend reduced microfibre release by approximately 54% in the controlled comparison.','STAGING','LITERATURE_CHECKED','INTERNAL'),
('P5-CLM-003','CLAIM','Parry Sound pilot reported approximately 41% lower final-effluent microfibre counts.','STAGING','LITERATURE_CHECKED','INTERNAL'),
('P5-CLM-004','CLAIM','Some Parry Sound households could not accommodate or operate filter installation.','STAGING','LITERATURE_CHECKED','INTERNAL'),
('P5-CLM-005','CLAIM','Parry Sound described an aftermarket filter around US$150 but did not test full lifecycle cost.','STAGING','LITERATURE_CHECKED','INTERNAL'),
('P5-CLM-006','CLAIM','Norwegian Environment Agency estimates roughly 1,000 tonnes/year textile microplastic emissions in Norway.','STAGING','LITERATURE_CHECKED','INTERNAL'),
('P5-CLM-007','CLAIM','Norway supports evaluation of filter requirements in the EU ecodesign revision process.','STAGING','LITERATURE_CHECKED','INTERNAL'),
('P5-CLM-008','CLAIM','Norwegian EEA note says possible future requirements remain process-stage and economics are too early to quantify.','STAGING','LITERATURE_CHECKED','INTERNAL'),
('P5-CLM-009','CLAIM','UNEP models cooling demand as capable of more than tripling by 2050 under BAU.','STAGING','LITERATURE_CHECKED','INTERNAL'),
('P5-CLM-010','CLAIM','UNEP models a sustainable cooling portfolio reducing 2050 cooling emissions by 64% versus BAU.','STAGING','LITERATURE_CHECKED','INTERNAL'),
('P5-CLM-011','CLAIM','UNEP treats passive and nature-based cooling as first-line demand reduction.','STAGING','LITERATURE_CHECKED','INTERNAL'),
('P5-CLM-012','CLAIM','UNEP portfolio benefits are not measured savings attributable to an individual retrofit.','STAGING','LITERATURE_CHECKED','INTERNAL'),
('P5-CLM-013','CLAIM','UNEP reports up to US$43 trillion modelled avoided electricity and infrastructure costs.','STAGING','LITERATURE_CHECKED','INTERNAL'),
('P5-CLM-014','CLAIM','Systematic review reported approximately 66% average restored-coral survival across reported projects.','STAGING','LITERATURE_CHECKED','INTERNAL'),
('P5-CLM-015','CLAIM','Systematic review found short monitoring and small median spatial scale in many coral projects.','STAGING','LITERATURE_CHECKED','INTERNAL'),
('P5-CLM-016','CLAIM','NOAA reported very low staghorn and elkhorn outplant survival after the 2023 Florida Keys heat event.','STAGING','LITERATURE_CHECKED','INTERNAL'),
('P5-CLM-017','CLAIM','NOAA is testing selective breeding and heat-adaptation strategies after bleaching.','STAGING','LITERATURE_CHECKED','INTERNAL'),
('P5-CLM-018','CLAIM','Systematic review cautions restoration is not a substitute for climate action.','STAGING','LITERATURE_CHECKED','INTERNAL'),
('P5-CLM-019','CLAIM','NOAA/CRC guidance recommends standardised restoration monitoring from local to ecosystem scales.','STAGING','LITERATURE_CHECKED','INTERNAL')
on conflict(public_ref) do nothing;

insert into public.claims(object_id,subject_id,predicate,value_text,claim_origin,interpretation_status,review_status,evidence_strength,visibility)
select co.id,so.id,'EVIDENCE_STATEMENT',v.value_text,'SOURCE_REPORTED','SOURCE_REPORTED','LITERATURE_CHECKED',v.evidence_strength,'INTERNAL'
from (values
('P5-CLM-001','4P-SOL-000321','In a controlled comparison, the XFiltra external washing-machine filter reduced microfibre release to wastewater by approximately 78% under the study conditions.','MODERATE'),
('P5-CLM-002','4P-SOL-000324','In the same controlled comparison, use of a Guppyfriend washing bag reduced microfibre release by approximately 54%, with evidence that part of the effect came from reduced fibre shedding.','MODERATE'),
('P5-CLM-003','4P-SOL-000321','A 97-home Parry Sound pilot reported an average 41% reduction in microfibre counts in treated final wastewater effluent after household filter deployment.','MODERATE'),
('P5-CLM-004','4P-SOL-000321','Twenty interested Parry Sound households were not included because their homes could not readily accommodate or operate the filter installation.','MODERATE'),
('P5-CLM-005','4P-SOL-000321','The Parry Sound study described the aftermarket filter as costing roughly US$150, but the pilot supplied the filter and professional installation at no cost to participants.','LIMITED'),
('P5-CLM-006','4P-PROB-00082','The Norwegian Environment Agency estimates that microplastics from textiles contribute roughly 1,000 tonnes of microplastic emissions per year in Norway, with private washing-machine use thought to be the largest source within the textile category.','LIMITED'),
('P5-CLM-007','4P-SOL-000322','Norway supports evaluating microplastic-filter requirements as part of the EU ecodesign revision process for household washing machines.','LIMITED'),
('P5-CLM-008','4P-SOL-000322','The Norwegian EEA note describes possible future product requirements and states that it is too early to quantify economic and administrative consequences.','LIMITED'),
('P5-CLM-009','4P-SOL-000037','UNEP Global Cooling Watch 2025 models cooling demand as capable of more than tripling by 2050 under a business-as-usual pathway.','LIMITED'),
('P5-CLM-010','4P-SOL-000037','UNEP''s 2025 Sustainable Cooling Pathway models a portfolio capable of reducing 2050 cooling emissions by 64% relative to business as usual while expanding cooling access.','LIMITED'),
('P5-CLM-011','4P-SOL-000038','UNEP''s sustainable cooling pathway treats passive and nature-based cooling measures as a first-line route to reduce cooling demand before meeting residual demand efficiently.','LIMITED'),
('P5-CLM-012','4P-SOL-000037','The large emission and economic benefits in UNEP''s Sustainable Cooling Pathway are results of an integrated portfolio scenario and are not measured savings attributable to an individual cool-roof, shading or ventilation retrofit.','LIMITED'),
('P5-CLM-013','4P-SOL-000037','UNEP reports that its Sustainable Cooling Pathway could avoid up to US$43 trillion in electricity and infrastructure costs under the modelled global pathway.','LIMITED'),
('P5-CLM-014','4P-SOL-000346','A global systematic review of coral restoration studies reported an average survival of restored corals of approximately 66% across reported projects.','STRONG'),
('P5-CLM-015','4P-SOL-000346','In the same systematic review, 60% of projects monitored restoration for less than 18 months and the median spatial scale was only about 100 square metres.','STRONG'),
('P5-CLM-016','4P-SOL-000346','After the 2023 Florida Keys marine heat event, NOAA reported that a 2024 assessment found less than 22% of staghorn and less than 5% of elkhorn corals from the Mission: Iconic Reefs outplanting programme remained alive.','MODERATE'),
('P5-CLM-017','4P-SOL-000349','NOAA''s post-bleaching Florida programme is testing selective breeding, heat-adapted crosses and symbiont strategies intended to improve future coral thermal resilience.','LIMITED'),
('P5-CLM-018','4P-SOL-000133','The systematic review explicitly cautions that coral restoration should not be treated as a replacement for meaningful action on climate change.','STRONG'),
('P5-CLM-019','4P-SOL-000282','NOAA/Coral Restoration Consortium guidance recommends standardised monitoring that links restoration goals to metrics from colony to ecosystem scales.','LIMITED')
) v(claim_ref,subject_ref,value_text,evidence_strength)
join public.brain_objects co on co.public_ref=v.claim_ref
join public.brain_objects so on so.public_ref=v.subject_ref
on conflict(object_id) do nothing;

insert into public.claim_evidence(claim_id,source_record_id,direction,directness,measurement_type,independence,evidence_tier,limitations)
select co.id,v.source_record_id,v.direction,v.directness,v.measurement_type,v.independence,v.evidence_tier,v.limitations
from (values
('P5-CLM-001','P6-SR-P5SRC-002','SUPPORTS','DIRECT_SOLUTION_LEVEL','MEASURED_CONTROLLED','INDEPENDENT_RESEARCH','MODERATE','One device/protocol; does not establish class-wide effectiveness or whole-life environmental benefit.'),
('P5-CLM-002','P6-SR-P5SRC-002','SUPPORTS','DIRECT_SOLUTION_LEVEL','MEASURED_CONTROLLED','INDEPENDENT_RESEARCH','MODERATE','One experimental protocol; bag use and garment mix affect generalisability.'),
('P5-CLM-003','P6-SR-P5SRC-001','SUPPORTS','IMPLEMENTATION_OUTCOME','MEASURED_PRE_POST_FIELD','INDEPENDENT_RESEARCH','MODERATE','Pre/post community study; only ~10% of WWTP-connected households participated and behavioural factors may have contributed.'),
('P5-CLM-004','P6-SR-P5SRC-001','QUALIFIES','IMPLEMENTATION_REQUIREMENT','MEASURED_IMPLEMENTATION_PROCESS','INDEPENDENT_RESEARCH','MODERATE','Single Canadian pilot context; constraints may differ by housing and appliance configuration.'),
('P5-CLM-005','P6-SR-P5SRC-001','QUALIFIES','DIRECT_IMPLEMENTATION_ECONOMICS','REPORTED_ECONOMICS','INDEPENDENT_RESEARCH','LIMITED','Historic approximate device price; full installation, maintenance and current lifecycle costs were not established.'),
('P5-CLM-006','P6-SR-P5SRC-003','SUPPORTS','NORWAY_PROBLEM_CONTEXT','GOVERNMENT_ESTIMATE','GOVERNMENT','LIMITED','Preserve agency wording and uncertainty; not a measurement of a specific intervention or direct ecosystem outcome.'),
('P5-CLM-007','P6-SR-P5SRC-004','SUPPORTS','NORWAY_POLICY_CONTEXT','REGULATORY_PROCESS_RECORD','GOVERNMENT','LIMITED','Participation/support in an EU process is not the same as an enacted current Norwegian filter mandate.'),
('P5-CLM-008','P6-SR-P5SRC-004','QUALIFIES','NORWAY_POLICY_LIMITATION','REGULATORY_PROCESS_RECORD','GOVERNMENT','LIMITED','Do not present a draft/process-stage requirement as current law.'),
('P5-CLM-009','P6-SR-P5SRC-005','SUPPORTS','SYSTEM_PATHWAY','MODELLED_SCENARIO','MULTILATERAL_ASSESSMENT','LIMITED','Forward scenario, not observed future demand.'),
('P5-CLM-010','P6-SR-P5SRC-005','SUPPORTS','PATHWAY_LEVEL','MODELLED_PORTFOLIO_SCENARIO','MULTILATERAL_ASSESSMENT','LIMITED','Integrated global model; effect cannot be attributed to any single intervention and depends on policy and implementation assumptions.'),
('P5-CLM-011','P6-SR-P5SRC-005','SUPPORTS','INTERVENTION_FAMILY','AUTHORITATIVE_PATHWAY_SYNTHESIS','MULTILATERAL_ASSESSMENT','LIMITED','Specific thermal, health, cost and energy outcomes depend on local climate, building form, occupancy and implementation quality.'),
('P5-CLM-012','P6-SR-P5SRC-005','QUALIFIES','PATHWAY_LIMITATION','MODEL_INTERPRETATION_LIMIT','MULTILATERAL_ASSESSMENT','LIMITED','Individual intervention economics and performance still require local evidence.'),
('P5-CLM-013','P6-SR-P5SRC-005','SUPPORTS','PATHWAY_ECONOMICS','MODELLED_ECONOMICS','MULTILATERAL_ASSESSMENT','LIMITED','Global cumulative scenario value; not a project cost, intervention payback or locally transferable business case.'),
('P5-CLM-014','P6-SR-P5SRC-006','SUPPORTS','SOLUTION_FAMILY','SYSTEMATIC_REVIEW_SYNTHESIS','PEER_REVIEWED','STRONG','High methodological and taxonomic heterogeneity; survival is not equivalent to self-sustaining ecosystem recovery.'),
('P5-CLM-015','P6-SR-P5SRC-006','QUALIFIES','EVIDENCE_BASE_LIMITATION','SYSTEMATIC_REVIEW_SYNTHESIS','PEER_REVIEWED','STRONG','Shows why short-term survival cannot be generalised to large-scale, long-term restoration success.'),
('P5-CLM-016','P6-SR-P5SRC-007','CHALLENGES','IMPLEMENTATION_OUTCOME','MEASURED_PROGRAMME_OUTCOME','GOVERNMENT_IMPLEMENTER','MODERATE','Extreme heat event, Florida geography and branching-coral programme; challenges robustness under severe warming but does not universally invalidate restoration.'),
('P5-CLM-017','P6-SR-P5SRC-007','SUPPORTS','EMERGING_INTERVENTION','ACTIVE_R_AND_D_PROGRAMME','GOVERNMENT_IMPLEMENTER','LIMITED','Ongoing research and adaptive programme design; not proof of long-term or ecosystem-scale effectiveness.'),
('P5-CLM-018','P6-SR-P5SRC-006','QUALIFIES','PATHWAY_LIMITATION','SYSTEMATIC_REVIEW_CONCLUSION','PEER_REVIEWED','STRONG','Restoration can address selected local recovery objectives but cannot remove the global warming driver.'),
('P5-CLM-019','P6-SR-P5SRC-008','SUPPORTS','IMPLEMENTATION_MONITORING','TECHNICAL_GUIDANCE','GOVERNMENT_TECHNICAL','LIMITED','Monitoring guidance improves evaluation consistency but does not by itself establish restoration effectiveness.')
) v(claim_ref,source_record_id,direction,directness,measurement_type,independence,evidence_tier,limitations)
join public.brain_objects co on co.public_ref=v.claim_ref
on conflict(claim_id,source_record_id,direction) do nothing;

insert into public.brain_objects(public_ref,object_type,title,lifecycle_state,review_status,visibility) values
('P6-PLACE-PARRY-SOUND','PLACE','Parry Sound, Ontario, Canada','STAGING','SOURCE_CHECKED','INTERNAL'),
('P6-PLACE-FLORIDA-KEYS','PLACE','Florida Keys, USA','STAGING','SOURCE_CHECKED','INTERNAL'),
('P6-PLACE-NORWAY','PLACE','Norway','STAGING','SOURCE_CHECKED','INTERNAL')
on conflict(public_ref) do nothing;

insert into public.places(object_id,place_type,geom,spatial_precision,country_code,source_record_id)
select o.id,v.place_type,null::geometry,v.spatial_precision,v.country_code,v.source_record_id
from (values
('P6-PLACE-PARRY-SOUND','ADMIN_LOCALITY','ADMIN_LOCALITY_NAME_ONLY','CA','P6-SR-P5SRC-001'),
('P6-PLACE-FLORIDA-KEYS','REGION','REGIONAL_NAME_ONLY','US','P6-SR-P5SRC-007'),
('P6-PLACE-NORWAY','COUNTRY','COUNTRY_LEVEL','NO',null)
) v(public_ref,place_type,spatial_precision,country_code,source_record_id)
join public.brain_objects o on o.public_ref=v.public_ref
on conflict(object_id) do nothing;

insert into public.brain_objects(public_ref,object_type,title,lifecycle_state,review_status,visibility)
values('FPA-075','ACTOR','Coral Restoration Foundation','STAGING','SOURCE_CHECKED','INTERNAL')
on conflict(public_ref) do nothing;
insert into public.actors(object_id,canonical_actor_ref,actor_type,official_url)
select id,'FPA-075','NGO',null from public.brain_objects where public_ref='FPA-075'
on conflict(object_id) do nothing;

insert into public.brain_objects(public_ref,object_type,title,lifecycle_state,review_status,visibility) values
('P5-IMP-001','IMPLEMENTATION','P5-IMP-001 — Parry Sound, Ontario, Canada','STAGING','LITERATURE_CHECKED','INTERNAL'),
('P5-IMP-002','IMPLEMENTATION','P5-IMP-002 — Controlled laboratory comparison','STAGING','LITERATURE_CHECKED','INTERNAL'),
('P5-IMP-003','IMPLEMENTATION','P5-IMP-003 — Florida Keys, USA','STAGING','LITERATURE_CHECKED','INTERNAL')
on conflict(public_ref) do nothing;

insert into public.implementations(object_id,execution_phase,execution_state,started_at,scale_note,operational_context)
select o.id,v.execution_phase,v.execution_state,v.started_at::date,v.scale_note,jsonb_build_object('source_id',v.source_id)
from (values
('P5-IMP-001','COMPLETED','ACTIVE','2019-01-01','97 household after-market filters','4P-SOL-000321','P5SRC-001'),
('P5-IMP-002','COMPLETED','ACTIVE','2020-01-01','Six devices compared','4P-SOL-000321','P5SRC-002'),
('P5-IMP-003','OPERATIONAL','ACTIVE','2020-01-01','Seven target reef sites; branching-coral programme affected by 2023 heat event','4P-SOL-000346','P5SRC-007')
) v(implementation_ref,execution_phase,execution_state,started_at,scale_note,solution_ref,source_id)
join public.brain_objects o on o.public_ref=v.implementation_ref
on conflict(object_id) do nothing;

insert into public.implementation_interventions(implementation_id,intervention_id,role)
select io.id,so.id,'USES'
from (values
('P5-IMP-001','4P-SOL-000321'),('P5-IMP-002','4P-SOL-000321'),('P5-IMP-003','4P-SOL-000346')
) v(implementation_ref,solution_ref)
join public.brain_objects io on io.public_ref=v.implementation_ref
join public.brain_objects so on so.public_ref=v.solution_ref
on conflict do nothing;

insert into public.brain_relationships(subject_id,predicate,object_id,review_status,interpretation_status,visibility,relation_basis,effectiveness_implication)
select io.id,'USES_INTERVENTION',so.id,'LITERATURE_CHECKED','SOURCE_REPORTED','INTERNAL','Phase05 documented implementation relation.','NONE'
from (values
('P5-IMP-001','4P-SOL-000321'),('P5-IMP-002','4P-SOL-000321'),('P5-IMP-003','4P-SOL-000346')
) v(implementation_ref,solution_ref)
join public.brain_objects io on io.public_ref=v.implementation_ref
join public.brain_objects so on so.public_ref=v.solution_ref
on conflict(subject_id,predicate,object_id) do nothing;

insert into public.implementation_places(implementation_id,place_id,role)
select i.id,p.id,'LOCATION' from (values
('P5-IMP-001','P6-PLACE-PARRY-SOUND'),
('P5-IMP-003','P6-PLACE-FLORIDA-KEYS')
) v(implementation_ref,place_ref)
join public.brain_objects i on i.public_ref=v.implementation_ref
join public.brain_objects p on p.public_ref=v.place_ref
on conflict do nothing;
insert into public.brain_relationships(subject_id,predicate,object_id,review_status,interpretation_status,visibility,relation_basis,effectiveness_implication)
select i.id,'LOCATED_IN',p.id,'LITERATURE_CHECKED','SOURCE_REPORTED','INTERNAL','Named geography from implementation source; geometry intentionally NULL.','NONE'
from (values
('P5-IMP-001','P6-PLACE-PARRY-SOUND'),
('P5-IMP-003','P6-PLACE-FLORIDA-KEYS')
) v(implementation_ref,place_ref)
join public.brain_objects i on i.public_ref=v.implementation_ref
join public.brain_objects p on p.public_ref=v.place_ref
on conflict(subject_id,predicate,object_id) do nothing;
insert into public.implementation_actors(implementation_id,actor_id,role)
select i.id,a.id,'IMPLEMENTER_PARTNER' from public.brain_objects i,public.brain_objects a
where i.public_ref='P5-IMP-003' and a.public_ref='FPA-075'
on conflict do nothing;

insert into public.brain_legacy_mappings(object_id,legacy_release,legacy_ref,legacy_class,migrated_class,migration_rule)
select o.id,'PHASE04','4P-IMP-040008','IMPLEMENTATION_SOLUTION_LINK','IMPLEMENTATION_SOLUTION_LINK',
'Supersede wrong solution link 4P-SOL-000325 -> 4P-SOL-000321; preserve audit history.'
from public.brain_objects o where o.public_ref='4P-SOL-000321'
on conflict do nothing;

insert into public.brain_objects(public_ref,object_type,title,lifecycle_state,review_status,visibility) values
('P5-OUT-001','BRAIN_OUTCOME','Average lint captured per household per week','STAGING','LITERATURE_CHECKED','INTERNAL'),
('P5-OUT-002','BRAIN_OUTCOME','Change in microfibre count in treated final WWTP effluent after deployment','STAGING','LITERATURE_CHECKED','INTERNAL'),
('P5-OUT-003','BRAIN_OUTCOME','Reduction in microfibre release to wastewater with XFiltra external filter','STAGING','LITERATURE_CHECKED','INTERNAL'),
('P5-OUT-004','BRAIN_OUTCOME','Reduction in microfibre release to wastewater with Guppyfriend washing bag','STAGING','LITERATURE_CHECKED','INTERNAL'),
('P5-OUT-005','BRAIN_OUTCOME','Cooling emissions reduction in 2050 versus BAU under sustainable cooling pathway','STAGING','LITERATURE_CHECKED','INTERNAL'),
('P5-OUT-007','BRAIN_OUTCOME','Staghorn coral outplant survival after 2023 Florida heat event','STAGING','LITERATURE_CHECKED','INTERNAL'),
('P5-OUT-008','BRAIN_OUTCOME','Elkhorn coral outplant survival after 2023 Florida heat event','STAGING','LITERATURE_CHECKED','INTERNAL'),
('P5-OUT-009','BRAIN_OUTCOME','Average restored-coral survival across studies in systematic review','STAGING','LITERATURE_CHECKED','INTERNAL')
on conflict(public_ref) do nothing;

insert into public.brain_outcomes(object_id,target_object_id,outcome_stage,statement,source_record_id,evidence_basis,limitations)
select oo.id,t.id,v.outcome_stage,v.statement,v.source_record_id,v.evidence_basis,v.limitations
from (values
('P5-OUT-001','P5-IMP-001','OUTPUT','Average lint captured per household per week: 6.4 g/week','P6-SR-P5SRC-001','MEASURED','Lint includes fibres and other captured material.'),
('P5-OUT-002','P5-IMP-001','OUTCOME','Change in microfibre count in treated final WWTP effluent after deployment: -41 % average','P6-SR-P5SRC-001','MEASURED','Possible behavioural confounding; 97 households only ~10% of connected households.'),
('P5-OUT-003','P5-IMP-002','OUTPUT','Reduction in microfibre release to wastewater with XFiltra external filter: 78 %','P6-SR-P5SRC-002','MEASURED','Controlled device comparison; not whole-life ecosystem impact.'),
('P5-OUT-004','P5-IMP-002','OUTPUT','Reduction in microfibre release to wastewater with Guppyfriend washing bag: 54 %','P6-SR-P5SRC-002','MEASURED','Controlled device comparison; use patterns affect performance.'),
('P5-OUT-005','4P-SOL-000037','LONGER_TERM_IMPACT','Cooling emissions reduction in 2050 versus BAU under sustainable cooling pathway: 64 %','P6-SR-P5SRC-005','MODELLED','Integrated global pathway; not observed single-intervention outcome.'),
('P5-OUT-007','P5-IMP-003','OUTCOME','Staghorn coral outplant survival after 2023 Florida heat event: <22 %','P6-SR-P5SRC-007','MEASURED','Florida branching-coral programme after extreme heat; not universal restoration result.'),
('P5-OUT-008','P5-IMP-003','OUTCOME','Elkhorn coral outplant survival after 2023 Florida heat event: <5 %','P6-SR-P5SRC-007','MEASURED','Florida branching-coral programme after extreme heat; not universal restoration result.'),
('P5-OUT-009','4P-SOL-000346','OUTCOME','Average restored-coral survival across studies in systematic review: 66 %','P6-SR-P5SRC-006','REPORTED','Heterogeneous methods/taxa; survival is not ecosystem recovery.')
) v(outcome_ref,target_ref,outcome_stage,statement,source_record_id,evidence_basis,limitations)
join public.brain_objects oo on oo.public_ref=v.outcome_ref
join public.brain_objects t on t.public_ref=v.target_ref
on conflict(object_id) do nothing;

insert into public.brain_relationships(subject_id,predicate,object_id,review_status,interpretation_status,visibility,relation_basis,effectiveness_implication)
select i.id,'PRODUCES_OUTCOME',o.id,'LITERATURE_CHECKED','SOURCE_REPORTED','INTERNAL','Outcome linked to documented implementation; limitations preserved.','NONE'
from (values
('P5-IMP-001','P5-OUT-001'),('P5-IMP-001','P5-OUT-002'),('P5-IMP-002','P5-OUT-003'),('P5-IMP-002','P5-OUT-004'),('P5-IMP-003','P5-OUT-007'),('P5-IMP-003','P5-OUT-008')
) v(implementation_ref,outcome_ref)
join public.brain_objects i on i.public_ref=v.implementation_ref
join public.brain_objects o on o.public_ref=v.outcome_ref
on conflict(subject_id,predicate,object_id) do nothing;

insert into public.cost_observations(target_object_id,cost_type,amount,amount_low,amount_high,currency,price_year,unit_basis,geography,observation_basis,source_record_id,limitations)
select o.id,v.cost_type,v.amount,v.amount_low,v.amount_high,v.currency,v.price_year,v.unit_basis,v.geography,v.observation_basis,v.source_record_id,v.limitations
from (values
('4P-SOL-000321','REPORTED_DEVICE_PRICE',150::numeric,null::numeric,null::numeric,'USD',2019,'per after-market filter unit','Parry Sound study context','REPORTED','P6-SR-P5SRC-001','Historic approximate device price; professional installation supplied free; not full lifecycle or current market cost.'),
('4P-SOL-000037','MODELLED_AVOIDED_ELECTRICITY_AND_INFRASTRUCTURE_COST',null::numeric,null::numeric,43000000000000::numeric,'USD',null::integer,'cumulative pathway scenario','Global to 2050','MODELLED','P6-SR-P5SRC-005','Global integrated scenario; not attributable to one intervention and not a project business case.'),
('4P-SOL-000349','PROGRAMME_FINANCING_CONTEXT',16000000::numeric,null::numeric,null::numeric,'USD',2023,'programme award','Florida coral breeding/restoration research','REPORTED','P6-SR-P5SRC-007','Funding amount is not unit cost, cost-effectiveness, or lifecycle economics.')
) v(target_ref,cost_type,amount,amount_low,amount_high,currency,price_year,unit_basis,geography,observation_basis,source_record_id,limitations)
join public.brain_objects o on o.public_ref=v.target_ref;

insert into public.brain_objects(public_ref,object_type,title,lifecycle_state,review_status,visibility)
values('P6-TRN-NO-321','TRANSFERABILITY_ASSESSMENT','External washing-machine filters → Norway','STAGING','SOURCE_CHECKED','INTERNAL')
on conflict(public_ref) do nothing;
insert into public.transferability_assessments(object_id,intervention_id,target_place_id,decision_context,factors,conclusion_class,material_unknowns)
select tr.id,i.id,no.id,'Norway Decision Proof',
'{"climate":"MATCH","ecology":"MATCH","infrastructure":"MATCH","regulation":"UNKNOWN","skills_om":"MATCH","supply_chain":"MATCH"}'::jsonb,
'PLAUSIBLE_HYPOTHESIS',ARRAY['machine compatibility','current regulation','consumer maintenance','sludge pathway']
from public.brain_objects tr,public.brain_objects i,public.brain_objects no
where tr.public_ref='P6-TRN-NO-321' and i.public_ref='4P-SOL-000321' and no.public_ref='P6-PLACE-NORWAY'
on conflict(object_id) do nothing;

insert into public.brain_objects(public_ref,object_type,title,lifecycle_state,review_status,visibility) values
('P6-GAP-MF-NO','GAP','Norway-specific implementation, sludge-pathway and lifecycle economics evidence gap','STAGING','SOURCE_CHECKED','INTERNAL'),
('P6-GAP-COOL','GAP','Observed intervention-level cooling implementation/economics evidence gap','STAGING','SOURCE_CHECKED','INTERNAL'),
('P6-GAP-CORAL','GAP','Long-term coral ecosystem-function and repeated-heat evidence gap','STAGING','SOURCE_CHECKED','INTERNAL')
on conflict(public_ref) do nothing;

insert into public.gaps(object_id,problem_id,gap_type,statement,assessment_kind)
select g.id,p.id,v.gap_type,v.statement,'4PLANET_HYPOTHESIS'
from (values
('P6-GAP-MF-NO','4P-PROB-00082','EVIDENCE','Norway-specific implementation, wastewater/sludge fate and lifecycle economics remain insufficient for a mission recommendation.'),
('P6-GAP-COOL','4P-PROB-00013','IMPLEMENTATION','Comparable observed intervention-level field economics and attribution remain sparse in the bounded Decision-Proof cohort.'),
('P6-GAP-CORAL','4P-PROB-00045','SCALE','Long-term ecosystem-function and cost-effectiveness evidence under repeated marine heat events remains incomplete.')
) v(gap_ref,problem_ref,gap_type,statement)
join public.brain_objects g on g.public_ref=v.gap_ref
join public.brain_objects p on p.public_ref=v.problem_ref
on conflict(object_id) do nothing;

insert into public.brain_relationships(subject_id,predicate,object_id,review_status,interpretation_status,visibility,relation_basis,effectiveness_implication)
select p.id,'IDENTIFIES_GAP',g.id,'SOURCE_CHECKED','4PLANET_INTERPRETATION','INTERNAL','Phase06 decision-proof gap; internal assessment.','NONE'
from (values
('P6-GAP-MF-NO','4P-PROB-00082'),('P6-GAP-COOL','4P-PROB-00013'),('P6-GAP-CORAL','4P-PROB-00045')
) v(gap_ref,problem_ref)
join public.brain_objects g on g.public_ref=v.gap_ref
join public.brain_objects p on p.public_ref=v.problem_ref
on conflict(subject_id,predicate,object_id) do nothing;

update public.brain_staging_records s
set validation_status=case when record_family='ACTOR_CANDIDATE' then 'QUARANTINED' else 'VALID' end,
    validation_errors=case when record_family='ACTOR_CANDIDATE' then ARRAY['PENDING_ENTITY_RESOLUTION'] else '{}'::text[] end
from public.brain_import_batches b
where s.batch_id=b.id and b.batch_key='PHASE06_DECISION_PROOFS';

insert into public.brain_quarantine_records(staging_record_id,reason_codes,details)
select s.id,ARRAY['PENDING_ENTITY_RESOLUTION'],'No canonical Actor ID assigned without defensible resolution.'
from public.brain_staging_records s join public.brain_import_batches b on b.id=s.batch_id
where b.batch_key='PHASE06_DECISION_PROOFS' and s.validation_status='QUARANTINED'
on conflict(staging_record_id) do nothing;

update public.brain_import_batches b set status='VALIDATED',
counts=jsonb_build_object(
  'staging_rows',(select count(*) from public.brain_staging_records s where s.batch_id=b.id),
  'valid_rows',(select count(*) from public.brain_staging_records s where s.batch_id=b.id and s.validation_status='VALID'),
  'quarantined_rows',(select count(*) from public.brain_staging_records s where s.batch_id=b.id and s.validation_status='QUARANTINED'),
  'founder_release',false
)
where b.batch_key='PHASE06_DECISION_PROOFS';

commit;
