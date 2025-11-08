import { useSettingsDialog } from "@/common/features/settings/components/settings-dialog";
import { Button } from "@/common/components/ui/button";
import { cn } from "@/common/lib/utils";
import { Settings } from "lucide-react";

interface SettingsFeatureProps {
  className?: string;
}

export function SettingsFeature({ className }: SettingsFeatureProps) {
  const { openSettingsDialog } = useSettingsDialog();
  return (
    <>
      <Button
        variant="secondary"
        size="icon"
        className={cn("h-9 w-9 hover:bg-muted/80", className)}
        onClick={openSettingsDialog}
      >
        <Settings className="h-[1.2rem] w-[1.2rem]" />
      </Button>
    </>
  );
}
