import { DialogTitle } from "@/common/components/ui/dialog";
import { SettingsPanel } from "../settings-panel";
import { Button } from "@/common/components/ui/button";
import { RotateCcw } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/common/components/ui/alert-dialog";
import { useState } from "react";
import { recoverDefaultSettings, settingsResource } from "@/core/resources/settings.resource";
import { useTranslation } from "@/core/hooks/use-i18n";

export function SettingsDialogContent() {
  const { t } = useTranslation();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleReset = async () => {
    await recoverDefaultSettings();
    await settingsResource.list.reload();
    setShowResetConfirm(false);
  };

  return (
    <>
      <DialogTitle
        className="flex items-center justify-between pr-12"
        style={{
          marginTop: "-30px",
        }}
      >
        <span className="text-lg font-medium">{t("settings.title")}</span>{" "}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowResetConfirm(true)}
          className="text-muted-foreground text-xs hover:text-primary flex items-center gap-2 mr-3"
        >
          <RotateCcw className="h-3 w-3" />
          {t("settings.resetToDefault")}
        </Button>
      </DialogTitle>
      <SettingsPanel />

      <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("settings.resetConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("settings.resetConfirmDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset}>{t("settings.resetConfirmAction")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 