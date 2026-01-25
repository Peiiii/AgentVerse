import { cn } from "@/common/lib/utils";
import type { MessageSegment, MessageWithTools } from "@/common/types/discussion";
import { MessageMarkdownContent } from "./message-markdown-content";
import { ToolResultList } from "./tool-result-list";

interface MessageContentBlocksProps {
  message: MessageWithTools;
  className?: string;
}

const hasSegments = (segments?: MessageSegment[]) =>
  Boolean(segments && segments.length > 0);

export function MessageContentBlocks({
  message,
  className,
}: MessageContentBlocksProps) {
  const segments = message.segments;

  if (!hasSegments(segments)) {
    return (
      <div className={cn("space-y-2", className)}>
        <MessageMarkdownContent content={message.content} />
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {segments!.map((segment, index) => {
        if (segment.type === "text") {
          if (!segment.content) return null;
          return (
            <MessageMarkdownContent
              key={`text-${index}`}
              content={segment.content}
            />
          );
        }
        return (
          <ToolResultList
            key={`${segment.key || segment.call.id || "tool"}-${index}`}
            invocations={[segment]}
          />
        );
      })}
    </div>
  );
}
