import type { CSSProperties } from "react";
import { RelationshipReveal } from "@/components/phase04/RelationshipReveal";
import { ProvenanceBar } from "@/components/phase04/ProvenanceBar";
import {
  OSLOFJORD_RELATIONSHIP_CHAINS,
  oslofjordRelationshipSourceById,
} from "@/data/oslofjordenRelationshipDeepening";

const mono: CSSProperties = {
  fontFamily: "'Fragment Mono',ui-monospace,monospace",
  fontSize: 10,
  letterSpacing: ".09em",
  textTransform: "uppercase",
};

export function OslofjordRelationshipDeepening() {
  return (
    <div style={{ display: "grid", gap: "clamp(42px,6vw,78px)" }}>
      {OSLOFJORD_RELATIONSHIP_CHAINS.map((chain) => (
        <div key={chain.id}>
          <RelationshipReveal
            steps={chain.steps}
            initialMode="THREAD"
            title={chain.title}
            note={chain.note}
          />
          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            {chain.sourceIds.map((id) => {
              const source = oslofjordRelationshipSourceById(id);
              return (
                <ProvenanceBar
                  key={source.id}
                  value={{
                    state: "SOURCE",
                    actor: source.publisher,
                    source: source.url,
                    time: `Checked ${source.checkedAt}`,
                    limitation: source.limitation,
                  }}
                />
              );
            })}
            <div style={{ ...mono, color: "rgba(10,10,10,.58)", lineHeight: 1.55 }}>
              CHAIN LIMIT / {chain.limitation}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
