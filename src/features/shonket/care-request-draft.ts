import { useSyncExternalStore } from "react";

export type CareRequestMethod = "text" | "aac" | "call";
export type CareRequestDraft = { message: string; method: CareRequestMethod };

const emptyDraft: CareRequestDraft = Object.freeze({ message: "", method: "text" });
let draft: CareRequestDraft = emptyDraft;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return draft;
}

function getServerSnapshot() {
  return emptyDraft;
}

export function updateCareRequestDraft(patch: Partial<CareRequestDraft>) {
  draft = { ...draft, ...patch };
  listeners.forEach(listener => listener());
}

export function useCareRequestDraft() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
