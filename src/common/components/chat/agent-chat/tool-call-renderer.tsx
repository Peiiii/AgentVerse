import { AgentToolRendererManagerContext, type ToolRenderer, type ToolResult } from '@agent-labs/agent-chat';
import type { ToolInvocation } from '@ai-sdk/ui-utils';
import * as React from 'react';
import { useContext } from 'react';

interface ToolCallRendererProps {
    toolInvocation: ToolInvocation; // 兼容UIMessage.parts中的toolInvocation结构
    toolRenderers?: Record<string, ToolRenderer>;
    onToolResult?: (result: ToolResult) => void;
}

export const ToolCallRenderer: React.FC<ToolCallRendererProps> = ({
    toolInvocation,
    onToolResult,
}) => {
    const toolRendererManager = useContext(AgentToolRendererManagerContext)
    const toolRenderers = Object.fromEntries(
        toolRendererManager
            .getToolRenderers()
            .map((renderer) => [renderer.definition.name, renderer]),
    )

    const renderer = toolRenderers[toolInvocation.toolName];

    if (renderer) {
        // 始终交给自定义UI渲染，传递完整toolInvocation对象，renderer内部自行解析state/result
        return (
            <div className="rounded-lg border bg-background p-2">
                {renderer.render(
                    {
                        id: toolInvocation.toolCallId,
                        type: 'function',
                        function: {
                            name: toolInvocation.toolName,
                            arguments: JSON.stringify(toolInvocation.args),
                        },
                    },
                    (result) => {
                        if (onToolResult) {
                            onToolResult(result);
                        }
                    }
                )}
            </div>
        );
    }

    // 没有renderer，降级为JSON
    return (
        <div className="rounded-lg border bg-background p-2">
            <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">工具调用</span>
                <span className="text-xs text-muted-foreground">{toolInvocation.toolName}</span>
            </div>
            <div className="rounded-md bg-muted p-2">
                <pre className="text-sm">
                    {JSON.stringify(toolInvocation, null, 2)}
                </pre>
            </div>
        </div>
    );
}; 