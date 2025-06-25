import { BaseAgent, ChatAgent, BaseAgentState } from "@/common/lib/agent";
import { DiscussionEnvBus } from "@/common/lib/discussion/discussion-env";
import { agentListResource } from "@/resources";
import { DiscussionMember } from "@/types/discussion-member";
import { RxEvent } from "@/common/lib/rx-event";

export class AgentManager {
    private agents: Map<string, BaseAgent> = new Map();
    onAgentStateChange$ = new RxEvent<{ agentId: string; state: BaseAgentState }>();

    constructor(private env: DiscussionEnvBus) {}

    syncAgents(members: DiscussionMember[]) {
        // 移除不在 members 中的 agents
        for (const [agentId, agent] of this.agents) {
            if (!members.find((m) => m.agentId === agentId)) {
                agent.leaveEnv();
                this.agents.delete(agentId);
            }
        }

        // 更新或添加 agents
        for (const member of members) {
            const agentData = agentListResource
                .read()
                .data.find((agent) => agent.id === member.agentId)!;
            const existingAgent = this.agents.get(member.agentId);
            
            if (existingAgent) {
                // 更新现有 agent 的配置
                existingAgent.updateConfig({
                    ...agentData,
                });
                // 更新状态
                existingAgent.updateState({
                    autoReply: member.isAutoReply,
                });
            } else {
                // 创建新的 agent
                const agent = new ChatAgent(
                    {
                        ...agentData,
                        agentId: member.agentId,
                    },
                    { autoReply: member.isAutoReply }
                );
                this.agents.set(member.agentId, agent);
                agent.enterEnv(this.env);

                // 监听agent状态变化
                agent.onStateChange$.listen((state) => {
                    this.onAgentStateChange$.next({
                        agentId: member.agentId,
                        state
                    });
                });
            }
        }
    }

    getAgent(agentId: string): BaseAgent | undefined {
        return this.agents.get(agentId);
    }

    pauseAll() {
        for (const agent of this.agents.values()) {
            agent.pause();
        }
    }

    resumeAll() {
        for (const agent of this.agents.values()) {
            agent.resume();
        }
    }

    cleanup() {
        for (const agent of this.agents.values()) {
            agent.leaveEnv();
        }
        this.agents.clear();
    }

    getAllAgents(): BaseAgent[] {
        return Array.from(this.agents.values());
    }

    hasAgent(agentId: string): boolean {
        return this.agents.has(agentId);
    }
} 