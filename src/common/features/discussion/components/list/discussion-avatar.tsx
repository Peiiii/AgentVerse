
import { usePresenter } from "@/core/presenter";
import { cn } from "@/common/lib/utils";
import { DiscussionMember } from "@/common/types/discussion-member";
import { Users } from "lucide-react";

interface DiscussionAvatarProps {
  members: DiscussionMember[];
  size?: "sm" | "md" | "lg";
}

/**
 * WeChat-style Group Avatar Layout (Optimized for Premium Minimalist Aesthetic)
 */
export function DiscussionAvatar({
  members,
  size = "sm"
}: DiscussionAvatarProps) {
  const presenter = usePresenter();

  const sizeConfig = {
    sm: "w-[32px] h-[32px]",
    md: "w-[40px] h-[40px]",
    lg: "w-[48px] h-[48px]"
  };

  const containerSizeClass = sizeConfig[size];
  const containerSize = size === "sm" ? 32 : size === "md" ? 40 : 48;
  const count = Math.min(members.length, 9);
  const items = members.slice(0, count);

  // 空状态：使用超淡灰色
  if (count === 0) {
    return (
      <div className={cn(containerSizeClass, "bg-[#f9f9f9] dark:bg-muted/10 rounded-full flex items-center justify-center border border-black/[0.03]")}>
        <Users className="w-1/2 h-1/2 text-muted-foreground/25" />
      </div>
    );
  }

  // 单人：超淡灰色圆框 + 内部头像气泡，确保视觉高度统一
  if (count === 1) {
    const member = items[0];
    return (
      <div className={cn(containerSizeClass, "bg-[#f9f9f9] dark:bg-muted/10 rounded-full shrink-0 overflow-hidden border border-black/[0.03] flex items-center justify-center p-[5px]")}>
        <div className="w-full h-full rounded-full overflow-hidden shadow-sm">
          <img
            src={presenter.agents.getAgentAvatar(member.agentId)}
            alt={presenter.agents.getAgentName(member.agentId)}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    );
  }

  // 多人：根据微信逻辑计算布局，统一使用超淡背景
  const isLarge = count > 4;
  const columns = isLarge ? 3 : 2;
  const gap = 0.5;
  const itemSize = (containerSize - (columns + 1) * gap) / columns;

  let rows: DiscussionMember[][] = [];
  if (count === 2) {
    rows = [items];
  } else if (count === 3) {
    rows = [[items[0]], [items[1], items[2]]];
  } else if (count === 4) {
    rows = [[items[0], items[1]], [items[2], items[3]]];
  } else if (count === 5) {
    rows = [[items[0], items[1]], [items[2], items[3], items[4]]];
  } else if (count === 6) {
    rows = [[items[0], items[1], items[2]], [items[3], items[4], items[5]]];
  } else if (count === 7) {
    rows = [[items[0]], [items[1], items[2], items[3]], [items[4], items[5], items[6]]];
  } else if (count === 8) {
    rows = [[items[0], items[1]], [items[2], items[3], items[4]], [items[5], items[6], items[7]]];
  } else if (count === 9) {
    rows = [[items[0], items[1], items[2]], [items[3], items[4], items[5]], [items[6], items[7], items[8]]];
  }

  return (
    <div
      className={cn(
        containerSizeClass,
        "bg-[#f9f9f9] dark:bg-muted/10 rounded-full flex flex-col items-center justify-center gap-[1px] border border-black/[0.03] overflow-hidden"
      )}
      style={{ padding: count > 4 ? '1.5px' : '2px' }}
    >
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-[1px] w-full">
          {row.map((member) => (
            <div
              key={member.id}
              className="shrink-0 overflow-hidden rounded-full shadow-sm"
              style={{ width: `${itemSize}px`, height: `${itemSize}px` }}
            >
              <img
                src={presenter.agents.getAgentAvatar(member.agentId)}
                alt={presenter.agents.getAgentName(member.agentId)}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
