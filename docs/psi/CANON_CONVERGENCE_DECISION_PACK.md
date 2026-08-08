# 4PLANET PSI — Canon Convergence Decision Pack

**Status:** FOUNDER GATE OPEN / NO SILENT CANON CHANGE

The smallest coherent convergence requires only the six already-isolated founder decisions. No additional strategic founder decision was found in this sprint.

| ID | Decision | Recommended disposition | Current status |
|---|---|---|---|
| FD-01 | Canonical problem class | APPROVE WITH MODIFICATION: `PROBLEM_FRAME` is scoped/versioned; preserve `4P-PROB-*`; public UX may say Problem. | PENDING FOUNDER |
| FD-02 | Legacy VARIANT handling | APPROVE WITH MODIFICATION: migrate to INTERVENTION, preserve legacy history; use `VARIANT_OF`/`SPECIALISES`; do not make VARIANT a durable intervention type. | PENDING FOUNDER |
| FD-03 | Solution umbrella | APPROVE: Solution is UX/derived umbrella; canonical identity uses SOLUTION_PATHWAY / INTERVENTION / OFFERING; no generic canonical SOLUTION object. | PENDING FOUNDER |
| FD-04 | NEED semantics | APPROVE WITH MODIFICATION: separate `need_kind` from `need_origin`; source/provenance mandatory for external demand. | PENDING FOUNDER |
| FD-05 | Implementation lifecycle | APPROVE WITH MODIFICATION: separate `execution_phase`, `execution_state` and sourced milestone/events. | PENDING FOUNDER |
| FD-06 | GOLD meaning | APPROVE WITH MODIFICATION: internal review-completeness benchmark only; never effectiveness/certification/public ranking. | PENDING FOUNDER |

## Physical schema blockers

These do not require additional strategic founder choices; they are implementation corrections:

- B-03 — make OBJECT_REGISTRY physically authoritative.
- B-04 — replace weak polymorphic refs with registry FKs, predicate constraints and Claim object/value XOR.
- B-05 — generalise measurement/outcome target/context.
- B-06 — add Place links to physical DDL.
- B-07 — version readiness/assessment dimensions.
- B-08 — normalise predicate vocabulary against object kinds.

The bounded PSI migration candidate implements B-03, B-04, B-06 and B-07 directly and provides the general measurement primitive required by B-05. Predicate constraints provide the physical enforcement seam for B-08.

## Explicit hold

The candidate migration does **not** create:

- the final SOLUTION_PATHWAY / INTERVENTION / OFFERING physical model;
- the final NEED model;
- the final Implementation lifecycle model.

Those remain held until FD-03/04/05 are founder-approved.

## Recommended founder release text

`GODKJENN DINE ANBEFALINGER FD-01–FD-06.`

If approved, the next technical action is Schema Hardening Gate 0 against the bounded migration candidate before any live migration or PSI ingest.
