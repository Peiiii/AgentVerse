import { Avatar, AvatarFallback, AvatarImage } from "@/common/components/ui/avatar";
import { cn } from "@/common/lib/utils";
import {
  ITypingIndicator as TypingIndicatorType,
  TypingStatus
} from "@/core/services/typing-indicator.service";

export interface TypingIndicatorProps {
  /**
   * 获取成员名称的函数
   */
  getMemberName: (memberId: string) => string;
  /**
   * 获取成员头像的函数
   */
  getMemberAvatar: (memberId: string) => string;
  /**
   * 自定义类名
   */
  className?: string;
  /**
   * 自定义容器类名
   */
  containerClassName?: string;
  /**
   * 输入状态指示器数据
   * 可选参数,如果不提供则使用内部状态管理
   */
  indicators: Map<string, TypingIndicatorType>;
}

/**
 * 输入状态指示器组件
 * 可以独立使用，也可以集成到消息列表中
 */
export function TypingIndicator({
  getMemberName,
  getMemberAvatar,
  className,
  containerClassName,
  indicators
}: TypingIndicatorProps) {

  if (indicators.size === 0) return null;

  // 对状态进行分组
  const groupedIndicators = Array.from(indicators.values()).reduce(
    (groups, indicator) => {
      const { status } = indicator;
      if (status) {
        // 只处理非空状态
        if (!groups[status]) {
          groups[status] = [];
        }
        groups[status].push(indicator);
      }
      return groups;
    },
    {} as Record<NonNullable<TypingStatus>, TypingIndicatorType[]>
  );

  return (
    <div className={cn("space-y-2", containerClassName)}>
      {Object.entries(groupedIndicators).map(([status, items]) => (
        <div
          key={status}
          className={cn("flex items-center animate-fadeIn", className)}
        >
          <div className="flex -space-x-2 items-center">
            {items.map((item) => (
              <Avatar
                key={item.memberId}
                className="w-6 h-6 border-2 border-background"
              >
                <AvatarImage src={getMemberAvatar(item.memberId)} />
                <AvatarFallback className="text-xs">
                  {getMemberName(item.memberId)[0]}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">
              {items.map((item) => getMemberName(item.memberId)).join("、")}
              正在
              {status === "typing" ? "输入" : "思考"}
              <span className="inline-flex gap-0.5 animate-pulse">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </span>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
