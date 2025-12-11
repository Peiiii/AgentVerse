import { getPresenter } from "@/core/presenter/presenter";
import { useIconStore } from "@/core/stores/icon.store";
import { useRouteTreeStore } from "@/core/stores/route-tree.store";
import { connectRouterWithActivityBar } from "@/core/utils/connect-router-with-activity-bar";
import { defineExtension, Disposable } from "@cardos/extension";
import { Folder } from "lucide-react";
import { FileManagerPage } from "../pages/file-manager-page";
import { ModuleOrderEnum } from "@/core/config/module-order";
import { i18n } from "@/core/hooks/use-i18n";

export const desktopFileManagerExtension = defineExtension({
    manifest: {
        id: "file-manager",
        name: "File Manager",
        description: "Browser file manager (powered by LightningFS)",
        version: "1.0.0",
        author: "AgentVerse",
        icon: "folder",
    },
    activate: ({ subscriptions }) => {
        subscriptions.push(Disposable.from(useIconStore.getState().addIcons({
            "folder": Folder,
        })))
        subscriptions.push(Disposable.from(getPresenter().activityBar.addItem({
            id: "file-manager",
            label: i18n.t("activityBar.fileManager.label"),
            title: i18n.t("activityBar.fileManager.title"),
            group: "main",
            icon: "folder",
            order: ModuleOrderEnum.FILE_MANAGER,
        })))
        subscriptions.push(Disposable.from(useRouteTreeStore.getState().addRoutes([
            {
                id: "file-manager",
                path: "/file-manager",
                element: <FileManagerPage />,
            }
        ])))
        subscriptions.push(Disposable.from(connectRouterWithActivityBar([
            {
                activityKey: "file-manager",
                routerPaths: ["/file-manager"],
            },
        ])))
    },
}); 
