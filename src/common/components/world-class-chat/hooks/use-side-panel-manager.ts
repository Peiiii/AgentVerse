import { useState, useMemo, useCallback } from "react";

export interface SidePanelConfig {
  key: string;
  hideCloseButton?: boolean;
  render: (panelProps: unknown, close: () => void) => React.ReactNode;
}

export function useSidePanelManager(initialConfigs: SidePanelConfig[]) {
  const [activePanel, setActivePanel] = useState<{ key: string; props?: unknown } | null>(null);
  const [dynamicConfigs, setDynamicConfigs] = useState<SidePanelConfig[]>([]);
  
  // 合并初始配置和动态配置
  const allConfigs = useMemo(() => [...initialConfigs, ...dynamicConfigs], [initialConfigs, dynamicConfigs]);
  
  const sidePanelActive = !!activePanel;
  const activePanelConfig = useMemo(() => allConfigs.find(cfg => cfg.key === activePanel?.key), [allConfigs, activePanel]);
  
  const openPanel = useCallback((key: string, props?: unknown) => setActivePanel({ key, props }), []);
  const closePanel = useCallback(() => setActivePanel(null), []);
  
  // 动态添加 panel 配置
  const addPanel = useCallback((config: SidePanelConfig) => {
    setDynamicConfigs(prev => {
      const existingIndex = prev.findIndex(cfg => cfg.key === config.key);
      if (existingIndex >= 0) {
        // 更新已存在的配置
        const updated = [...prev];
        updated[existingIndex] = config;
        return updated;
      }
      // 添加新配置
      return [...prev, config];
    });
  }, []);
  
  // 动态移除 panel 配置
  const removePanel = useCallback((key: string) => {
    setDynamicConfigs(prev => prev.filter(cfg => cfg.key !== key));
    // 如果当前激活的面板被移除，关闭它
    if (activePanel?.key === key) {
      setActivePanel(null);
    }
  }, [activePanel]);

  return {
    activePanel,
    activePanelConfig,
    sidePanelActive,
    openPanel,
    closePanel,
    addPanel,
    removePanel,
    allConfigs,
  };
} 
