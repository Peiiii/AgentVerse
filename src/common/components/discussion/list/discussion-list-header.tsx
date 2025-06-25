import { Button } from "@/common/components/ui/button";
import { cn } from "@/common/lib/utils";
import { Loader2, PlusCircle } from "lucide-react";

interface DiscussionListHeaderProps {
  className?: string;
  isLoading?: boolean;
  disabled?: boolean;
  onCreateDiscussion: () => void;
}

export function DiscussionListHeader({
  className,
  isLoading,
  disabled,
  onCreateDiscussion
}: DiscussionListHeaderProps) {
  return (
    <header
      className={cn(
        "flex-none flex justify-between items-center sticky top-0",
        "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
        "py-3.5 px-3 border-b border-border/40 z-10",
        className
      )}
    >
      <h2 className="text-sm font-medium text-foreground/90">会话列表</h2>
      <Button
        onClick={onCreateDiscussion}
        variant="outline"
        size="sm"
        disabled={isLoading || disabled}
        className="h-7 px-2.5 text-xs hover:bg-muted/50"
      >
        {isLoading ? (
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
        ) : (
          <PlusCircle className="w-3 h-3 mr-1" />
        )}
        新建会话
      </Button>
    </header>
  );
} 