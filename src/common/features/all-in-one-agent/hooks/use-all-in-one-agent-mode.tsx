import { createContext, ReactNode, useContext, useState } from "react";

export type AllInOneAgentMode = "fullscreen" | "dock";

interface AllInOneAgentModeContextProps {
    mode: AllInOneAgentMode;
    setMode: (mode: AllInOneAgentMode) => void;
}

const AllInOneAgentModeContext = createContext<AllInOneAgentModeContextProps | undefined>(undefined);

export const AllInOneAgentModeProvider = ({ children }: { children: ReactNode }) => {
    const [mode, setMode] = useState<AllInOneAgentMode>("fullscreen");
    return (
        <AllInOneAgentModeContext.Provider value={{ mode, setMode }
        }>
            {children}
        </AllInOneAgentModeContext.Provider>
    );
};

export function useAllInOneAgentMode() {
    const ctx = useContext(AllInOneAgentModeContext);
    if (!ctx) throw new Error("useAllInOneAgentMode must be used within AllInOneAgentModeProvider");
    return ctx;
} 