import { useRouteTreeStore, type RouteTreeState } from "@/core/stores/route-tree.store";
import type { RouteNode } from "@/common/types/route";

// Manager for route tree registration and updates.
export class RouteTreeManager {
  store = useRouteTreeStore;

  addRoute = (route: RouteNode, parentId?: string) => this.store.getState().addRoute(route, parentId);
  addRoutes = (routes: RouteNode[], parentId?: string) => this.store.getState().addRoutes(routes, parentId);
  removeRoute = (id: string) => this.store.getState().removeRoute(id);
  updateRoute = (id: string, updates: Partial<RouteNode>) => this.store.getState().updateRoute(id, updates);
  getRoutes = () => this.store.getState().getRoutes();
  reset = () => this.store.getState().reset();

  getState = (): RouteTreeState => this.store.getState();
}

