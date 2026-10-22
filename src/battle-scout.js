(function () {
  'use strict';

  // Non-invasive strategic-to-tactical preview. Does not call ROMA Challenger.
  const SITE_INTEL = Object.freeze({
    cannae: {
      terrainType: 'river_plain',
      title: 'Cannae · Aufidus frontier',
      summary: 'Grain position and river corridor. Ancient Cannae was on the right bank of the Aufidus (modern Ofanto). The precise battlefield footprint is debated.',
      suggestedObjects: ['river corridor', 'grain store', 'possible crossing', 'low rises'],
      sources: ['Polybius, Histories III.107–118', 'Oxford Classical Dictionary: Cannae'],
      evidence: 'Historical text and approximate location. No measured 216 BCE terrain reconstruction.'
    },
    canusium: {
      terrainType: 'supply_corridor',
      title: 'Canusium · Roman supply area',
      summary: 'Polybius describes Roman corn and supply collection around Canusium, connected with the contested stores at Cannae.',
      suggestedObjects: ['supply routes', 'grain fields', 'marching approaches'],
      sources: ['Polybius, Histories III.107–118'],
      evidence: 'Narrative basis. Road alignments, deployment areas and environmental details unverified.'
    },
    venusia: {
      terrainType: 'inland_hills',
      title: 'Venusia · inland approach',
      summary: 'Proposed inland approach for a campaign encounter. Detailed battle terrain and precise roads need historical and terrain-data verification.',
      suggestedObjects: ['rising ground', 'march routes', 'defensive position'],
      sources: ['Pleiades historical site review needed'],
      evidence: 'Design-only terrain hypothesis, NOT archaeological terrain reconstruction.'
    },
    luceria: {
      terrainType: 'settlement_approaches',
      title: 'Luceria · regional settlement',
      summary: 'Regional Roman-connected location. Any locally reconstructed battlefield remains a future research task.',
      suggestedObjects: ['settlement perimeter', 'road approach'],
      sources: ['Pleiades historical site review needed'],
      evidence: 'Design-only hypothesis.'
    },
    beneventum: {
      terrainType: 'inland_route',
      title: 'Beneventum · inland corridor',
      summary: 'Potential battle setting in the inland transport network. Exact period roads and site environment require source review.',
      suggestedObjects: ['inland corridor', 'settlement approach'],
      sources: ['Pleiades historical site review needed'],
      evidence: 'Design-only hypothesis.'
    },
    capua: {
      terrainType: 'settlement_plain',
      title: 'Capua · Campanian settlement',
      summary: 'Capua belongs to the wider Second Punic War political story. Faction allegiance must be date-sensitive.',
      suggestedObjects: ['open approaches', 'settlement perimeter', 'farm zone'],
      sources: ['Pleiades historical site review needed'],
      evidence: 'Design-only hypothesis.'
    },
    tarentum: {
      terrainType: 'coastal_port',
      title: 'Tarentum · coastal theatre',
      summary: 'Potential coastal and port strategy setting. Naval, harbour and historic city geometry not implemented.',
      suggestedObjects: ['harbour', 'coastal approaches'],
      sources: ['Pleiades historical site review needed'],
      evidence: 'Design-only hypothesis.'
    },
    brundisium: {
      terrainType: 'coastal_port',
      title: 'Brundisium · Adriatic theatre',
      summary: 'A possible starting point for future coastal logistics, troop movements and naval conflict.',
      suggestedObjects: ['harbour', 'roads', 'shoreline'],
      sources: ['Pleiades historical site review needed'],
      evidence: 'Design-only hypothesis.'
    },
    roma: {
      terrainType: 'river_city',
      title: 'Roma · Republic capital',
      summary: 'City-centred strategic context, not a verified 216 BCE tactical site. A detailed reconstruction needs date-specific evidence.',
      suggestedObjects: ['urban defences', 'river', 'settlement'],
      sources: ['Pleiades historical site review needed'],
      evidence: 'Design-only hypothesis.'
    }
  });

  const BASE_INTEL = Object.freeze({
    terrainDem: 'Mapzen/AWS elevation imagery visible in strategic map, not compiled into 3D battle mesh',
    geoHistorical: 'Contemporary geography does not verify 216 BCE land use, roads or river course',
    modelSource: 'User-supplied Medieval Build 03: Kenney Nature Kit CC0 rock.glb, oak.glb',
    modelAvailability: 'Packaged separately for Claude; no asset file has been injected into the original battle runtime'
  });

  function draft() {
    const campaign = window.ROMA_CAMPAIGN;
    if (!campaign) throw new Error('Campaign state not available');
    const state = campaign.state;
    const c = campaign.siteInfo(state.selected);
    if (!c) throw new Error('Selected site could not be resolved');
    const intel = SITE_INTEL[c.id] || {
      terrainType: 'unverified', title: c.name,
      summary: 'Area mapped for future campaign expansion.',
      suggestedObjects: [], sources: ['Historical source review needed'],
      evidence: 'No verified tactical geography yet.'
    };
    const selectedArmies = state.armies
      .filter(a => a.at === c.id || (a.move && a.move.to === c.id))
      .map(a => ({
        id: a.id,
        name: a.name,
        faction: a.owner,
        men: a.men,
        morale: a.morale,
        supply: a.supply,
        currentSite: a.at,
        marchingTo: a.move?.to || null
      }));
    return {
      schema: 'CUB.ROMA.BattleBriefDraft.0.1',
      state: 'DRAFT_ONLY_NOT_APPLIED_TO_BATTLE_ENGINE',
      origin: 'AXE standalone ROMA strategic campaign prototype',
      encounterId: state.pending?.id || null,
      scenario: state.scenario,
      campaignDay: state.tick + 1,
      campaignYearBCE: 216,
      site: {
        id: c.id, ancientName: c.name,
        latitude: c.lat, longitude: c.lon,
        region: c.region,
        spatialAccuracy: c.confidence === 'high' ? 'approximate point, not confirmed battle polygon' : 'provisional location'
      },
      recommendedTerrainTemplate: intel.terrainType,
      geographicAssessment: {
        note: intel.summary,
        evidenceState: intel.evidence,
        proposedObjects: intel.suggestedObjects,
        historicalSources: intel.sources,
        realDEMInBattle: false,
        modernPhysicalGeographyLayer: window.ROMA_GEO?.mode || 'unknown'
      },
      armies: selectedArmies,
      resources: { grain: state.food, treasury: state.treasury },
      integration: {
        originalBattleEngineModified: false,
        preciseTroopTypesTransferred: false,
        battlefieldCoordinatesResolved: false,
        resultContractImplemented: false,
        sourceAssets: BASE_INTEL,
        disclaimer: 'For review with Claude only; NOT a production tactical battle order.'
      }
    };
  }

  function render() {
    const host = document.getElementById('scout-summary');
    if (!host || !window.ROMA_CAMPAIGN) return;
    const state = window.ROMA_CAMPAIGN.state;
    const site = window.ROMA_CAMPAIGN.siteInfo(state.selected);
    const intel = SITE_INTEL[site?.id];
    host.replaceChildren();
    if (!intel) {
      host.textContent = 'No battle terrain briefing researched for this site.';
      return;
    }
    const heading = document.createElement('strong');
    heading.textContent = intel.title;
    const note = document.createElement('p');
    note.textContent = intel.summary;
    const evidence = document.createElement('small');
    evidence.textContent = 'EVIDENCE · ' + intel.evidence;
    host.append(heading, note, evidence);
  }

  function exportDraft() {
    const contents = JSON.stringify(draft(), null, 2);
    const blob = new Blob([contents], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ROMA_BATTLE_BRIEF_' + draft().site.id.toUpperCase() + '.json';
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  window.ROMA_BATTLE_SCOUT = Object.freeze({ draft, getSiteIntel: id => SITE_INTEL[id] || null });
  document.addEventListener('roma:campaign-render', render);
  document.getElementById('export-battle-brief')?.addEventListener('click', exportDraft);
  render();
})();