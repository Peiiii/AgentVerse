import { useAgents } from "@/hooks/useAgents";
import { cn } from "@/common/lib/utils";
import { DiscussionMember } from "@/common/types/discussion-member";
import { Users } from "lucide-react";

interface DiscussionAvatarProps {
  members: DiscussionMember[];
  size?: "sm" | "md" | "lg";
}

export function DiscussionAvatar({ 
  members, 
  size = "sm"
}: DiscussionAvatarProps) {
  const { getAgentName, getAgentAvatar } = useAgents();

  // 尺寸配置
  const sizeConfig = {
    sm: {
      container: "w-[30px] h-[30px]",
      avatar: "w-[28px] h-[28px]",
      grid: "gap-[1px] p-[1px]",
      icon: "w-3 h-3"
    },
    md: {
      container: "w-[40px] h-[40px]",
      avatar: "w-[38px] h-[38px]",
      grid: "gap-[1px] p-[1px]",
      icon: "w-4 h-4"
    },
    lg: {
      container: "w-[50px] h-[50px]",
      avatar: "w-[48px] h-[48px]",
      grid: "gap-[1px] p-[1px]",
      icon: "w-5 h-5"
    }
  };

  const config = sizeConfig[size];

  // 渲染默认头像
  const renderDefaultAvatar = () => (
    <div className={cn(
      config.container,
      "bg-muted/30 rounded-[3px] flex items-center justify-center",
      "shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)]"
    )}>
      <Users className={cn(config.icon, "text-muted-foreground/50")} />
    </div>
  );

  // 渲染单人头像
  const renderSingleAvatar = (member: DiscussionMember) => (
    <div className={cn(
      config.container,
      "bg-muted/40 rounded-[3px] shrink-0 overflow-hidden",
      "shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)]",
      "flex items-center justify-center"
    )}>
      <img
        src={getAgentAvatar(member.agentId)}
        alt={getAgentName(member.agentId)}
        className={cn(config.avatar, "rounded-[2px] object-cover")}
      />
    </div>
  );

  // 渲染多人头像网格
  const renderMultiAvatar = () => (
    <div className={cn(
      config.container,
      "bg-muted/40 rounded-[3px] shrink-0 overflow-hidden",
      "shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)]",
      "grid grid-cols-2",
      config.grid
    )}>
      {members.slice(0, 4).map((member) => (
        <div key={member.id} className="relative aspect-square">
          <img
            src={getAgentAvatar(member.agentId)}
            alt={getAgentName(member.agentId)}
            className="w-full h-full rounded-[1px] object-cover"
          />
        </div>
      ))}
    </div>
  );

  // 根据成员数量渲染不同样式
  if (members.length === 0) {
    return renderDefaultAvatar();
  }

  if (members.length === 1) {
    return renderSingleAvatar(members[0]);
  }

  return renderMultiAvatar();
} 