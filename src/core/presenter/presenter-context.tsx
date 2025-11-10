import React, { createContext, useContext, useEffect, useMemo } from "react";
import { getPresenter, Presenter } from "@/core/presenter/presenter";
// Presenter context should remain domain-agnostic. No business bootstraps here.

const PresenterContext = createContext<Presenter | null>(null);

export const PresenterProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  // use a stable singleton presenter instance
  const presenter = useMemo(() => getPresenter(), []);
  
  // No domain side-effects here; app bootstraps should live in feature-level hooks/components
  useEffect(() => {}, [presenter]);

  return <PresenterContext.Provider value={presenter}>{children}</PresenterContext.Provider>;
};

export const usePresenter = () => {
  const ctx = useContext(PresenterContext);
  // fallback to singleton to avoid null checks in non-wrapped callers (defensive)
  return ctx ?? getPresenter();
};
