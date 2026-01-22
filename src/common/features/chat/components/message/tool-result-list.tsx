import { cn } from "@/common/lib/utils";
import { ToolResultMessage } from "@/common/types/discussion";

interface ToolResultListProps {
  toolResults?: Record<string, ToolResultMessage>;
  className?: string;
}

const stringifyToolResult = (value: unknown) => {
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value ?? {}, null, 2);
  } catch {
    return String(value);
  }
};

export function ToolResultList({ toolResults, className }: ToolResultListProps) {
  if (!toolResults) return null;
  const results = Object.values(toolResults);
  if (results.length === 0) return null;

  const sorted = results.slice().sort((a, b) => {
    return (
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  });

  return (
    <div className={cn("space-y-2 text-xs", className)}>
      {sorted.map((result) => {
        const statusText = result.status === "success" ? "success" : "error";
        const statusClass =
          result.status === "success"
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-rose-600 dark:text-rose-400";
        return (
          <div
            key={result.toolCallId}
            className="rounded-md border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/40 p-2"
          >
            <div className="flex items-center justify-between gap-2 text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
              <span className="font-medium">{result.toolName}</span>
              <span className={statusClass}>{statusText}</span>
            </div>
            <pre className="mt-1 whitespace-pre-wrap break-words text-[12px] text-gray-700 dark:text-gray-200">
              {result.status === "success"
                ? stringifyToolResult(result.result)
                : stringifyToolResult(result.error ?? "Tool error")}
            </pre>
          </div>
        );
      })}
    </div>
  );
}
