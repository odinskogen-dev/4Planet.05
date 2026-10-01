/**
 * Component lifetime and user intent are different owners.
 * A map/camera landing uses the same split: unmount or a newer gesture
 * cancels the in-flight response, and an untouched response may still land.
 */

export function createRestoreOwnership() {
  let lifetime = 0;
  let intent = 0;
  return {
    begin() {
      return { lifetime, intent };
    },
    noteUserIntent() {
      intent += 1;
    },
    endLifetime() {
      lifetime += 1;
    },
    lifetimeStillCurrent(token) {
      return token.lifetime === lifetime;
    },
    mayApply(token) {
      return token.lifetime === lifetime && token.intent === intent;
    },
  };
}

export async function restoreFoodPantryIfStillOwned(input) {
  try {
    const session = await input.loadSession();
    if (!input.ownership.lifetimeStillCurrent(input.token)) return "abandoned";
    if (session) input.onSession(session);
    if (!input.ownership.mayApply(input.token)) return "abandoned";
    if (!session) {
      input.onSignedOut();
      return "signed_out";
    }
    const memory = await input.loadMemory(session);
    if (!input.ownership.mayApply(input.token)) return "abandoned";
    if (!memory) {
      input.onEmpty();
      return "empty";
    }
    input.onReturned(memory);
    return "applied";
  } catch {
    if (!input.ownership.mayApply(input.token)) return "abandoned";
    input.onError();
    return "error";
  }
}
