import { type IconState, useIconStore } from "@/core/stores/icon.store";
import type { LucideIcon } from "lucide-react";

// Manager for icon registry. No constructor; arrow functions only.
export class IconManager {
  store = useIconStore;

  addIcon = (id: string, icon: LucideIcon) => this.store.getState().addIcon(id, icon);
  addIcons = (icons: Record<string, LucideIcon>) => this.store.getState().addIcons(icons);
  removeIcon = (id: string) => this.store.getState().removeIcon(id);
  getIcon = (id: string) => this.store.getState().getIcon(id);
  reset = () => this.store.getState().reset();

  // expose raw state read if needed
  getState = (): IconState => this.store.getState();
}

