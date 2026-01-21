import { SmartAvatar } from "@/common/components/ui/smart-avatar";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { ScrollArea } from "@/common/components/ui/scroll-area";
import { cn } from "@/common/lib/utils";
import { AgentDef } from "@/common/types/agent";
import {
    ArrowLeft,
    Bot,
    Edit3,
    MessageSquare,
    Sparkles,
    Target,
    User,
    Zap
} from "lucide-react";

interface AgentProfileViewProps {
    agent: AgentDef;
    onBack: () => void;
    onEdit: () => void;
    onChat: () => void;
    className?: string;
}

export function AgentProfileView({
    agent,
    onBack,
    onEdit,
    onChat,
    className,
}: AgentProfileViewProps) {
    const getRoleConfig = (role?: string) => {
        switch (role) {
            case "moderator":
                return {
                    icon: Bot,
                    color: "text-amber-600 dark:text-amber-400",
                    bgColor: "bg-amber-50 dark:bg-amber-950/50",
                    borderColor: "border-amber-200 dark:border-amber-800",
                    label: "主持人",
                    gradientFrom: "from-amber-500",
                    gradientTo: "to-orange-500",
                };
            case "participant":
                return {
                    icon: Bot,
                    color: "text-emerald-600 dark:text-emerald-400",
                    bgColor: "bg-emerald-50 dark:bg-emerald-950/50",
                    borderColor: "border-emerald-200 dark:border-emerald-800",
                    label: "参与者",
                    gradientFrom: "from-emerald-500",
                    gradientTo: "to-teal-500",
                };
            default:
                return {
                    icon: Sparkles,
                    color: "text-blue-600 dark:text-blue-400",
                    bgColor: "bg-blue-50 dark:bg-blue-950/50",
                    borderColor: "border-blue-200 dark:border-blue-800",
                    label: "智能体",
                    gradientFrom: "from-blue-500",
                    gradientTo: "to-indigo-500",
                };
        }
    };

    const roleConfig = getRoleConfig(agent.role);

    return (
        <div className={cn("flex flex-col h-full", className)}>
            {/* Header with back button */}
            <div className="p-4 border-b flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onBack}
                    className="flex-shrink-0"
                >
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-muted-foreground">智能体详情</span>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-6 space-y-6">
                    {/* Hero Section */}
                    <div className="text-center space-y-4">
                        <div className="relative inline-block">
                            <SmartAvatar
                                src={agent.avatar}
                                alt={agent.name}
                                className="w-24 h-24 ring-4 ring-primary/20 shadow-xl mx-auto"
                                fallback={
                                    <span className={cn(
                                        "bg-gradient-to-br text-white text-2xl font-bold",
                                        roleConfig.gradientFrom,
                                        roleConfig.gradientTo
                                    )}>
                                        {agent.name?.[0] || "?"}
                                    </span>
                                }
                            />
                            <div className={cn(
                                "absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-background",
                                roleConfig.bgColor
                            )}>
                                <roleConfig.icon className={cn("w-4 h-4", roleConfig.color)} />
                            </div>
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold">{agent.name}</h1>
                            <Badge
                                variant="outline"
                                className={cn(
                                    "mt-2 px-3 py-1",
                                    roleConfig.borderColor,
                                    roleConfig.bgColor,
                                    roleConfig.color
                                )}
                            >
                                <roleConfig.icon className="w-3 h-3 mr-1" />
                                {roleConfig.label}
                            </Badge>
                        </div>
                    </div>

                    {/* Info Cards */}
                    <div className="space-y-4">
                        {/* Personality */}
                        {agent.personality && (
                            <div className="bg-card border rounded-xl p-4 space-y-2">
                                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                    <User className="w-4 h-4" />
                                    <span>性格特征</span>
                                </div>
                                <p className="text-sm leading-relaxed">{agent.personality}</p>
                            </div>
                        )}

                        {/* Expertise */}
                        {agent.expertise && agent.expertise.length > 0 && (
                            <div className="bg-card border rounded-xl p-4 space-y-3">
                                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                    <Target className="w-4 h-4" />
                                    <span>专长领域</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {agent.expertise.map((exp, index) => (
                                        <Badge
                                            key={index}
                                            variant="secondary"
                                            className="px-3 py-1"
                                        >
                                            {exp}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Response Style */}
                        {agent.responseStyle && (
                            <div className="bg-card border rounded-xl p-4 space-y-2">
                                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                    <MessageSquare className="w-4 h-4" />
                                    <span>回复风格</span>
                                </div>
                                <p className="text-sm leading-relaxed">{agent.responseStyle}</p>
                            </div>
                        )}

                        {/* Bias */}
                        {agent.bias && (
                            <div className="bg-card border rounded-xl p-4 space-y-2">
                                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                    <Zap className="w-4 h-4" />
                                    <span>思维偏向</span>
                                </div>
                                <p className="text-sm leading-relaxed">{agent.bias}</p>
                            </div>
                        )}
                    </div>
                </div>
            </ScrollArea>

            {/* Action Buttons */}
            <div className="p-4 border-t bg-background/80 backdrop-blur-sm">
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={onEdit}
                    >
                        <Edit3 className="w-4 h-4 mr-2" />
                        编辑智能体
                    </Button>
                    <Button
                        className="flex-1"
                        onClick={onChat}
                    >
                        <Bot className="w-4 h-4 mr-2" />
                        和TA对话
                    </Button>
                </div>
            </div>
        </div>
    );
}
