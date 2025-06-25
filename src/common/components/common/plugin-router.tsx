import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { useRouteTreeStore } from '../../../core/stores/route-tree.store';
import type { RouteNode } from '../../types/route';

function renderRoutes(nodes: RouteNode[]): React.ReactNode {
  return nodes
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map(node => (
      <Route
        key={node.id}
        path={node.path}
        element={node.element}
      >
        {node.children && renderRoutes(node.children)}
      </Route>
    ));
}

export const PluginRouter: React.FC = () => {
  const routes = useRouteTreeStore(state => state.routes);
  console.log("[PluginRouter] routes", routes);
  const location = useLocation();
  console.log("[PluginRouter] location", location);
  return <Routes>
    {renderRoutes(routes)}
  </Routes>
};
