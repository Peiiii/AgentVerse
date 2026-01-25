import type { PropsWithChildren } from "react";
import { cn } from "@/common/lib/utils";

interface AuthShellProps {
  className?: string;
}

export function AuthShell({ children, className }: PropsWithChildren<AuthShellProps>) {
  return (
    <div className={cn("flex-1 min-h-0 flex items-center justify-center p-6", className)}>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
