import { useState, useEffect } from "react";
import { useWorldClassChatSettingsStore } from "../stores/world-class-chat-settings.store";

export function WorldClassChatSettingsPanel({ onClose }: { onClose: () => void }) {
  const prompt = useWorldClassChatSettingsStore(s => s.prompt);
  const setPrompt = useWorldClassChatSettingsStore(s => s.setPrompt);
  const [localPrompt, setLocalPrompt] = useState(prompt);

  // 输入变化时自动同步到AI（不持久化）
  useEffect(() => {
    setPrompt(localPrompt, { persist: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localPrompt]);

  const handleSave = () => {
    setPrompt(localPrompt, { persist: true }); // 持久化到 localStorage
  };

  return (
    <div className="w-full h-full flex flex-col bg-white shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">设置</h2>
        <button className="text-gray-400 hover:text-gray-700" onClick={onClose} title="关闭">✕</button>
      </div>
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">自定义 Prompt</label>
        <textarea
          className="w-full border rounded p-2 min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={localPrompt}
          onChange={e => setLocalPrompt(e.target.value)}
          placeholder="请输入自定义 Prompt..."
        />
        <div className="text-xs text-gray-400 mt-1">可为当前会话定制 AI 行为</div>
      </div>
      <div className="flex justify-end gap-2">
        <button className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleSave}>保存</button>
      </div>
    </div>
  );
} 