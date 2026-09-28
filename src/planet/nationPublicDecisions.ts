import { placeId } from './ids';

export type PublicDecisionStage = 'PROPOSAL' | 'CONSULTATION' | 'DECIDED' | 'IMPLEMENTING' | 'MEASURED';

export type PublicDecisionEvent = {
  date: string;
  stage: PublicDecisionStage | 'EVIDENCE' | 'PROCESS';
  label: string;
  sourceUrl: string;
};

export type PublicDecision = {
  id: string;
  title: string;
  shortTitle: string;
  placeSlug: 'norway' | 'bergen' | 'oslo';
  placeName: string;
  jurisdiction: 'NATIONAL' | 'MUNICIPAL';
  authority: string;
  stage: PublicDecisionStage;
  statusLabel: string;
  summary: string;
  nextStep: string;
  sourceAsOf: string;
  sourceUrl: string;
  sourceTitle: string;
  sourceIssuer: string;
  placeId: string;
  geographyNote: string;
  journey: PublicDecisionEvent[];
};

export type NationPlaceModel = {
  slug: 'norway' | 'bergen' | 'oslo';
  name: string;
  kind: 'COUNTRY' | 'MUNICIPALITY';
  label: string;
  placeId: string;
  intro: string;
};

export const nationPlaceModels: NationPlaceModel[] = [
  {
    slug: 'norway',
    name: 'Norway',
    kind: 'COUNTRY',
    label: 'NORWAY_',
    placeId: placeId('norway'),
    intro: 'National public decisions, official sources and geographic context.',
  },
  {
    slug: 'bergen',
    name: 'Bergen',
    kind: 'MUNICIPALITY',
    label: 'BERGEN_',
    placeId: placeId('bergen'),
    intro: 'First municipal model: follow a local case through political treatment and the official record.',
  },
  {
    slug: 'oslo',
    name: 'Oslo',
    kind: 'MUNICIPALITY',
    label: 'OSLO_',
    placeId: placeId('oslo'),
    intro: 'Capital model: consultation, council decision and implementation can be kept distinct.',
  },
];

export const publicDecisions: PublicDecision[] = [
  {
    id: 'GOV-NOR-OSLOFJORD-PLAN-2026-HEARING',
    title: 'The proposed Oslofjord Plan 2026–2030',
    shortTitle: 'Oslofjord Plan',
    placeSlug: 'norway',
    placeName: 'Oslofjord / Norway',
    jurisdiction: 'NATIONAL',
    authority: 'Norwegian Ministry of Climate and Environment',
    stage: 'CONSULTATION',
    statusLabel: 'UNDER CONSIDERATION',
    summary: 'The government proposal remains under consideration. The ordinary consultation deadline has passed; municipalities and counties with political treatment have a separate 15 October 2026 deadline.',
    nextStep: '15 October 2026 · separate municipal/county submission deadline',
    sourceAsOf: '28 September 2026',
    sourceUrl: 'https://www.regjeringen.no/no/dokumenter/horing-av-regjeringens-forslag-til-ny-oslofjordplan/id3166019/',
    sourceTitle: 'Høring av regjeringens forslag til ny Oslofjordplan',
    sourceIssuer: 'Norwegian Ministry of Climate and Environment',
    placeId: placeId('oslofjord'),
    geographyNote: 'ATLAS shows navigational context. It does not claim an official catchment or implementation boundary.',
    journey: [
      { date: '30 Mar 2021', stage: 'DECIDED', label: 'Earlier Oslofjord action plan published', sourceUrl: 'https://www.regjeringen.no/no/dokumenter/helhetlig-tiltaksplan-for-en-ren-og-rik-oslofjord-med-et-aktivt-friluftsliv/id2842258/' },
      { date: '19 Jun 2026', stage: 'PROPOSAL', label: 'Proposed 2026–2030 plan published for consultation', sourceUrl: 'https://www.regjeringen.no/no/dokumenter/horing-av-regjeringens-forslag-til-ny-oslofjordplan/id3166019/' },
      { date: '15 Sep 2026', stage: 'CONSULTATION', label: 'Ordinary consultation deadline passed', sourceUrl: 'https://www.regjeringen.no/no/dokumenter/horing-av-regjeringens-forslag-til-ny-oslofjordplan/id3166019/' },
      { date: '15 Oct 2026', stage: 'PROCESS', label: 'Separate deadline for municipalities and counties treating their input politically', sourceUrl: 'https://www.regjeringen.no/no/dokumenter/horing-av-regjeringens-forslag-til-ny-oslofjordplan/id3166019/' },
    ],
  },
  {
    id: 'MUN-NO-4601-BEREDSKAP-2026',
    title: 'Et tryggere samfunn – sammen',
    shortTitle: 'Bergen preparedness plan',
    placeSlug: 'bergen',
    placeName: 'Bergen',
    jurisdiction: 'MUNICIPAL',
    authority: 'Bergen City Council',
    stage: 'DECIDED',
    statusLabel: 'CITY COUNCIL DECISION RECORDED',
    summary: 'Bergen municipality describes this as its new plan for follow-up of civil protection and emergency preparedness. The official political case records treatment through the city government, committees and the City Council.',
    nextStep: 'Implementation and follow-up sit after the recorded political decision',
    sourceAsOf: '28 September 2026',
    sourceUrl: 'https://www.bergen.kommune.no/politikk/saker/267647',
    sourceTitle: 'Plan for oppfølgning av samfunnssikkerhet og beredskap – Et tryggere samfunn',
    sourceIssuer: 'Bergen kommune',
    placeId: placeId('bergen'),
    geographyNote: 'Bergen is shown as municipal navigation context. Decision-specific implementation sites are not established by this record.',
    journey: [
      { date: '23 Apr 2026', stage: 'PROCESS', label: 'City government case with recommendation to the City Council', sourceUrl: 'https://www.bergen.kommune.no/politikk/saker/267647' },
      { date: '5–7 May 2026', stage: 'PROCESS', label: 'Political committees treated the case', sourceUrl: 'https://www.bergen.kommune.no/politikk/saker/267647' },
      { date: '20 May 2026', stage: 'DECIDED', label: 'Bergen City Council treatment recorded', sourceUrl: 'https://www.bergen.kommune.no/politikk/saker/267647' },
    ],
  },
  {
    id: 'MUN-NO-0301-KPA-2026-HEARING',
    title: 'Oslo kommuneplanens arealdel',
    shortTitle: 'Oslo land-use plan',
    placeSlug: 'oslo',
    placeName: 'Oslo',
    jurisdiction: 'MUNICIPAL',
    authority: 'Oslo municipality',
    stage: 'CONSULTATION',
    statusLabel: 'CONSULTATION CLOSED · INPUTS UNDER REVIEW',
    summary: 'Oslo is revising its municipal land-use plan toward 2040. The hearing deadline passed in August 2026; the municipality says submitted input will be reviewed and the 2015 land-use plan remains in force until a new plan is finally adopted.',
    nextStep: 'Review of consultation input before later final treatment',
    sourceAsOf: '28 September 2026',
    sourceUrl: 'https://www.oslo.kommune.no/politikk/kommuneplan/kommuneplanens-arealdel/',
    sourceTitle: 'Kommuneplanens arealdel',
    sourceIssuer: 'Oslo kommune',
    placeId: placeId('oslo'),
    geographyNote: 'ATLAS gives city context. The official plan page links separate Planinnsyn maps for proposal-specific geography.',
    journey: [
      { date: '14 Apr 2026', stage: 'PROPOSAL', label: 'City government decision to send the proposal to consultation', sourceUrl: 'https://aktuelt.oslo.kommune.no/saker-i-byrad-16-april' },
      { date: '24 Aug 2026', stage: 'CONSULTATION', label: 'Consultation deadline passed', sourceUrl: 'https://www.oslo.kommune.no/kunngjoringer/kommuneplanens-arealdel/' },
      { date: '28 Sep 2026', stage: 'PROCESS', label: 'Official page says consultation input will be reviewed; final adoption is not established', sourceUrl: 'https://www.oslo.kommune.no/politikk/kommuneplan/kommuneplanens-arealdel/' },
    ],
  },
  {
    id: 'MUN-NO-0301-BYDELSREFORM-2026',
    title: 'Oslo bydelsreform',
    shortTitle: 'Oslo district reform',
    placeSlug: 'oslo',
    placeName: 'Oslo',
    jurisdiction: 'MUNICIPAL',
    authority: 'Oslo City Council',
    stage: 'IMPLEMENTING',
    statusLabel: 'DECIDED · PREPARING 2028 CHANGE',
    summary: 'Oslo City Council adopted the district reform on 17 June 2026. The municipality says the city will move from 15 to eight districts from 1 January 2028, while further implementation work continues.',
    nextStep: 'Implementation work continues before the new district structure takes effect 1 January 2028',
    sourceAsOf: '28 September 2026',
    sourceUrl: 'https://www.oslo.kommune.no/satsingsomrader-og-prosjekter/bydelsreformen/bydelsreformen-hva-er-vedtatt/',
    sourceTitle: 'Bydelsreformen: Hva er vedtatt?',
    sourceIssuer: 'Oslo kommune',
    placeId: placeId('oslo'),
    geographyNote: 'The official Oslo source publishes a separate interactive map of the future district boundaries. ATLAS here remains shared 4PLANET city context.',
    journey: [
      { date: '16 Oct 2025', stage: 'PROPOSAL', label: 'Preliminary reorganisation proposal sent to consultation', sourceUrl: 'https://www.oslo.kommune.no/satsingsomrader-og-prosjekter/bydelsreformen/om-bydelsreformen/' },
      { date: '9 Jan 2026', stage: 'CONSULTATION', label: 'Consultation closed', sourceUrl: 'https://www.oslo.kommune.no/satsingsomrader-og-prosjekter/bydelsreformen/om-bydelsreformen/' },
      { date: '17 Jun 2026', stage: 'DECIDED', label: 'Oslo City Council adopted the district reform', sourceUrl: 'https://www.oslo.kommune.no/satsingsomrader-og-prosjekter/bydelsreformen/bydelsreformen-hva-er-vedtatt/' },
      { date: '1 Jan 2028', stage: 'IMPLEMENTING', label: 'New district structure is scheduled to take effect', sourceUrl: 'https://www.oslo.kommune.no/satsingsomrader-og-prosjekter/bydelsreformen/' },
    ],
  },
];

export const nationSourceFederation = [
  {
    id: 'kartverket-admin',
    label: 'Kartverket / Geonorge',
    role: 'Official administrative geography',
    access: 'OPEN DATA · GEOJSON / WMS / WFS / REST',
    runtime: 'SOURCE REGISTERED · ATLAS BOUNDARY RENDERING NEXT',
    url: 'https://www.kartverket.no/api-og-data/grensedata',
  },
  {
    id: 'stortinget',
    label: 'Stortinget open data',
    role: 'National parliamentary case discovery',
    access: 'OPEN API',
    runtime: 'LIVE SEARCH CONNECTED',
    url: 'https://data.stortinget.no/',
  },
  {
    id: 'ssb',
    label: 'Statistics Norway / Statbank',
    role: 'Official statistical context',
    access: 'PXWEBAPI V2',
    runtime: 'LIVE TABLE SEARCH CONNECTED',
    url: 'https://www.ssb.no/statbank/',
  },
  {
    id: 'bergen',
    label: 'Bergen kommune',
    role: 'Municipal political case model',
    access: 'OFFICIAL CASE PAGES',
    runtime: 'SOURCE-BOUND MODEL',
    url: 'https://www.bergen.kommune.no/politikk/saker',
  },
  {
    id: 'oslo',
    label: 'Oslo kommune',
    role: 'Municipal consultation and decision model',
    access: 'OFFICIAL MUNICIPAL SOURCES',
    runtime: 'SOURCE-BOUND MODEL',
    url: 'https://www.oslo.kommune.no/innsyn/',
  },
] as const;
