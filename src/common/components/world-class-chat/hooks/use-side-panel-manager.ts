import { useState, useMemo, useCallback } from "react";

export interface SidePanelConfig {
  key: string;
  hideCloseButton?: boolean;
  render: (panelProps: any, close: () => void) => React.ReactNode;
}

export function useSidePanelManager(configs: SidePanelConfig[]) {
  const [activePanel, setActivePanel] = useState<{ key: string; props?: any } | null>(null);
  const sidePanelActive = !!activePanel;
  const activePanelConfig = useMemo(() => configs.find(cfg => cfg.key === activePanel?.key), [configs, activePanel]);
  const openPanel = useCallback((key: string, props?: any) => setActivePanel({ key, props }), []);
  const closePanel = useCallback(() => setActivePanel(null), []);

  return {
    activePanel,
    activePanelConfig,
    sidePanelActive,
    openPanel,
    closePanel,
  };
} 