## AI 接口层（实际可用的能力调用格式）

````markdown
模型在需要调用工具时，必须输出一个 `:::action … :::` 区块：

:::action
{
  "operationId": "searchFiles_482910_0",
  "capability": "searchFiles",
  "description": "让我搜索一下相关文件",
  "params": {
    "query": "*.ts"
  }
}
:::
````

字段含义：

- `operationId`：唯一 ID，通常按照 `{capability}_{timestamp}_{sequence}` 生成。
- `capability`：要调用的系统能力名称，必须存在于 `CapabilityRegistry`。
- `description`：自然语言描述本次操作的目的，便于人类理解。
- `params`：传入能力的参数对象，可为空对象。

> ⚠️ 当前实现**仅支持**上述线性语法。`<flow>`、`<action-group>`、`await` 等扩展语法尚未实现，也不会被解析。

## 内部实现

```ts
interface ActionDef {
  operationId: string;
  type: "action";
  capability: string;
  description: string;
  params: Record<string, unknown>;
  await?: boolean; // 预留字段，当前执行器不会使用
}

class ActionParser {
  parse(content: string): ActionParseResult<ActionDef>[] {
    const actionRegex = /:::action(?:\s+|\s*\n)([\s\S]*?)(?:\s*\n|)\s*:::\s*/g;
    // 每个 :::action 块被单独解析为 ActionDef
  }
}

class DefaultActionExecutor {
  async execute(actions: ActionParseResult[], registry: CapabilityRegistry) {
    // 顺序执行解析到的每个 ActionDef
    // 成功/失败结果会被包装为 action_result 消息写回消息流
  }
}
```

执行流程：

1. `ActionParser` 顺序扫描消息内容中的每个 `:::action` 块。
2. 解析得到的 `ActionDef` 会被 `DefaultActionExecutor` 依次执行。
3. 每条 action 的 `result`/`error`、`status` 等会写入一条新的 `action_result` 系统消息。
4. 目前没有并发、流程控制、嵌套等高级语义，模型不应该输出这些标记。

## 行为约束

- 能力调用前后需要用自然语言解释目的及后续计划。
- 一次消息可以包含多个 `:::action` 区块，但它们会按出现顺序依次执行。
- 在 `action_result` 返回前不要继续下一步推理或重复调用相同能力。
- 如果系统提示权限不足或出现解析错误，应改为自然语言沟通并等待进一步指示。
