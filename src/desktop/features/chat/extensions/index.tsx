import { useActivityBarStore } from "@/core/stores/activity-bar.store";
import { useIconStore } from "@/core/stores/icon.store";
import { useRouteTreeStore } from "@/core/stores/route-tree.store";
import { defineExtension, Disposable } from "@cardos/extension";
import { MessageSquare } from "lucide-react";
import { ChatPage } from "../pages/chat-page";
import { connectRouterWithActivityBar } from "@/core/utils/connect-router-with-activity-bar";
import { RedirectToChat } from "@/common/components/common/redirect";
import { ModuleOrderEnum } from "@/core/config/module-order";

// 重定向组件

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
            order: ModuleOrderEnum.CHAT,
        })))

        subscriptions.push(Disposable.from(useRouteTreeStore.getState().addRoutes([{
            id: "chat",
            path: "/chat",
            order: 0,
            element: <ChatPage />,
        },
        {
            id: "redirect",
            path: "/",
            order: 9999,
            element: <RedirectToChat />,
        }
        ])))

        subscriptions.push(Disposable.from(connectRouterWithActivityBar([
            {
                activityKey: "chat",
                routerPath: "/chat",
            },
        ])))
    },
})