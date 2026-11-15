"use client";

import { createContext, useContext } from "react";
import type { Copy, Locale } from "./home-content";

export const HomeContext = createContext<{
  locale: Locale;
  setLocale: (locale: Locale) => void;
  openPreferences: () => void;
  openSignIn: () => void;
}>({ locale: "en", setLocale: () => {}, openPreferences: () => {}, openSignIn: () => {} });

export function useHome() {
  const context = useContext(HomeContext);
  return { ...context, t: (value: Copy) => value[context.locale] };
}
