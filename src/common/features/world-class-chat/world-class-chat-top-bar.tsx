import type { AgentDef } from "@/common/types/agent";
import { Trash2, Settings as SettingsIcon } from "lucide-react";
import { useTranslation } from "@/core/hooks/use-i18n";

export interface WorldClassChatTopBarProps {
  agentDef: AgentDef;
  onClear?: () => void;
  onSettings?: () => void;
}

export function WorldClassChatTopBar({ agentDef, onClear, onSettings }: WorldClassChatTopBarProps) {
  const { t } = useTranslation();
  return (
    <div
      className="w-full min-h-[80px] flex items-center justify-between px-10 bg-gradient-to-r from-indigo-500 to-indigo-400 shadow-lg sticky top-0 z-10 text-white"
    >
      <div className="flex items-center gap-5">
        <img src={agentDef.avatar} alt="avatar" className="w-[54px] h-[54px] rounded-2xl bg-white shadow-md" />
        <div>
          <div className="font-extrabold text-2xl tracking-wide">{agentDef.name}</div>
          <div className="font-normal text-base opacity-85">World-Class AI Copilot</div>
        </div>
      </div>
      <div className="flex gap-3">
        {onClear && (
          <button
            onClick={onClear}
            title={t("chat.clearChat")}
            className="bg-white/15 hover:bg-white/25 border-none rounded-lg text-white p-2 cursor-pointer transition-colors duration-200 flex items-center justify-center w-9 h-9 shadow-md"
          >
            <Trash2 style={{ width: 20, height: 20 }} />
          </button>
        )}
        {onSettings && (
          <button
            onClick={onSettings}
            title={t("settings.title")}
            className="bg-white/15 hover:bg-white/25 border-none rounded-lg text-white p-2 cursor-pointer transition-colors duration-200 flex items-center justify-center w-9 h-9 shadow-md"
          >
            <SettingsIcon style={{ width: 20, height: 20 }} />
          </button>
        )}
      </div>
    </div>
  );
} 