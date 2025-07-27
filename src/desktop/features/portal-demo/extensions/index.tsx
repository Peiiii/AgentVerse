import { useActivityBarStore } from "@/core/stores/activity-bar.store";
import { useIconStore } from "@/core/stores/icon.store";
import { useRouteTreeStore } from "@/core/stores/route-tree.store";
import { connectRouterWithActivityBar } from "@/core/utils/connect-router-with-activity-bar";
import { defineExtension, Disposable } from "@cardos/extension";
import { Link } from "lucide-react";
import { PortalDemoPage } from "../pages/portal-demo-page";
import { ModuleOrderEnum } from "@/core/config/module-order";

export const desktopPortalDemoExtension = defineExtension({
    manifest: {
        id: "portal-demo",
        name: "Portal Demo",
        description: "Demonstrate @cardos/service-bus-portal package usage",
        version: "1.0.0",
        author: "AgentVerse",
        icon: "link",
    },
    activate: ({ subscriptions }) => {
        subscriptions.push(Disposable.from(useIconStore.getState().addIcons({
            "link": Link,
        })))
        subscriptions.push(Disposable.from(useActivityBarStore.getState().addItem({
            id: "portal-demo",
            label: "Portal Demo",
            title: "Service Bus Portal Demo",
            group: "main",
            icon: "link",
            order: ModuleOrderEnum.MCP + 1, // 放在 MCP 后面
        })))
        subscriptions.push(Disposable.from(useRouteTreeStore.getState().addRoutes([
            {
                id: "portal-demo",
                path: "/portal-demo",
                element: <PortalDemoPage />,
            }
        ])))
        subscriptions.push(Disposable.from(connectRouterWithActivityBar([
            {
                activityKey: "portal-demo",
                routerPath: "/portal-demo",
            },
        ])))
    },
}); 