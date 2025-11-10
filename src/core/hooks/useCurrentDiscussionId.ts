import { useEffect, useState } from "react";
import { discussionControlService } from "@/core/services/discussion-control.service";

export function useCurrentDiscussionId() {
  const [id, setId] = useState<string | null>(discussionControlService.getCurrentDiscussionId());
  useEffect(() => {
    const sub = discussionControlService.getCurrentDiscussionId$().subscribe(setId);
    return () => sub.unsubscribe();
  }, []);
  return id;
}
