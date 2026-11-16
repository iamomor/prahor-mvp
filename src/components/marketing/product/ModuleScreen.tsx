"use client";

import { type ReactNode } from "react";
import type { ModuleName } from "./content";
import { PhoneFrame } from "./ScreenFrame";
import { AdaptScreen } from "./modules/AdaptScreen";
import { BartaScreen } from "./modules/BartaScreen";
import { ShonketScreen } from "./modules/ShonketScreen";
import { JibonrekhaScreen } from "./modules/JibonrekhaScreen";
import { BujhiScreen } from "./modules/BujhiScreen";
import { ShusthotaScreen } from "./modules/ShusthotaScreen";
import { PothScreen } from "./modules/PothScreen";
import { ConsentScreen } from "./modules/BondhonScreen";

export function ModuleScreen({ name }: { name: ModuleName }) {
  const screens: Record<ModuleName, ReactNode> = { Adapt: <AdaptScreen />, Barta: <BartaScreen />, Shonket: <ShonketScreen />, Jibonrekha: <JibonrekhaScreen />, Bujhi: <BujhiScreen />, Shusthota: <ShusthotaScreen />, Poth: <PothScreen />, Bondhon: <ConsentScreen /> };
  return <PhoneFrame title={name} titleLang="en">{screens[name]}</PhoneFrame>;
}
