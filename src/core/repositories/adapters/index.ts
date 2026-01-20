/**
 * Adapters 统一导出
 * @module core/ports/adapters
 */

// Settings
export {
    LocalStorageSettingsAdapter,
    settingsRepository,
} from './settings.adapter';

// Discussion & Message
export {
    MockDiscussionAdapter,
    discussionRepository,
} from './discussion.adapter';
export { MockMessageAdapter, messageRepository } from './message.adapter';

// Agent
export { MockAgentAdapter, agentRepository } from './agent.adapter';

// Chat Client
export { BrowserChatClientAdapter, chatClient } from './chat-client.adapter';
