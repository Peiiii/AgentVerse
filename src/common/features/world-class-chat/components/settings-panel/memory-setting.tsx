import { AutoResizeTextarea } from "@/common/components/ui/auto-resize-textarea";
import { Check, Edit, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import type { SettingItemComponent } from "./types";
import { useMemoryStore, type MemoryItem } from "../../stores/memory.store";
import { useTranslation } from "@/core/hooks/use-i18n";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function MemorySetting(_props: SettingItemComponent) {
  const { t, currentLanguage } = useTranslation();
  // 使用 Memory Store
  const { memories, addMemory, updateMemory, deleteMemory } = useMemoryStore();
  
  // 本地状态
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newContent, setNewContent] = useState("");
  const [editContent, setEditContent] = useState("");

  const handleCreate = () => {
    if (!newContent.trim()) return;

    addMemory(newContent);
    setNewContent("");
    setIsCreating(false);
  };

  const handleUpdate = () => {
    if (!editingId || !editContent.trim()) return;

    updateMemory(editingId, editContent);
    setEditingId(null);
    setEditContent("");
  };

  const handleDelete = (id: string) => {
    deleteMemory(id);
  };

  const startEdit = (memory: MemoryItem) => {
    setEditingId(memory.id);
    setEditContent(memory.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const cancelCreate = () => {
    setIsCreating(false);
    setNewContent("");
  };

  const formatDate = (date: Date) => {
    try {
      // 确保 date 是有效的 Date 对象
      if (!(date instanceof Date) || isNaN(date.getTime())) {
        return t("common.unknownTime");
      }
      
      return new Intl.DateTimeFormat(currentLanguage, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return t("common.unknownTime");
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white shadow-lg relative overflow-hidden">
      {/* 创建表单 */}
      {isCreating && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900">{t("memory.add")}</h3>
            <div className="flex gap-1">
              <button
                onClick={handleCreate}
                disabled={!newContent.trim()}
                className="p-1.5 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title={t("common.confirm")}
              >
                <Check size={14} />
              </button>
              <button
                onClick={cancelCreate}
                className="p-1.5 bg-gray-200 text-gray-600 rounded-md hover:bg-gray-300 transition-colors"
                title={t("common.cancel")}
              >
                <X size={14} />
              </button>
            </div>
          </div>
          <AutoResizeTextarea
            placeholder={t("memory.add")}
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            minRows={3}
            maxRows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 resize-none bg-white"
          />
        </div>
      )}

      {/* Memory 列表 */}
      <div className="flex-1 overflow-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-700">{t("memory.title")}</h3>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm transition-colors font-medium"
          >
            <Plus size={14} />
            {t("memory.add")}
          </button>
        </div>

        <div className="space-y-3">
          {memories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>{t("memory.empty")}</p>
            </div>
          ) : (
            memories.map((memory) => {
              // 确保 createdAt 是有效的 Date 对象
              const createdAt = memory.createdAt instanceof Date && !isNaN(memory.createdAt.getTime()) 
                ? memory.createdAt 
                : new Date();
              
              return (
                <div
                  key={memory.id}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow bg-white"
                >
                  {editingId === memory.id ? (
                    // 编辑模式
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">{t("memory.edit")}</span>
                        <div className="flex gap-1">
                          <button
                            onClick={handleUpdate}
                            disabled={!editContent.trim()}
                            className="p-1.5 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title={t("common.save")}
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1.5 bg-gray-200 text-gray-600 rounded-md hover:bg-gray-300 transition-colors"
                            title={t("common.cancel")}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                      <AutoResizeTextarea
                        placeholder={t("memory.add")}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        minRows={3}
                        maxRows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 resize-none"
                      />
                    </div>
                  ) : (
                    // 显示模式
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm text-gray-600 flex-1 mr-3 leading-relaxed">
                          {memory.content}
                        </p>
                        <div className="flex gap-1 flex-shrink-0">
                          <button
                            onClick={() => startEdit(memory)}
                            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                            title={t("common.edit")}
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(memory.id)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title={t("common.delete")}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500">
                        {t("common.createdAt")}: {formatDate(createdAt)}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
