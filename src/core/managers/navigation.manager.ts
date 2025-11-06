import { navigationStore } from "@/core/stores/navigation.store";

// Manager that wraps navigation actions/state.
export class NavigationManager {
  store = navigationStore;

  navigate = (path: string | null) => this.store.getState().navigate(path);
  setCurrentPath = (path: string) => this.store.getState().setCurrentPath(path);

  getCurrentPath = () => this.store.getState().currentPath;
  getTargetPath = () => this.store.getState().targetPath;
}

