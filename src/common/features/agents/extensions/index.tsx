import { getPresenter } from "@/core/presenter/presenter";
import { useIconStore } from "@/core/stores/icon.store";
import { defineExtension, Disposable } from "@cardos/extension";
import { Bot } from "lucide-react";


export const commonAgentsExtension = defineExtension({
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
        subscriptions.push(Disposable.from(getPresenter().activityBar.addItem({
            id: "agents",
            label: "Agents",
            title: "Agents",
            group: "main",
            icon: "bot",
            order: 20,
        })))
        
    },
});
