(() => {
  const getLivingRelationship = (anchor, stage, index) => {
    const step = anchor?.steps?.find((item) => item.stage === stage);
    return step?.relationships?.[index];
  };

  const getSpeciesRelationship = (relationships, id) => relationships?.find((relationship) => relationship.id === id);

  const resolveBinding = (binding, canonical) => {
    const species = canonical.species;
    const anchor = canonical.livingSystemAnchor;

    if (binding === 'species.identity') {
      return {
        truthState: 'KNOWN',
        body: `${species.commonName} / ${species.scientificName}. ${species.context}`,
        source: {
          label: `GBIF TAXON ${species.gbifKey}`,
          url: species.taxonSourceUrl
        },
        boundary: species.descriptorSource?.note || 'Species identity does not establish local presence, abundance or ecological condition.'
      };
    }

    if (binding?.startsWith('species.publicClaims.')) {
      const index = Number(binding.split('.').at(-1));
      const claim = species.publicClaims?.[index];
      if (!claim) throw new Error(`Canonical SPECIES claim missing for ${binding}`);
      return {
        truthState: claim.state,
        body: claim.text,
        source: { label: claim.source, url: claim.sourceUrl },
        boundary: claim.limitation
      };
    }

    if (binding?.startsWith('relationships.')) {
      const relationshipId = binding.slice('relationships.'.length);
      const relationship = getSpeciesRelationship(canonical.speciesRelationships, relationshipId);
      if (!relationship) throw new Error(`Canonical species relationship missing for ${binding}`);
      return {
        relationClass: relationship.relationClass,
        truthState: relationship.state,
        body: relationship.relation,
        source: { label: relationship.sourceLabel, url: relationship.sourceUrl },
        boundary: relationship.boundary
      };
    }

    if (binding?.startsWith('living.')) {
      const [, stage, indexText] = binding.split('.');
      const relationship = getLivingRelationship(anchor, stage, Number(indexText));
      if (!relationship) throw new Error(`Canonical Living Systems relationship missing for ${binding}`);
      return {
        truthState: relationship.state,
        body: relationship.relation,
        source: {
          label: relationship.source || '4PLANET LIVING SYSTEMS — SOURCE REVIEW PENDING',
          url: relationship.sourceUrl || '/living-systems'
        },
        boundary: relationship.boundary
      };
    }

    return null;
  };

  const compose = (layout, canonical) => {
    const species = canonical.species;
    const manifest = structuredClone(layout);
    manifest.entity = {
      id: species.id,
      slug: species.slug,
      commonName: species.commonName,
      scientificName: species.scientificName,
      gbifKey: species.gbifKey,
      taxonSourceUrl: species.taxonSourceUrl,
      livingSystemId: species.livingSystemId,
      issue: species.issue,
      solution: species.solution
    };
    manifest.canonical = {
      generatedFrom: canonical.generatedFrom,
      speciesSlug: species.slug,
      livingSystemAnchorSlug: canonical.livingSystemAnchor?.slug,
      speciesRelationshipCount: canonical.speciesRelationships?.length || 0
    };

    manifest.nodes = layout.nodes.map((node) => {
      if (!node.canonicalBinding) return node;
      const canonicalTruth = resolveBinding(node.canonicalBinding, canonical);
      return canonicalTruth ? { ...node, ...canonicalTruth } : node;
    });

    return manifest;
  };

  const load = async ({ layoutUrl, canonicalUrl }) => {
    const [layoutResponse, canonicalResponse] = await Promise.all([
      fetch(layoutUrl, { credentials: 'same-origin' }),
      fetch(canonicalUrl, { credentials: 'same-origin' })
    ]);
    if (!layoutResponse.ok) throw new Error(`XR layout failed: ${layoutResponse.status}`);
    if (!canonicalResponse.ok) throw new Error(`XR canonical feed failed: ${canonicalResponse.status}`);
    return compose(await layoutResponse.json(), await canonicalResponse.json());
  };

  window.NatureSceneAdapter = { compose, load };
})();
