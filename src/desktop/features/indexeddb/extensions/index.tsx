import { getPresenter } from "@/core/presenter/presenter";
import { useIconStore } from "@/core/stores/icon.store";
import { useRouteTreeStore } from "@/core/stores/route-tree.store";
import { connectRouterWithActivityBar } from "@/core/utils/connect-router-with-activity-bar";
import { defineExtension, Disposable } from "@cardos/extension";
import { Database } from "lucide-react";
import { IndexedDBManagerPage } from "../pages/indexeddb-manager-page";
import { ModuleOrderEnum } from "@/core/config/module-order";
import { i18n } from "@/core/hooks/use-i18n";

export const desktopIndexedDBExtension = defineExtension({
    manifest: {
        id: "indexeddb",
        name: "IndexedDB",
        description: "IndexedDB browser manager",
        version: "1.0.0",
        author: "AgentVerse",
        icon: "database",
    },
    activate: ({ subscriptions }) => {
        // 注册图标
        subscriptions.push(Disposable.from(useIconStore.getState().addIcons({
            "database": Database,
        })))

        // 注册活动栏项目
        subscriptions.push(Disposable.from(getPresenter().activityBar.addItem({
            id: "indexeddb",
            label: i18n.t("activityBar.indexeddb.label"),
            title: i18n.t("activityBar.indexeddb.title"),
            group: "main",
            icon: "database",
            order: ModuleOrderEnum.INDEXEDDB,
        })))

        // 注册路由
        subscriptions.push(Disposable.from(useRouteTreeStore.getState().addRoutes([
            {
                id: "indexeddb",
                path: "/indexeddb",
                element: <IndexedDBManagerPage />,
            }
        ])))

        // 连接路由和活动栏
        subscriptions.push(Disposable.from(connectRouterWithActivityBar([
            {
                activityKey: "indexeddb",
                routerPaths: ["/indexeddb"],
            },
        ])))
    },
}); 
