// action-parser.ts

export interface ActionParseResult<T = FlowDef | ActionGroupDef | ActionDef> {
  raw: string;
  parsed?: T;
  error?: string;
}

export interface ActionDef {
  operationId: string;
  type: "action";
  capability: string;
  description: string; // GPT生成的操作描述
  params: Record<string, unknown>;
  await?: boolean;
}

export interface ActionGroupDef {
  type: "action-group";
  actions: ActionParseResult<ActionDef>[];
  await?: boolean;
}

export interface FlowDef {
  type: "flow";
  operations: ActionParseResult<ActionDef | ActionGroupDef>[];
  await?: boolean;
}

export class ActionParser {
  parse(content: string): ActionParseResult[] {
    const operations: ActionParseResult[] = [];

    // 匹配 :::action 语法，支持内联和多行格式：
    // 1. :::action 后可以是空格或换行
    // 2. 结束的 ::: 前可以是空格或换行
    // 3. 使用非贪婪匹配确保正确匹配嵌套的情况
    const actionRegex = /:::action(?:\s+|\s*\n)([\s\S]*?)(?:\s*\n|)\s*:::\s*/g;
    let match;

    while ((match = actionRegex.exec(content)) !== null) {
      const jsonContent = match[1].trim();
      try {
        const parsed = JSON.parse(jsonContent);
        if (!parsed.operationId) {
          throw new Error("Missing required field: operationId");
        }
        if (!parsed.description) {
          throw new Error("Missing required field: description");
        }
        operations.push({
          raw: jsonContent,
          parsed: {
            type: "action",
            ...parsed,
            await: Boolean(parsed.await),
          },
        });
      } catch (error) {
        operations.push({
          raw: jsonContent,
          error: `Failed to parse action: ${error}`,
        });
      }
    }

    return operations;
  }
}
