import { useMemo } from "react";
import type { EcosystemNode } from "@/ecosystems/types";

type Props = {
  nodes: EcosystemNode[];
  centreLabel: string;
  activeId: string;
  accent: string;
  onSelect: (node: EcosystemNode) => void;
};

export function EcosystemSystemGraph({ nodes, centreLabel, activeId, accent, onSelect }: Props) {
  const active = useMemo(() => nodes.find((node) => node.id === activeId) ?? nodes[0], [activeId, nodes]);
  if (!active) return null;

  return (
    <div className="eco-graph-wrap" style={{ "--eco-accent": accent } as React.CSSProperties}>
      <div className="eco-graph" aria-label={`${centreLabel} living-system relationship map`}>
        <svg className="eco-graph__links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          {nodes.map((node) => (
            <line key={node.id} x1="50" y1="50" x2={node.x} y2={node.y} className={node.id === active.id ? "is-active" : ""} />
          ))}
        </svg>
        <div className="eco-graph__centre" aria-hidden>
          <span>LIVING SYSTEM</span>
          <strong>{centreLabel}</strong>
        </div>
        {nodes.map((node) => (
          <button
            key={node.id}
            type="button"
            className={`eco-node eco-node--${node.kind.toLowerCase()} ${node.id === active.id ? "is-active" : ""}`}
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
            onClick={() => onSelect(node)}
            aria-pressed={node.id === active.id}
          >
            <small>{node.kicker}</small>
            <strong>{node.label}</strong>
          </button>
        ))}
      </div>
      <div className="eco-graph-detail" aria-live="polite">
        <div className="eco-graph-detail__meta"><span>{active.kind}</span><span>{active.relation ?? "CONNECTED"}</span></div>
        <h3>{active.label}</h3>
        <p>{active.detail}</p>
        {active.href && <a href={active.href}>OPEN CONNECTION →</a>}
      </div>
    </div>
  );
}