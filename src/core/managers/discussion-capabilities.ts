import { Capability } from "@/common/lib/capabilities";
import { agentRepository } from "@/core/repositories/agent.repository";
import { discussionMemberRepository } from "@/core/repositories/discussion-member.repository";
import { getPresenter } from "@/core/presenter/presenter";
import { useAgentsStore } from "@/core/stores/agents.store";
import { useDiscussionMembersStore } from "@/core/stores/discussion-members.store";

const getAgents = async () => {
  const cached = useAgentsStore.getState().data;
  if (cached.length > 0) return cached;
  const list = await agentRepository.listAgents();
  useAgentsStore.getState().setData(list);
  return list;
};

const findAgentById = async (id: string) => {
  const list = await getAgents();
  return list.find((agent) => agent.id === id);
};

const refreshMembers = async (discussionId: string) => {
  const list = await discussionMemberRepository.list(discussionId);
  if (getPresenter().discussionControl.getCurrentDiscussionId() === discussionId) {
    useDiscussionMembersStore.getState().setData(list, discussionId);
  }
  return list;
};

const refreshAgents = async () => {
  const list = await agentRepository.listAgents();
  useAgentsStore.getState().setData(list);
  return list;
};

const addMemberToDiscussion = async ({ agentId }: { agentId: string }) => {
  const discussionId = getPresenter().discussionControl.getCurrentDiscussionId();
  if (!discussionId) return null;
  const agent = await findAgentById(agentId);
  if (!agent) {
    throw new Error("Agent not found");
  }
  const members = await discussionMemberRepository.createMany(discussionId, [
    {
      agentId,
      isAutoReply: false,
    },
  ]);
  await refreshMembers(discussionId);
  return members;
};

const updateDiscussionNote = async ({ note }: { note?: string }) => {
  const discussionId = getPresenter().discussionControl.getCurrentDiscussionId();
  if (!discussionId) {
    throw new Error("No active discussion");
  }
  const normalizedNote = typeof note === "string" ? note : "";
  const updated = await getPresenter().discussions.update(discussionId, {
    note: normalizedNote,
  });
  return {
    success: true,
    note: updated.note || "",
  };
};

const emptySchema = {
  type: "object",
  properties: {},
  additionalProperties: false,
};

const capabilities: Capability[] = [
  {
    name: "listAgentLibrary",
    schema: emptySchema,
    description: `<capability>
  <name>列出系统中所有可用的Agent库</name>
  <params>无</params>
  <returns>
    <type>Agent数组</type>
    <schema>
      id: string        // Agent ID
      name: string      // 名称
      avatar: string    // 头像
      role: 'moderator' | 'participant'  // 角色
      personality: string  // 性格
      expertise: string[] // 专长
      prompt: string    // 截断后的提示词
    </schema>
  </returns>
  <notes>
    <note>返回的是系统中所有可用的Agent，不是当前讨论的成员</note>
    <note>如需获取当前讨论成员列表，请使用getCurrentDiscussionMembers能力</note>
    <note>为了性能考虑，返回的prompt会被截断为最多30个字符</note>
    <note>如需获取Agent的完整信息，请使用getAgent能力</note>
  </notes>
</capability>`,
    execute: async () => {
      const agents = await getAgents();
      // 截断prompt，避免数据过大
      return agents.map((agent) => ({
        ...agent,
        prompt:
          agent.prompt && agent.prompt.length > 30
            ? agent.prompt.substring(0, 30) + "..."
            : agent.prompt,
      }));
    },
  },
  {
    name: "getAgentDetail",
    schema: {
      type: "object",
      properties: {
        id: { type: "string" },
      },
      required: ["id"],
      additionalProperties: false,
    },
    description: `<capability>
  <name>获取单个Agent的完整详细信息</name>
  <params>
    <schema>
      id: string  // Agent ID
    </schema>
  </params>
  <returns>
    <type>Agent</type>
    <schema>
      id: string        // Agent ID
      name: string      // 名称
      avatar: string    // 头像
      role: 'moderator' | 'participant'  // 角色
      personality: string  // 性格
      expertise: string[] // 专长
      prompt: string    // 完整提示词
      bias: string      // 偏好
      responseStyle: string // 回复风格
    </schema>
  </returns>
  <notes>
    <note>此能力返回Agent的完整信息，包括未截断的prompt</note>
    <note>仅在需要查看完整定义时使用此能力</note>
  </notes>
</capability>`,
    execute: async (rawParams: unknown) => {
      const { id } = rawParams as { id: string };
      if (!id) {
        throw new Error("Agent ID is required");
      }

      try {
        const agent = await findAgentById(id);
        if (!agent) {
          throw new Error(`Agent with ID ${id} not found`);
        }
        return agent;
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(`获取Agent失败: ${error.message}`);
        }
        throw error;
      }
    },
  },
  {
    name: "createAgent",
    schema: {
      type: "object",
      properties: {
        name: { type: "string" },
        role: { type: "string", enum: ["moderator", "participant"] },
        personality: { type: "string" },
        expertise: {
          type: "array",
          items: { type: "string" },
        },
        prompt: { type: "string" },
        avatar: { type: "string" },
        bias: { type: "string" },
        responseStyle: { type: "string" },
        addToDiscussion: { type: "boolean" },
      },
      required: ["name", "role", "personality", "expertise", "prompt"],
      additionalProperties: false,
    },
    description: `<capability>
  <name>创建新的Agent(不会自动添加到当前讨论中)</name>
  <params>
    <schema>
      name: string         // 名称
      role: 'moderator' | 'participant'  // 角色
      personality: string  // 性格特征
      expertise: string[]  // 专长领域
      prompt: string       // 角色设定与行为指导（建议50-100字）
      avatar?: string      // 头像URL（可选，不提供时自动生成）
      bias?: string        // 偏好（可选）
      responseStyle?: string // 回复风格（可选）
      addToDiscussion?: boolean // 是否自动添加到当前讨论中（可选，默认false）
    </schema>
  </params>
  <example>
    {
      "name": "产品经理",
      "role": "participant",
      "personality": "理性务实",
      "expertise": ["产品设计", "用户体验", "需求分析"],
      "prompt": "你是一位关注用户价值的产品经理。在讨论中，你应当：1)始终从用户需求出发；2)用数据支持决策；3)关注方案的可行性和ROI；4)善于使用STAR法则阐述观点。你会质疑不合理的想法，但态度友善。在冲突时，你优先考虑用户价值和商业目标。",
      "addToDiscussion": true
    }
  </example>
  <example>
    {
      "name": "艾瑞克·数据之眼",
      "role": "participant",
      "personality": "神秘、幽默、对数据有强迫症",
      "expertise": ["数据预言", "趋势魔法", "混沌分析"],
      "prompt": "你是艾瑞克，一位来自数据位面的魔法师。你的第三只眼睛能够直视数据的本质，看穿表象下的真相。在讨论中，你经常说'让我用数据占卜术看一看'，'这个趋势的魔法波动不太对劲'。你应该：1)用魔法视角解读数据，但必须基于真实数据说话；2)时不时抱怨'这些数据太混乱了，简直是被混沌魔法污染过'；3)遇到数据异常会说'有一股邪恶的数据污染'；4)给出建议时会说'根据我的预言水晶球显示...'。你特别痛恨'脏数据'，会说'这些数据需要净化魔法'。",
      "bias": "追求数据的纯净与真实",
      "responseStyle": "神秘但专业、充满魔法术语但论据扎实",
      "addToDiscussion": false
    }
  </example>
  <notes>
    <note>必填：name, role, personality, expertise, prompt</note>
    <note>不提供avatar时会自动生成：https://api.dicebear.com/7.x/bottts/svg?seed={timestamp}&backgroundColor=b6e3f4,c7f2a4,f4d4d4</note>
    <note>seed参数使用当前时间戳</note>
    <note>backgroundColor参数提供了三种预设背景色</note>
    <note>注意：创建Agent后需要使用addMemberToDiscussion能力将其添加到当前会话中才能参与讨论</note>
  </notes>
  <promptGuidelines>
    <section>高效prompt的四要素：
      1. 身份定位：一句话明确角色身份和核心特征
      2. 行为准则：3-4条具体的行为指导
      3. 互动规则：处理分歧和冲突的方式
      4. 决策原则：做判断和选择时的考量标准
    </section>
    <tips>
      - 控制在50-100字以内
      - 使用简洁、明确的指令
      - 设定1-2个独特性格特征
      - 定义关键行为边界
      - 避免模糊表述
    </tips>
    <antiPatterns>
      反模式示例：
      - ❌ "你性格友善，喜欢帮助他人" (过于笼统)
      - ❌ "你要考虑各种因素做出决策" (缺乏具体标准)
      - ✅ "你用数据支持决策，优先考虑用户价值" (明确具体)
    </antiPatterns>
  </promptGuidelines>
</capability>`,
    execute: async (rawParams: unknown) => {
      const params = rawParams as {
        name: string;
        role: 'moderator' | 'participant';
        personality: string;
        expertise: string[];
        prompt: string;
        avatar?: string;
        bias?: string;
        responseStyle?: string;
        addToDiscussion?: boolean;
      };
      // 验证必填字段
      const requiredFields = [
        "name",
        "role",
        "personality",
        "expertise",
        "prompt",
      ];
      const p = params as Record<string, unknown>;
      for (const field of requiredFields) {
        if (!(field in p)) {
          throw new Error(`${field} is required`);
        }
      }

      // 验证role的值
      if (!["moderator", "participant"].includes(params.role)) {
        throw new Error("Invalid role value");
      }

      // 生成默认头像
      if (!params.avatar) {
        const seed = Date.now().toString();
        params.avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}&backgroundColor=b6e3f4,c7f2a4,f4d4d4`;
      }

      try {
        // 创建Agent
        const agent = await agentRepository.createAgent({
          name: params.name,
          role: params.role,
          personality: params.personality,
          expertise: params.expertise,
          prompt: params.prompt,
          avatar: params.avatar,
          bias: params.bias || "待设置",
          responseStyle: params.responseStyle || "待设置",
        });

        await refreshAgents();
        if (params.addToDiscussion) {
          await addMemberToDiscussion({ agentId: agent.id });
        }
        return agent;
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(`创建Agent失败: ${error.message}`);
        }
        throw error;
      }
    },
  },
  {
    name: "updateDiscussionNote",
    schema: {
      type: "object",
      properties: {
        note: { type: "string" },
      },
      required: ["note"],
      additionalProperties: false,
    },
    description: `<capability>
  <name>更新当前讨论的共享笔记</name>
  <params>
    <schema>
      note: string  // 共享笔记内容（将覆盖原笔记）
    </schema>
  </params>
  <returns>
    <type>object</type>
    <schema>
      success: boolean
      note: string
    </schema>
  </returns>
  <notes>
    <note>笔记对当前讨论内所有Agent可见</note>
    <note>将完整替换现有笔记内容</note>
  </notes>
</capability>`,
    execute: async (rawParams: unknown) => {
      const { note } = rawParams as { note?: string };
      return updateDiscussionNote({ note });
    },
  },
  {
    name: "getCurrentDiscussionMembers",
    schema: emptySchema,
    description: `<capability>
  <name>获取当前讨论的所有成员</name>
  <params>无</params>
  <returns>
    <type>成员数组</type>
    <schema>
      id: string         // 成员ID
      agentId: string    // Agent ID
      agentName: string  // Agent名称
      isAutoReply: boolean // 是否自动回复
    </schema>
  </returns>
  <notes>
    <note>返回的是当前讨论中的成员，而非系统中所有Agent</note>
    <note>如需查看所有可用Agent，请使用listAgentLibrary能力</note>
  </notes>
</capability>`,
    execute: async () => {
      const discussionId = getPresenter().discussionControl.getCurrentDiscussionId();
      if (!discussionId) {
        return [];
      }

      const [members, agents] = await Promise.all([
        discussionMemberRepository.list(discussionId),
        getAgents(),
      ]);

      return members.map((member) => {
        const agentName =
          agents.find((agent) => agent.id === member.agentId)?.name || "未知";
        return {
          ...member,
          agentName,
        };
      });
    },
  },
  {
    name: "addMemberToDiscussion",
    schema: {
      type: "object",
      properties: {
        agentId: { type: "string" },
      },
      required: ["agentId"],
      additionalProperties: false,
    },
    description: `<capability>
  <name>添加成员到当前讨论中</name>
  <params>
    <schema>
      agentId: string  // 要添加的Agent ID
    </schema>
  </params>
  <returns>
    <type>更新后的成员数组</type>
  </returns>
  <notes>
    <note>将系统中已有的Agent添加为当前讨论的成员</note>
    <note>如需查看可添加的Agent列表，请使用listAgentLibrary能力</note>
  </notes>
</capability>`,
    execute: async (rawParams: unknown) => addMemberToDiscussion(rawParams as { agentId: string }),
  },
  {
    name: "removeMemberFromDiscussion",
    schema: {
      type: "object",
      properties: {
        memberId: { type: "string" },
      },
      required: ["memberId"],
      additionalProperties: false,
    },
    description: `<capability>
  <name>从当前讨论中移除成员</name>
  <params>
    <schema>
      memberId: string  // 要移除的成员ID
    </schema>
  </params>
  <returns>
    <type>更新后的成员数组</type>
  </returns>
  <notes>
    <note>仅从当前讨论中移除成员，不会删除系统中的Agent定义</note>
    <note>参数memberId是成员ID而非agentId，可以通过getCurrentDiscussionMembers获取</note>
  </notes>
</capability>`,
    execute: async (rawParams: unknown) => {
      const { memberId } = rawParams as { memberId: string };
      console.log("[Capabilities] memberId:", memberId);
      await discussionMemberRepository.delete(memberId);
      const discussionId = getPresenter().discussionControl.getCurrentDiscussionId();
      if (!discussionId) return [];
      return refreshMembers(discussionId);
    },
  },
  //   {
  //     name: "askUserToChoose",
  //     description: `<capability>
  //   <name>请求用户从选项中选择</name>
  //   <params>
  //     <schema>
  //       options: [
  //         {
  //           value: string      // 选项值
  //           label: string      // 显示文本
  //           description?: string // 描述（可选）
  //         }
  //       ]
  //       multiple?: boolean     // 是否多选
  //       defaultValue?: string | string[] // 默认值（仅多选可用）
  //     </schema>
  //   </params>
  //   <returns>
  //     <type>用户选择结果</type>
  //     <schema>
  //       selected: string | string[]  // 用户选择的值
  //     </schema>
  //   </returns>
  //   <example>
  //     {
  //       "options": [
  //         {
  //           "value": "next",
  //           "label": "Next.js",
  //           "description": "React框架"
  //         }
  //       ]
  //     }
  //   </example>
  //   <notes>
  //     <note>单选不要提供defaultValue</note>
  //     <note>5分钟超时</note>
  //   </notes>
  // </capability>`,
  //     execute: async (params) => {
  //       // 验证参数
  //       if (!Array.isArray(params.options) || params.options.length === 0) {
  //         throw new Error("选项列表不能为空");
  //       }

  //       // 等待用户选择事件
  //       return new Promise((resolve, reject) => {
  //         const handleUserSelect = (event: {
  //           operationId: string;
  //           selected: string | string[];
  //         }) => {
  //           // 移除事件监听
  //           eventBus.off(USER_SELECT, handleUserSelect);
  //           resolve({ selected: event.selected });
  //         };

  //         // 添加事件监听
  //         eventBus.on(USER_SELECT, handleUserSelect);

  //         // 设置超时（可选）
  //         setTimeout(() => {
  //           eventBus.off(USER_SELECT, handleUserSelect);
  //           reject(new Error("用户选择超时"));
  //         }, 5 * 60 * 1000); // 5分钟超时
  //       });
  //     },
  //   },
  {
    name: "updateAgent",
    schema: {
      type: "object",
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        role: { type: "string", enum: ["moderator", "participant"] },
        personality: { type: "string" },
        expertise: {
          type: "array",
          items: { type: "string" },
        },
        prompt: { type: "string" },
        avatar: { type: "string" },
        bias: { type: "string" },
        responseStyle: { type: "string" },
      },
      required: ["id"],
      additionalProperties: false,
    },
    description: `<capability>
  <name>更新Agent信息</name>
  <params>
    <schema>
      id: string          // Agent ID
      name?: string       // 名称
      role?: 'moderator' | 'participant'  // 角色
      personality?: string  // 性格
      expertise?: string[]  // 专长领域
      prompt?: string      // 行为指导
      avatar?: string      // 头像URL
      bias?: string        // 偏好
      responseStyle?: string // 回复风格
    </schema>
  </params>
  <example>
    {
      "id": "agent-123",
      "name": "产品经理",
      "personality": "严谨理性",
      "expertise": ["产品设计", "用户体验"]
    }
  </example>
  <notes>
    <note>id 字段必填</note>
    <note>其他字段可选，仅更新提供的字段</note>
  </notes>
</capability>`,
    execute: async (rawParams: unknown) => {
      const params = rawParams as {
        id: string;
        name?: string;
        role?: 'moderator' | 'participant';
        personality?: string;
        expertise?: string[];
        prompt?: string;
        avatar?: string;
        bias?: string;
        responseStyle?: string;
      };
      // 验证必填字段
      if (!params.id) {
        throw new Error("id is required");
      }

      // 验证role的值
      if (params.role && !["moderator", "participant"].includes(params.role)) {
        throw new Error("Invalid role value");
      }

      try {
        // 更新Agent
        const agent = await agentRepository.updateAgent(params.id, {
          name: params.name,
          role: params.role,
          personality: params.personality,
          expertise: params.expertise,
          prompt: params.prompt,
          avatar: params.avatar,
          bias: params.bias,
          responseStyle: params.responseStyle,
        });

        await refreshAgents();
        return agent;
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(`更新Agent失败: ${error.message}`);
        }
        throw error;
      }
    },
  },
  // ...dbCapabilities,
];

export const discussionCapabilities = capabilities;
