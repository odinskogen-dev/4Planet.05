import { FUNCTIONS, SERVICES } from "@/data/nodes";
import { directDependents } from "@/lib/graph";
import { RegistryIndex } from "@/components/RegistryIndex";

export const metadata = { title: "Dependencies — LIVING SYSTEMS INTELLIGENCE" };

export default function DependenciesPage() {
  const fnItems = Object.values(FUNCTIONS).map((f) => ({
    id: f.id,
    name: f.name,
    sub: "Function",
    gloss: f.humanTranslation,
    href: `/functions/${f.id}`,
    meta: `${directDependents(f.id).length} depend`,
  }));
  const svItems = Object.values(SERVICES).map((v) => ({
    id: v.id,
    name: v.name,
    sub: "Service",
    gloss: v.humanTranslation,
    href: `/services/${v.id}`,
    meta: `${directDependents(v.id).length} depend`,
  }));
  const items = [...fnItems, ...svItems];
  return (
    <RegistryIndex
      nodeType="Dependency"
      title="Dependencies"
      intro="The ecological dependencies living systems and civilization rest on — the functions species perform and the services those functions provide. Open one to see what depends on it and what fails if it is lost."
      items={items}
    />
  );
}
