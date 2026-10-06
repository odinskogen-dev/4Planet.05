import Link from "next/link";

export type RegistryItem = {
  id: string;
  name: string;
  sub?: string;
  gloss?: string;
  meta?: string;
  href?: string;
};

export function RegistryIndex({
  nodeType,
  title,
  intro,
  items,
}: {
  nodeType: string;
  title: string;
  intro: string;
  items: RegistryItem[];
}) {
  return (
    <div className="pb-10 pt-16">
      <div className="micro-brand mb-4">Node Type · {nodeType}</div>
      <h1 className="text-[clamp(2rem,4vw,3rem)] font-semibold tracking-tight">
        {title}
      </h1>
      <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted">{intro}</p>

      <div className="mt-10 micro mb-3">{items.length} nodes</div>
      <div className="grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {items.map((n) => {
          const inner = (
            <>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[15px] font-medium tracking-tight group-hover:text-brand">
                  {n.name}
                </span>
                {n.sub ? <span className="micro">{n.sub}</span> : null}
              </div>
              {n.gloss ? (
                <p className="mt-1.5 text-[12.5px] leading-snug text-muted">{n.gloss}</p>
              ) : null}
              <div className="mt-3 flex items-center justify-between gap-2 pt-1">
                <span className="font-mono text-[10.5px] text-ink/40">{n.id}</span>
                {n.meta ? (
                  <span className="micro-brand whitespace-nowrap">{n.meta}</span>
                ) : null}
              </div>
            </>
          );
          return n.href ? (
            <Link
              key={n.id}
              href={n.href}
              className="group flex flex-col bg-paper p-4 transition-colors hover:bg-brand/[0.02]"
            >
              {inner}
            </Link>
          ) : (
            <div key={n.id} className="group flex flex-col bg-paper p-4">
              {inner}
            </div>
          );
        })}
      </div>
    </div>
  );
}
