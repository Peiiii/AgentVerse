import { Loader2 } from "lucide-react";

interface StatusIconProps {
  status?: string;
}

export function StatusIcon({ status }: StatusIconProps) {
  switch (status) {
    case "pending":
    case "running":
      return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
    case "success":
      return (
        <span className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
          ✓
        </span>
      );
    case "error":
      return (
        <span className="w-4 h-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
          !
        </span>
      );
    default:
      return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
  }
} 