# 4PLANET IMPACT CONTRACT v0

Status: WORKING CANON FOR PROTOTYPE IMPLEMENTATION
As of: 2026-07-21

## Core law

Contribution, Delivery, Outcome and System Impact are separate.

A user contribution is not proof that a provider delivered.
A provider delivery record is not proof of ecological outcome.
A provider claim is not independent 4PLANET verification.

## Entity sequence

`ImpactUnitDefinition → ContributionRecord → ProviderAdapter → ProviderDeliveryRecord → NormalisedDeliveryRecord → ProofArtifact → PersonalImpactRecord`

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
- PRODUCTION

Prototype records must use FIXTURE or TEST only.

## Prototype disclosure

Every fixture/test record and every related share card must display:

`TEST RECORD — NO PHYSICAL DELIVERY`

## Minimum contract fields

### ImpactUnitDefinition
- id
- slug
- name
- missionId
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
- location fields when supplied
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
- deliveryRecordId
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
- Mission: CLIM4TE
- Prototype measure: one provider-requested tree unit
- Do not claim survival, permanence, carbon removal or ecosystem restoration unless separately evidenced.

### Plastic Unit
- Mission: CLE4N / PL4STIC
- Prototype measure: one provider-requested kilogram or provider-defined plastic unit
- Do not claim prevention, ocean removal, recycling or avoided leakage unless the provider record distinguishes and supports the method.

## Adapter law

Fixture and network adapters must return the same normalised types.
No component may read provider-specific raw fields directly outside the adapter boundary.

## Failure law

- provider timeout → PROVIDER REQUEST FAILED or PENDING, never no impact available
- evidence missing → delivery may be provider-reported, but evidence status remains missing
- refund → preserve history; do not delete the original contribution/delivery chain
- partial quantity → record actual reported quantity and discrepancy

## Share-card law

A share card may show:
- contribution quantity
- provider-reported delivery status
- provider name
- evidence status
- test disclosure

A share card may not imply:
- verified ecological outcome
- independent audit
- physical delivery in test mode
- guaranteed permanence or additionality

## Acceptance

The prototype passes this contract when Tree and Plastic can each create a test contribution, receive a fixture/test provider response, produce a normalised delivery record, display proof state and create a Personal Impact Record without semantic collapse.
