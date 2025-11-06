import { useActivityBarStore, type ActivityItem } from "@/core/stores/activity-bar.store";

// Manager for Activity Bar related actions. No constructor; arrow functions only.
export class ActivityBarManager {
  // expose the zustand hook for subscription in components when needed
  store = useActivityBarStore;

  // actions
  addItem = (item: ActivityItem) => this.store.getState().addItem(item);
  removeItem = (id: string) => this.store.getState().removeItem(id);
  updateItem = (id: string, updates: Partial<ActivityItem>) =>
    this.store.getState().updateItem(id, updates);
  setActiveId = (id: string) => this.store.getState().setActiveId(id);
  toggleExpanded = () => this.store.getState().toggleExpanded();
  setExpanded = (expanded: boolean) => this.store.getState().setExpanded(expanded);
  reset = () => this.store.getState().reset();

  // selectors (non-subscribing reads)
  getActiveId = () => this.store.getState().activeId;
  getItems = () => this.store.getState().items;
  isExpanded = () => this.store.getState().expanded;
}

