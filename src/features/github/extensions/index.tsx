import { useActivityBarStore } from "@/core/stores/activity-bar.store";
import { useIconStore } from "@/core/stores/icon.store";
import { defineExtension, Disposable } from "@cardos/extension";
import { Github } from "lucide-react";

export const githubExtension = defineExtension({
    manifest: {
        id: "github",
        name: "Github",
        description: "Github",
        version: "1.0.0",
        author: "AgentVerse",
        icon: "github",
    },
    activate: ({ subscriptions }) => {
        subscriptions.push(Disposable.from(useIconStore.getState().addIcons({
            "github": Github,
        })))
        subscriptions.push(Disposable.from(useActivityBarStore.getState().addItem({
            id: "github",
            label: "Github",
            title: "Github",
            group: "footer",
            icon: "github",
            order: 40,
        })))
    },
});     