import { useActivityBarStore } from "@/core/stores/activity-bar.store";
import { useIconStore } from "@/core/stores/icon.store";
import { useRouteTreeStore } from "@/core/stores/route-tree.store";
import { connectRouterWithActivityBar } from "@/core/utils/connect-router-with-activity-bar";
import { defineExtension, Disposable } from "@cardos/extension";
import { Database } from "lucide-react";
import { IndexedDBManagerPage } from "../pages/indexeddb-manager-page";

export const desktopIndexedDBExtension = defineExtension({
    manifest: {
        id: "indexeddb-manager",
        name: "IndexedDB Manager",
        description: "IndexedDB 数据库管理器",
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
        subscriptions.push(Disposable.from(useActivityBarStore.getState().addItem({
            id: "indexeddb-manager",
            label: "数据库",
            title: "IndexedDB 管理器",
            group: "main",
            icon: "database",
            order: 30,
        })))

        // 注册路由
        subscriptions.push(Disposable.from(useRouteTreeStore.getState().addRoutes([
            {
                id: "indexeddb-manager",
                path: "/indexeddb",
                element: <IndexedDBManagerPage />,
            }
        ])))

        // 连接路由和活动栏
        subscriptions.push(Disposable.from(connectRouterWithActivityBar([
            {
                activityKey: "indexeddb-manager",
                routerPaths: ["/indexeddb"],
            },
        ])))
    },
}); 