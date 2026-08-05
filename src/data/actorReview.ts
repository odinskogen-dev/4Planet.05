export type ActorReviewRequestType =
  | "CLAIM"
  | "CORRECTION"
  | "URGENT_CORRECTION"
  | "REMOVAL"
  | "DISPUTE"
  | "APPEAL";

export type ActorReviewStatus =
  | "RECEIVED"
  | "IDENTITY_VERIFICATION_PENDING"
  | "EVIDENCE_REQUESTED"
  | "UNDER_EDITORIAL_REVIEW"
  | "APPROVED"
  | "PARTIALLY_APPROVED"
  | "REJECTED"
  | "URGENT_SUSPENSION"
  | "RESOLVED"
  | "APPEALED"
  | "CLOSED";

export type ActorReviewRequest = {
  actorId: string;
  actorSlug: string;
  requestType: ActorReviewRequestType;
  requestorName: string;
  requestorRole: string;
  officialEmail: string;
  organisationDomain: string;
  authorisationContext: string;
  affectedSection?: string;
  proposedChange: string;
  evidenceReferences: string;
  attachmentReference?: string;
  consent: true;
  privacyAcknowledged: true;
};

export type ActorReviewReceipt = {
  requestId: string;
  status: ActorReviewStatus | "STAGING_BLOCKED";
  submittedAt: string;
  persisted: boolean;
  message: string;
};

export const ACTOR_REVIEW_STATUSES: ActorReviewStatus[] = [
  "RECEIVED",
  "IDENTITY_VERIFICATION_PENDING",
  "EVIDENCE_REQUESTED",
  "UNDER_EDITORIAL_REVIEW",
  "APPROVED",
  "PARTIALLY_APPROVED",
  "REJECTED",
  "URGENT_SUSPENSION",
  "RESOLVED",
  "APPEALED",
  "CLOSED",
];

const normaliseDomain = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0];

const emailDomain = (value: string) => value.trim().toLowerCase().split("@")[1] ?? "";

export function validateActorReviewRequest(request: ActorReviewRequest) {
  const errors: string[] = [];
  const domain = normaliseDomain(request.organisationDomain);
  const mailDomain = emailDomain(request.officialEmail);

  if (!request.actorId.startsWith("actor:p17:")) errors.push("Unknown actor identity.");
  if (request.requestorName.trim().length < 2) errors.push("Name is required.");
  if (request.requestorRole.trim().length < 2) errors.push("Role is required.");
  if (!request.officialEmail.includes("@")) errors.push("A valid official email is required.");
  if (!domain.includes(".")) errors.push("A valid organisation domain is required.");
  if (mailDomain && domain && mailDomain !== domain && !mailDomain.endsWith(`.${domain}`)) {
    errors.push("Email domain must match the organisation domain. Explain exceptions through the authorisation context.");
  }
  if (request.authorisationContext.trim().length < 10) errors.push("Authorisation context is required.");
  if (request.proposedChange.trim().length < 10) errors.push("Describe the requested change.");
  if (!request.consent || !request.privacyAcknowledged) errors.push("Consent and privacy acknowledgement are required.");

  return { valid: errors.length === 0, errors, normalisedDomain: domain };
}

export async function submitActorReviewRequest(request: ActorReviewRequest): Promise<ActorReviewReceipt> {
  const validation = validateActorReviewRequest(request);
  if (!validation.valid) {
    throw new Error(validation.errors.join(" "));
  }

  const endpoint = String(import.meta.env.VITE_P17_REVIEW_ENDPOINT ?? "").trim();
  const requestId = `P17-${request.requestType}-${crypto.randomUUID()}`;
  const submittedAt = new Date().toISOString();

  if (!endpoint) {
    return {
      requestId,
      status: "STAGING_BLOCKED",
      submittedAt,
      persisted: false,
      message:
        "The secure review endpoint is not configured. No contact or request data was stored in the browser or transmitted.",
    };
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-4planet-request-id": requestId,
    },
    credentials: "omit",
    referrerPolicy: "strict-origin",
    body: JSON.stringify({
      ...request,
      organisationDomain: validation.normalisedDomain,
      requestId,
      submittedAt,
      requestedStatus: "RECEIVED",
      source: "P17_PRIVATE_BETA",
    }),
  });

  if (!response.ok) {
    throw new Error("The secure review endpoint did not accept the request. No profile content changed.");
  }

  return {
    requestId,
    status: "RECEIVED",
    submittedAt,
    persisted: true,
    message: "Received for internal review. No public profile state changed.",
  };
}
