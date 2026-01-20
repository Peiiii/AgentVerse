/**
 * MessageRepository 的 Mock Adapter
 * 包装现有 MessageService 实现
 * @module core/repositories/adapters/message.adapter
 */

import type {
    DiscussionId,
    Message,
    MessageRepository,
} from '../discussion.repository';
import { messageService } from '@/core/services/message.service';
import type { AgentMessage, NormalMessage } from '@/common/types/discussion';

/**
 * 检查是否为普通消息（有 content 字段）
 */
function isNormalMessage(m: AgentMessage): m is NormalMessage {
    return m.type !== 'action_result' && 'content' in m;
}

/**
 * 将旧的 AgentMessage 类型转换为 Repository 定义的 Message
 */
function toMessage(m: AgentMessage): Message | null {
    // 只处理普通消息，跳过 action_result
    if (!isNormalMessage(m)) {
        return null;
    }

    return {
        id: m.id,
        discussionId: m.discussionId,
        senderId: m.agentId,
        role: m.agentId === 'user' ? 'user' : 'assistant',
        content: m.content,
        createdAt:
            m.timestamp instanceof Date
                ? m.timestamp.getTime()
                : Date.parse(String(m.timestamp)),
    };
}

/**
 * Mock 适配器
 * 基于现有 MessageService 实现 MessageRepository 接口
 */
export class MockMessageAdapter implements MessageRepository {
    async list(discussionId: DiscussionId): Promise<Message[]> {
        const messages = await messageService.listMessages(discussionId);
        return messages
            .map(toMessage)
            .filter((m): m is Message => m !== null);
    }

    async append(message: Omit<Message, 'id' | 'createdAt'>): Promise<Message> {
        // 构建符合 NormalMessage 类型的对象，使用类型断言
        const messageData = {
            discussionId: message.discussionId,
            agentId: message.senderId,
            type: 'text' as const,
            content: message.content,
            timestamp: new Date(),
        } as Omit<NormalMessage, 'id'>;

        const newMessage = await messageService.createMessage(messageData);

        const result = toMessage(newMessage);
        if (!result) {
            throw new Error('Failed to convert message');
        }
        return result;
    }

    async clear(discussionId: DiscussionId): Promise<void> {
        await messageService.clearMessages(discussionId);
    }
}

/** 默认 MessageRepository 实例 */
export const messageRepository: MessageRepository = new MockMessageAdapter();
