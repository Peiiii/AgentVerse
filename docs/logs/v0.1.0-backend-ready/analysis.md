# v0.1.0-backend-ready 现状盘点（后端/存储可替换性）

## 目标
- 梳理当前“外部世界”接入点（LLM、存储、扩展）与数据流，明确需要抽象的端口。
- 识别阻碍后端落地/可替换的耦合点，作为后续重构的清单。

## 外部接口/存储现状（按能力）
- **LLM 调用**
  - `src/common/lib/ai-service`：OpenAI SDK 直连 + 自建代理模式（EventSource SSE），使用 `OpenAI` 客户端；直接暴露给 UI/业务。
  - `src/common/lib/runnable-agent`：另一套基于 OpenAI 的 agent/工具调用实现，流式处理与工具调用，与 ai-service 重叠。
  - 配置来源：`.env`（通过 `AI_PROVIDER_CONFIG`）+ 设置页（已收口 schema）。
- **设置存储**
  - `src/core/services/settings.service.ts`：localStorage/内存存储，固定 schema（`settings-schema.ts`），无后端适配器。
  - 读取后直接配置 `aiService` 和 `i18n`，UI 通过 hook 直接调用。
- **讨论/消息/成员数据**
  - `src/core/services/discussion.service.ts`
  - `src/core/services/message.service.ts`
  - `src/core/services/discussion-member.service.ts`
  - 以上均用 `MockHttpProvider`（本地存储模拟，延迟可配），无真实后端接口。
- **Agent 定义**
  - `src/core/services/agent.service.ts`：同样使用 `MockHttpProvider`。
- **文件/存储抽象**
  - `src/common/lib/storage` 下的存储适配（含 Mock、IndexedDB、HTTP），但主流程仍以 Mock 为主；IndexedDB/HTTP 未统一入口。
- **扩展机制**
  - `common/desktop/mobile features/*/extensions` + `plugin-router`：前端动态扩展点；无后端接口，但增加了装配复杂度。

## 耦合与风险
- LLM/工具调用双轨：`ai-service` 与 `runnable-agent` 并存，接口形态与错误模型不同，后端接入难以统一。
- Mock 存储与 UI 高耦合：服务层直接返回模拟数据模型，缺少 DTO ↔ Domain 映射；后端落地时改动面大。
- 设置读写直连 localStorage：缺少“设置存储”端口定义，无法无痛切换后端/安全存储。
- 扩展装配无清晰合同：extensions 直接暴露组件/配置，后端驱动或动态配置时缺少 schema/协议。

## 建议的抽象端口（下一步设计用）
- **LLM/Tool Port**：统一 Chat/Stream/Tool 调用接口；适配器分为 Browser(OpenAI SDK)/Proxy(后端)；收敛到单一路径。
- **Settings Store Port**：CRUD + reset + watch；内置 Local adapter，预留 HTTP/secure storage adapter。
- **Discussion/Message/Member Store Port**：CRUD + list by discussion；抽象 DTO ↔ Domain 映射；适配 Mock/HTTP。
- **Agent Catalog Port**：列出/更新 agent 定义；适配 Mock/HTTP。
- **File/Blob Port**（若需）：上传/下载/列目录；适配 Local/HTTP。
- **Extension Descriptor Schema**：描述扩展的路由/入口组件/权限，便于未来由后端下发或配置化。

## 下一步建议
- 先画接口草图：为上述端口写 TS 接口 + 错误模型 + 事件（watch/subscribe）。
- 选“LLM + Settings + Discussion/Message”作为第一批收敛：实现 LocalAdapter + HttpAdapter（仅接口 stub），让 UI 只依赖端口。
- 移除/封存 `runnable-agent` 或 `ai-service` 的重复路径，先收敛一套。
- 为设置与消息路径补最小冒烟测试脚本，验证切换 adapter 后行为一致。

## 接口草案（v2 - 优化版）

> 命名规范：数据存取层用 `Repository`，外部调用层用 `Client`。

### 共享类型

```ts
/** Unix 毫秒时间戳 */
type Timestamp = number;

/** 统一错误基类 */
class RepositoryError extends Error {
  constructor(
    message: string,
    public code: 'NOT_FOUND' | 'CONFLICT' | 'VALIDATION' | 'NETWORK' | 'UNKNOWN',
    public cause?: unknown
  ) {
    super(message);
  }
}

class ClientError extends Error {
  constructor(
    message: string,
    public code: 'AUTH' | 'RATE_LIMIT' | 'INVALID_REQUEST' | 'NETWORK' | 'UNKNOWN',
    public status?: number,
    public cause?: unknown
  ) {
    super(message);
  }
}
```

---

### ChatClient（原 LlmPort）

```ts
/** 聊天消息 */
interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  /** 当 role 为 tool 时，关联的 tool call id */
  toolCallId?: string;
}

/** 工具定义（传给 API 的 schema） */
interface ToolDefinition {
  name: string;
  description: string;
  parameters: JsonSchema;
}

/** 工具调用结果（API 返回） */
interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

/** 聊天请求选项 */
interface ChatOptions {
  messages: ChatMessage[];
  model: string;
  temperature?: number;
  maxTokens?: number;
  tools?: ToolDefinition[];
}

/** 聊天响应 */
interface ChatResponse {
  content: string;
  toolCalls?: ToolCall[];
  usage?: { promptTokens: number; completionTokens: number };
}

/** 流式事件 */
type StreamEvent =
  | { type: 'delta'; content: string }
  | { type: 'tool_call'; call: ToolCall }
  | { type: 'done'; usage?: ChatResponse['usage'] }
  | { type: 'error'; error: ClientError };

/** AI 对话客户端接口 */
interface ChatClient {
  chat(options: ChatOptions): Promise<ChatResponse>;
  stream(options: ChatOptions, signal?: AbortSignal): AsyncIterable<StreamEvent>;
}

// Adapters: BrowserAdapter(OpenAI SDK), ProxyAdapter(后端代理), MockAdapter
```

---

### SettingsRepository（原 SettingsStorePort）

```ts
interface SettingItem<T = unknown> {
  key: string;
  value: T;
  category: string;
  label: string;
  description?: string;
}

interface SettingsRepository {
  list(): Promise<SettingItem[]>;
  get<T>(key: string): Promise<T | undefined>;
  update(key: string, value: unknown): Promise<void>;
  reset(): Promise<SettingItem[]>;
  watch(cb: (settings: SettingItem[]) => void): () => void;
}

// Adapters: LocalStorageAdapter, HttpAdapter(预留), SecureStorageAdapter(可选)
```

---

### DiscussionRepository / MessageRepository

```ts
type DiscussionId = string;
type MessageId = string;

interface Discussion {
  id: DiscussionId;
  title: string;
  status: 'active' | 'paused' | 'archived';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface Message {
  id: MessageId;
  discussionId: DiscussionId;
  senderId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Timestamp;
}

interface DiscussionRepository {
  list(): Promise<Discussion[]>;
  get(id: DiscussionId): Promise<Discussion | undefined>;
  create(data: Omit<Discussion, 'id' | 'createdAt' | 'updatedAt'>): Promise<Discussion>;
  update(id: DiscussionId, patch: Partial<Discussion>): Promise<Discussion>;
  delete(id: DiscussionId): Promise<void>;
}

interface MessageRepository {
  list(discussionId: DiscussionId): Promise<Message[]>;
  append(message: Omit<Message, 'id' | 'createdAt'>): Promise<Message>;
  clear(discussionId: DiscussionId): Promise<void>;
}

// Adapters: MockAdapter, HttpAdapter, IndexedDBAdapter(可选)
```

---

### AgentRepository（原 AgentCatalogPort）

```ts
interface Agent {
  id: string;
  name: string;
  description?: string;
  systemPrompt?: string;
  avatar?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface AgentRepository {
  list(): Promise<Agent[]>;
  get(id: string): Promise<Agent | undefined>;
  upsert(agent: Omit<Agent, 'createdAt' | 'updatedAt'>): Promise<Agent>;
  delete(id: string): Promise<void>;
}

// Adapters: MockAdapter, HttpAdapter
```

---

### ExtensionDescriptor（保持建议状态）

```ts
interface ExtensionDescriptor {
  id: string;
  type: 'page' | 'panel' | 'tool';
  entry: string;
  route?: string;
  icon?: string;
  title?: string;
  permissions?: string[];
  version?: string;
}
```

---

## 迁移策略

### Phase 1: 接口定义（本迭代）
- 在 `src/core/repositories/` 下创建接口文件
- 不修改现有实现，只定义契约

### Phase 2: Adapter 实现
- 为现有 Mock 实现包装 Adapter
- 保持向后兼容，Service 层同时支持新旧接口

### Phase 3: 切换依赖
- UI/业务代码改为依赖新接口
- 移除旧的直接调用

### Phase 4: 清理
- 删除旧代码（`runnable-agent`、`MockHttpProvider` 直接使用）
- 移除兼容层

---

## 验证清单

| 场景 | 验证步骤 | 预期结果 |
|------|---------|---------|
| Settings 读写 | 修改 theme → 刷新 → 检查 | theme 保持 |
| Settings 适配器切换 | Mock → LocalStorage | 行为一致 |
| 消息发送 | 发送消息 → 查看历史 | 消息正确显示 |
| 流式对话 | 发送 → 点击停止 | 立即中断，无报错 |
| 流式错误 | 断网 → 发送 | 收到 error 事件 |

---

## 建议实施顺序

1. **接口定义**：在 `src/core/repositories/` 创建上述接口（本迭代）
2. **ChatClient 收敛**：保留 `ai-service`，包装为 `ChatClient` Adapter
3. **Settings 收口**：现有实现包装为 `SettingsRepository`
4. **Discussion/Message 收口**：包装现有 Mock 为 Adapter
5. **验证**：按上述清单逐项验证
