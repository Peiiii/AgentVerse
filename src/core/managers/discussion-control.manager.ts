import type { AgentMessage, DiscussionSettings } from "@/common/types/discussion";
import { discussionControlService } from "@/core/services/discussion-control.service";

type DiscussionMember = { agentId: string; isAutoReply: boolean };

export class DiscussionControlManager {
  readonly onError$ = discussionControlService.onError$;
  readonly onCurrentDiscussionIdChange$ =
    discussionControlService.onCurrentDiscussionIdChange$;

  getSettings = () => discussionControlService.getSettings();
  getSettings$ = () => discussionControlService.getSettings$();
  getSnapshot = () => discussionControlService.getSnapshot();
  getSnapshot$ = () => discussionControlService.getSnapshot$();
  getCurrentDiscussionId = () =>
    discussionControlService.getCurrentDiscussionId();
  getCurrentDiscussionId$ = () =>
    discussionControlService.getCurrentDiscussionId$();
  isPaused = () => discussionControlService.isPaused();

  setCurrentDiscussionId = (id: string | null) =>
    discussionControlService.setCurrentDiscussionId(id);
  setMembers = (members: DiscussionMember[]) =>
    discussionControlService.setMembers(members);
  setSettings = (settings: Partial<DiscussionSettings>) =>
    discussionControlService.setSettings(settings);

  pause = () => discussionControlService.pause();
  resume = () => discussionControlService.resume();
  startIfEligible = () => discussionControlService.startIfEligible();
  run = () => discussionControlService.run();
  process = (message: AgentMessage) => discussionControlService.process(message);
}
