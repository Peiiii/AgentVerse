import { create } from 'zustand';

interface NavigationState {
  targetPath: string | null;
  currentPath: string;
  navigate: (path: string | null) => void;
  setCurrentPath: (path: string) => void;
}

export const navigationStore = create<NavigationState>((set) => ({
  targetPath: null,
  currentPath: '/',
  navigate: (path) => set({ targetPath: path }),
  setCurrentPath: (path) => set({ currentPath: path }),
})); 