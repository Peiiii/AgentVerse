import React, { createContext, useContext, useEffect, useMemo } from "react";
import { getPresenter, Presenter } from "@/core/presenter/presenter";
import { discussionControlService } from "@/core/services/discussion-control.service";

const PresenterContext = createContext<Presenter | null>(null);

export const PresenterProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  // use a stable singleton presenter instance
  const presenter = useMemo(() => getPresenter(), []);
  
  // Bootstrap global stores and sync with discussion control service
  useEffect(() => {
    // initial loads
    void presenter.agents.load();
    void presenter.discussions.load();

    const off = discussionControlService.onCurrentDiscussionIdChange$.listen(async () => {
      const id = discussionControlService.getCurrentDiscussionId();
      presenter.discussions.store.getState().setCurrentId(id);
      if (id) {
        await Promise.all([
          presenter.messages.loadForDiscussion(id),
          presenter.discussionMembers.load(id),
        ]);
      } else {
        presenter.messages.store.getState().setMessages([]);
        presenter.discussionMembers.store.getState().setMembers([]);
      }
    });
    // prime current selection
    const initId = discussionControlService.getCurrentDiscussionId();
    presenter.discussions.store.getState().setCurrentId(initId ?? null);
    if (initId) {
      void presenter.messages.loadForDiscussion(initId);
      void presenter.discussionMembers.load(initId);
    }

    return () => {
      off();
    };
  }, [presenter]);

  return <PresenterContext.Provider value={presenter}>{children}</PresenterContext.Provider>;
};

export const usePresenter = () => {
  const ctx = useContext(PresenterContext);
  // fallback to singleton to avoid null checks in non-wrapped callers (defensive)
  return ctx ?? getPresenter();
};
