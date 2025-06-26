import { create } from 'zustand';
import type { RouteNode } from '@/common/types/route';

export interface RouteTreeState {
  routes: RouteNode[];
  addRoute: (route: RouteNode, parentId?: string) => () => void;
  addRoutes: (routes: RouteNode[], parentId?: string) =>()=> void;
  removeRoute: (id: string) => void;
  updateRoute: (id: string, updates: Partial<RouteNode>) => void;
  getRoutes: () => RouteNode[];
  reset: () => void;
}

function addRouteToTree(tree: RouteNode[], route: RouteNode, parentId?: string): RouteNode[] {
  if (!parentId) return [...tree, route];
  return tree.map(node => {
    if (node.id === parentId) {
      return {
        ...node,
        children: node.children ? [...node.children, route] : [route],
      };
    }
    return node.children
      ? { ...node, children: addRouteToTree(node.children, route, parentId) }
      : node;
  });
}

function addRoutesToTree(tree: RouteNode[], routes: RouteNode[], parentId?: string): RouteNode[] {
  if (!parentId) return [...tree, ...routes];
  return tree.map(node => {
    if (node.id === parentId) {
      return {
        ...node,
        children: node.children ? [...node.children, ...routes] : routes,
      };
    }
    return node.children
      ? { ...node, children: addRoutesToTree(node.children, routes, parentId) }
      : node;
  });
}

function removeRouteFromTree(tree: RouteNode[], id: string): RouteNode[] {
  return tree
    .filter(node => node.id !== id)
    .map(node =>
      node.children
        ? { ...node, children: removeRouteFromTree(node.children, id) }
        : node
    );
}

function updateRouteInTree(tree: RouteNode[], id: string, updates: Partial<RouteNode>): RouteNode[] {
  return tree.map(node => {
    if (node.id === id) {
      return { ...node, ...updates };
    }
    return node.children
      ? { ...node, children: updateRouteInTree(node.children, id, updates) }
      : node;
  });
}

export const useRouteTreeStore = create<RouteTreeState>()((set, get) => ({
  routes: [],
  addRoute: (route: RouteNode, parentId?: string) => {
    set((state: RouteTreeState) => ({
      routes: addRouteToTree(state.routes, route, parentId),
    }));
    // 返回unregister函数
    return () => {
      set((state: RouteTreeState) => ({
        routes: removeRouteFromTree(state.routes, route.id),
      }));
    };
  },
  addRoutes: (routes: RouteNode[], parentId?: string) => {
    set((state: RouteTreeState) => ({
      routes: addRoutesToTree(state.routes, routes, parentId),
    }));
    // 返回unregister函数
    return () => {
      set((state: RouteTreeState) => ({
        routes: routes.reduce((currentRoutes, route) => 
          removeRouteFromTree(currentRoutes, route.id), state.routes),
      }));
    };
  },
  removeRoute: (id: string) => {
    set((state: RouteTreeState) => ({
      routes: removeRouteFromTree(state.routes, id),
    }));
  },
  updateRoute: (id: string, updates: Partial<RouteNode>) => {
    set((state: RouteTreeState) => ({
      routes: updateRouteInTree(state.routes, id, updates),
    }));
  },
  getRoutes: () => get().routes,
  reset: () => set({ routes: [] }),
})); 