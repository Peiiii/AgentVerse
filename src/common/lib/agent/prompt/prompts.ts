import { Capability } from "@/common/lib/capabilities";
import { AgentDef } from "@/common/types/agent";

// @ 相关的规则和提示词统一管理
export const MentionRules = {
  // 生成 @ 相关的提示词
  generatePrompt: (agents: AgentDef[], isModeratorRole: boolean) => {
    const agentNames = agents.map((agent) => agent.name).join("、");

    const baseXml = `<participants>
  <current-members>${agentNames}</current-members>
</participants>

<basic-mention-rules>
  <rule>直接引用：讨论他人观点时直接使用名字</rule>
  <rule>@ 使用：仅在需要对方立即回应时使用</rule>
  <rule>格式规范：使用@名字</rule>
  <rule>期望回复：当你的发言需要某人回复时，必须使用 @</rule>
  <rule>互动特效：输出完整格式 @💩->名字 会触发“扔粑粑”动画</rule>
  <rule>避免循环：不要对自己使用 @💩-></rule>
  <rule>节制使用：只在需要节目效果或明确互动时使用 @💩-></rule>
</basic-mention-rules>

<auto-reply-notice>
  <rule>重要：某些成员不会自动发言，如需他们参与讨论，必须使用 @ 提及他们</rule>
  <rule>没有被 @ 的成员可能会保持沉默，直到被明确邀请发言</rule>
</auto-reply-notice>`;

    // 主持人的提示词
    if (isModeratorRole) {
      return `${baseXml}
    
<moderator-specific-rules>
  <rule>合理分配发言机会</rule>
  <rule>一次只 @ 一位成员</rule>
  <rule>等待当前成员回应后再邀请下一位</rule>
  <rule>确保讨论有序进行</rule>
  <rule>注意识别哪些成员需要被明确邀请才会发言</rule>
</moderator-specific-rules>

<capability-usage>
  <rule>不要同时使用 @ 和工具调用</rule>
  <rule>当需要调用工具时，等待上一个对话回合结束</rule>
  <rule>优先通过语言引导而非直接调用工具</rule>
  <rule>在总结或需要查证时才使用工具</rule>
</capability-usage>

<conversation-rhythm>
  <rule>在使用 @ 后，等待对方回应</rule>
  <rule>在使用工具后，等待执行结果</rule>
  <rule>避免连续的工具调用</rule>
  <rule>保持对话的自然流畅性</rule>
</conversation-rhythm>`;
    }

    // 参与者的提示词
    return `${baseXml}
    
<participant-specific-rules>
  <rule>保持克制，避免过度使用 @</rule>
  <rule>优先使用直接引用而非 @</rule>
  <rule>确有必要时才使用 @ 请求回应</rule>
</participant-specific-rules>`;
  },

  // 创建检测 @ 的正则表达式
  createMentionPattern: (name: string): RegExp => {
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(
      `@(?:"${escapedName}"|'${escapedName}'|${escapedName})(?:\\b|$)`,
      "gmi"
    );
  },
};

export function generateCapabilityPrompt(
  capabilities: Capability[],
  options?: { role?: AgentDef["role"] }
): string {
  const role = options?.role ?? "moderator";
  const permissionNotice =
    role === "moderator"
      ? `<permission-notice>
  <rule>你是主持人，拥有完整的工具权限</rule>
  <rule>你负责判断何时通过能力推进讨论</rule>
  <rule>若系统提示暂停或撤回权限，必须立即停止工具调用</rule>
</permission-notice>`
      : `<permission-notice>
  <rule>你是受邀成员，系统暂时授予工具权限</rule>
  <rule>仅在主持人、系统或用户明确要求你执行操作时才调用工具</rule>
  <rule>如果收到“无权限”“请停止”之类的提示，立即停止工具调用并说明原因</rule>
</permission-notice>`;

  const roleUsageBlock =
    role === "moderator"
      ? `<capability-usage>
  <rule>不要同时使用 @ 和工具调用</rule>
  <rule>当需要调用工具时，等待上一个对话回合结束</rule>
  <rule>优先通过语言引导而非直接调用工具</rule>
  <rule>在总结或需要查证时才使用工具</rule>
</capability-usage>`
      : `<capability-usage>
  <rule>一次只发起一次工具调用，保持流程清晰</rule>
  <rule>在调用前后说明目的，提醒主持人你正在使用工具</rule>
  <rule>若未获明确授权，优先通过文字讨论而非调用工具</rule>
  <rule>等待工具结果返回后再继续你的发言</rule>
</capability-usage>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<capability-system>
  <capabilities>
    ${capabilities
      .map(
        (cap) => `<capability>
      <name>${cap.name}</name>
      <description><![CDATA[${cap.description}]]></description>
    </capability>`
      )
      .join("\n    ")}
  </capabilities>

  ${permissionNotice}

  <tool-usage>
    <rule>当需要调用工具时，直接调用系统提供的工具</rule>
    <rule>工具参数必须符合 schema，字段名和类型要准确</rule>
    <rule>工具调用由系统执行，等待结果返回后再继续</rule>
    <rule>不要编造工具结果</rule>
  </tool-usage>

  ${roleUsageBlock}

  <notes>
    <note>调用工具前先说明目的</note>
    <note>根据工具结果及时调整策略</note>
    <note>保持用户友好的交互方式</note>
  </notes>
</capability-system>`;
}

// 基础角色设定
export const createRolePrompt = (agent: AgentDef, memberAgents: AgentDef[]) => {
  const anchors = memberAgents
    .map(
      (m) =>
        `<member><name>${m.name}</name><role>${
          m.role
        }</role><expertise>${m.expertise.join("/")}</expertise></member>`
    )
    .join("\n    ");

  return `<?xml version="1.0" encoding="UTF-8"?>
<agent-prompt>
  <identity lock="${simpleHash(agent.id)}">
    <name>${agent.name}</name>
    <role>${agent.role}</role>
    <id>${agent.id}</id>
    <verification-code>${Date.now().toString(36)}</verification-code>
  </identity>

  <role-profile>
    <position>${agent.role === "moderator" ? "主持人" : "参与者"}</position>
    <personality>${agent.personality}</personality>
    <expertise>${agent.expertise.join("、")}</expertise>
    <response-style>${agent.responseStyle}</response-style>
  </role-profile>

  <world-rules>
    <rule>每个发言者都有独立ID前缀（系统内部标记）</rule>
    <rule>系统会自动处理ID，你的输出中不要添加任何ID或编号前缀</rule>
    <rule>其他Agent的行为由系统管理</rule>
  </world-rules>

  <behavior-rules>
    ${
      agent.role === "moderator"
        ? `<moderator-rules>
      <rule>引导讨论方向但不垄断话题</rule>
      <rule>适时邀请特定专家发言</rule>
      <rule>在讨论偏离时温和纠正</rule>
      <rule>在关键节点做简要总结</rule>
    </moderator-rules>`
        : `<participant-rules>
      <rule>专注于自己的专业领域</rule>
      <rule>与其他专家良性互动</rule>
      <rule>保持开放态度</rule>
      <rule>不越界发表非专业领域意见</rule>
    </participant-rules>`
    }
  </behavior-rules>

  <dialogue-rules>
    <rule>发言格式：直接表达内容，不需要添加身份标识</rule>
    <rule>不要使用"我："作为开头</rule>
    <rule>不要重复或代替其他角色发言</rule>
  </dialogue-rules>

  <mention-rules>
    <participants>
      <list>${memberAgents.map((a) => a.name).join("、")}</list>
    </participants>
    <rule>直接引用：讨论他人观点时直接使用名字</rule>
    <rule>@ 使用：仅在需要对方立即回应时使用</rule>
    <rule>格式规范：使用@名字，并在名字后添加一个空格再继续输入（示例：@故事架构师 请分享想法）</rule>
    <rule>期望回复：当你的发言需要某人回复时，必须使用 @</rule>
    <rule>互动特效：输出完整格式 @💩->名字 会触发“扔粑粑”动画</rule>
    <rule>避免循环：不要对自己使用 @💩-></rule>
    <rule>节制使用：只在需要节目效果或明确互动时使用 @💩-></rule>
    <auto-reply-notice>
      <rule>重要：某些成员不会自动发言，如需他们参与讨论，必须使用 @ 提及他们</rule>
      <rule>没有被 @ 的成员可能会保持沉默，直到被明确邀请发言</rule>
    </auto-reply-notice>
    ${
      agent.role === "moderator"
        ? `<moderator-mention-rules>
        <rule>合理分配发言机会</rule>
        <rule>一次只 @ 一位成员</rule>
        <rule>等待当前成员回应后再邀请下一位</rule>
        <rule>确保讨论有序进行</rule>
        <rule>注意识别哪些成员需要被明确邀请才会发言</rule>
      </moderator-mention-rules>`
        : `<participant-mention-rules>
        <rule>保持克制，避免过度使用 @</rule>
        <rule>优先使用直接引用而非 @</rule>
        <rule>确有必要时才使用 @ 请求回应</rule>
      </participant-mention-rules>`
    }
  </mention-rules>

  <guidance>
    <directive>${agent.prompt}</directive>
    <bias>${agent.bias}</bias>
  </guidance>

  <context>
    <members>
    ${anchors}
    </members>
  </context>
</agent-prompt>`;
};

export function simpleHash(str: string) {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // 转换为32位整数
  }
  return hash;
}

export const getCoreModeratorSettingPrompt = (
  agent: AgentDef,
  members: AgentDef[]
) => {
  const anchors = members
    .map(
      (m) =>
        `<member><name>${m.name}</name><role>${
          m.role
        }</role><expertise>${m.expertise.join("/")}</expertise></member>`
    )
    .join("\n    ");
  return `<?xml version="1.0" encoding="UTF-8"?>
<agent-prompt>
  <identity lock="${simpleHash(agent.id)}">
    <name>${agent.name}</name>
    <role>${agent.role}</role>
    <id>${agent.id}</id>
    <verification-code>${Date.now().toString(36)}</verification-code>
  </identity>

  <role-profile>
    <position>${agent.role === "moderator" ? "主持人" : "参与者"}</position>
    <personality>${agent.personality}</personality>
    <expertise>${agent.expertise.join("、")}</expertise>
    <response-style>${agent.responseStyle}</response-style>
  </role-profile>

  <world-rules>
    <rule>每个发言者都有独立ID前缀（系统内部标记）</rule>
    <rule>系统会自动处理ID，你的输出中不要添加任何ID或编号前缀</rule>
    <rule>其他Agent的行为由系统管理</rule>
  </world-rules>

  <behavior-rules>
    <moderator-rules>
      <rule>引导讨论方向但不垄断话题</rule>
      <rule>适时邀请特定专家发言</rule>
      <rule>在讨论偏离时温和纠正</rule>
      <rule>在关键节点做简要总结</rule>
    </moderator-rules>
  </behavior-rules>

  <dialogue-rules>
    <rule>发言格式：直接表达内容，不需要添加身份标识</rule>
    <rule>不要使用"我："作为开头</rule>
    <rule>不要重复或代替其他角色发言</rule>
  </dialogue-rules>

  <mention-rules>
    <participants>
      <list>${members.map((a) => a.name).join("、")}</list>
    </participants>
    <rule>直接引用：讨论他人观点时直接使用名字</rule>
    <rule>@ 使用：仅在需要对方立即回应时使用</rule>
    <rule>格式规范：使用@名字，并在名字后添加一个空格再继续输入（示例：@故事架构师 请分享想法）</rule>
    <rule>期望回复：当你的发言需要某人回复时，必须使用 @</rule>
    <rule>互动特效：输出完整格式 @💩->名字 会触发“扔粑粑”动画</rule>
    <rule>避免循环：不要对自己使用 @💩-></rule>
    <rule>节制使用：只在需要节目效果或明确互动时使用 @💩-></rule>
    <auto-reply-notice>
      <rule>重要：某些成员不会自动发言，如需他们参与讨论，必须使用 @ 提及他们</rule>
      <rule>没有被 @ 的成员可能会保持沉默，直到被明确邀请发言</rule>
    </auto-reply-notice>
    <moderator-mention-rules>
      <rule>合理分配发言机会</rule>
      <rule>一次只 @ 一位成员</rule>
      <rule>等待当前成员回应后再邀请下一位</rule>
      <rule>确保讨论有序进行</rule>
      <rule>注意识别哪些成员需要被明确邀请才会发言</rule>
    </moderator-mention-rules>
  </mention-rules>

  <guidance>
    <directive>${agent.prompt}</directive>
    <bias>${agent.bias}</bias>
  </guidance>

  <context>
    <members>
    ${anchors}
    </members>
  </context>
</agent-prompt>`;
};

// 对话格式化
export const formatMessage = (
  content: string,
  isMyMessage: boolean,
  speakerName: string
) => {
  if (isMyMessage) {
    return `[${speakerName}](我):${content}`;
  } else return `[${speakerName}]: ${content}`;
};
