export type RestoreToken = {
  lifetime: number;
  intent: number;
};

export type RestoreOwnership = {
  begin(): RestoreToken;
  noteUserIntent(): void;
  endLifetime(): void;
  lifetimeStillCurrent(token: RestoreToken): boolean;
  mayApply(token: RestoreToken): boolean;
};

export function createRestoreOwnership(): RestoreOwnership;

export type PantryRestoreOutcome = "applied" | "empty" | "signed_out" | "abandoned" | "error";

export function restoreFoodPantryIfStillOwned<TSession, TMemory>(input: {
  ownership: RestoreOwnership;
  token: RestoreToken;
  loadSession: () => Promise<TSession | null>;
  loadMemory: (session: TSession) => Promise<TMemory | null>;
  onSession: (session: TSession) => void;
  onSignedOut: () => void;
  onEmpty: () => void;
  onReturned: (memory: TMemory) => void;
  onError: () => void;
}): Promise<PantryRestoreOutcome>;
