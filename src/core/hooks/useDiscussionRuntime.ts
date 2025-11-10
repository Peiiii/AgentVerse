import { useEffect, useState } from "react";
import { discussionControlService } from "@/core/services/discussion-control.service";
import type { Snapshot } from "@/core/services/discussion-control.service";

export function useDiscussionSnapshot() {
  const [snap, setSnap] = useState<Snapshot>(discussionControlService.getSnapshot());
  useEffect(() => {
    const sub = discussionControlService.getSnapshot$().subscribe(setSnap);
    return () => sub.unsubscribe();
  }, []);
  return snap;
}

export function useIsPaused() {
  const snap = useDiscussionSnapshot();
  return !snap.isRunning;
}

