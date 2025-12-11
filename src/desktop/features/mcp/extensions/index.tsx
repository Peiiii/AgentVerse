import { getPresenter } from "@/core/presenter/presenter";
import { useIconStore } from "@/core/stores/icon.store";
import { useRouteTreeStore } from "@/core/stores/route-tree.store";
import { connectRouterWithActivityBar } from "@/core/utils/connect-router-with-activity-bar";
import { defineExtension, Disposable } from "@cardos/extension";
import { Cpu } from "lucide-react";
import { MCPDemoPage } from "../pages/mcp-demo-page";
import { ModuleOrderEnum } from "@/core/config/module-order";
import { i18n } from "@/core/hooks/use-i18n";

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
            "cpu": Cpu,
        })))
        subscriptions.push(Disposable.from(getPresenter().activityBar.addItem({
            id: "mcp",
            label: i18n.t("activityBar.mcp.label"),
            title: i18n.t("activityBar.mcp.title"),
            group: "main",
            icon: "cpu",
            order: ModuleOrderEnum.MCP,
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
