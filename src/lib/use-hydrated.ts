"use client";
import { useSyncExternalStore } from "react";
const subscribe = () => () => {};
const client = () => true;
const server = () => false;
/** Prevent pre-hydration edits to controlled SSR forms from being discarded. */
export function useHydrated() { return useSyncExternalStore(subscribe, client, server); }
