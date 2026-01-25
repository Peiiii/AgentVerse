import { cn } from "@/common/lib/utils";
import { ToolInvocationSegment } from "@/common/types/discussion";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useState } from "react";

interface ToolResultListProps {
  invocations?: ToolInvocationSegment[];
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

export function ToolResultList({
  invocations,
  className,
}: ToolResultListProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const items = (invocations ?? []).filter(Boolean);
  if (items.length === 0) return null;

  return (
    <div className={cn("space-y-2 text-xs", className)}>
      {items.map((item, index) => {
        const status =
          item.status ??
          (item.error
            ? "error"
            : item.result !== undefined
              ? "success"
              : "pending");
        const statusLabel =
          status === "success" ? "成功" : status === "error" ? "失败" : "等待";
        const statusClass =
          status === "success"
            ? "text-emerald-600 dark:text-emerald-400"
            : status === "error"
              ? "text-rose-600 dark:text-rose-400"
              : "text-gray-400 dark:text-gray-500";
        const StatusIcon =
          status === "success"
            ? CheckCircle2
            : status === "error"
              ? XCircle
              : Loader2;
        const itemId = item.call.id || item.key || `${item.call.name}-${index}`;
        const isExpanded = Boolean(expanded[itemId]);

        return (
          <div
            key={`${itemId}-${index}`}
            className="rounded-md border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/40"
          >
            <button
              type="button"
              onClick={() =>
                setExpanded((prev) => ({
                  ...prev,
                  [itemId]: !prev[itemId],
                }))
              }
              aria-expanded={isExpanded}
              className="flex w-full items-center justify-between gap-2 px-2 py-1.5 text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400"
            >
              <span className="font-medium text-gray-600 dark:text-gray-300">
                {item.call.name}
              </span>
              <span className={cn("inline-flex items-center", statusClass)} title={statusLabel}>
                <StatusIcon
                  className={cn(
                    "h-3.5 w-3.5",
                    status === "pending" && "animate-spin"
                  )}
                />
                <span className="sr-only">{statusLabel}</span>
              </span>
              <span className="ml-auto text-[11px] text-gray-400 dark:text-gray-500">
                {isExpanded ? "收起" : "展开"}
              </span>
            </button>

            {isExpanded ? (
              <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 px-2 py-2">
                <div>
                  <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                    输入
                  </div>
                  <div className="mt-1 max-h-32 overflow-auto rounded-md bg-gray-50 dark:bg-gray-800/60">
                    <pre className="whitespace-pre-wrap break-words p-2 text-[12px] text-gray-700 dark:text-gray-200">
                      {stringifyToolResult(item.call.arguments ?? "-")}
                    </pre>
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                    输出
                  </div>
                  <div className="mt-1 max-h-32 overflow-auto rounded-md bg-gray-50 dark:bg-gray-800/60">
                    <pre className="whitespace-pre-wrap break-words p-2 text-[12px] text-gray-700 dark:text-gray-200">
                      {status === "success"
                        ? stringifyToolResult(item.result)
                        : status === "error"
                          ? stringifyToolResult(item.error ?? "Tool error")
                          : "等待结果"}
                    </pre>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
