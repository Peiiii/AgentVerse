import { Discussion } from "@/common/types/discussion";

export interface DiscussionListProps {
  className?: string;
  headerClassName?: string;
  listClassName?: string;
}

export interface DiscussionItemProps {
  discussion: Discussion;
  isActive: boolean;
}
