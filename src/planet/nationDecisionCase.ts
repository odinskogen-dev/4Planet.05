import { placeId } from './ids';
import { PLACES } from './places';

/**
 * 4NATION 01 — a reviewed, dated READ PROJECTION of existing official sources.
 * NOT a new PlanetBrain registry, live ingestion service, legal interpretation,
 * national decision feed, or claim of Government/municipal endorsement.
 * Project Home: https://docs.google.com/document/d/1IAB_myJZ3pT0rx58QNBJmuCutxhGlWBKBuOjO__NuBo/edit
 * Re-check these sources before any later change of legal/procedural status.
 */
export const nationCaseAsOf = '21 September 2026';
export const nationPlace = PLACES.find((place) => place.id === placeId('oslofjord'));

export const nationSources = [
  { id: 'KLD-2026-HEARING', issuer: 'Norwegian Ministry of Climate and Environment', title: 'Hearing: Proposed Oslofjord Plan 2026–2030', date: '19 June 2026', url: 'https://www.regjeringen.no/no/dokumenter/horing-av-regjeringens-forslag-til-ny-oslofjordplan/id3166019/' },
  { id: 'KLD-2026-PROPOSAL', issuer: 'Norwegian Ministry of Climate and Environment', title: 'Draft comprehensive action plan (PDF)', date: '19 June 2026', url: 'https://www.regjeringen.no/contentassets/817ae0efc8a3496e9f54d7a8f60a10ab/forslag-til-helhetlig-tiltaksplan-for-en-ren-og-rik-oslofjord-med-et-aktivt-friluftsliv-20262030.pdf' },
  { id: 'KLD-2026-DEADLINE', issuer: 'Norwegian Ministry of Climate and Environment', title: 'Extended consultation deadlines', date: '29 June 2026', url: 'https://www.regjeringen.no/no/aktuelt/utsatt-horingsfrist-for-den-nye-oslofjordplanen/id3167967/' },
  { id: 'MDE-2026-MODEL', issuer: 'Norwegian Environment Agency', title: 'Research and modelled Oslofjord measures', date: '17 April 2026', url: 'https://www.miljodirektoratet.no/aktuelt/nyheter/2026/april-2026/oslofjorden-ma-fa-flere-miljotiltak/' },
  { id: 'MDE-2026-GRANTS', issuer: 'Norwegian Environment Agency', title: 'Nitrogen-removal grants: second 2026 round', date: '2 September 2026', url: 'https://www.miljodirektoratet.no/aktuelt/fagmeldinger/2026/september-2026/nitrogenfjerning-stotte-til-14-kommuner/' },
  { id: 'KLD-2021-PLAN', issuer: 'Norwegian Ministry of Climate and Environment', title: 'Original Oslofjord action plan', date: '30 March 2021', url: 'https://www.regjeringen.no/no/dokumenter/helhetlig-tiltaksplan-for-en-ren-og-rik-oslofjord-med-et-aktivt-friluftsliv/id2842258/' },
] as const;

export const nationDecision = {
  id: 'GOV-NOR-OSLOFJORD-PLAN-2026-HEARING',
  title: 'The proposed Oslofjord Plan',
  period: '2026–2030',
  issuer: 'Norwegian Ministry of Climate and Environment',
  jurisdiction: 'National proposal · regional and local relevance',
  status: 'UNDER CONSIDERATION',
  consulted: 'Ordinary consultation closed 15 September 2026',
  localDeadline: 'Separate municipality and county deadline: 15 October 2026',
  location: 'Oslofjord catchment, Norway',
  synopsis: 'The Norwegian government published a proposed new action plan for the Oslofjord. Its official consultation remains under consideration; a proposal must not be presented as final adopted policy.',
  sourceIds: ['KLD-2026-HEARING', 'KLD-2026-PROPOSAL', 'KLD-2026-DEADLINE'],
  timeline: [
    { date: '30 Mar 2021', label: 'Earlier Oslofjord action plan published', state: 'EXISTING PLAN', sourceId: 'KLD-2021-PLAN' },
    { date: '17 Apr 2026', label: 'New research modelling described', state: 'EVIDENCE', sourceId: 'MDE-2026-MODEL' },
    { date: '19 Jun 2026', label: 'Proposed 2026–2030 plan published for consultation', state: 'PROPOSAL', sourceId: 'KLD-2026-HEARING' },
    { date: '29 Jun 2026', label: 'Ordinary consultation deadline extended', state: 'CHANGE', sourceId: 'KLD-2026-DEADLINE' },
    { date: '15 Sep 2026', label: 'Ordinary consultation deadline passed', state: 'DEADLINE', sourceId: 'KLD-2026-HEARING' },
    { date: '15 Oct 2026', label: 'Separate local/regional authority deadline', state: 'UPCOMING AS OF SNAPSHOT', sourceId: 'KLD-2026-DEADLINE' },
  ],
} as const;

export const nationLearning = [
  { title: 'Not yet a final adopted 2026–2030 plan', detail: 'The official government hearing page labels the proposal under consideration.', sourceId: 'KLD-2026-HEARING' },
  { title: 'Modelled alternatives are not a political vote', detail: 'Scientific scenarios A and B are modelling assumptions about measures. They are not two formally voted governmental choices or measured results.', sourceId: 'MDE-2026-MODEL' },
  { title: 'Funding is not a total project cost', detail: 'An additional NOK 10 million in grants announced on 2 September concerned 14 municipalities/intermunicipal recipients. It is not the price of the proposed plan or proof of ecological recovery.', sourceId: 'MDE-2026-GRANTS' },
] as const;
