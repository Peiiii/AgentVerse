import { DiscussionMarkdown } from "@/common/components/chat/markdown";
import { ActionDisplay } from "./components/action-display";
import { ActionComponentProps, MarkdownActionResults } from "./types";

interface MessageMarkdownContentProps {
  content: string;
  className?: string;
  actionResults?: MarkdownActionResults;
}

export function MessageMarkdownContent({
  content,
  className,
  actionResults,
}: MessageMarkdownContentProps) {
  return (
    <DiscussionMarkdown
      className={className}
      content={content}
      actionResults={actionResults}
    />
  );
}

export function Action({ data }: ActionComponentProps) {
  if (!data?.capability) {
    console.error("Invalid action data:", data);
    return null;
  }

  return (
    <ActionDisplay
      {...data}
      status={data.result?.status}
      result={data.result}
      error={data.result?.error}
    />
  );
}

// 导出类型
export type * from "./types";

// 导出组件
export { ActionDisplay } from "./components/action-display";
export { DefaultAction } from "./components/default-action";
export { SelectDisplay } from "./components/select-display";
export { SelectOptionItem } from "./components/select-option";
export { StatusIcon } from "./components/status-icon";
export { UserSelectAction } from "./components/action-user-select";
