import type { Root as MdastRoot, Paragraph, Parent, PhrasingContent, Link } from "mdast";
import { visit } from "unist-util-visit";
import { ActionData, MarkdownActionResults } from "../types";

interface RemarkActionOptions {
  actionResults?: MarkdownActionResults;
}

/**
 * 将节点内容转换为文本
 */
function nodeToText(node: PhrasingContent): string {
  if (node.type === 'text') {
    return node.value;
  }
  if (node.type === 'link') {
    const link = node as Link;
    const text = link.children.map(child => nodeToText(child)).join('');
    return `[${text}](${link.url})`;
  }
  return '';
}

/**
 * 处理包含 action 的内容
 */
function processActionContent(
  content: string,
  actionResults: MarkdownActionResults
): PhrasingContent[] {
  const actionRegex = /:::action(\s*)([\s\S]*?)(\s*):::\s*/g;
  let match;
  let lastIndex = 0;
  const nodes: PhrasingContent[] = [];

  while ((match = actionRegex.exec(content)) !== null) {
    // 添加 action 之前的文本
    if (match.index > lastIndex) {
      nodes.push({
        type: 'text',
        value: content.slice(lastIndex, match.index)
      });
    }

    const jsonContent = match[2].trim();
    try {
      const parsed = JSON.parse(jsonContent);
      if (!parsed.operationId) {
        throw new Error("Missing required field: operationId");
      }
      if (!parsed.description) {
        throw new Error("Missing required field: description");
      }
      const result = actionResults[parsed.operationId];


      const actionData: ActionData = {
        operationId: parsed.operationId,
        capability: parsed.capability,
        description: parsed.description,
        params: parsed.params || {},
        await: Boolean(parsed.await),
        result: result
      };

      const actionNode: PhrasingContent = {
        type: 'action',
        value: JSON.stringify({
          ...actionData,
          actionResults,
        }),
        data: {
          ...actionData,
          actionResults,
          hName: 'action',
          hProperties: {
            value: JSON.stringify(actionData),
            data: actionData
          }
        }
      } as unknown as PhrasingContent;

      nodes.push(actionNode);
    } catch (err) {
      console.error('Failed to parse action:', err);
      // 如果解析失败，保留原始文本
      nodes.push({
        type: 'text',
        value: match[0]
      });
    }

    lastIndex = match.index + match[0].length;
  }

  // 添加剩余的文本
  if (lastIndex < content.length) {
    nodes.push({
      type: 'text',
      value: content.slice(lastIndex)
    });
  }

  return nodes;
}

/**
 * 自定义 remark 插件，用于处理 action 语法
 * 将 :::action {...} ::: 语法转换为 action 节点
 */
export function remarkAction(options: RemarkActionOptions = {}) {
  return (tree: MdastRoot) => {
    const actionResults = options.actionResults || {};
    
    visit(tree, 'paragraph', (node: Paragraph, index: number|undefined, parent?: Parent) => {
      if (!parent || typeof index !== 'number') return;

      // 合并所有子节点的内容
      const fullContent = node.children.map(child => nodeToText(child)).join('');

      // 如果不包含 action 标记，保持原样
      if (!fullContent.includes(':::action')) {
        return;
      }

      // 处理包含 action 的内容
      const newNodes = processActionContent(fullContent, actionResults);
      
      // 替换原节点的子节点
      node.children = newNodes;
    });
  };
} 