/**
 * AgentRepository 接口定义
 * Agent 定义存储抽象层
 * @module core/repositories/agent.repository
 */

import type { Timestamp } from './shared.types';

/** Agent 定义 */
export interface Agent {
    id: string;
    name: string;
    description?: string;
    systemPrompt?: string;
    avatar?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

/**
 * Agent 存储接口
 *
 * Adapters:
 * - MockAdapter: 当前默认
 * - HttpAdapter: 后端 API
 */
export interface AgentRepository {
    /** 获取所有 Agent */
    list(): Promise<Agent[]>;

    /** 获取单个 Agent */
    get(id: string): Promise<Agent | undefined>;

    /** 创建或更新 Agent */
    upsert(agent: Omit<Agent, 'createdAt' | 'updatedAt'>): Promise<Agent>;

    /** 删除 Agent */
    delete(id: string): Promise<void>;
}
