import { Sheet, SheetContent } from "@/common/components/ui/sheet";
import { Button } from "@/common/components/ui/button";
import { Settings, Eraser, Moon, Sun, X } from "lucide-react";
import { useTheme } from "@/common/components/common/theme";
import { Separator } from "@/common/components/ui/separator";
import { cn } from "@/common/lib/utils";
import { useModal } from "@/common/components/ui/modal";
import { useSettingsDialog } from "@/common/features/settings/components/settings-dialog";

interface MobileActionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClearMessages: () => void;
}

export function MobileActionSheet({
  open,
  onOpenChange,
  onClearMessages,
}: MobileActionSheetProps) {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const modal = useModal();
  const { openSettingsDialog } = useSettingsDialog();

  const handleClearMessages = () => {
    modal.confirm({
      title: "清空消息",
      description: "确定要清空所有消息吗？此操作不可撤销。",
      okText: "确认清空",
      cancelText: "取消",
      onOk: () => {
        onClearMessages();
        onOpenChange(false);
      }
    });
  };

  const ActionItem = ({ 
    icon: Icon, 
    label, 
    onClick,
    className,
    destructive
  }: { 
    icon: React.ElementType;
    label: string;
    onClick: () => void;
    className?: string;
    destructive?: boolean;
  }) => (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start gap-3 h-12 text-base font-normal",
        destructive && "text-destructive hover:text-destructive",
        className
      )}
      onClick={onClick}
    >
      <Icon className="h-5 w-5" />
      {label}
    </Button>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom" 
        className="px-0 max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-6 pt-4 pb-2 border-b">
          <h2 className="text-lg font-medium">更多选项</h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-muted"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="px-2 py-1">
          <ActionItem
            icon={Settings}
            label="讨论设置"
            onClick={() => {
              openSettingsDialog();
              onOpenChange(false);
            }}
          />
          <ActionItem
            icon={isDarkMode ? Sun : Moon}
            label={isDarkMode ? "切换到浅色模式" : "切换到深色模式"}
            onClick={() => {
              toggleDarkMode();
              onOpenChange(false);
            }}
          />
          <Separator className="my-2" />
          <ActionItem
            icon={Eraser}
            label="清空消息"
            onClick={handleClearMessages}
            destructive
          />
        </div>
      </SheetContent>
    </Sheet>
  );
} 