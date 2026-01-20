import { useEffect, useState } from "react";
import type { Snapshot } from "@/core/managers/discussion-control.manager";
import { getPresenter } from "@/core/presenter/presenter";

export function useDiscussionSnapshot() {
  const discussionControl = getPresenter().discussionControl;
  const [snap, setSnap] = useState<Snapshot>(
    discussionControl.getSnapshot()
  );
  useEffect(() => {
    const sub = discussionControl.getSnapshot$().subscribe(setSnap);
    return () => sub.unsubscribe();
  }, [discussionControl]);
  return snap;
}

export function useIsPaused() {
  const snap = useDiscussionSnapshot();
  return !snap.isRunning;
}
