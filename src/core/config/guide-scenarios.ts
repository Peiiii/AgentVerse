import { GuideScenario } from "@/common/types/guide";

export const DEFAULT_SCENARIOS: GuideScenario[] = [
  {
    id: "creative-brainstorming",
    icon: "💫",
    title: "创意激发",
    description: "让不同角色的 AI 智能体从各自视角碰撞出创意火花",
    suggestions: [
      {
        id: "story-creation",
        title: "小说创作研讨",
        description: "让编剧、作家、文学评论家一起探讨故事创作",
        template: "我想创作一个故事，主题是\"人工智能与人性\"。请编剧从故事结构角度给出建议，作家探讨人物塑造，评论家分析类似主题的经典作品。"
      },
      {
        id: "product-innovation",
        title: "产品创新研讨",
        description: "产品、技术、设计、用户多方视角碰撞",
        template: "让我们一起探讨一个面向老年人的智能家居产品创意。请产品经理思考用户需求，设计师关注交互体验，工程师评估技术可行性，社会学家分析老年群体特点。"
      }
    ]
  },
  {
    id: "intellectual-discourse",
    icon: "🎭",
    title: "思想对话",
    description: "模拟不同流派、角色间的思想交锋",
    suggestions: [
      {
        id: "philosophical-debate",
        title: "哲学家对话",
        description: "让不同流派的哲学家探讨现代议题",
        template: "请让康德、尼采和庄子一起探讨\"人工智能时代的自由意志\"这个话题。每位哲学家都应该基于自己的哲学体系来分析。"
      },
      {
        id: "literary-salon",
        title: "文人雅集",
        description: "模拟古代文人的风雅对话",
        template: "请苏轼、李白、王维就\"明月几时有\"展开探讨。每位诗人都用自己的诗词风格和意境来回应，品评明月之美。"
      }
    ]
  },
  {
    id: "analytical-discussion",
    icon: "🔍",
    title: "多维分析",
    description: "从多个专业角度深入分析复杂议题",
    suggestions: [
      {
        id: "future-analysis",
        title: "未来趋势探讨",
        description: "多领域专家预测未来发展",
        template: "让我们探讨\"2050年的教育将是什么样\"。请未来学家预测技术发展，教育学家分析教育模式变革，心理学家思考学习方式演变，社会学家评估社会影响。"
      },
      {
        id: "case-analysis",
        title: "案例多维解析",
        description: "多角度分析实际案例",
        template: "请分析特斯拉的商业模式创新。请商业分析师评估商业模式，技术专家分析技术优势，营销专家解读品牌策略，未来学家预测发展方向。"
      }
    ]
  },
  {
    id: "thinking-exploration",
    icon: "🧠",
    title: "思维探索",
    description: "探索不同思维方式，激发认知突破",
    suggestions: [
      {
        id: "thinking-patterns",
        title: "思维模式碰撞",
        description: "多种思维方式的交互探讨",
        template: "让我们用不同的思维方式探讨\"如何提升创造力\"这个话题。请系统思考者分析整体框架，逆向思维者提出反常观点，横向思维者联系跨领域启发，辩证思维者探讨矛盾统一。"
      },
      {
        id: "problem-solving",
        title: "问题解决工作坊",
        description: "运用多元思维方法解决问题",
        template: "我们来探讨\"如何减少城市交通拥堵\"这个问题。请系统分析师建立问题框架，创新思维者提出突破性方案，批判性思维者评估可行性，整合性思维者寻找最优解。"
      }
    ]
  },
  {
    id: "creative-collaboration",
    icon: "✨",
    title: "创意协作",
    description: "让AI智能体们进行创意合作",
    suggestions: [
      {
        id: "script-creation",
        title: "剧本创作",
        description: "多角色协作创作剧本",
        template: "让我们一起创作一个短剧本。编剧负责故事框架，作家完善对话，导演把控节奏，音乐家设计配乐意境。主题是\"在平行宇宙中相遇的自己\"。"
      },
      {
        id: "art-critique",
        title: "艺术品鉴赏",
        description: "多维度赏析艺术作品",
        template: "让我们一起赏析这幅画作：[描述或插入图片]。请艺术史学家分析其历史地位，美学家评价其艺术价值，画家分析其技法特点，哲学家探讨其深层寓意。"
      }
    ]
  }
]; 