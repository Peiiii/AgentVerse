import { create } from "zustand";
import { persist } from "zustand/middleware";

// Memory 数据结构
export interface MemoryItem {
  id: string;
  content: string;
  createdAt: Date;
}

// Memory Store 接口
interface MemoryStore {
  // 状态
  memories: MemoryItem[];
  
  // 操作方法
  addMemory: (content: string) => void;
  updateMemory: (id: string, content: string) => void;
  deleteMemory: (id: string) => void;
  clearMemories: () => void;
  
  // 查询方法
  getMemory: (id: string) => MemoryItem | undefined;
  getMemories: () => MemoryItem[];
}

// 创建 Memory Store
export const useMemoryStore = create<MemoryStore>()(
  persist(
    (set, get) => ({
      // 初始状态
      memories: [],
      
      // 添加 Memory
      addMemory: (content: string) => {
        const newMemory: MemoryItem = {
          id: Date.now().toString(),
          content: content.trim(),
          createdAt: new Date(),
        };
        
        set((state) => ({
          memories: [...state.memories, newMemory],
        }));
      },
      
      // 更新 Memory
      updateMemory: (id: string, content: string) => {
        set((state) => ({
          memories: state.memories.map((memory) =>
            memory.id === id
              ? { ...memory, content: content.trim() }
              : memory
          ),
        }));
      },
      
      // 删除 Memory
      deleteMemory: (id: string) => {
        set((state) => ({
          memories: state.memories.filter((memory) => memory.id !== id),
        }));
      },
      
      // 清空所有 Memory
      clearMemories: () => {
        set({ memories: [] });
      },
      
      // 获取单个 Memory
      getMemory: (id: string) => {
        return get().memories.find((memory) => memory.id === id);
      },
      
      // 获取所有 Memory
      getMemories: () => {
        return get().memories;
      },
    }),
    {
      name: "world-class-chat-memory", // 持久化存储的 key
    }
  )
); 