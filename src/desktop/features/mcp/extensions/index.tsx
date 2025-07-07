import { useActivityBarStore } from "@/core/stores/activity-bar.store";
import { useIconStore } from "@/core/stores/icon.store";
import { useRouteTreeStore } from "@/core/stores/route-tree.store";
import { connectRouterWithActivityBar } from "@/core/utils/connect-router-with-activity-bar";
import { defineExtension, Disposable } from "@cardos/extension";
import { Server } from "lucide-react";
import { MCPDemoPage } from "../pages/mcp-demo-page";

export const desktopMCPExtension = defineExtension({
    manifest: {
        id: "mcp",
        name: "MCP Tools",
        description: "Model Context Protocol tools integration",
        version: "1.0.0",
        author: "AgentVerse",
        icon: "server",
    },
    activate: ({ subscriptions }) => {
        subscriptions.push(Disposable.from(useIconStore.getState().addIcons({
            "server": Server,
        })))
        subscriptions.push(Disposable.from(useActivityBarStore.getState().addItem({
            id: "mcp",
            label: "MCP Tools",
            title: "Model Context Protocol tools",
            group: "main",
            icon: "server",
            order: 30,
        })))
        subscriptions.push(Disposable.from(useRouteTreeStore.getState().addRoutes([
            {
                id: "mcp-demo",
                path: "/mcp",
                element: <MCPDemoPage />,
            }
        ])))
        subscriptions.push(Disposable.from(connectRouterWithActivityBar([
            {
                activityKey: "mcp",
                routerPath: "/mcp",
            },
        ])))
    },
});
