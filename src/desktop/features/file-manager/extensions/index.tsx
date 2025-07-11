import { useActivityBarStore } from "@/core/stores/activity-bar.store";
import { useIconStore } from "@/core/stores/icon.store";
import { useRouteTreeStore } from "@/core/stores/route-tree.store";
import { connectRouterWithActivityBar } from "@/core/utils/connect-router-with-activity-bar";
import { defineExtension, Disposable } from "@cardos/extension";
import { Folder } from "lucide-react";
import { FileManagerPage } from "../pages/file-manager-page";

export const desktopFileManagerExtension = defineExtension({
    manifest: {
        id: "file-manager",
        name: "文件管理",
        description: "浏览器文件管理器（基于 LightningFS）",
        version: "1.0.0",
        author: "AgentVerse",
        icon: "folder",
    },
    activate: ({ subscriptions }) => {
        subscriptions.push(Disposable.from(useIconStore.getState().addIcons({
            "folder": Folder,
        })))
        subscriptions.push(Disposable.from(useActivityBarStore.getState().addItem({
            id: "file-manager",
            label: "文件管理",
            title: "文件管理",
            group: "main",
            icon: "folder",
            order: 25,
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