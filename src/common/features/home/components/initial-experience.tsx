import { CustomTeamDialog } from "@/common/features/agents/components/dialogs/custom-team-dialog";
import { AGENT_COMBINATIONS, AgentCombinationType, resolveCombination } from "@/core/config/agents";
import { useAgents } from "@/core/hooks/useAgents";
import { usePresenter } from "@/core/presenter";
import { cn } from "@/common/lib/utils";
import { motion } from "framer-motion";
import { useState } from "react";
import { AgentPopover } from "./agent-popover";
import { InitialInput } from "./initial-input";
import { TeamDetailsDialog } from "./team-details-dialog";
import { WelcomeHeader } from "./welcome-header";

interface InitialExperienceProps {
  onStart: (
    topic: string,
    customMembers?: { agentId: string; isAutoReply: boolean }[]
  ) => void;
   
  onChangeTeam?: (key: AgentCombinationType) => void;
  className?: string;
}

export function InitialExperience({
  onStart,
   
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
  const presenter = usePresenter();
  const { agents } = useAgents();

  const handleInputSubmit = (inputTopic: string) => {
    setTopic(inputTopic);
    if (customMembers.length > 0) {
      // 使用自定义成员
      onStart(inputTopic, customMembers);
    } else {
      // 从 agents 中找到对应的成员
      const combination = AGENT_COMBINATIONS[selectedCombinationKey];
      const moderatorSlug = combination.moderator as unknown as string;
      const participantSlugs = combination.participants as unknown as string[];
      const combinationMembers = [moderatorSlug, ...participantSlugs]
        .map((slug) => {
          const agent = agents.find((a) => a.slug === slug);
          return agent
            ? {
                agentId: agent.id,
                isAutoReply: slug === moderatorSlug,
              }
            : null;
        })
        .filter(Boolean) as { agentId: string; isAutoReply: boolean }[];

      onStart(inputTopic, combinationMembers);
    }
  };

  const { openCustomTeamDialog } = CustomTeamDialog.useCustomTeamDialog();

  const handleCustomTeamClick = () => {
    openCustomTeamDialog(agents, customMembers, (selected) => {
      setCustomMembers(selected);
      if (topic && selected.length > 0) {
        onStart(topic, selected);
      }
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
                          const resolved = resolveCombination(key as AgentCombinationType);
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
                                  src={resolved.moderator.avatar}
                                  alt={resolved.moderator.name}
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
                              name={presenter.agents.getAgentName(agent.id)}
                              avatar={presenter.agents.getAgentAvatar(agent.id)}
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
                          {resolveCombination(selectedCombinationKey)
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
                        {(() => {
                          const r = resolveCombination(selectedCombinationKey);
                          return (
                            <AgentPopover
                              name={r.moderator.name}
                              avatar={r.moderator.avatar}
                              role="主持人"
                              expertise={r.moderator.expertise}
                            />
                          );
                        })()}
                      </div>

                      <div className="space-y-2">
                        <div className="text-xs font-medium text-muted-foreground">
                          团队成员
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {resolveCombination(selectedCombinationKey).participants.map((participant, idx) => (
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
                      role: agent ? presenter.agents.getAgentName(agent.id) : "未知专家",
                      expertise: agent?.expertise || [],
                    };
                  })
                : (() => {
                    const r = resolveCombination(selectedCombinationKey);
                    return [
                      {
                        id: "moderator",
                        role: r.moderator.name,
                        expertise: r.moderator.expertise,
                      },
                      ...r.participants.map((p, i) => ({
                        id: `member-${i}`,
                        role: p.name,
                        expertise: p.expertise,
                      })),
                    ];
                  })(),
          }}
          open={isTeamDetailsOpen}
          onOpenChange={setIsTeamDetailsOpen}
        />
      </div>
    </motion.div>
  );
}
