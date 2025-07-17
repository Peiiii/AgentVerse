import { create } from 'zustand';

const PROMPT_STORAGE_KEY = 'world-class-chat-prompt';

export interface SetPromptOptions {
  persist?: boolean;
  // 未来可扩展更多选项
}

export interface WorldClassChatSettingsState {
  prompt: string;
  setPrompt: (prompt: string, options?: SetPromptOptions) => void;
  // 未来可扩展更多设置项
}

function getInitialPrompt() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(PROMPT_STORAGE_KEY) || '';
  }
  return '';
}

export const useWorldClassChatSettingsStore = create<WorldClassChatSettingsState>((set) => ({
  prompt: getInitialPrompt(),
  setPrompt: (prompt, options = {}) => {
    if (options.persist && typeof window !== 'undefined') {
      localStorage.setItem(PROMPT_STORAGE_KEY, prompt);
    }
    set({ prompt });
  },
})); 