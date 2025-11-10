import { ModuleOrderEnum } from "@/core/config/module-order";
import { getPresenter } from "@/core/presenter/presenter";
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
        subscriptions.push(Disposable.from(getPresenter().activityBar.addItem({
            id: "settings",
            label: "Settings",
            title: "Settings",
            group: "footer",
            icon: "settings",
            order: ModuleOrderEnum.SETTINGS,
            onClick: () => getPresenter().settings.open(),
        })))
    },
});
