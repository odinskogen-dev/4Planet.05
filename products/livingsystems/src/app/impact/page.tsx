import { IMPACT_OPPORTUNITIES } from "@/data/impact";
import { RegistryIndex } from "@/components/RegistryIndex";

export const metadata = { title: "Impact Opportunities — LIVING SYSTEMS INTELLIGENCE" };

export default function ImpactPage() {
  const items = Object.values(IMPACT_OPPORTUNITIES).map((o) => ({
    id: o.id,
    name: o.title,
    gloss: o.description,
    href: `/impact/${o.id}`,
    meta: `confidence · ${o.confidence}`,
  }));
  return (
    <RegistryIndex
      nodeType="Impact Opportunity"
      title="Impact Opportunities"
      intro="Specific interventions that can receive capital and produce measurable outcomes — wired to the solutions, species, ecosystems and threats they act on."
      items={items}
    />
  );
}
