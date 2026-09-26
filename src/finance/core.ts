export const FINANCE_DEVICE_STATE_KEY = "4planet.4sapien.finance.manual.v1";
export const DEFAULT_BANK_SYNC_TARGET = 4;

export type AccountKind = "bank" | "cash" | "debt" | "asset";

export type ManualFinanceAccount = {
  id: string;
  name: string;
  kind: AccountKind;
  balance: string;
  currency: string;
  asOf: string;
  source: "manual";
};

export type ManualHolding = {
  id: string;
  symbol: string;
  name: string;
  quantity: string;
  averageCost: string;
  currentPrice: string | null;
  currency: string;
  asOf: string | null;
  source: "manual";
};

export type FinanceDeviceState = {
  version: 1;
  accounts: ManualFinanceAccount[];
  holdings: ManualHolding[];
  updatedAt: string;
};

export type HoldingMetrics = {
  costBasis: number;
  marketValue: number | null;
  unrealisedChange: number | null;
  unrealisedChangePercent: number | null;
};

export type CurrencySummary = {
  currency: string;
  liquidity: number | null;
  debt: number | null;
  otherAssets: number | null;
  portfolioCost: number | null;
  portfolioValue: number | null;
  unrealisedChange: number | null;
  recordedNetWorth: number | null;
  holdingCount: number;
  missingQuoteCount: number;
};

export type BankSyncState =
  | "CONSENT_REQUIRED"
  | "CONSENT_EXPIRED"
  | "RATE_LIMITED"
  | "DUE"
  | "SCHEDULED"
  | "TARGET_REACHED";

export type BankSyncPlan = {
  state: BankSyncState;
  dueAt: string | null;
  effectiveTargetPerDay: number;
  reason: string;
};

export type BankSyncInput = {
  now: string;
  consentExpiresAt: string | null;
  lastSuccessfulAt: string | null;
  successfulSyncsToday: number;
  targetPerDay?: number;
  providerDailyLimit?: number | null;
  providerRemaining?: number | null;
  providerResetAt?: string | null;
};

const CURRENCY_PATTERN = /^[A-Z]{3}$/;

export function normaliseCurrency(value: string): string {
  const currency = value.trim().toUpperCase();
  return CURRENCY_PATTERN.test(currency) ? currency : "NOK";
}

export function parseDecimal(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const normalised = String(value).trim().replace(/\s/g, "").replace(",", ".");
  if (normalised === "") return null;
  const parsed = Number(normalised);
  return Number.isFinite(parsed) ? parsed : null;
}

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateHoldingMetrics(holding: ManualHolding): HoldingMetrics {
  const quantity = parseDecimal(holding.quantity);
  const averageCost = parseDecimal(holding.averageCost);
  const currentPrice = parseDecimal(holding.currentPrice);

  if (quantity === null || quantity < 0 || averageCost === null || averageCost < 0) {
    throw new Error("INVALID_HOLDING_INPUT");
  }

  const costBasis = roundMoney(quantity * averageCost);
  if (currentPrice === null || currentPrice < 0) {
    return { costBasis, marketValue: null, unrealisedChange: null, unrealisedChangePercent: null };
  }

  const marketValue = roundMoney(quantity * currentPrice);
  const unrealisedChange = roundMoney(marketValue - costBasis);
  const unrealisedChangePercent = costBasis === 0
    ? null
    : Math.round(((unrealisedChange / costBasis) * 100 + Number.EPSILON) * 10) / 10;

  return { costBasis, marketValue, unrealisedChange, unrealisedChangePercent };
}

function sumOrUnknown(values: number[]): number | null {
  return values.length === 0 ? null : roundMoney(values.reduce((sum, value) => sum + value, 0));
}

export function listFinanceCurrencies(
  accounts: ManualFinanceAccount[],
  holdings: ManualHolding[],
): string[] {
  const currencies = new Set<string>(["NOK"]);
  accounts.forEach((account) => currencies.add(normaliseCurrency(account.currency)));
  holdings.forEach((holding) => currencies.add(normaliseCurrency(holding.currency)));
  return [...currencies].sort((a, b) => (a === "NOK" ? -1 : b === "NOK" ? 1 : a.localeCompare(b)));
}

export function summariseCurrency(
  accounts: ManualFinanceAccount[],
  holdings: ManualHolding[],
  requestedCurrency: string,
): CurrencySummary {
  const currency = normaliseCurrency(requestedCurrency);
  const matchingAccounts = accounts.filter((account) => normaliseCurrency(account.currency) === currency);
  const matchingHoldings = holdings.filter((holding) => normaliseCurrency(holding.currency) === currency);

  const accountValues = matchingAccounts.map((account) => {
    const value = parseDecimal(account.balance);
    if (value === null) throw new Error("INVALID_ACCOUNT_BALANCE");
    return { ...account, value };
  });

  const liquidity = sumOrUnknown(
    accountValues.filter((account) => account.kind === "bank" || account.kind === "cash").map((account) => account.value),
  );
  const debt = sumOrUnknown(
    accountValues.filter((account) => account.kind === "debt").map((account) => Math.abs(account.value)),
  );
  const otherAssets = sumOrUnknown(
    accountValues.filter((account) => account.kind === "asset").map((account) => Math.max(account.value, 0)),
  );

  const metrics = matchingHoldings.map(calculateHoldingMetrics);
  const portfolioCost = sumOrUnknown(metrics.map((metric) => metric.costBasis));
  const missingQuoteCount = metrics.filter((metric) => metric.marketValue === null).length;
  const portfolioValue = metrics.length === 0 || missingQuoteCount > 0
    ? null
    : roundMoney(metrics.reduce((sum, metric) => sum + (metric.marketValue ?? 0), 0));
  const unrealisedChange = portfolioValue === null || portfolioCost === null
    ? null
    : roundMoney(portfolioValue - portfolioCost);

  const hasAnyRecordedValue = accountValues.length > 0 || metrics.length > 0;
  const recordedNetWorth = !hasAnyRecordedValue || (metrics.length > 0 && portfolioValue === null)
    ? null
    : roundMoney((liquidity ?? 0) + (otherAssets ?? 0) + (portfolioValue ?? 0) - (debt ?? 0));

  return {
    currency,
    liquidity,
    debt,
    otherAssets,
    portfolioCost,
    portfolioValue,
    unrealisedChange,
    recordedNetWorth,
    holdingCount: matchingHoldings.length,
    missingQuoteCount,
  };
}

export function formatMoney(value: number | null, currency: string): string {
  if (value === null) return "Ukjent";
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: normaliseCurrency(currency),
    maximumFractionDigits: 2,
  }).format(value);
}

function clampInteger(value: number | null | undefined, minimum: number, maximum: number): number {
  if (!Number.isFinite(value)) return maximum;
  return Math.min(maximum, Math.max(minimum, Math.floor(value as number)));
}

function nextUtcDay(now: Date): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
}

export function planNextBankSync(input: BankSyncInput): BankSyncPlan {
  const now = new Date(input.now);
  if (Number.isNaN(now.getTime())) throw new Error("INVALID_NOW");

  const target = clampInteger(input.targetPerDay ?? DEFAULT_BANK_SYNC_TARGET, 1, DEFAULT_BANK_SYNC_TARGET);
  const providerLimit = input.providerDailyLimit === null || input.providerDailyLimit === undefined
    ? DEFAULT_BANK_SYNC_TARGET
    : clampInteger(input.providerDailyLimit, 1, DEFAULT_BANK_SYNC_TARGET);
  const effectiveTargetPerDay = Math.min(target, providerLimit);

  if (!input.consentExpiresAt) {
    return {
      state: "CONSENT_REQUIRED",
      dueAt: null,
      effectiveTargetPerDay,
      reason: "Explicit bank consent is required before any account read.",
    };
  }

  const consentExpiresAt = new Date(input.consentExpiresAt);
  if (Number.isNaN(consentExpiresAt.getTime()) || consentExpiresAt.getTime() <= now.getTime()) {
    return {
      state: "CONSENT_EXPIRED",
      dueAt: null,
      effectiveTargetPerDay,
      reason: "Bank consent has expired and must be renewed.",
    };
  }

  if (input.providerRemaining !== null && input.providerRemaining !== undefined && input.providerRemaining <= 0) {
    const resetAt = input.providerResetAt ? new Date(input.providerResetAt) : null;
    return {
      state: "RATE_LIMITED",
      dueAt: resetAt && !Number.isNaN(resetAt.getTime()) && resetAt.getTime() > now.getTime()
        ? resetAt.toISOString()
        : null,
      effectiveTargetPerDay,
      reason: "The bank/provider rate limit has been reached.",
    };
  }

  if (Math.max(0, Math.floor(input.successfulSyncsToday)) >= effectiveTargetPerDay) {
    const providerReset = input.providerResetAt ? new Date(input.providerResetAt) : null;
    const dueAt = providerReset && !Number.isNaN(providerReset.getTime()) && providerReset.getTime() > now.getTime()
      ? providerReset
      : nextUtcDay(now);
    return {
      state: "TARGET_REACHED",
      dueAt: dueAt.toISOString(),
      effectiveTargetPerDay,
      reason: "The effective daily refresh target has been reached.",
    };
  }

  if (!input.lastSuccessfulAt) {
    return {
      state: "DUE",
      dueAt: now.toISOString(),
      effectiveTargetPerDay,
      reason: "No successful bank refresh has been recorded yet.",
    };
  }

  const lastSuccessfulAt = new Date(input.lastSuccessfulAt);
  if (Number.isNaN(lastSuccessfulAt.getTime())) throw new Error("INVALID_LAST_SUCCESS");
  const intervalMs = (24 * 60 * 60 * 1000) / effectiveTargetPerDay;
  const scheduledAt = new Date(lastSuccessfulAt.getTime() + intervalMs);

  if (scheduledAt.getTime() >= consentExpiresAt.getTime()) {
    return {
      state: "CONSENT_EXPIRED",
      dueAt: null,
      effectiveTargetPerDay,
      reason: "Consent expires before the next eligible refresh.",
    };
  }

  if (scheduledAt.getTime() <= now.getTime()) {
    return {
      state: "DUE",
      dueAt: now.toISOString(),
      effectiveTargetPerDay,
      reason: "The next refresh interval has elapsed.",
    };
  }

  return {
    state: "SCHEDULED",
    dueAt: scheduledAt.toISOString(),
    effectiveTargetPerDay,
    reason: "Refresh is scheduled within the provider's effective daily limit.",
  };
}

function isAccount(value: unknown): value is ManualFinanceAccount {
  if (!value || typeof value !== "object") return false;
  const row = value as Partial<ManualFinanceAccount>;
  return typeof row.id === "string"
    && typeof row.name === "string"
    && ["bank", "cash", "debt", "asset"].includes(String(row.kind))
    && parseDecimal(row.balance) !== null
    && typeof row.currency === "string"
    && typeof row.asOf === "string"
    && row.source === "manual";
}

function isHolding(value: unknown): value is ManualHolding {
  if (!value || typeof value !== "object") return false;
  const row = value as Partial<ManualHolding>;
  return typeof row.id === "string"
    && typeof row.symbol === "string"
    && typeof row.name === "string"
    && parseDecimal(row.quantity) !== null
    && parseDecimal(row.averageCost) !== null
    && (row.currentPrice === null || parseDecimal(row.currentPrice) !== null)
    && typeof row.currency === "string"
    && (row.asOf === null || typeof row.asOf === "string")
    && row.source === "manual";
}

export function parseFinanceDeviceState(raw: string | null): FinanceDeviceState {
  const empty: FinanceDeviceState = {
    version: 1,
    accounts: [],
    holdings: [],
    updatedAt: new Date(0).toISOString(),
  };
  if (!raw) return empty;

  try {
    const parsed = JSON.parse(raw) as Partial<FinanceDeviceState>;
    if (parsed.version !== 1 || !Array.isArray(parsed.accounts) || !Array.isArray(parsed.holdings)) return empty;
    return {
      version: 1,
      accounts: parsed.accounts.filter(isAccount),
      holdings: parsed.holdings.filter(isHolding),
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : empty.updatedAt,
    };
  } catch {
    return empty;
  }
}
