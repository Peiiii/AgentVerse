import { Button } from "@/common/components/ui/button";
import { cn } from "@/common/lib/utils";
import { Loader2, PlusCircle } from "lucide-react";
import { usePresenter } from "@/core/presenter";
import { useTranslation } from "@/core/hooks/use-i18n";

interface DiscussionListHeaderProps {
  className?: string;
  isLoading?: boolean;
  disabled?: boolean;
  onCreateDiscussion?: () => void;
}

export function DiscussionListHeader({
  className,
  isLoading,
  disabled,
  onCreateDiscussion,
}: DiscussionListHeaderProps) {
  const { t } = useTranslation();
  const presenter = usePresenter();
  const handleCreate = onCreateDiscussion ?? (() => presenter.discussions.create(t("discussion.new")));
  return (
    <header
      className={cn(
        "flex-none flex justify-between items-center sticky top-0",
        "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
        "py-3.5 px-3 border-b border-border/40 z-10",
        className
      )}
    >
      <h2 className="text-sm font-medium text-foreground/90">{t("discussion.sessionList")}</h2>
      <Button
        onClick={handleCreate}
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
        {t("discussion.createSession")}
      </Button>
    </header>
  );
} 
