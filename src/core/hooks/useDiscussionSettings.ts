import { useEffect, useState } from "react";
import { DiscussionSettings } from "@/common/types/discussion";
import { getPresenter } from "@/core/presenter/presenter";

export function useDiscussionSettings() {
  const discussionControl = getPresenter().discussionControl;
  const [settings, setSettings] = useState<DiscussionSettings>(
    discussionControl.getSettings()
  );
  useEffect(() => {
    const sub = discussionControl.getSettings$().subscribe(setSettings);
    return () => sub.unsubscribe();
  }, [discussionControl]);
  return settings;
}
