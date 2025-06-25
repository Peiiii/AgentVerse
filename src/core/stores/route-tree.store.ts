import { create } from 'zustand';
import type { RouteNode } from '@/common/types/route';

export interface RouteTreeState {
  routes: RouteNode[];
  addRoute: (route: RouteNode, parentId?: string) => () => void;
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
  addRoute: (route, parentId) => {
    set(state => ({
      routes: addRouteToTree(state.routes, route, parentId),
    }));
    // 返回unregister函数
    return () => {
      set(state => ({
        routes: removeRouteFromTree(state.routes, route.id),
      }));
    };
  },
  removeRoute: (id) => {
    set(state => ({
      routes: removeRouteFromTree(state.routes, id),
    }));
  },
  updateRoute: (id, updates) => {
    set(state => ({
      routes: updateRouteInTree(state.routes, id, updates),
    }));
  },
  getRoutes: () => get().routes,
  reset: () => set({ routes: [] }),
})); 