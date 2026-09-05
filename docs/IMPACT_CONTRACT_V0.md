# 4PLANET UNIVERSAL IMPACT / IMPACT CONTRACT v0.2

Status: WORKING CANON FOR TEST / PROTOTYPE IMPLEMENTATION
Updated: 03 SEP 2026

## Scope correction — permanent

**IMPACT is not limited to the 16 Missions.**

The 16 Missions are the first curated action portfolios. The long-term system must be able to represent any legitimate positive action that materially helps living systems, provided actor, authority, funding, delivery, evidence and claims boundaries can be represented truthfully.

Working thesis:

> **FUND THE EXPERTS. SECURE PROOF OF DONE.**

Universal chain:

`Need / Problem → Project / Action → Expert Actor → Diligence → Funding Need → Funder / Market → Commitment → Delivery → Proof of Done → Outcome → Verified Impact where defensible → Learning`

4PLANET does not need to vertically replace specialist banking, payments, logistics, field operations or regulated professional systems. It should own the trusted, inspectable connection and state transitions between understanding, allocation, action, proof and learning, integrating stronger specialist infrastructure where appropriate.

## Core truth law

**Funding, Contribution, Delivery, Proof of Done, Outcome and Verified Impact are separate states.**

A contribution is not proof that an operator delivered.
A payment confirmation is not ecological delivery.
A provider delivery record is not proof of ecological outcome.
A provider claim is not independent 4PLANET verification.
`DONE ≠ OUTCOME ≠ VERIFIED IMPACT`.

No public interface may collapse these states for simplicity or marketing.

## Universal Action Contract

An `ActionContract` is the inspectable agreement/state object that connects a qualified need to an actor, resources, delivery obligations and evidence requirements. It is funding-instrument neutral.

Minimum objects:

`NeedRecord → ActionProject → ActorDiligence → FundingNeed → ActionContract → FundingCommitment → DeliveryMilestone(s) → DeliveryRecord(s) → ProofArtifact(s) → OutcomeAssessment → ImpactAssessment → LearningRecord`

The existing Impact Unit contribution/provider chain remains a valid specialised implementation beneath `ActionContract` for standardised units.

### NeedRecord
- id
- problem / ecological need
- place / system / species scope where applicable
- sourceRefs
- evidence state
- urgency / timing where evidenced
- known uncertainty / UNKNOWN
- authority / rights considerations

### ActionProject
- id
- needId
- actorId
- action type
- scope
- location / jurisdiction where relevant
- proposed quantity / effort / milestone definition
- method / protocol reference
- limitations
- sourceRefs
- status

### ActorDiligence
- actorId
- legal / operational identity where applicable
- relevant capability
- authority / permission state
- track record evidence
- safeguarding / rights / compliance considerations where relevant
- evidence quality
- conflicts / UNKNOWN
- diligence state

### FundingNeed
- id
- actionProjectId
- amount / currency or unit requirement when known
- allowed funding instrument(s)
- use of funds
- cost basis / unit economics where available
- timing
- restrictions
- funding state
- UNKNOWN fields remain explicit

### ActionContract
- id
- actionProjectId
- actorId
- fundingNeedId
- version
- environment: TEST / CONTROLLED / PRODUCTION
- action scope
- milestones
- acceptance criteria
- evidence required
- reporting cadence where relevant
- claims allowed
- claims prohibited
- dispute / refund / correction path where applicable
- sourceRefs
- authority / approval state

### FundingCommitment
- id
- actionContractId
- instrument type
- amount / unit quantity
- committedAt
- state
- external transaction reference where allowed
- restrictions
- source / evidence

`PIPELINE`, `APPROVED`, `COMMITTED`, `CONTRACTED`, `PAID` and `CASH` must not be collapsed.

### DeliveryMilestone
- id
- actionContractId
- description
- target date / period where applicable
- definition of done
- evidence required
- state

### DeliveryRecord
- id
- milestoneId
- actorId
- reported activity / quantity
- time / place when available and safe
- source / provider record
- evidence state
- discrepancy state
- correction history

### OutcomeAssessment
- id
- actionContractId
- outcome question / indicator
- method
- observation period
- sourceRefs
- result
- uncertainty
- state: NOT_ASSESSED / PROVIDER_CLAIMED / INDEPENDENTLY_REVIEWED / UNVERIFIED

### ImpactAssessment
Reserved for claims that can genuinely support system/ecological impact inference. Must record method, counterfactual/additionality assumptions where relevant, uncertainty, scope and verifier. Absence of this object must never prevent truthful Proof of Done.

### LearningRecord
- expected
- actual
- evidence
- discrepancy / failure
- cause or hypothesis
- lesson
- reusable rule / contract / test changed where justified
- next comparable test

## Standardised Impact Unit implementation

For unitised action products, the implementation chain remains:

`ImpactUnitDefinition → ContributionRecord → ProviderAdapter → ProviderDeliveryRecord → NormalisedDeliveryRecord → ProofArtifact → PersonalImpactRecord`

This chain must link upward to an ActionContract in PRODUCTION when a real open Impact Unit is activated.

## Required status model

### Contribution status
- CREATED
- CONFIRMED
- CANCELLED
- FAILED

### Provider request status
- NOT_SENT
- PENDING
- ACCEPTED
- REJECTED
- FAILED

### Delivery status
- NOT_DELIVERED
- SCHEDULED
- PROVIDER_REPORTED
- EVIDENCE_ATTACHED
- REFUNDED
- DISPUTED

### Outcome status
- NOT_ASSESSED
- PROVIDER_CLAIMED
- INDEPENDENTLY_REVIEWED
- UNVERIFIED

### Environment
- FIXTURE
- TEST
- CONTROLLED
- PRODUCTION

Prototype records must use FIXTURE or TEST only. CONTROLLED/PRODUCTION require the relevant partner, legal, payment, claim and Founder gates.

## Prototype disclosure

Every fixture/test record and related share card must display:

`TEST RECORD — NO PHYSICAL DELIVERY`

## Minimum unit-contract fields

### ImpactUnitDefinition
- id
- slug
- name
- missionId / portfolioId where relevant
- actionContractId when real
- unitType
- unitQuantity
- unitLabel
- description
- providerCapability
- environment
- sourceRefs

### ContributionRecord
- id
- impactUnitId
- quantity
- createdAt
- status
- environment
- idempotencyKey
- contributorRef (optional/local prototype)
- disclosure

### ProviderAdapter
- providerId
- adapterVersion
- capabilities
- submitContribution()
- getDelivery()
- getEvidence()
- requestRefund() when supported
- normaliseDelivery()

### ProviderDeliveryRecord
- providerId
- providerReference
- contributionId
- status
- reportedQuantity
- reportedUnit
- reportedAt
- location fields when supplied and safe
- rawEvidenceRefs
- rawProviderClaims
- environment

### NormalisedDeliveryRecord
- id
- contributionId
- providerId
- providerReference
- deliveryStatus
- normalisedQuantity
- normalisedUnit
- deliveredAt
- evidenceStatus
- sourceAttribution
- disclosure

### ProofArtifact
- id
- deliveryRecordId / milestoneId
- artifactType
- uri or payload reference
- createdAt
- issuer
- claimScope
- verificationStatus

### PersonalImpactRecord
- id
- contributionId
- impactUnit snapshot
- delivery snapshot
- proof artifacts
- publicShareState
- disclosure

## First unit definitions

### Tree Unit
- Prototype measure: one provider-requested tree unit
- Portfolio mapping may include CLIM4TE / restoration portfolios, but the unit is not confined to one Mission taxonomy.
- Do not claim survival, permanence, carbon removal or ecosystem restoration unless separately evidenced.

### Plastic Unit
- Prototype measure: one provider-requested kilogram or provider-defined plastic unit
- Initial portfolio mapping: CLE4N.
- Do not claim prevention, ocean removal, recycling or avoided leakage unless the provider record distinguishes and supports the method.

Internal diligence lineage for first activation remains: Plastic Bank lead; CleanHub reserve; Plastic Fischer direct-collection alternative. These are candidates, not public partner claims.

## Adapter law

Fixture and network adapters must return the same normalised types.
No component may read provider-specific raw fields directly outside the adapter boundary.
Specialist providers remain external execution systems; 4PLANET preserves interoperable state and evidence semantics.

## Failure law

- provider timeout → PROVIDER REQUEST FAILED or PENDING, never false success
- evidence missing → delivery may be provider-reported, but evidence status remains missing
- refund → preserve history; do not delete the original contribution/delivery chain
- partial quantity → record actual reported quantity and discrepancy
- actor fails milestone → preserve failure state and evidence; do not silently mark complete
- payment succeeds but delivery fails → Funding/Contribution may be confirmed while Delivery remains failed/not delivered
- proof-of-done exists but outcome is unknown → keep Outcome NOT_ASSESSED/UNKNOWN
- disputed impact claim → preserve delivery proof while separating/disputing the impact inference

## Share/public claim law

A public surface may show, when evidenced:
- committed / contributed quantity
- actor/provider identity
- delivery state
- provider-reported quantity
- proof/evidence state
- test disclosure
- independently reviewed outcome only when actually reviewed.

It may not imply:
- verified ecological outcome from payment alone
- independent audit from provider evidence alone
- physical delivery in test mode
- guaranteed permanence/additionality
- verified system impact without defensible assessment.

## MACHINE 1.0 Action Proof acceptance

Universal IMPACT reaches its first functional Machine 1.0 proof when one real qualified action path can be inspected end-to-end:

1. evidence-backed NeedRecord;
2. qualified Expert Actor with explicit diligence state;
3. ActionProject and FundingNeed;
4. versioned ActionContract with acceptance/evidence rules;
5. legitimate funding route/commitment state;
6. delivery milestone and truthful state transition;
7. inspectable Proof of Done;
8. Outcome kept separate unless actually assessed;
9. learning written back into the next comparable contract/test.

The first open Impact Unit may fulfil this proof if the chosen partner and unit can satisfy these requirements. No partner, funding, delivery or impact state may be fabricated to complete the demo.

## Prototype acceptance

The current prototype remains acceptable when Tree and Plastic can each create a test contribution, receive a fixture/test provider response, produce a normalised delivery record, display proof state and create a Personal Impact Record without semantic collapse — while remaining explicitly TEST / NO PHYSICAL DELIVERY.
