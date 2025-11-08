import type { Root as MdastRoot } from "mdast";
import { visit } from "unist-util-visit";
import { ActionData, ActionNode } from "../types";

/**
 * 自定义 remark 插件，用于处理 mdast 到 hast 的转换
 * 将 action 节点转换为 HTML 元素
 */
export function remarkMdastToHast() {
  return (tree: MdastRoot) => {
    visit(tree, "action", (node: ActionNode) => {
      const actionData: ActionData = {
        operationId: node.data.operationId,
        capability: node.data.capability,
        description: node.data.description,
        params: node.data.params,
        await: node.data.await,
        result: node.data.actionResults?.[node.data.operationId]
      };

      node.data = {
        ...actionData,
        actionResults: node.data.actionResults,
        hName: "action",
        hProperties: {
          value: node.value,
          data: actionData
        }
      };
    });
  };
} 