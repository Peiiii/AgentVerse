import { cn } from "@/common/lib/utils";

type DiscussionStatus = "active" | "paused";

interface StatusIndicatorProps {
  status: DiscussionStatus;
  className?: string;
}

export function StatusIndicator({ status, className }: StatusIndicatorProps) {
  const statusText = status === "paused" ? "已暂停" : "讨论中";
  
  return (
    <span
      className={cn(
        "text-sm px-2.5 py-1.5 rounded-md transition-colors duration-200",
        status === "paused"
          ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
          : "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400",
        className
      )}
    >
      {statusText}
    </span>
  );
} 