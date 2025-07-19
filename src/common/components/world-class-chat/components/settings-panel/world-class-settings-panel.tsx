import { cn } from "@/common/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { getAllSettings, getSettingById } from "./settings-registry";

export interface WorldClassSettingsPanelProps {
  onClose: () => void;
}

export function WorldClassSettingsPanel({ onClose }: WorldClassSettingsPanelProps) {
  const [activeSetting, setActiveSetting] = useState<string | null>(null);
  const settings = getAllSettings();

  const handleSettingClick = (settingId: string) => {
    setActiveSetting(settingId);
  };

  const handleBack = () => {
    setActiveSetting(null);
  };

  const currentSetting = activeSetting ? getSettingById(activeSetting) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full h-full flex flex-col bg-white shadow-lg relative overflow-hidden"
    >
      <AnimatePresence mode="wait">
        {!activeSetting ? (
          // 设置项列表
          <motion.div
            key="settings-list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-full h-full flex flex-col p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">设置</h2>
              <button
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-accent rounded-md transition-colors"
                onClick={onClose}
                title="关闭"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {settings.map((setting) => (
                <motion.div
                  key={setting.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "p-4 border rounded-lg cursor-pointer transition-all duration-200",
                    "hover:border-indigo-300 hover:bg-indigo-50/30 hover:shadow-md"
                  )}
                  onClick={() => handleSettingClick(setting.id)}
                >
                  <div className="flex items-center gap-3">
                    {setting.icon && (
                      <div className="flex-shrink-0">
                        <setting.icon className="w-5 h-5 text-indigo-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 mb-1">
                        {setting.name}
                      </h3>
                      {setting.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {setting.description}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          // 具体设置项内容
          <motion.div
            key="setting-content"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full h-full"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold">{currentSetting?.name}</h2>
              <div className="flex gap-1">
                <button
                  onClick={handleBack}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-accent rounded-md transition-colors"
                  title="返回"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-accent rounded-md transition-colors"
                  onClick={onClose}
                  title="关闭"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              {currentSetting && (
                <currentSetting.component
                  item={currentSetting}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
