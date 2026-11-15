"use client";

import { createContext, useContext, type ReactNode } from "react";

const PortalMotionContext = createContext(false);

export function PortalMotionProvider({ children }: { children: ReactNode }) {
  return <PortalMotionContext.Provider value>{children}</PortalMotionContext.Provider>;
}

export function usePortalMotion() {
  return useContext(PortalMotionContext);
}
