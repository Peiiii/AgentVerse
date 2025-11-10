import { useEffect, useState } from "react";
import { discussionControlService } from "@/core/services/discussion-control.service";
import { DiscussionSettings } from "@/common/types/discussion";

export function useDiscussionSettings() {
  const [settings, setSettings] = useState<DiscussionSettings>(discussionControlService.getSettings());
  useEffect(() => {
    const sub = discussionControlService.getSettings$().subscribe(setSettings);
    return () => sub.unsubscribe();
  }, []);
  return settings;
}

