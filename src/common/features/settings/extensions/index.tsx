import { useActivityBarStore } from "@/core/stores/activity-bar.store";
import { useIconStore } from "@/core/stores/icon.store";
import { defineExtension, Disposable } from "@cardos/extension";
import { Settings } from "lucide-react";

export const settingsExtension = defineExtension({
    manifest: {
        id: "settings",
        name: "Settings",
        description: "Settings and MCP Connection Management",
        version: "1.0.0",
        author: "AgentVerse",
        icon: "settings",
    },
    activate: ({ subscriptions }) => {
        subscriptions.push(Disposable.from(useIconStore.getState().addIcons({
            "settings": Settings,
        })))
        subscriptions.push(Disposable.from(useActivityBarStore.getState().addItem({
            id: "settings",
            label: "设置",
            title: "设置",
            group: "footer",
            icon: "settings",
            order: 30,
        })))
    },
});