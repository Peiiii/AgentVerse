import { create } from "zustand";
import type { SettingItem } from "@/common/types/settings";

export interface SettingsState {
  data: SettingItem[];
  isLoading: boolean;
  error: string | null;
  setLoading: (isLoading: boolean) => void;
  setData: (data: SettingItem[]) => void;
  setError: (error: string | null) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  data: [],
  isLoading: false,
  error: null,
  setLoading: (isLoading) => set({ isLoading }),
  setData: (data) => set({ data, isLoading: false, error: null }),
  setError: (error) => set({ error, isLoading: false }),
}));
