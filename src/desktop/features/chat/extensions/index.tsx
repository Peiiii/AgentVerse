import { useActivityBarStore } from "@/core/stores/activity-bar.store";
import { useIconStore } from "@/core/stores/icon.store";
import { useRouteTreeStore } from "@/core/stores/route-tree.store";
import { defineExtension, Disposable } from "@cardos/extension";
import { MessageSquare } from "lucide-react";
import { ChatPage } from "../pages/chat-page";
import { connectRouterWithActivityBar } from "@/core/utils/connect-router-with-activity-bar";

export const desktopChatExtension = defineExtension({
    manifest: {
        id: "chat",
        name: "Chat",
        description: "Chat with the user",
        version: "1.0.0",
        author: "AgentVerse",
        icon: "message",
    },
    activate: ({ subscriptions }) => {
        subscriptions.push(Disposable.from(useIconStore.getState().addIcons({
            "message": MessageSquare,
        })))
        subscriptions.push(Disposable.from(useActivityBarStore.getState().addItem({
            id: "chat",
            label: "Chat",
            title: "Chat with the user",
            group: "main",
            icon: "message",
            order: 10,
        })))

        useRouteTreeStore.getState().addRoute({
            id: "chat",
            path: "/chat",
            element: <ChatPage />,
        })

        subscriptions.push(Disposable.from(connectRouterWithActivityBar([
            {
                activityKey: "chat",
                routerPath: "/chat",
            },
        ])))
    },
})