import { cn } from "@/common/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { getAllSettings, getSettingById } from "./settings-registry";
import { ChevronDown, ArrowRight, X } from "lucide-react";

export interface WorldClassSettingsPanelProps {
  onClose: () => void;
}

export function WorldClassSettingsPanel({ onClose }: WorldClassSettingsPanelProps) {
  const [activeSetting, setActiveSetting] = useState<string | null>(null);
  const [expandedInlineSettings, setExpandedInlineSettings] = useState<Set<string>>(new Set(["prompt"]));
  const settings = getAllSettings();

  const handleSettingClick = (settingId: string) => {
    const setting = getSettingById(settingId);
    if (setting?.inline) {
      // 对于 inline 设置项，切换展开/收起状态
      setExpandedInlineSettings(prev => {
        const newSet = new Set(prev);
        if (newSet.has(settingId)) {
          newSet.delete(settingId);
        } else {
          newSet.add(settingId);
        }
        return newSet;
      });
    } else {
      // 对于非 inline 设置项，进入详情页面
      setActiveSetting(settingId);
    }
  };

  const handleBack = () => {
    setActiveSetting(null);
  };

  const currentSetting = activeSetting ? getSettingById(activeSetting) : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full h-full flex flex-col relative overflow-hidden bg-transparent"
    >
      <AnimatePresence mode="wait">
        {!activeSetting ? (
          // 设置项列表
          <motion.div
            key="settings-list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-full h-full flex flex-col p-6 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">设置</h2>
              <button
                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-white/50 backdrop-blur-sm rounded-xl transition-all duration-300 border border-transparent hover:border-indigo-100"
                onClick={onClose}
                title="关闭"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {settings.map((setting) => {
                const isExpanded = expandedInlineSettings.has(setting.id);
                const isInline = setting.inline;
                
                return (
                  <div
                    key={setting.id}
                    className={cn(
                      "group border border-indigo-100/50 rounded-2xl overflow-hidden transition-all duration-300 bg-white/40 backdrop-blur-sm",
                      "hover:border-indigo-300/50 hover:shadow-lg hover:shadow-indigo-500/5 hover:translate-y-[-2px]",
                      isExpanded && "border-indigo-300/50 shadow-xl shadow-indigo-500/10 bg-white/60 translate-y-[-2px]"
                    )}
                  >
                    {/* 设置项头部 */}
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={cn(
                        "p-4 cursor-pointer transition-all duration-200",
                        "hover:bg-indigo-50/30",
                        isExpanded && "bg-indigo-50/40 border-b border-indigo-200/50"
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
                          {isInline ? (
                            // inline 设置项：展开/收起图标
                            <motion.div
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                              className="text-gray-500"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </motion.div>
                          ) : (
                            // 非 inline 设置项：进入详情图标
                            <div className="text-gray-500">
                              <ArrowRight className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                    
                    {/* inline 设置项的展开内容 - 在卡片内部 */}
                    {isInline && (
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ 
                              duration: 0.25, 
                              ease: "easeInOut",
                              opacity: { duration: 0.2 }
                            }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 bg-white">
                              <setting.component item={setting} />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </div>
                );
              })}
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
