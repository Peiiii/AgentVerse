/**
 * DiscussionRepository 的 Mock Adapter
 * 包装现有 DiscussionService 实现
 * @module core/repositories/adapters/discussion.adapter
 */

import type {
    Discussion,
    DiscussionId,
    DiscussionRepository,
} from '../discussion.repository';
import { discussionService } from '@/core/services/discussion.service';
import type { Discussion as LegacyDiscussion } from '@/common/types/discussion';

/**
 * 将旧的 Discussion 类型转换为 Repository 定义的 Discussion
 */
function toDiscussion(d: LegacyDiscussion): Discussion {
    // 映射 status: 旧系统用 'completed'，新系统用 'archived'
    const statusMap: Record<string, 'active' | 'paused' | 'archived'> = {
        active: 'active',
        paused: 'paused',
        completed: 'archived',
    };

    return {
        id: d.id,
        title: d.title,
        status: statusMap[d.status] || 'paused',
        createdAt: d.createdAt instanceof Date ? d.createdAt.getTime() : Date.parse(String(d.createdAt)),
        updatedAt: d.updatedAt instanceof Date ? d.updatedAt.getTime() : Date.parse(String(d.updatedAt)),
    };
}

/**
 * 将 Port status 转换为旧系统 status
 */
function toLegacyStatus(
    status: 'active' | 'paused' | 'archived'
): 'active' | 'paused' | 'completed' {
    const statusMap: Record<string, 'active' | 'paused' | 'completed'> = {
        active: 'active',
        paused: 'paused',
        archived: 'completed',
    };
    return statusMap[status] || 'paused';
}

/**
 * Mock 适配器
 * 基于现有 DiscussionService 实现 DiscussionRepository 接口
 */
export class MockDiscussionAdapter implements DiscussionRepository {
    async list(): Promise<Discussion[]> {
        const discussions = await discussionService.listDiscussions();
        return discussions.map(toDiscussion);
    }

    async get(id: DiscussionId): Promise<Discussion | undefined> {
        try {
            const discussion = await discussionService.getDiscussion(id);
            return toDiscussion(discussion);
        } catch {
            return undefined;
        }
    }

    async create(
        data: Omit<Discussion, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<Discussion> {
        const discussion = await discussionService.createDiscussion(data.title);
        // 更新 status 如果传入的不是默认值
        if (data.status !== 'paused') {
            const updated = await discussionService.updateDiscussion(discussion.id, {
                status: toLegacyStatus(data.status),
            });
            return toDiscussion(updated);
        }
        return toDiscussion(discussion);
    }

    async update(
        id: DiscussionId,
        patch: Partial<Discussion>
    ): Promise<Discussion> {
        const legacyPatch: { title?: string; status?: 'active' | 'paused' | 'completed' } = {};
        if (patch.title !== undefined) {
            legacyPatch.title = patch.title;
        }
        if (patch.status !== undefined) {
            legacyPatch.status = toLegacyStatus(patch.status);
        }
        const updated = await discussionService.updateDiscussion(id, legacyPatch);
        return toDiscussion(updated);
    }

    async delete(id: DiscussionId): Promise<void> {
        await discussionService.deleteDiscussion(id);
    }
}

/** 默认 DiscussionRepository 实例 */
export const discussionRepository: DiscussionRepository =
    new MockDiscussionAdapter();
