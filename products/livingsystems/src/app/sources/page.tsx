import { sourcesList, getClaimsForSource } from "@/lib/trust";
import { RegistryIndex } from "@/components/RegistryIndex";

export const metadata = { title: "Sources — LIVING SYSTEMS INTELLIGENCE" };

export default function SourcesPage() {
  const items = sourcesList.map((s) => {
    const claims = getClaimsForSource(s.id).length;
    const parts = [s.trustLevel + " reliability"];
    if (s.evidenceTier) parts.push(s.evidenceTier.replace(/([A-Z])/g, " $1").trim());
    if (s.verificationStatus) {
      parts.push(
        s.verificationStatus === "Verified"
          ? "verified"
          : s.verificationStatus === "NeedsURL"
          ? "needs URL"
          : s.verificationStatus === "NeedsMetadata"
          ? "needs metadata"
          : "needs review"
      );
    } else if (s.needsVerification) {
      parts.push("needs verification");
    }
    if (s.year) parts.push(String(s.year));
    return {
      id: s.id,
      name: s.title,
      sub: s.organization,
      gloss: s.summary,
      href: `/sources/${s.id}`,
      meta: `${claims} claim${claims === 1 ? "" : "s"} · ${parts.join(" · ")}`,
    };
  });
  return (
    <RegistryIndex
      nodeType="Source"
      title="Sources"
      intro="Every traceable statement points back to a source. This is the evidence base — open a source to see exactly what it supports inside the system. A source can be verified, need metadata, need URL review, or be used only as contextual support."
      items={items}
    />
  );
}
