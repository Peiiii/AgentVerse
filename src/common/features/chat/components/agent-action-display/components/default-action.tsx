import { ChevronDown, ChevronRight } from "lucide-react";
import { StatusIcon } from "./status-icon";

interface DefaultActionProps {
  description: string;
  status?: string;
  error?: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  debugInfo: Record<string, unknown>;
}

export function DefaultAction({
  description,
  status,
  error,
  isExpanded,
  onToggleExpand,
  debugInfo,
}: DefaultActionProps) {
  const isPending = !status || status === "pending" || status === "running";

  return (
    <div className="space-y-2 text-sm">
      <div 
        className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 p-2 -mx-2 rounded-md transition-colors group" 
        onClick={onToggleExpand}
      >
        <div className="flex-shrink-0 mt-1">
          <StatusIcon status={status} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-200">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-500" />
            )}
            <span className="font-medium">{description}</span>
          </div>
          
          {!isPending && status === "error" && (
            <div className="mt-1.5 ml-5">
              <div className="text-red-500 dark:text-red-400">
                {error || "执行失败"}
              </div>
            </div>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="ml-6 space-y-3 bg-gray-50 dark:bg-gray-800/50 rounded-md p-3 text-xs">
          <div className="text-gray-400 dark:text-gray-500 italic">
            调试信息
          </div>
          <pre className="bg-gray-100 dark:bg-gray-800 p-2.5 rounded-md overflow-auto text-gray-600 dark:text-gray-400 leading-relaxed">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 