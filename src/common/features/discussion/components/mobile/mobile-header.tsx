import { Button } from "@/common/components/ui/button";
import { useDiscussionMembers } from "@/core/hooks/useDiscussionMembers";
import { cn } from "@/common/lib/utils";
import {
  Menu,
  MoreVertical,
  PauseCircle,
  PlayCircle,
  Users,
} from "lucide-react";
import { useState } from "react";
import { MobileActionSheet } from "./mobile-action-sheet";
import { useDiscussionControl } from "@/common/features/discussion/components/control/use-discussion-control";
import { useTranslation } from "@/core/hooks/use-i18n";

interface MobileHeaderProps {
  title?: string;
  onToggleSidebar?: () => void;
  className?: string;
  status?: "active" | "paused";
  onStatusChange?: (status: "active" | "paused") => void;
  onManageMembers?: () => void;
  onClearMessages?: () => void;
}

export function MobileHeader({
  title,
  onToggleSidebar,
  className,
  status = "paused",
  onStatusChange = () => {},
  onManageMembers = () => {},
  onClearMessages = () => {},
}: MobileHeaderProps) {
  const { t } = useTranslation();
  const displayTitle = title || t("mobile.discussionSystem");
  const [showActions, setShowActions] = useState(false);
  const isActive = status === "active";
  const { members } = useDiscussionMembers();
  const { handleStatusChange } = useDiscussionControl({ status });

  const toggleStatus = () => {
    handleStatusChange(!isActive);
    onStatusChange(isActive ? "paused" : "active");
  };

  return (
    <>
      <header
        className={cn(
          "h-14 max-w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:hidden",
          className
        )}
      >
        <div className="flex h-full items-center px-4 gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={onToggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-medium truncate">{displayTitle}</h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant={isActive ? "destructive" : "default"}
              size="icon"
              className="h-8 w-8"
              onClick={toggleStatus}
            >
              {isActive ? (
                <PauseCircle className="h-5 w-5" />
              ) : (
                <PlayCircle className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 relative",
                "hover:bg-accent hover:text-accent-foreground",
                "focus-visible:ring-1 focus-visible:ring-ring"
              )}
              onClick={() => {
                onManageMembers();
              }}
            >
              <Users className="h-5 w-5" />
              {members.length > 0 && (
                <span
                  className={cn(
                    "absolute -top-0.5 -right-0.5 flex items-center justify-center",
                    "min-w-[16px] h-4 px-1",
                    "text-[10px] font-medium leading-none",
                    "bg-primary text-primary-foreground",
                    "rounded-full",
                    "shadow-[0_0_0_2px] shadow-background"
                  )}
                >
                  {members.length}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowActions(true)}
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <MobileActionSheet
        open={showActions}
        onOpenChange={setShowActions}
        onClearMessages={onClearMessages}
      />
    </>
  );
}
