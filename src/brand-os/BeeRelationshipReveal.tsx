import "./bee-relationship-reveal.css";

const nodes = [
  {
    id: "CLM-BOS-BEE-001",
    label: "BEES",
    body: "One important group of animal pollinators — not the only pollinators.",
    state: "SOURCE",
    source: "FAO / SRC-017",
  },
  {
    id: "CLM-BOS-BEE-002",
    label: "POLLINATION",
    body: "Many crop plants depend at least partly on animal pollination.",
    state: "SOURCE",
    source: "FAO / SRC-017",
  },
  {
    id: "CLM-BOS-BEE-003",
    label: "APPLE",
    body: "A bounded example: multiple bee groups contribute to apple pollination, with effectiveness varying among pollinators and varieties.",
    state: "SOURCE",
    source: "Garratt et al. / SRC-019",
  },
  {
    id: "CLM-BOS-BEE-004",
    label: "FOOD",
    body: "One concrete food relationship — not a claim that all food depends on bees.",
    state: "4PLANET CONTEXT",
    source: "Synthesis of SRC-017 + SRC-019",
  },
];

export function BeeRelationshipReveal() {
  return (
    <figure className="bee-reveal" aria-labelledby="bee-reveal-title">
      <figcaption className="bee-reveal-head">
        <span>RELATIONSHIP REVEAL / INTERNAL PRODUCTION OBJECT</span>
        <h3 id="bee-reveal-title">What depends on what?</h3>
        <p>Bee → pollination → apple → one part of the food system.</p>
      </figcaption>

      <div className="bee-thread" role="list" aria-label="Source-scoped relationship chain">
        {nodes.map((node, index) => (
          <div className="bee-thread-step" role="listitem" key={node.id}>
            <article className="bee-node">
              <div className="bee-node-meta">
                <span>{node.id}</span>
                <strong>{node.state}</strong>
              </div>
              <h4>{node.label}</h4>
              <p>{node.body}</p>
              <small>{node.source}</small>
            </article>
            {index < nodes.length - 1 ? <div className="bee-link" aria-hidden="true"><span>RELATES TO</span></div> : null}
          </div>
        ))}
      </div>

      <div className="bee-limit">
        <strong>LIMIT</strong>
        <p>Bees are not all pollinators. Apples are not all food. This first object demonstrates a bounded relationship, not a universal dependency claim.</p>
      </div>
    </figure>
  );
}
