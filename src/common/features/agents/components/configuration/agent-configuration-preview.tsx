// 智能体配置预览组件
interface AgentConfigArgs {
  name: string;
  role: string;
  personality: string;
  expertise?: string[];
  prompt: string;
  responseStyle?: string;
}

export function AgentConfigurationPreview({ args }: { args: AgentConfigArgs }) {
  return (
    <div className="p-4 border rounded-lg bg-gradient-to-br from-violet-50 to-blue-50 dark:from-violet-900/60 dark:to-blue-900/60 shadow dark:border-gray-700">
      <h3 className="font-bold mb-2 text-violet-700 dark:text-violet-200 flex items-center gap-2">
        🪄 智能体配置预览
      </h3>
      <div className="mb-2 text-sm text-gray-700 dark:text-gray-200">
        <strong>名称：</strong>{args.name}<br />
        <strong>角色：</strong>{args.role}<br />
        <strong>性格：</strong>{args.personality}<br />
        <strong>技能：</strong>{Array.isArray(args.expertise) ? args.expertise.join("、") : "-"}<br />
        <strong>系统提示：</strong><span className="break-all">{args.prompt}</span><br />
        <strong>回应风格：</strong>{args.responseStyle || "-"}<br />
      </div>
      <div className="text-center text-xs text-gray-400 dark:text-gray-500 mt-2">AI已自动确认创建，无需手动操作</div>
    </div>
  );
} 