import { useEffect, useState } from "react";
import { getPresenter } from "@/core/presenter/presenter";

export function useCurrentDiscussionId() {
  const discussionControl = getPresenter().discussionControl;
  const [id, setId] = useState<string | null>(
    discussionControl.getCurrentDiscussionId()
  );
  useEffect(() => {
    const sub = discussionControl.getCurrentDiscussionId$().subscribe(setId);
    return () => sub.unsubscribe();
  }, [discussionControl]);
  return id;
}
