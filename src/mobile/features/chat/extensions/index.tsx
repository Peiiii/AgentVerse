import { RedirectToChat } from "@/common/components/common/redirect";
import { getPresenter } from "@/core/presenter/presenter";
import { useIconStore } from "@/core/stores/icon.store";
import { useRouteTreeStore } from "@/core/stores/route-tree.store";
import { connectRouterWithActivityBar } from "@/core/utils/connect-router-with-activity-bar";
import { defineExtension, Disposable } from "@cardos/extension";
import { MessagesSquare } from "lucide-react";
import { ChatPage } from "@/mobile/features/chat/pages/chat-page";
import { i18n } from "@/core/hooks/use-i18n";

export const mobileChatExtension = defineExtension({
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
            "message": MessagesSquare,
        })))
        subscriptions.push(Disposable.from(getPresenter().activityBar.addItem({
            id: "chat",
            label: i18n.t("activityBar.chat.label"),
            title: i18n.t("activityBar.chat.title"),
            group: "main",
            icon: "message",
            order: 10,
        })))

        useRouteTreeStore.getState().addRoutes([{
            id: "chat",
            path: "/chat",
            element: <ChatPage />,
        },
        {
            id: "redirect",
            path: "/",
            order: 9999,
            element: <RedirectToChat />,
        }])


        subscriptions.push(Disposable.from(connectRouterWithActivityBar([
            {
                activityKey: "chat",
                routerPath: "/chat",
            },
        ])))
    },
})
