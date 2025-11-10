import { useEffect } from "react";
import { usePresenter } from "@/core/presenter";
import { useSettingsDialog } from "./use-settings-dialog";

// Bridge component: listens to presenter.settings events and opens the dialog via UI modal hook.
// Keeps ActivityBar and other views generic and free from business/UI coupling.
export function SettingsDialogBridge() {
  const presenter = usePresenter();
  const { openSettingsDialog } = useSettingsDialog();

  useEffect(() => {
    const sub = presenter.settings.events.open.subscribe(() => openSettingsDialog());
    return () => sub.unsubscribe();
  }, [presenter, openSettingsDialog]);

  return null;
}

