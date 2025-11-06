import { discussionControlService } from "@/core/services/discussion-control.service";
import type { AgentMessage } from "@/common/types/discussion";

// Manager wrapper for DiscussionControlService to expose actions via Presenter
export class DiscussionControlManager {
  // expose underlying rx-bean store for subscriptions (read-only usage pattern)
  store = discussionControlService.store;

  // state getters
  getCurrentDiscussionId = () => discussionControlService.getCurrentDiscussionId();
  isPaused = () => discussionControlService.isPaused();

  // actions
  setCurrentDiscussionId = (id: string | null) => discussionControlService.setCurrentDiscussionId(id);
  setMessages = (messages: AgentMessage[]) => discussionControlService.setMessages(messages);
  onMessage = (message: AgentMessage) => discussionControlService.onMessage(message);
  pause = () => discussionControlService.pause();
  resume = () => discussionControlService.resume();
  run = () => discussionControlService.run();

  // events
  onCurrentDiscussionIdChange$ = discussionControlService.onCurrentDiscussionIdChange$;
  onError$ = discussionControlService.onError$;
}

