import type { DiscussionService } from "@/core/services/discussion.service";
import type { DiscussionControlService } from "@/core/services/discussion-control.service";
import type { DiscussionMemberService } from "@/core/services/discussion-member.service";

declare global {
  interface Window {
    discussionService: DiscussionService;
    discussionControlService: DiscussionControlService;
    discussionMemberService: DiscussionMemberService;
  }
}

export {};
