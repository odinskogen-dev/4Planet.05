import Link from "next/link";
import { failureCascade, dependsUpon, directDependents, type GraphNode } from "@/lib/graph";

function Chip({ node }: { node: GraphNode }) {
  const inner = (
    <span className="inline-flex flex-col border border-line bg-paper px-2.5 py-1.5 group-hover:border-brand">
      <span className="micro text-[9.5px] leading-none">{node.kind}</span>
      <span className="mt-0.5 text-[12.5px] font-medium leading-snug group-hover:text-brand">
        {node.name}
      </span>
    </span>
  );
  return node.href ? (
    <Link href={node.href} className="group">
      {inner}
    </Link>
  ) : (
    <span className="group">{inner}</span>
  );
}

export function FailureCascade({
  nodeId,
  title = "Failure Cascade",
  intro = "What is weakened, layer by layer, if this is lost. Each step is a node in the graph — the effect propagates downstream toward human relevance.",
}: {
  nodeId: string;
  title?: string;
  intro?: string;
}) {
  const layers = failureCascade(nodeId);
  // A cascade needs at least one downstream layer to be meaningful.
  if (layers.length < 2) return null;
  return (
    <section className="border-t border-line py-8">
      <div className="micro-brand mb-1">{title}</div>
      <p className="mb-5 max-w-2xl text-[13px] leading-relaxed text-muted">{intro}</p>
      <div className="space-y-1">
        {layers.map((layer, i) => (
          <div key={i}>
            <div className="flex flex-wrap items-stretch gap-1.5">
              {layer.map((n) => (
                <Chip key={n.id} node={n} />
              ))}
            </div>
            {i < layers.length - 1 ? (
              <div className="py-1 pl-2 text-brand" aria-hidden>
                ↓
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

export function ReverseDependency({ nodeId }: { nodeId: string }) {
  const dependents = directDependents(nodeId);
  const upstream = dependsUpon(nodeId);
  if (dependents.length === 0 && upstream.length === 0) return null;
  return (
    <section className="grid grid-cols-1 gap-6 border-t border-line py-8 lg:grid-cols-2">
      <div>
        <div className="micro mb-3">What depends on this</div>
        {dependents.length ? (
          <div className="flex flex-wrap gap-1.5">
            {dependents.map((n) => (
              <Chip key={n.id} node={n} />
            ))}
          </div>
        ) : (
          <span className="text-[13px] text-muted">—</span>
        )}
      </div>
      <div>
        <div className="micro mb-3">What this depends on</div>
        {upstream.length ? (
          <div className="flex flex-wrap gap-1.5">
            {upstream.map((n) => (
              <Chip key={n.id} node={n} />
            ))}
          </div>
        ) : (
          <span className="text-[13px] text-muted">—</span>
        )}
      </div>
    </section>
  );
}
