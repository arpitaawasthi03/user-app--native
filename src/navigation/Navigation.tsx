import React, { createContext, useContext, useMemo } from "react";
import {
  NavigationProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import type {
  RootStackParamList,
  RouteSpec,
  TabName,
  PlacesMode,
} from "./types";

export type { TabName, PlacesMode, RouteSpec };

export const TAB_NAMES: TabName[] = [
  "home",
  "navcart",
  "wallet",
  "orders",
  "account",
];

export const isTab = (
  name: string
): name is TabName => (TAB_NAMES as string[]).includes(name);

export interface NavContextType {
  push: (r: RouteSpec) => void;
  replace: (r: RouteSpec) => void;
  reset: (routes: RouteSpec[]) => void;
  back: () => void;
  pop: (count?: number) => void;
  canGoBack: () => boolean;
  switchTab: (t: TabName) => void;
}

const NavContext = createContext<NavContextType | null>(null);

/**
 * Hook providing uniform navigation actions across all native screens,
 * matching original RoadRider push/back/switchTab contracts while backed by React Navigation.
 */
export function useNav() {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();

  const push = (r: RouteSpec) => {
    if (isTab(r.name)) {
      (nav as any).navigate("mainTabs", { screen: r.name });
      return;
    }
    const { name, ...params } = r as any;
    (nav as any).navigate(name, params);
  };

  const replace = (r: RouteSpec) => {
    if (isTab(r.name)) {
      (nav as any).reset({
        index: 0,
        routes: [{ name: "mainTabs", params: { screen: r.name } }],
      });
      return;
    }
    const { name, ...params } = r as any;
    (nav as any).replace(name, params);
  };

  const reset = (routes: RouteSpec[]) => {
    const last = routes[routes.length - 1];
    if (last && isTab(last.name)) {
      nav.reset({
        index: 0,
        routes: [{ name: "mainTabs", params: { screen: last.name } }],
      });
      return;
    }
    if (last) {
      const { name, ...params } = last as any;
      nav.reset({
        index: 0,
        routes: [{ name, params }],
      });
    }
  };

  const back = () => {
    if (nav.canGoBack()) {
      nav.goBack();
    } else {
      (nav as any).navigate("mainTabs", { screen: "home" });
    }
  };

  const pop = (count: number = 1) => {
    if ((nav as any).pop) {
      (nav as any).pop(count);
    } else if (nav.canGoBack()) {
      nav.goBack();
    } else {
      (nav as any).navigate("mainTabs", { screen: "home" });
    }
  };

  const switchTab = (t: TabName) => {
    (nav as any).navigate("mainTabs", { screen: t });
  };

  return {
    push,
    replace,
    reset,
    back,
    pop,
    canGoBack: () => nav.canGoBack(),
    switchTab,
  };
}
