import { BreakpointProvider } from "./breakpoint-provider";
import { ReactNode } from "react";

interface ClientBreakpointProviderProps {
  children: ReactNode;
}

export function ClientBreakpointProvider({ children }: ClientBreakpointProviderProps) {
  if (typeof window === 'undefined') {
    return <>{children}</>;
  }
  
  return <BreakpointProvider>{children}</BreakpointProvider>;
}
