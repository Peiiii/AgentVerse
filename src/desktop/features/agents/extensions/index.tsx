import { useActivityBarStore } from "@/core/stores/activity-bar.store";
import { useIconStore } from "@/core/stores/icon.store";
import { useRouteTreeStore } from "@/core/stores/route-tree.store";
import { connectRouterWithActivityBar } from "@/core/utils/connect-router-with-activity-bar";
import { defineExtension, Disposable } from "@cardos/extension";
import { Bot } from "lucide-react";
import { AgentsPage } from "../pages/agents-page";


export const desktopAgentsExtension = defineExtension({
    manifest: {
        id: "agents",
        name: "Agents",
        description: "Agents",
        version: "1.0.0",
        author: "AgentVerse",
        icon: "bot",
    },
    activate: ({ subscriptions }) => {
        subscriptions.push(Disposable.from(useIconStore.getState().addIcons({
            "bot": Bot,
        })))
        subscriptions.push(Disposable.from(useActivityBarStore.getState().addItem({
            id: "agents",
            label: "Agents",
            title: "Agents",
            group: "main",
            icon: "bot",
            order: 20,
        })))
        useRouteTreeStore.getState().addRoute({
            id: "agents",
            path: "/agents",
            element: <AgentsPage />,
        })
        subscriptions.push(Disposable.from(connectRouterWithActivityBar([
            {
                activityKey: "agents",
                routerPath: "/agents",
            },
        ])))
    },
});