import { ACTORS } from "@/data/actors";
import { RegistryIndex } from "@/components/RegistryIndex";

export const metadata = { title: "Actors — LIVING SYSTEMS INTELLIGENCE" };

export default function ActorsPage() {
  const items = Object.values(ACTORS).map((a) => ({
    id: a.id,
    name: a.name,
    sub: a.actorType,
    gloss: a.humanTranslation,
    meta: a.draft ? "draft" : undefined,
    href: `/actors/${a.id}`,
  }));
  return (
    <RegistryIndex
      nodeType="Actor"
      title="Actors"
      intro="The organisations and groups that act on the graph — NGOs, funders, governments, Indigenous groups, researchers and mission operators. Seed entries are draft archetypes."
      items={items}
    />
  );
}
