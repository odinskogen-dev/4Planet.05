export function accountStorageKey(baseKey: string, accountId: string | null): string {
  const id = accountId?.trim();
  return id ? `${baseKey}:account:${encodeURIComponent(id)}` : baseKey;
}

export function isActiveAccount(expectedAccountId: string, activeAccountId: string | null | undefined): boolean {
  return Boolean(activeAccountId) && activeAccountId === expectedAccountId;
}
