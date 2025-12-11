import { getPresenter } from "@/core/presenter/presenter";
import { useIconStore } from "@/core/stores/icon.store";
import { defineExtension, Disposable } from "@cardos/extension";
import { Github } from "lucide-react";
import { i18n } from "@/core/hooks/use-i18n";

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
        subscriptions.push(Disposable.from(getPresenter().activityBar.addItem({
            id: "github",
            label: i18n.t("activityBar.github.label"),
            title: i18n.t("activityBar.github.title"),
            group: "footer",
            icon: "github",
            order: 40,
            onClick: () => window.open("https://github.com/Peiiii/AgentVerse", "_blank"),
        })))
    },
});     
