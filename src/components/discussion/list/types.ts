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
  onClick: () => void;
  onRename: (title: string) => void;
  onDelete: () => void;
} 