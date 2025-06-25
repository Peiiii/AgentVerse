import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { useRouteTreeStore } from '../../stores/route-tree.store';
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
  return <Routes>
    {renderRoutes(routes)}
  </Routes>
};
