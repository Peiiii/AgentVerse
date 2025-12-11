import React from "react";
import { cn } from "@/common/lib/utils";
import { useTranslation } from "@/core/hooks/use-i18n";

// 可复用的AgentCard组件，用于展示代理信息的Popover卡片
interface AgentCardProps {
  name: string;
  avatar: string;
  role?: string;
  expertise?: string[];
  description?: string;
  className?: string;
}

export const AgentCard: React.FC<AgentCardProps> = ({
  name,
  avatar,
  role,
  expertise = [],
  description,
  className,
}) => {
  const { t } = useTranslation();
  // 确保头像URL是有效的
  const safeAvatar = avatar || "/avatars/default.png";
  
  return (
    <div className={cn("p-3 space-y-3", className)}>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
          <img 
            src={safeAvatar} 
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/avatars/default.png";
            }}
          />
        </div>
        <div>
          <h3 className="font-medium text-base">{name}</h3>
          {role && <p className="text-sm text-muted-foreground">{role}</p>}
        </div>
      </div>
      
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      
      {expertise.length > 0 && (
        <div className="space-y-1.5">
          <h4 className="text-xs font-medium text-muted-foreground">{t("home.expertise")}</h4>
          <div className="flex flex-wrap gap-1">
            {expertise.map((skill, index) => (
              <span 
                key={index}
                className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 