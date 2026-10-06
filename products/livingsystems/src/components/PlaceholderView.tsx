import Link from "next/link";

export function PlaceholderView({
  nodeType,
  title,
  intro,
  nodes,
}: {
  nodeType: string;
  title: string;
  intro: string;
  nodes: { id: string; name: string; sub?: string; gloss?: string; meta?: string }[];
}) {
  return (
    <div className="pb-10 pt-16">
      <div className="micro-brand mb-4">Node Type · {nodeType}</div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-[clamp(2rem,4vw,3rem)] font-semibold tracking-tight">
          {title}
        </h1>
        <span className="border border-line px-2.5 py-1 micro">
          View in progress
        </span>
      </div>
      <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted">
        {intro}
      </p>

      <div className="mt-10 micro mb-3">
        Already registered as nodes ({nodes.length})
      </div>
      <div className="grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {nodes.map((n) => (
          <div key={n.id} className="bg-paper p-4">
            <div className="flex items-baseline justify-between">
              <span className="text-[14px] font-medium">{n.name}</span>
              {n.sub ? <span className="micro">{n.sub}</span> : null}
            </div>
            {n.gloss ? (
              <p className="mt-1.5 text-[12px] leading-snug text-muted">
                {n.gloss}
              </p>
            ) : null}
            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="font-mono text-[10.5px] text-ink/40">{n.id}</span>
              {n.meta ? (
                <span className="micro-brand whitespace-nowrap">{n.meta}</span>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex items-center gap-3">
        <div className="h-px w-8 bg-brand" />
        <p className="text-[13px] text-muted">
          These nodes are live in the graph and already power{" "}
          <Link href="/species" className="text-brand hover:underline">
            species profiles
          </Link>
          . A dedicated {title.toLowerCase()} view is the next layer.
        </p>
      </div>
    </div>
  );
}
