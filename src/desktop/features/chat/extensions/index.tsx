import { getPresenter } from "@/core/presenter/presenter";
import { defineExtension, Disposable } from "@cardos/extension";
import { MessageSquare } from "lucide-react";
import { ChatPage } from "@/desktop/features/chat/pages/chat-page";
import { connectRouterWithActivityBar } from "@/core/utils/connect-router-with-activity-bar";
import { RedirectToChat } from "@/common/components/common/redirect";
import { ModuleOrderEnum } from "@/core/config/module-order";
import { i18n } from "@/core/hooks/use-i18n";


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
        const presenter = getPresenter();
        subscriptions.push(Disposable.from(presenter.icon.addIcons({
            "message": MessageSquare,
        })))
        subscriptions.push(Disposable.from(presenter.activityBar.addItem({
            id: "chat",
            label: i18n.t("activityBar.chat.label"),
            title: i18n.t("activityBar.chat.title"),
            group: "main",
            icon: "message",
            order: ModuleOrderEnum.CHAT,
        })))

        subscriptions.push(Disposable.from(presenter.routeTree.addRoutes([{
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
