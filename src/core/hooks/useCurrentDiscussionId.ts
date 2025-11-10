import { useEffect, useState } from "react";
import { discussionControlService } from "@/core/services/discussion-control.service";

export function useCurrentDiscussionId() {
  const [id, setId] = useState<string | null>(discussionControlService.getCurrentDiscussionId());
  useEffect(() => {
    const off = discussionControlService.onCurrentDiscussionIdChange$.listen((next) => setId(next));
    return () => off();
  }, []);
  return id;
}

