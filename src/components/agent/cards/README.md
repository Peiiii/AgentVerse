# Agent卡片组件系统

这是一个完整的Agent卡片组件系统，提供多种卡片类型和展示模式，适用于不同场景。

## 组件概览

本系统包含以下组件：

1. **基础卡片 (AgentCard)**：支持三种展示模式的基础组件
2. **选择卡片 (AgentSelectCard)**：用于Agent选择场景
3. **聊天卡片 (AgentChatCard)**：用于聊天/讨论界面
4. **组合卡片 (AgentGroupCard)**：用于展示Agent组合

## 1. 基础卡片 (AgentCard)

### 特性

- 支持三种展示模式：预览(preview)、详情(detail)和管理(management)
- 自适应不同的数据结构
- 统一的UI风格
- 可定制的交互功能

### 使用方法

```tsx
import { AgentCard } from '@/components/shared/agent-card';

// 预览模式 - 简单展示
<AgentCard 
  agent={agent} 
  mode="preview"
/>

// 详情模式 - 可展开查看详情
<AgentCard 
  agent={agent} 
  mode="detail"
  defaultExpanded={false}
/>

// 管理模式 - 包含编辑和删除功能
<AgentCard 
  agent={agent} 
  mode="management"
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

### 属性说明

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| agent | Agent 或 简化对象 | 必填 | Agent数据对象 |
| mode | "preview" \| "detail" \| "management" | "preview" | 展示模式 |
| onEdit | (agent: Agent) => void | undefined | 编辑回调函数 |
| onDelete | (agentId: string) => void | undefined | 删除回调函数 |
| className | string | undefined | 自定义CSS类名 |
| description | string | undefined | 描述文本(仅预览模式) |
| defaultExpanded | boolean | false | 是否默认展开(详情和管理模式) |

## 2. 选择卡片 (AgentSelectCard)

### 特性

- 基于基础卡片，添加选择功能
- 支持选中/未选中状态
- 支持禁用状态
- 包含复选框

### 使用方法

```tsx
import { AgentSelectCard } from '@/components/shared/agent-card';

<AgentSelectCard
  agent={agent}
  selected={isSelected}
  disabled={isDisabled}
  onSelect={(agent, selected) => {
    console.log(`Agent ${agent.name} selected: ${selected}`);
  }}
  showRole={true}
  description="可选的描述文本"
/>
```

## 3. 聊天卡片 (AgentChatCard)

### 特性

- 专为聊天/讨论界面设计
- 显示最后一条消息预览
- 显示未读消息数量
- 显示时间戳
- 支持活跃状态指示

### 使用方法

```tsx
import { AgentChatCard } from '@/components/shared/agent-card';

<AgentChatCard
  agent={agent}
  isActive={true}
  lastMessage="这是最后一条消息的预览..."
  unreadCount={3}
  timestamp={new Date()}
  onClick={() => handleChatSelect(agent)}
/>
```

## 4. 组合卡片 (AgentGroupCard)

### 特性

- 展示Agent组合信息
- 显示主持人和参与者
- 支持限制显示的参与者数量
- 包含选择按钮

### 使用方法

```tsx
import { AgentGroupCard } from '@/components/shared/agent-card';

<AgentGroupCard
  name="思维探索团队"
  description="由创意激发主持人带领的多维度思考团队"
  moderator={moderator}
  participants={participants}
  maxParticipants={4}
  onClick={() => handleGroupSelect(groupId)}
/>
```

## 场景应用指南

### 1. Agent管理页面

使用 `AgentCard` 的管理模式：

```tsx
<div className="space-y-4">
  {agents.map(agent => (
    <AgentCard
      key={agent.id}
      agent={agent}
      mode="management"
      onEdit={handleEditAgent}
      onDelete={handleDeleteAgent}
    />
  ))}
</div>
```

### 2. 讨论成员选择

使用 `AgentSelectCard`：

```tsx
<div className="grid grid-cols-2 gap-4">
  {availableAgents.map(agent => (
    <AgentSelectCard
      key={agent.id}
      agent={agent}
      selected={selectedAgents.includes(agent.id)}
      onSelect={(agent, selected) => handleAgentSelect(agent, selected)}
    />
  ))}
</div>
```

### 3. 讨论界面

使用 `AgentChatCard`：

```tsx
<div className="space-y-2">
  {discussionMembers.map(member => (
    <AgentChatCard
      key={member.id}
      agent={member}
      isActive={member.id === activeMemberId}
      lastMessage={member.lastMessage}
      unreadCount={member.unreadCount}
      timestamp={member.lastMessageTime}
      onClick={() => setActiveMember(member.id)}
    />
  ))}
</div>
```

### 4. Agent组合选择

使用 `AgentGroupCard`：

```tsx
<div className="grid grid-cols-2 gap-4">
  {agentCombinations.map(combination => (
    <AgentGroupCard
      key={combination.id}
      name={combination.name}
      description={combination.description}
      moderator={combination.moderator}
      participants={combination.participants}
      onClick={() => selectCombination(combination.id)}
    />
  ))}
</div>
```

## 设计原则

1. **一致性**：所有卡片组件保持一致的设计语言
2. **可复用性**：基础组件可被其他组件复用
3. **可扩展性**：易于添加新的卡片类型
4. **可维护性**：集中管理所有Agent卡片相关组件

## 最佳实践

1. 根据场景选择合适的卡片组件
2. 使用TypeScript类型确保数据正确性
3. 使用默认值和空值处理增强组件健壮性
4. 保持组件API简洁明了 