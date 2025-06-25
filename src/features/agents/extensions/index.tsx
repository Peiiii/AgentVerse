import { useActivityBarStore } from "@/stores/activity-bar.store";
import { useIconStore } from "@/stores/icon.store";
import { defineExtension, Disposable } from "@cardos/extension";
import { Bot } from "lucide-react";


export const agentsExtension = defineExtension({
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
    },
});