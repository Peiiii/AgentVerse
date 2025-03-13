import React, { useState } from "react";
import { motion } from "framer-motion";
import { WelcomeHeader } from "./welcome-header";
import { InitialInput } from "./initial-input";
import { TeamDetailsDialog } from "./team-details-dialog";
import { cn } from "@/lib/utils";
import { AGENT_COMBINATIONS, AgentCombinationType } from "@/config/agents";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Search, X } from "lucide-react";
import { useAgents } from "@/hooks/useAgents";
import { useModal } from "@/components/ui/modal";
import { Agent } from "@/types/agent";
import { AgentPopover } from "./agent-popover";

interface InitialExperienceProps {
  onStart: (
    topic: string,
    customMembers?: { agentId: string; isAutoReply: boolean }[]
  ) => void;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onChangeTeam?: (key: AgentCombinationType) => void;
  className?: string;
}

// 自定义团队选择器组件的Props类型
interface CustomTeamSelectorProps {
  agents: Agent[];
  getAgentName: (id: string) => string;
  getAgentAvatar: (id: string) => string;
  initialSelected: { agentId: string; isAutoReply: boolean }[];
  onConfirm: (selected: { agentId: string; isAutoReply: boolean }[]) => void;
  onCancel: () => void;
}

// 自定义团队选择器组件
const CustomTeamSelector: React.FC<CustomTeamSelectorProps> = ({
  agents,
  getAgentName,
  getAgentAvatar,
  initialSelected,
  onConfirm,
  onCancel,
}) => {
  const [selectedMembers, setSelectedMembers] =
    useState<{ agentId: string; isAutoReply: boolean }[]>(initialSelected);
  const [searchQuery, setSearchQuery] = useState("");

  // 过滤代理列表
  const filteredAgents = agents.filter((agent) => {
    if (!searchQuery) return true;
    const name = getAgentName(agent.id).toLowerCase();
    const query = searchQuery.toLowerCase();
    return (
      name.includes(query) || agent.personality?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-4">
      {/* 搜索框 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="搜索专家..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => setSearchQuery("")}
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 max-h-[60vh] overflow-y-auto">
        {filteredAgents.map((agent) => {
          const isSelected = selectedMembers.some(
            (m) => m.agentId === agent.id
          );
          return (
            <div
              key={agent.id}
              className={cn(
                "p-4 rounded-lg border cursor-pointer transition-colors",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "hover:border-primary/50"
              )}
              onClick={() => {
                const newMembers = [...selectedMembers];
                const existingIndex = newMembers.findIndex(
                  (m) => m.agentId === agent.id
                );

                if (existingIndex >= 0) {
                  newMembers.splice(existingIndex, 1);
                } else {
                  newMembers.push({ agentId: agent.id, isAutoReply: true });
                }

                setSelectedMembers(newMembers);
                console.log("已选择成员:", newMembers.length, newMembers);
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                  <img
                    src={getAgentAvatar(agent.id)}
                    alt={getAgentName(agent.id)}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // 如果头像加载失败，使用默认头像
                      (e.target as HTMLImageElement).src =
                        "/avatars/default.png";
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-medium text-sm md:text-base">
                      {getAgentName(agent.id)}
                    </h3>
                    <span className="text-xs text-muted-foreground capitalize whitespace-nowrap">
                      {agent.role}
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground line-clamp-1">
                    {agent.personality}
                  </p>
                </div>
                {isSelected && (
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between gap-2 pt-2">
        <Button
          variant="outline"
          onClick={() => {
            setSelectedMembers([]);
            console.log("已清空选择");
          }}
        >
          清空选择
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            取消
          </Button>
          <Button
            onClick={() => onConfirm(selectedMembers)}
            disabled={selectedMembers.length === 0}
            className={
              selectedMembers.length > 0
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : ""
            }
          >
            确认选择
          </Button>
        </div>
      </div>
    </div>
  );
};

export function InitialExperience({
  onStart,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onChangeTeam,
  className,
}: InitialExperienceProps) {
  const [isTeamDetailsOpen, setIsTeamDetailsOpen] = useState(false);
  const [customMembers, setCustomMembers] = useState<
    { agentId: string; isAutoReply: boolean }[]
  >([]);
  const [topic, setTopic] = useState("");
  const [selectedCombinationKey, setSelectedCombinationKey] =
    useState<AgentCombinationType>("thinkingTeam");
  const { agents, getAgentName, getAgentAvatar } = useAgents();
  const modal = useModal();

  const handleInputSubmit = (inputTopic: string) => {
    setTopic(inputTopic);
    if (customMembers.length > 0) {
      // 使用自定义成员
      onStart(inputTopic, customMembers);
    } else {
      // 从 agents 中找到对应的成员
      const combination = AGENT_COMBINATIONS[selectedCombinationKey];
      const combinationMembers = [
        combination.moderator,
        ...combination.participants,
      ].map((role) => {
        const agent = agents.find((a) => a.name === role.name);
        return agent
          ? {
              agentId: agent.id,
              isAutoReply: agent.name === combination.moderator.name,
            }
          : null;
      }).filter(Boolean) as { agentId: string; isAutoReply: boolean }[];

      onStart(inputTopic, combinationMembers);
    }
  };

  const handleCustomTeamClick = () => {
    modal.show({
      title: "自定义专家团队",
      content: (
        <CustomTeamSelector
          agents={agents}
          getAgentName={getAgentName}
          getAgentAvatar={getAgentAvatar}
          initialSelected={customMembers}
          onConfirm={(selected) => {
            setCustomMembers(selected);
            if (topic && selected.length > 0) {
              onStart(topic, selected);
            }
            modal.close();
          }}
          onCancel={() => modal.close()}
        />
      ),
      className: "max-w-4xl",
      showFooter: false,
    });
  };

  // 处理组合选择
  const handleCombinationSelect = (key: AgentCombinationType) => {
    console.log("选择团队:", key, AGENT_COMBINATIONS[key].name);
    setSelectedCombinationKey(key);
    setCustomMembers([]); // 清空自定义成员

    // 保存选择到localStorage
    window.localStorage.setItem("selectedCombinationKey", key);

    // 通知团队变更
    if (onChangeTeam) {
      onChangeTeam(key);
    }

    // 如果已有话题，直接使用新组合开始
    if (topic) {
      onStart(topic);
    }
  };

  return (
    <motion.div
      className={cn(
        "relative flex flex-col",
        "py-8 md:py-12",
        "overflow-y-auto overflow-x-hidden",
        "h-[100vh]",
        className
      )}
      initial="initial"
      animate="animate"
      variants={{
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { staggerChildren: 0.12 } },
      }}
    >
      {/* 背景装饰 */}
      <motion.div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        variants={{
          initial: { opacity: 0 },
          animate: { opacity: 1 },
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_50%,#7c3aed0a,#3b82f610,transparent)]" />
      </motion.div>

      {/* 主要内容区域 */}
      <div
        className={cn(
          "relative flex flex-col items-center w-full mx-auto",
          "flex-1 px-4",
          "max-w-full"
        )}
      >
        {/* Logo 和标题区域 */}
        <motion.div
          className="mb-12 md:mb-16 text-center w-full"
          variants={{
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
          }}
        >
          <WelcomeHeader />
        </motion.div>

        {/* 输入区域 */}
        <motion.div
          className="w-full max-w-2xl mx-auto space-y-8"
          variants={{
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
          }}
        >
          <InitialInput onSubmit={handleInputSubmit} className="w-full" />

          {/* 快捷提示区 - 使用预定义的组合场景 */}
          <motion.div
            className="flex flex-col items-center space-y-6"
            variants={{
              initial: { opacity: 0 },
              animate: { opacity: 1 },
            }}
          >
            {/* 专家团队选择区域 */}
            <div className="w-full">
              <div className="flex items-center justify-center gap-2 mb-6 mt-2">
                <div className="h-px flex-grow max-w-[80px] bg-gradient-to-r from-transparent to-purple-500/30"></div>
                <h2 className="text-base font-medium text-foreground/90 px-3">
                  选择专家团队
                </h2>
                <div className="h-px flex-grow max-w-[80px] bg-gradient-to-l from-transparent to-purple-500/30"></div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 max-w-full">
                {/* 左侧团队列表 */}
                <div className="w-full md:w-1/3 bg-background/60 backdrop-blur-sm rounded-lg border border-border/50 shadow-sm flex flex-col h-[400px] min-w-0">
                  {/* 固定在顶部的自定义团队按钮 */}
                  <button
                    onClick={handleCustomTeamClick}
                    className={cn(
                      "w-full text-left p-3 rounded-t-lg transition-all duration-200 border-b border-border/50",
                      "flex items-center gap-2",
                      "hover:bg-blue-500/5",
                      customMembers.length > 0
                        ? "bg-blue-500/10"
                        : "bg-background/80"
                    )}
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                        customMembers.length > 0
                          ? "bg-blue-500/30 ring-2 ring-blue-500 ring-offset-1"
                          : "bg-blue-500/20"
                      )}
                    >
                      <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                        +
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <span
                          className={cn(
                            "font-medium text-sm truncate",
                            customMembers.length > 0 &&
                              "text-blue-700 dark:text-blue-300"
                          )}
                        >
                          自定义团队
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {customMembers.length > 0
                          ? `已选择 ${customMembers.length} 位专家`
                          : "选择你想要的专家组合"}
                      </p>
                    </div>
                  </button>

                  {/* 可滚动的团队列表区域 */}
                  <div className="relative flex-1 overflow-hidden">
                    <div className="absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-background/80 to-transparent z-10 pointer-events-none"></div>
                    <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none"></div>

                    <div className="space-y-1 max-h-[360px] overflow-y-auto p-2 scrollbar-thin pb-6">
                      {Object.entries(AGENT_COMBINATIONS).map(
                        ([key, combination]) => {
                          const isSelected =
                            !customMembers.length &&
                            key === selectedCombinationKey;
                          const isRecommended = key === "thinkingTeam";
                          return (
                            <button
                              key={key}
                              onClick={() =>
                                handleCombinationSelect(
                                  key as AgentCombinationType
                                )
                              }
                              className={cn(
                                "w-full text-left p-2 rounded-md transition-all duration-200",
                                "flex items-center gap-2",
                                "hover:bg-purple-500/5",
                                isSelected
                                  ? "bg-purple-500/10 shadow-sm"
                                  : "bg-background/80"
                              )}
                            >
                              <div
                                className={cn(
                                  "w-8 h-8 rounded-full overflow-hidden flex-shrink-0",
                                  isSelected
                                    ? "ring-2 ring-purple-500 ring-offset-1"
                                    : isRecommended
                                    ? "ring-1 ring-purple-300 ring-offset-1"
                                    : "bg-muted"
                                )}
                              >
                                <img
                                  src={combination.moderator.avatar}
                                  alt={combination.moderator.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center">
                                  <span
                                    className={cn(
                                      "font-medium text-sm truncate",
                                      isSelected &&
                                        "text-purple-700 dark:text-purple-300",
                                      isRecommended &&
                                        !isSelected &&
                                        "text-purple-900/80 dark:text-purple-300/80"
                                    )}
                                  >
                                    {combination.name}
                                    {isRecommended && (
                                      <span className="ml-1 text-xs text-purple-500 opacity-70">
                                        ✦ 推荐
                                      </span>
                                    )}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground truncate">
                                  {combination.participants.length} 位专家
                                </p>
                              </div>
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>

                {/* 右侧团队详情 */}
                <div className="w-full md:w-2/3 bg-background/60 backdrop-blur-sm rounded-lg border border-border/50 p-4 shadow-sm h-[400px] overflow-y-auto scrollbar-thin min-w-0">
                  {customMembers.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-blue-700 dark:text-blue-300">
                          自定义团队
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          {customMembers.length} 位专家
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {customMembers.map((member, idx) => {
                          const agent = agents.find(
                            (a) => a.id === member.agentId
                          );
                          return agent ? (
                            <AgentPopover
                              key={idx}
                              name={getAgentName(agent.id)}
                              avatar={getAgentAvatar(agent.id)}
                              role={agent.role}
                              expertise={agent.expertise}
                              description={agent.personality}
                              triggerClassName="bg-blue-500/5 border border-blue-500/10 hover:bg-blue-500/10"
                            />
                          ) : null;
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3
                          className={cn(
                            "font-medium",
                            selectedCombinationKey === "thinkingTeam" &&
                              "text-purple-700 dark:text-purple-300"
                          )}
                        >
                          {AGENT_COMBINATIONS[selectedCombinationKey].name}
                          {selectedCombinationKey === "thinkingTeam" && (
                            <span className="ml-1 text-xs text-purple-500 opacity-70">
                              ✦ 推荐
                            </span>
                          )}
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          {AGENT_COMBINATIONS[selectedCombinationKey]
                            .participants.length + 1}{" "}
                          位专家
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground">
                        {AGENT_COMBINATIONS[selectedCombinationKey].description}
                      </p>

                      <div className="space-y-2">
                        <div className="text-xs font-medium text-muted-foreground">
                          主持人
                        </div>
                        <AgentPopover
                          name={
                            AGENT_COMBINATIONS[selectedCombinationKey].moderator
                              .name
                          }
                          avatar={
                            AGENT_COMBINATIONS[selectedCombinationKey].moderator
                              .avatar
                          }
                          role="主持人"
                          expertise={
                            AGENT_COMBINATIONS[selectedCombinationKey].moderator
                              .expertise
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="text-xs font-medium text-muted-foreground">
                          团队成员
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {AGENT_COMBINATIONS[
                            selectedCombinationKey
                          ].participants.map((participant, idx) => (
                            <AgentPopover
                              key={idx}
                              name={participant.name}
                              avatar={participant.avatar}
                              role="专家"
                              expertise={participant.expertise}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* 团队详情弹窗 */}
        <TeamDetailsDialog
          team={{
            id: "default",
            name:
              customMembers.length > 0
                ? "自定义团队"
                : AGENT_COMBINATIONS[selectedCombinationKey].name,
            members:
              customMembers.length > 0
                ? customMembers.map((member) => {
                    const agent = agents.find((a) => a.id === member.agentId);
                    return {
                      id: member.agentId,
                      role: agent ? getAgentName(agent.id) : "未知专家",
                      expertise: agent?.expertise || [],
                    };
                  })
                : [
                    {
                      id: "moderator",
                      role: AGENT_COMBINATIONS[selectedCombinationKey].moderator
                        .name,
                      expertise:
                        AGENT_COMBINATIONS[selectedCombinationKey].moderator
                          .expertise,
                    },
                    ...AGENT_COMBINATIONS[
                      selectedCombinationKey
                    ].participants.map((p, i) => ({
                      id: `member-${i}`,
                      role: p.name,
                      expertise: p.expertise,
                    })),
                  ],
          }}
          open={isTeamDetailsOpen}
          onOpenChange={setIsTeamDetailsOpen}
        />
      </div>
    </motion.div>
  );
}
