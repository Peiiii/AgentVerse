import { useActivityBarStore } from "@/stores/activity-bar.store";
import { useIconStore } from "@/stores/icon.store";
import { defineExtension, Disposable } from "@cardos/extension";
import { MessageSquare } from "lucide-react";

export const chatExtension = defineExtension({
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
    },
})