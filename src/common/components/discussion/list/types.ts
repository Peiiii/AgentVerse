import { Discussion } from "@/common/types/discussion";

export interface DiscussionListProps {
  className?: string;
  headerClassName?: string;
  listClassName?: string;
  onSelectDiscussion?: (discussionId: string) => void;
}

export interface DiscussionItemProps {
  discussion: Discussion;
  isActive: boolean;
}
