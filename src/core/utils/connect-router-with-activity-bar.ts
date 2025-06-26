import { navigationStore } from "@/core/stores/navigation.store";
import { useActivityBarStore } from "@/core/stores/activity-bar.store";

/**
 * 路由配置示例：
 * 
 * ```typescript
 * // 基础路由配置
 * const basicRoutes: RouteConfig[] = [
 *   {
 *     activityKey: "home",
 *     routerPath: "/",
 *     matchOptions: { exact: true }
 *   },
 *   {
 *     activityKey: "chat",
 *     routerPath: "/chat"
 *   }
 * ];
 * 
 * // 带动态参数的路由
 * const dynamicRoutes: RouteConfig[] = [
 *   {
 *     activityKey: "chat",
 *     routerPath: "/chat",
 *     children: [
 *       {
 *         activityKey: "chat-detail",
 *         routerPath: "/chat/:id"
 *       },
 *       {
 *         activityKey: "chat-settings",
 *         routerPath: "/chat/:id/settings"
 *       }
 *     ]
 *   }
 * ];
 * 
 * // 带通配符的路由
 * const wildcardRoutes: RouteConfig[] = [
 *   {
 *     activityKey: "settings",
 *     routerPath: "/settings/*"
 *   },
 *   {
 *     activityKey: "profile",
 *     routerPath: "/profile/*"
 *   }
 * ];
 * 
 * // 复杂嵌套路由
 * const nestedRoutes: RouteConfig[] = [
 *   {
 *     activityKey: "workspace",
 *     routerPath: "/workspace",
 *     children: [
 *       {
 *         activityKey: "workspace-projects",
 *         routerPath: "/workspace/projects",
 *         children: [
 *           {
 *             activityKey: "workspace-project-detail",
 *             routerPath: "/workspace/projects/:projectId"
 *           }
 *         ]
 *       },
 *       {
 *         activityKey: "workspace-settings",
 *         routerPath: "/workspace/settings"
 *       }
 *     ]
 *   }
 * ];
 * 
 * // 使用示例
 * function App() {
 *   useEffect(() => {
 *     // 基础使用
 *     const unsubscribe = connectRouterWithActivityBar(basicRoutes);
 *     
 *     // 带匹配选项的使用
 *     const unsubscribeWithOptions = connectRouterWithActivityBar(dynamicRoutes, {
 *       exact: false,
 *       sensitive: true
 *     });
 *     
 *     return () => {
 *       unsubscribe();
 *       unsubscribeWithOptions();
 *     };
 *   }, []);
 *   
 *   return <div>...</div>;
 * }
 * ```
 */

/**
 * example:
 * 
 * // const routerToActivityBarMap = {
//   "/": "home",
//   "/chat": "chat",
//   "/card": "card",
// };

// const activityBarToRouterMap = {
//   home: "/",
//   chat: "/chat",
//   card: "/card",
// };
 */

/**
 * 路由匹配选项
 */
export interface RouteMatchOptions {
  /**
   * 是否精确匹配
   * @default false
   */
  exact?: boolean;
  /**
   * 是否敏感匹配（区分大小写）
   * @default false
   */
  sensitive?: boolean;
}

/**
 * 路由配置项
 */
export interface RouteConfig {
  /**
   * 活动栏的 key
   */
  activityKey: string;
  /**
   * 路由路径（单个）
   */
  routerPath?: string;
  /**
   * 路由路径（多个）
   */
  routerPaths?: string[];
  /**
   * 路由匹配选项
   */
  matchOptions?: RouteMatchOptions;
  /**
   * 子路由配置
   */
  children?: RouteConfig[];
}

/**
 * 创建路由到活动栏的映射
 */
export function createRouterToActivityBarMap(items: RouteConfig[]) {
  const map: Record<string, string> = {};
  
  function processRoute(route: RouteConfig) {
    // 处理单个路由路径
    if (route.routerPath) {
      map[route.routerPath] = route.activityKey;
    }
    // 处理多个路由路径
    if (route.routerPaths) {
      route.routerPaths.forEach(path => {
        map[path] = route.activityKey;
      });
    }
    // 处理子路由
    if (route.children) {
      route.children.forEach(processRoute);
    }
  }
  
  items.forEach(processRoute);
  return map;
}

/**
 * 创建活动栏到路由的映射
 */
export function createActivityBarToRouterMap(items: RouteConfig[]) {
  const map: Record<string, string> = {};
  
  function processRoute(route: RouteConfig) {
    // 优先使用 routerPath，如果没有则使用 routerPaths 的第一个路径
    const primaryPath = route.routerPath || (route.routerPaths && route.routerPaths[0]);
    if (primaryPath) {
      map[route.activityKey] = primaryPath;
    }
    if (route.children) {
      route.children.forEach(processRoute);
    }
  }
  
  items.forEach(processRoute);
  return map;
}

/**
 * 将路由路径转换为正则表达式
 */
function pathToRegexp(
  path: string,
  options: RouteMatchOptions = {}
): RegExp {
  const { exact = false, sensitive = false } = options;
  
  // 处理动态参数
  const pattern = path
    .replace(/:[^/]+/g, '([^/]+)') // 将 :param 转换为 ([^/]+)
    .replace(/\*/g, '.*'); // 将 * 转换为 .*
    
  const flags = sensitive ? '' : 'i';
  const regexp = new RegExp(
    `^${pattern}${exact ? '$' : ''}`,
    flags
  );
  
  return regexp;
}

/**
 * 查找匹配的路由
 */
function findMatchingRoute(
  path: string,
  routes: RouteConfig[],
  options: RouteMatchOptions = {}
): RouteConfig | undefined {
  // 按优先级排序：精确匹配 > 动态参数 > 通配符
  const sortedRoutes = [...routes].sort((a, b) => {
    const aHasParams = (a.routerPath?.includes(':') || a.routerPaths?.some(p => p.includes(':'))) ?? false;
    const bHasParams = (b.routerPath?.includes(':') || b.routerPaths?.some(p => p.includes(':'))) ?? false;
    const aHasWildcard = (a.routerPath?.includes('*') || a.routerPaths?.some(p => p.includes('*'))) ?? false;
    const bHasWildcard = (b.routerPath?.includes('*') || b.routerPaths?.some(p => p.includes('*'))) ?? false;
    
    if (aHasParams && !bHasParams) return 1;
    if (!aHasParams && bHasParams) return -1;
    if (aHasWildcard && !bHasWildcard) return 1;
    if (!aHasWildcard && bHasWildcard) return -1;
    return 0;
  });

  for (const route of sortedRoutes) {
    // 检查单个路由路径
    if (route.routerPath) {
      const regexp = pathToRegexp(route.routerPath, options);
      if (regexp.test(path)) {
        return route;
      }
    }
    // 检查多个路由路径
    if (route.routerPaths) {
      for (const routePath of route.routerPaths) {
        const regexp = pathToRegexp(routePath, options);
        if (regexp.test(path)) {
          return route;
        }
      }
    }
    // 检查子路由
    if (route.children) {
      const childMatch = findMatchingRoute(path, route.children, options);
      if (childMatch) {
        return childMatch;
      }
    }
  }
  
  return undefined;
}

/**
 * 根据路由路径更新活动栏状态
 */
function updateActivityBarByPath(
  currentPath: string,
  routes: RouteConfig[],
  options: RouteMatchOptions = {}
) {
  const matchingRoute = findMatchingRoute(currentPath, routes, options);
  if (matchingRoute) {
    useActivityBarStore.getState().setActiveId(matchingRoute.activityKey);
  }
}

/**
 * 根据活动栏状态更新路由路径
 */
function updateRouterByActivityBar(
  activeItemKey: string,
  routes: RouteConfig[],
  options: RouteMatchOptions = {}
) {
  // 查找匹配的路由配置
  const route = routes.find(r => r.activityKey === activeItemKey);
  if (!route) return;

  // 获取当前路径
  const currentPath = navigationStore.getState().currentPath;
  if (!currentPath) return;

  // 获取所有可能的目标路径
  const targetPaths: string[] = [];
  if (route.routerPath) {
    targetPaths.push(route.routerPath);
    }
  if (route.routerPaths) {
    targetPaths.push(...route.routerPaths);
  }
  if (route.children) {
    route.children.forEach(child => {
      if (child.routerPath) {
        targetPaths.push(child.routerPath);
      }
      if (child.routerPaths) {
        targetPaths.push(...child.routerPaths);
      }
    });
  }

  // 检查当前路径是否已经匹配任一目标路径
  for (const path of targetPaths) {
    const regexp = pathToRegexp(path, options);
    if (regexp.test(currentPath)) {
      // 当前路径已经匹配，不需要跳转
      return;
    }
  }

  // 按优先级排序路径
  const sortedPaths = targetPaths.sort((a, b) => {
    const aHasParams = a.includes(':');
    const bHasParams = b.includes(':');
    const aHasWildcard = a.includes('*');
    const bHasWildcard = b.includes('*');
    
    // 优先选择静态路径
    if (!aHasParams && bHasParams) return -1;
    if (aHasParams && !bHasParams) return 1;
    // 其次选择带参数路径
    if (!aHasWildcard && bHasWildcard) return -1;
    if (aHasWildcard && !bHasWildcard) return 1;
    // 最后按路径长度排序（较短的路径优先）
    return a.length - b.length;
  });

  // 选择优先级最高的路径
  const targetPath = sortedPaths[0];
  if (targetPath) {
    navigationStore.getState().navigate(targetPath);
  }
}

export function mapRouterToActivityBar(
  routes: RouteConfig[],
  options: RouteMatchOptions = {}
) {
  // 初始化时进行一次映射
  const currentPath = navigationStore.getState().currentPath;
  if (currentPath) {
    updateActivityBarByPath(currentPath, routes, options);
  }

  return navigationStore.subscribe((state, prevState) => {
    if (state.currentPath === prevState.currentPath) {
      return;
    }
    const currentPath = state.currentPath;
    if (currentPath) {
      updateActivityBarByPath(currentPath, routes, options);
    }
  });
}

export function mapActivityBarToRouter(
  routes: RouteConfig[]
) {
  // 初始化时进行一次映射
  const activeItemKey = useActivityBarStore.getState().activeId;    
  if (activeItemKey) {
    updateRouterByActivityBar(activeItemKey, routes);
  }

  return useActivityBarStore.subscribe((state, prevState) => {
    if (state.activeId === prevState.activeId) {
      return;
    }
    const activeItemKey = state.activeId;
    if (activeItemKey) {
      updateRouterByActivityBar(activeItemKey, routes);
    }
  });
}

/**
 * 连接路由和活动栏
 * @param routes 路由配置
 * @param options 路由匹配选项
 * @returns 取消订阅函数
 */
export function connectRouterWithActivityBar(
  routes: RouteConfig[],
  options: RouteMatchOptions = {}
) {
  const unsubscribeRouter = mapRouterToActivityBar(routes, options);
  const unsubscribeActivityBar = mapActivityBarToRouter(routes);

  return () => {
    unsubscribeRouter();
    unsubscribeActivityBar();
  };
}
