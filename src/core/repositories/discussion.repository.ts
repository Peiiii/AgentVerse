/**
 * DiscussionRepository / MessageRepository 接口定义
 * 讨论与消息存储抽象层
 * @module core/repositories/discussion.repository
 */

import type { Timestamp } from './shared.types';

export type DiscussionId = string;
export type MessageId = string;

/** 讨论 */
export interface Discussion {
    id: DiscussionId;
    title: string;
    status: 'active' | 'paused' | 'archived';
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

/** 消息 */
export interface Message {
    id: MessageId;
    discussionId: DiscussionId;
    senderId: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt: Timestamp;
}

/**
 * 讨论存储接口
 *
 * Adapters:
 * - MockAdapter: 当前默认
 * - HttpAdapter: 后端 API
 * - IndexedDBAdapter: 离线存储（可选）
 */
export interface DiscussionRepository {
    /** 获取所有讨论 */
    list(): Promise<Discussion[]>;

    /** 获取单个讨论 */
    get(id: DiscussionId): Promise<Discussion | undefined>;

    /** 创建讨论 */
    create(
        data: Omit<Discussion, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<Discussion>;

    /** 更新讨论 */
    update(id: DiscussionId, patch: Partial<Discussion>): Promise<Discussion>;

    /** 删除讨论 */
    delete(id: DiscussionId): Promise<void>;
}

/**
 * 消息存储接口
 */
export interface MessageRepository {
    /** 获取讨论的所有消息 */
    list(discussionId: DiscussionId): Promise<Message[]>;

    /** 追加消息 */
    append(message: Omit<Message, 'id' | 'createdAt'>): Promise<Message>;

    /** 清空讨论的所有消息 */
    clear(discussionId: DiscussionId): Promise<void>;
}
