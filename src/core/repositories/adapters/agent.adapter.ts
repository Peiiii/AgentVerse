/**
 * AgentRepository 的 Mock Adapter
 * 包装现有 AgentService 实现
 * @module core/repositories/adapters/agent.adapter
 */

import type { Agent, AgentRepository } from '../agent.repository';
import { agentService } from '@/core/services/agent.service';
import type { AgentDef } from '@/common/types/agent';

const agentMeta = new Map<string, { createdAt: number; updatedAt: number }>();
const aliasToRealId = new Map<string, string>();
const realToAliasId = new Map<string, string>();

function resolveAgentId(id: string): string {
    return aliasToRealId.get(id) ?? id;
}

function displayAgentId(id: string): string {
    return realToAliasId.get(id) ?? id;
}

function ensureAgentMeta(id: string): { createdAt: number; updatedAt: number } {
    const existing = agentMeta.get(id);
    if (existing) return existing;
    const now = Date.now();
    const next = { createdAt: now, updatedAt: now };
    agentMeta.set(id, next);
    return next;
}

function touchAgent(id: string): void {
    const meta = ensureAgentMeta(id);
    meta.updatedAt = Date.now();
}

/**
 * 将旧的 AgentDef 类型转换为 Repository 定义的 Agent
 */
function toAgent(a: AgentDef): Agent {
    const displayId = displayAgentId(a.id);
    const meta = ensureAgentMeta(displayId);
    return {
        id: displayId,
        name: a.name,
        description: undefined,
        systemPrompt: a.prompt,
        avatar: a.avatar,
        createdAt: meta.createdAt,
        updatedAt: meta.updatedAt,
    };
}

/**
 * Mock 适配器
 * 基于现有 AgentService 实现 AgentRepository 接口
 */
export class MockAgentAdapter implements AgentRepository {
    async list(): Promise<Agent[]> {
        const agents = await agentService.listAgents();
        return agents.map(toAgent);
    }

    async get(id: string): Promise<Agent | undefined> {
        try {
            const agent = await agentService.getAgent(resolveAgentId(id));
            return toAgent(agent);
        } catch {
            return undefined;
        }
    }

    async upsert(agent: Omit<Agent, 'createdAt' | 'updatedAt'>): Promise<Agent> {
        const resolvedId = resolveAgentId(agent.id);
        try {
            // 尝试更新
            const existing = await agentService.getAgent(resolvedId);
            if (existing) {
                const updated = await agentService.updateAgent(resolvedId, {
                    name: agent.name,
                    prompt: agent.systemPrompt,
                    avatar: agent.avatar,
                });
                touchAgent(displayAgentId(updated.id));
                return toAgent(updated);
            }
        } catch {
            // 不存在，创建新的
        }

        const created = await agentService.createAgent({
            name: agent.name,
            prompt: agent.systemPrompt ?? '',
            avatar: agent.avatar ?? '',
            role: 'participant',
            personality: '',
            expertise: [],
            bias: '',
            responseStyle: '',
        });
        if (created.id !== agent.id) {
            aliasToRealId.set(agent.id, created.id);
            realToAliasId.set(created.id, agent.id);
        }
        ensureAgentMeta(displayAgentId(created.id));
        return toAgent(created);
    }

    async delete(id: string): Promise<void> {
        const resolvedId = resolveAgentId(id);
        await agentService.deleteAgent(resolvedId);
        const displayId = displayAgentId(resolvedId);
        agentMeta.delete(displayId);
        aliasToRealId.delete(id);
        realToAliasId.delete(resolvedId);
    }
}

/** 默认 AgentRepository 实例 */
export const agentRepository: AgentRepository = new MockAgentAdapter();
