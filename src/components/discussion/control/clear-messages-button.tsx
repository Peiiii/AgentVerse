import { Button } from "@/components/ui/button";
import { useModal } from "@/components/ui/modal";
import { useDiscussions } from "@/core/hooks/useDiscussions";
import { cn } from "@/common/lib/utils";
import { Eraser } from "lucide-react";

interface ClearMessagesButtonProps {
  className?: string;
  variant?: "default" | "outline" | "ghost" | "secondary" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  mode?: "current" | "all";
}

export function ClearMessagesButton({
  className,
  variant = "ghost",
  size = "sm",
  mode = "current"
}: ClearMessagesButtonProps) {
  const { currentDiscussion, clearMessages, clearAllMessages } = useDiscussions();
  const modal = useModal();

  // 如果是清空当前会话且没有当前会话，则不显示
  if (mode === "current" && !currentDiscussion) return null;

  const handleClick = () => {
    modal.confirm({
      title: mode === "current" ? "清空当前会话" : "清空所有会话",
      description: mode === "current" 
        ? "此操作将清空当前会话的所有消息记录，此操作不可撤销。"
        : "此操作将清空所有会话的全部消息记录，此操作不可撤销。",
      okText: "确认清空",
      cancelText: "取消",
      onOk: () => {
        if (mode === "current" && currentDiscussion) {
          clearMessages(currentDiscussion.id);
        } else if (mode === "all") {
          clearAllMessages();
        }
      }
    });
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={cn(
        "text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors",
        className
      )}
    >
      {size === "icon" ? (
        <Eraser className="h-5 w-5" />
      ) : (
        <>
          <Eraser className="h-4 w-4 mr-2" />
          {mode === "current" ? "清空消息" : "清空所有"}
        </>
      )}
    </Button>
  );
}
