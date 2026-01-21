import { Avatar, AvatarFallback, AvatarImage } from "@/common/components/ui/avatar";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/common/components/ui/hover-card";
import { cn } from "@/common/lib/utils";
import { AgentDef } from "@/common/types/agent";
import {
    Bot,
    Brain,
    MessageCircle,
    Sparkles,
    Target,
    User,
    Zap,
} from "lucide-react";
import React from "react";

interface AgentHoverCardProps {
    agent: AgentDef;
    children: React.ReactNode;
    onViewDetail?: (agentId: string) => void;
    onChat?: (agent: AgentDef) => void;
    side?: "top" | "right" | "bottom" | "left";
    align?: "start" | "center" | "end";
}

// 获取角色配置
const getRoleConfig = (role?: string) => {
    switch (role) {
        case "moderator":
            return {
                icon: Brain,
                color: "text-purple-500",
                bgColor: "bg-purple-500/10",
                borderColor: "border-purple-500/20",
                label: "主持人",
                gradientFrom: "from-purple-500",
                gradientTo: "to-pink-500",
            };
        case "participant":
            return {
                icon: MessageCircle,
                color: "text-green-500",
                bgColor: "bg-green-500/10",
                borderColor: "border-green-500/20",
                label: "参与者",
                gradientFrom: "from-green-500",
                gradientTo: "to-teal-500",
            };
        default:
            return {
                icon: Sparkles,
                color: "text-blue-500",
                bgColor: "bg-blue-500/10",
                borderColor: "border-blue-500/20",
                label: "智能体",
                gradientFrom: "from-blue-500",
                gradientTo: "to-indigo-500",
            };
    }
};

export const AgentHoverCard: React.FC<AgentHoverCardProps> = ({
    agent,
    children,
    onViewDetail,
    onChat,
    side = "right",
    align = "start",
}) => {
    const safeAvatar = agent.avatar || "/avatars/default.png";
    const safeName = agent.name || "未命名";
    const nameInitial = safeName.length > 0 ? safeName[0] : "?";
    const roleConfig = getRoleConfig(agent.role);

    return (
        <HoverCard openDelay={200} closeDelay={100}>
            <HoverCardTrigger asChild>{children}</HoverCardTrigger>
            <HoverCardContent
                side={side}
                align={align}
                className="w-80 p-0 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header with gradient background */}
                <div
                    className={cn(
                        "bg-gradient-to-br p-4",
                        roleConfig.gradientFrom,
                        roleConfig.gradientTo
                    )}
                >
                    <div className="flex items-center gap-3">
                        <Avatar className="w-14 h-14 ring-2 ring-white/30 shadow-lg">
                            <AvatarImage src={safeAvatar} alt={safeName} />
                            <AvatarFallback className="bg-white/20 text-white font-bold text-lg">
                                {nameInitial}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-white truncate">{safeName}</h3>
                            <Badge
                                variant="outline"
                                className="mt-1 bg-white/20 text-white border-white/30 text-xs"
                            >
                                <roleConfig.icon className="w-3 h-3 mr-1" />
                                {roleConfig.label}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                    {/* Personality */}
                    {agent.personality && (
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                <User className="w-3 h-3" />
                                <span>性格特征</span>
                            </div>
                            <p className="text-sm line-clamp-2">{agent.personality}</p>
                        </div>
                    )}

                    {/* Expertise */}
                    {agent.expertise && agent.expertise.length > 0 && (
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                <Target className="w-3 h-3" />
                                <span>专长领域</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {agent.expertise.slice(0, 4).map((exp, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                        {exp}
                                    </Badge>
                                ))}
                                {agent.expertise.length > 4 && (
                                    <Badge variant="outline" className="text-xs">
                                        +{agent.expertise.length - 4}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Response Style */}
                    {agent.responseStyle && (
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                <MessageCircle className="w-3 h-3" />
                                <span>回复风格</span>
                            </div>
                            <p className="text-sm line-clamp-2 text-muted-foreground">
                                {agent.responseStyle}
                            </p>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="border-t p-3 flex gap-2 bg-muted/30">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewDetail?.(agent.id);
                        }}
                    >
                        <Zap className="w-3 h-3 mr-1" />
                        查看详情
                    </Button>
                    <Button
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                            e.stopPropagation();
                            onChat?.(agent);
                        }}
                    >
                        <Bot className="w-3 h-3 mr-1" />
                        对话
                    </Button>
                </div>
            </HoverCardContent>
        </HoverCard>
    );
};
