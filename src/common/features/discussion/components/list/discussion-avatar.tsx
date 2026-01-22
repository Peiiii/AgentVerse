
import { usePresenter } from "@/core/presenter";
import { cn } from "@/common/lib/utils";
import { DiscussionMember } from "@/common/types/discussion-member";
import { Users } from "lucide-react";

interface DiscussionAvatarProps {
  members: DiscussionMember[];
  size?: "sm" | "md" | "lg";
}

/**
 * WeChat-style Group Avatar Layout
 * 
 * 1 member: 1x1
 * 2 members: [1, 2] (Row-centered 2-column)
 * 3 members: [1] (Row 1 centered), [2, 3] (Row 2)
 * 4 members: [1, 2], [3, 4] (2x2)
 * 5 members: [1, 2], [3, 4, 5] (Row 1 centered among 3-col space)
 * 6 members: [1, 2, 3], [4, 5, 6]
 * 7 members: [1], [2, 3, 4], [5, 6, 7]
 * 8 members: [1, 2], [3, 4, 5], [6, 7, 8]
 * 9 members: [1, 2, 3], [4, 5, 6], [7, 8, 9]
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

  if (count === 0) {
    return (
      <div className={cn(containerSizeClass, "bg-muted/30 rounded-full flex items-center justify-center border border-black/5")}>
        <Users className="w-1/2 h-1/2 text-muted-foreground/40" />
      </div>
    );
  }

  if (count === 1) {
    const member = items[0];
    return (
      <div className={cn(containerSizeClass, "bg-muted/40 rounded-full shrink-0 overflow-hidden border border-black/5 flex items-center justify-center")}>
        <img
          src={presenter.agents.getAgentAvatar(member.agentId)}
          alt={presenter.agents.getAgentName(member.agentId)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // WeChat-specific Layout Calculation
  const isLarge = count > 4; // 5-9 members use 3-column grid
  const columns = isLarge ? 3 : 2;
  const gap = 0.5; // 进一步缩小间距
  const itemSize = (containerSize - (columns + 1) * gap) / columns;

  // Split items into rows based on WeChat's pattern
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
        "bg-[#e8e8e8] dark:bg-gray-700 rounded-full p-[1px] flex flex-col items-center justify-center gap-[1px] border border-black/5 overflow-hidden"
      )}
    >
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-[1px] w-full">
          {row.map((member) => (
            <div
              key={member.id}
              className="shrink-0 overflow-hidden rounded-full"
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
