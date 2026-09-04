/**
 * Local, private Embla decision state.
 *
 * Everything here stays in the person's own browser. There is no account, no
 * upload and no claim that a saved decision proves a purchase, a health outcome
 * or an ecological outcome. It records what the person decided and, when they
 * choose to say so, whether Embla was useful — the bounded LEARNING seam.
 */

import type { ChoiceDomain, ChoiceVerdict } from "./contract";

export type ChoiceAction = "SWITCH" | "KEEP";
export type ChoiceFeedback = "USEFUL" | "NOT_USEFUL" | null;

export interface ChoiceReceipt {
  id: string;
  savedAt: string;
  domain: ChoiceDomain;
  intent: string;
  action: ChoiceAction;
  verdict: ChoiceVerdict;
  chosenTitle: string;
  chosenId: string;
  baselineTitle: string;
  reasons: string[];
  priorities: string[];
  recordType: "LIVE_SOURCE_READ" | "SAMPLE_TEST_RECORD";
  feedback: ChoiceFeedback;
}

export interface EmblaContextState {
  priorities: string[];
  avoidAllergens: string[];
}

export type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

const RECEIPTS_KEY = "4planet.embla.decisions.v1";
const CONTEXT_KEY = "4planet.embla.context.v1";
const LIST_KEY = "4planet.embla.list.v1";
const MAX_RECEIPTS = 12;

export function browserStorage(): StorageLike | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

function readJson<T>(storage: StorageLike | null, key: string, fallback: T): T {
  if (!storage) return fallback;
  try {
    const raw = storage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as unknown;
    return (parsed ?? fallback) as T;
  } catch {
    return fallback;
  }
}

function writeJson(storage: StorageLike | null, key: string, value: unknown): boolean {
  if (!storage) return false;
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

const stringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

export function makeReceiptId(): string {
  return `d${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

export function readReceipts(storage: StorageLike | null): ChoiceReceipt[] {
  const raw = readJson<unknown[]>(storage, RECEIPTS_KEY, []);
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is ChoiceReceipt => Boolean(item) && typeof item === "object")
    .filter((item) => typeof item.id === "string" && typeof item.chosenTitle === "string")
    .slice(0, MAX_RECEIPTS);
}

export function writeReceipts(storage: StorageLike | null, receipts: ChoiceReceipt[]): boolean {
  return writeJson(storage, RECEIPTS_KEY, receipts.slice(0, MAX_RECEIPTS));
}

export function addReceipt(receipts: ChoiceReceipt[], receipt: ChoiceReceipt): ChoiceReceipt[] {
  return [receipt, ...receipts.filter((item) => item.id !== receipt.id)].slice(0, MAX_RECEIPTS);
}

export function setReceiptFeedback(
  receipts: ChoiceReceipt[],
  id: string,
  feedback: ChoiceFeedback,
): ChoiceReceipt[] {
  return receipts.map((item) => (item.id === id ? { ...item, feedback } : item));
}

export function removeReceipt(receipts: ChoiceReceipt[], id: string): ChoiceReceipt[] {
  return receipts.filter((item) => item.id !== id);
}

export function readContext(storage: StorageLike | null): EmblaContextState {
  const raw = readJson<Partial<EmblaContextState>>(storage, CONTEXT_KEY, {});
  return {
    priorities: stringArray(raw.priorities),
    avoidAllergens: stringArray(raw.avoidAllergens),
  };
}

export function writeContext(storage: StorageLike | null, context: EmblaContextState): boolean {
  return writeJson(storage, CONTEXT_KEY, context);
}

export function readList(storage: StorageLike | null): string {
  const raw = readJson<{ text?: unknown }>(storage, LIST_KEY, {});
  return typeof raw.text === "string" ? raw.text : "";
}

export function writeList(storage: StorageLike | null, text: string): boolean {
  return writeJson(storage, LIST_KEY, { text, savedAt: new Date().toISOString() });
}

export function clearEmblaLocalData(storage: StorageLike | null): void {
  if (!storage) return;
  for (const key of [RECEIPTS_KEY, CONTEXT_KEY, LIST_KEY]) {
    try {
      storage.removeItem(key);
    } catch {
      // A blocked storage write must never break the decision surface.
    }
  }
}
