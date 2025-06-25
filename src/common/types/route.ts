export interface RouteNode {
  id: string;
  path: string;
  element: React.ReactNode;
  children?: RouteNode[];
  order?: number;
  meta?: Record<string, unknown>;
} 