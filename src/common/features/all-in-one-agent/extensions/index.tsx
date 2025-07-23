import { useActivityBarStore } from "@/core/stores/activity-bar.store";
import { useIconStore } from "@/core/stores/icon.store";
import { useRouteTreeStore } from "@/core/stores/route-tree.store";
import { connectRouterWithActivityBar } from "@/core/utils/connect-router-with-activity-bar";
import { defineExtension, Disposable } from "@cardos/extension";
import { Sparkles } from "lucide-react";
import { AllInOneAgentPage } from "../pages/all-in-one-agent-page";

export const allInOneAgentExtension = defineExtension({
  manifest: {
    id: "all-in-one-agent",
    name: "All-in-One Agent",
    description: "全局超级智能体，系统级控制台",
    version: "1.0.0",
    author: "AgentVerse",
    icon: "sparkles",
  },
  activate: ({ subscriptions }) => {
    subscriptions.push(
      Disposable.from(
        useIconStore.getState().addIcons({
          sparkles: Sparkles,
        })
      )
    );
    subscriptions.push(
      Disposable.from(
        useActivityBarStore.getState().addItem({
          id: "all-in-one-agent",
          label: "All-in-One Agent",
          title: "全局超级智能体",
          group: "main",
          icon: "sparkles",
          order: 5,
        })
      )
    );
    subscriptions.push(
      Disposable.from(
        useRouteTreeStore.getState().addRoutes([
          {
            id: "all-in-one-agent",
            path: "/all-in-one-agent",
            element: <AllInOneAgentPage />,
          },
        ])
      )
    );
    subscriptions.push(
      Disposable.from(
        connectRouterWithActivityBar([
          {
            activityKey: "all-in-one-agent",
            routerPath: "/all-in-one-agent",
          },
        ])
      )
    );
  },
}); 