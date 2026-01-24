import type { AgentTool } from "@/common/hooks/use-provide-agent-tools";
import { AgentDef } from "@/common/types/agent";
import type { ToolCall } from "@agent-labs/agent-chat";
import { useMemo, useState } from "react";

interface AgentUpdateArgs {
  name: string;
  prompt: string;
  personality: string;
  role: "participant" | "moderator";
  expertise?: string[];
  tags?: string[];
  bias?: string;
  responseStyle?: string;
  avatar?: string;
}

interface ToolInvocationLike {
  id: string;
  function: {
    arguments: string;
  };
}

function AgentUpdateResult({ args }: { args: AgentUpdateArgs }) {
  const [expanded, setExpanded] = useState(false);
  const expertiseList = Array.isArray(args.expertise) ? args.expertise : [];
  const expertisePreview = expertiseList.slice(0, 2).join('、');
  const hasMoreExpertise = expertiseList.length > 2;
  const tagList = Array.isArray(args.tags) ? args.tags : [];

  return (
    <div className="p-4 border rounded-lg bg-muted mt-2">
      <div className="flex items-center gap-3 mb-2">
        <img src={args.avatar} alt={args.name} className="w-10 h-10 rounded-full border" />
        <div>
          <div className="font-bold text-base">{args.name}</div>
          <div className="text-xs text-muted-foreground">{args.role === 'moderator' ? '主持人' : '参与者'}</div>
        </div>
      </div>
      <div className="text-sm mb-1"><b>性格：</b>{args.personality}</div>
      <div className="text-sm mb-1">
        <b>专业领域：</b>
        {expertisePreview}
        {hasMoreExpertise && !expanded && <span className="text-xs text-blue-500 cursor-pointer ml-1" onClick={() => setExpanded(true)}>...展开</span>}
        {expanded && expertiseList.length > 2 && (
          <span className="ml-1">、{expertiseList.slice(2).join('、')}</span>
        )}
      </div>
      {tagList.length > 0 && (
        <div className="text-sm mb-1"><b>标签：</b>{tagList.join('、')}</div>
      )}
      <div className="text-sm mb-1"><b>风格：</b>{args.responseStyle}</div>
      {expanded && (
        <div className="mt-2 text-xs text-muted-foreground space-y-1">
          <div><b>系统提示词：</b>{args.prompt}</div>
          {args.bias && <div><b>偏好：</b>{args.bias}</div>}
          <div><b>头像链接：</b><a href={args.avatar} target="_blank" rel="noopener noreferrer" className="underline text-blue-500">{args.avatar}</a></div>
        </div>
      )}
      <div className="flex items-center mt-2">
        {expanded && <button className="text-xs text-blue-500 underline mr-2" onClick={() => setExpanded(false)}>收起</button>}
        <span className="text-xs text-muted-foreground">已成功创建/更新智能体配置！</span>
      </div>
    </div>
  );
}

export function createUpdateAgentTool(onAgentCreate?: (agent: Omit<AgentDef, "id">) => void): AgentTool {
  interface UpdateAgentToolResult {
    toolCallId: string;
    result: { confirmed: boolean } & AgentUpdateArgs;
    status: "success";
  }
  function UpdateAgentToolRender({ toolInvocation, onResult }: { toolInvocation: ToolInvocationLike; onResult: (result: UpdateAgentToolResult) => void }) {
    const args: AgentUpdateArgs = useMemo(() => {
      try {
        return JSON.parse(toolInvocation.function.arguments);
      } catch {
        return {
          name: '', prompt: '', personality: '', role: 'participant', expertise: [], bias: '', responseStyle: '', avatar: ''
        };
      }
    }, [toolInvocation.function.arguments]);
    useMemo(() => {
      setTimeout(() => {
        onResult({
          toolCallId: toolInvocation.id,
          result: { confirmed: true, ...args },
          status: "success",
        });
      }, 300);
    }, [args, onResult, toolInvocation.id]);
    return <AgentUpdateResult args={args} />;
  }
  return {
    name: "updateAgent",
    description: "更新或创建智能体配置。当用户要求创建或修改智能体时使用此工具。",
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "智能体的名称"
        },
        prompt: {
          type: "string",
          description: "智能体的系统提示词，定义其行为和角色"
        },
        personality: {
          type: "string",
          description: "智能体的性格特征，如友善、专业、幽默等"
        },
        role: {
          type: "string",
          enum: ["participant", "moderator"],
          description: "智能体的角色类型：participant（参与者）或moderator（主持人）"
        },
        expertise: {
          type: "array",
          items: {
            type: "string"
          },
          description: "智能体的专业技能和知识领域列表"
        },
        tags: {
          type: "array",
          items: {
            type: "string"
          },
          description: "智能体标签列表，用于路由或分类"
        },
        bias: {
          type: "string",
          description: "智能体的倾向性或偏好"
        },
        responseStyle: {
          type: "string",
          description: "智能体的回应风格，如正式、casual、技术性等"
        },
        avatar: {
          type: "string",
          description: "智能体头像URL（可选）"
        }
      },
      required: ["name", "prompt", "personality", "role"]
    },
    async execute(toolCall: ToolCall) {
      try {
        const args = JSON.parse(toolCall.function.arguments);
        const agentConfig: Omit<AgentDef, "id"> = {
          name: args.name,
          prompt: args.prompt,
          personality: args.personality,
          role: args.role,
          expertise: args.expertise || [],
          tags: Array.isArray(args.tags) ? args.tags : [],
          bias: args.bias || "",
          responseStyle: args.responseStyle || "友好专业",
          avatar: args.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(args.name)}`,
        };
        if (onAgentCreate) {
          onAgentCreate(agentConfig);
        }
        return {
          toolCallId: toolCall.id,
          result: {
            success: true,
            message: `智能体 "${args.name}" 已成功创建！配置已应用。`,
            agentConfig: agentConfig
          },
          status: "success" as const
        };
      } catch (error) {
        console.error("更新agent失败:", error);
        return {
          toolCallId: toolCall.id,
          result: {
            success: false,
            message: `更新智能体失败: ${error instanceof Error ? error.message : "未知错误"}`,
            error: error
          },
          status: "error" as const
        };
      }
    },
    render: (toolInvocation, onResult) => <UpdateAgentToolRender toolInvocation={toolInvocation} onResult={onResult} />,
  };
} 
