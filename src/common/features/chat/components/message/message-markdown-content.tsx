import { Markdown } from "@/common/components/ui/markdown";

interface MessageMarkdownContentProps {
  content: string;
  className?: string;
}

export function MessageMarkdownContent({
  content,
  className,
}: MessageMarkdownContentProps) {
  return <Markdown content={content} className={className} />;
}
