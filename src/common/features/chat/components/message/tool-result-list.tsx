import { cn } from "@/common/lib/utils";
import type { ToolCall } from "@/common/lib/ai-service";
import { ToolResultMessage } from "@/common/types/discussion";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useState } from "react";

interface ToolResultListProps {
  toolCalls?: ToolCall[];
  toolResults?: Record<string, ToolResultMessage>;
  className?: string;
}

type ToolRenderItem = {
  id: string;
  name: string;
  args?: Record<string, unknown>;
  result?: ToolResultMessage;
};

const stringifyToolResult = (value: unknown) => {
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value ?? {}, null, 2);
  } catch {
    return String(value);
  }
};

export function ToolResultList({
  toolCalls,
  toolResults,
  className,
}: ToolResultListProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const results = toolResults ? Object.values(toolResults) : [];
  const hasCalls = Boolean(toolCalls?.length);
  if (!hasCalls && results.length === 0) return null;

  let items: ToolRenderItem[] = hasCalls
    ? toolCalls!.map((call) => ({
        id: call.id,
        name: call.name,
        args: call.arguments,
        result: toolResults?.[call.id],
      }))
    : results
        .slice()
        .sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )
        .map((result) => ({
          id: result.toolCallId,
          name: result.toolName,
          args: undefined,
          result,
        }));

  if (hasCalls && results.length > 0) {
    const existing = new Set(items.map((item) => item.id));
    const extras: ToolRenderItem[] = results
      .filter((result) => !existing.has(result.toolCallId))
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )
      .map((result) => ({
        id: result.toolCallId,
        name: result.toolName,
        result,
      }));
    items = [...items, ...extras];
  }

  return (
    <div className={cn("space-y-2 text-xs", className)}>
      {items.map((item) => {
        const status = item.result?.status ?? "pending";
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
        const isExpanded = Boolean(expanded[item.id]);

        return (
          <div
            key={item.id}
            className="rounded-md border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/40"
          >
            <button
              type="button"
              onClick={() =>
                setExpanded((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
              }
              aria-expanded={isExpanded}
              className="flex w-full items-center justify-between gap-2 px-2 py-1.5 text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400"
            >
              <span className="font-medium text-gray-600 dark:text-gray-300">
                {item.name}
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
                      {stringifyToolResult(item.args ?? "-")}
                    </pre>
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                    输出
                  </div>
                  <div className="mt-1 max-h-32 overflow-auto rounded-md bg-gray-50 dark:bg-gray-800/60">
                    <pre className="whitespace-pre-wrap break-words p-2 text-[12px] text-gray-700 dark:text-gray-200">
                      {item.result
                        ? item.result.status === "success"
                          ? stringifyToolResult(item.result.result)
                          : stringifyToolResult(item.result.error ?? "Tool error")
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
