import { Component, ErrorInfo, ReactNode } from "react";

interface MarkdownErrorBoundaryProps {
  children: ReactNode;
  content: string;
}

interface MarkdownErrorBoundaryState {
  hasError: boolean;
}

/**
 * Markdown 错误边界组件
 * 用于捕获 Markdown 渲染过程中的错误，并提供降级显示
 */
export class MarkdownErrorBoundary extends Component<
  MarkdownErrorBoundaryProps,
  MarkdownErrorBoundaryState
> {
  constructor(props: MarkdownErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Markdown rendering error:", error);
    console.error("Error details:", errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-sm whitespace-pre-wrap break-words text-gray-600 dark:text-gray-400">
          {this.props.content}
        </div>
      );
    }

    return this.props.children;
  }
} 