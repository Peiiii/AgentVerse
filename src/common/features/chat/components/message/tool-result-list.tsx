import { cn } from "@/common/lib/utils";
import { ToolResultMessage } from "@/common/types/discussion";
import { useState } from "react";

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
  const [expanded, setExpanded] = useState(false);
  const results = toolResults ? Object.values(toolResults) : [];
  if (results.length === 0) return null;
  const errorCount = results.filter((item) => item.status === "error").length;

  const sorted = results.slice().sort((a, b) => {
    return (
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  });

  return (
    <div className={cn("text-xs", className)}>
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        className="flex w-full items-center gap-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/40 px-2 py-1.5 text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400"
      >
        <span className="font-medium text-gray-600 dark:text-gray-300">
          工具结果
        </span>
        <span className="text-[11px]">({results.length})</span>
        {errorCount > 0 && (
          <span className="text-[11px] text-rose-600 dark:text-rose-400">
            {errorCount} 个错误
          </span>
        )}
        <span className="ml-auto text-[11px] text-gray-400 dark:text-gray-500">
          {expanded ? "收起" : "展开"}
        </span>
      </button>

      {expanded ? (
        <div className="mt-2 max-h-56 space-y-2 overflow-auto pr-1">
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
      ) : null}
    </div>
  );
}
