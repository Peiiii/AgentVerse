import { Sheet, SheetContent } from "@/common/components/ui/sheet";
import { Button } from "@/common/components/ui/button";
import { Eraser, Moon, Sun, X } from "lucide-react";
import { useTheme } from "@/common/components/common/theme";
import { Separator } from "@/common/components/ui/separator";
import { cn } from "@/common/lib/utils";
import { useModal } from "@/common/components/ui/modal";
import { useTranslation } from "@/core/hooks/use-i18n";

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
  const { t } = useTranslation();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const modal = useModal();

  const handleClearMessages = () => {
    modal.confirm({
      title: t("discussion.clearMessagesTitle"),
      description: t("discussion.clearMessagesDescription"),
      okText: t("discussion.clearMessagesConfirm"),
      cancelText: t("common.cancel"),
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
          <h2 className="text-lg font-medium">{t("common.moreOptions")}</h2>
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
            icon={isDarkMode ? Sun : Moon}
            label={isDarkMode ? t("theme.switchToLight") : t("theme.switchToDark")}
            onClick={() => {
              toggleDarkMode();
              onOpenChange(false);
            }}
          />
          <Separator className="my-2" />
          <ActionItem
            icon={Eraser}
            label={t("discussion.clearMessages")}
            onClick={handleClearMessages}
            destructive
          />
        </div>
      </SheetContent>
    </Sheet>
  );
} 
