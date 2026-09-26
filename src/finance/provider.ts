import type { BankSyncPlan } from "./core";

export const BANK_CONNECTION_CONTRACT = {
  candidateProvider: "gocardless_bank_account_data",
  activationState: "NOT_CONFIGURED",
  accessMode: "READ_ONLY",
  targetSuccessfulSyncsPerDay: 4,
  targetIsGuarantee: false,
  browserMayReceiveProviderCredentials: false,
  browserMayReceiveProviderConnectionReference: false,
} as const;

export type BankInstitution = {
  id: string;
  name: string;
  country: string;
  logoUrl: string | null;
};

export type BankConsentStart = {
  redirectUrl: string;
  expiresAt: string;
};

export type BankSyncReceipt = {
  connectionId: string;
  state: "SUCCEEDED" | "PARTIAL" | "FAILED" | "RATE_LIMITED";
  startedAt: string;
  finishedAt: string;
  accountsUpdated: number;
  transactionsImported: number;
  plan: BankSyncPlan;
};

/**
 * Server-only seam for a licensed account-information provider.
 * Implementations must keep provider credentials and bank references outside
 * browser-readable schemas and return only owner-scoped status/data.
 */
export interface AccountInformationProvider {
  listInstitutions(country: string): Promise<BankInstitution[]>;
  startConsent(institutionId: string, returnUrl: string): Promise<BankConsentStart>;
  syncConnection(connectionId: string): Promise<BankSyncReceipt>;
  revokeConnection(connectionId: string): Promise<void>;
}
