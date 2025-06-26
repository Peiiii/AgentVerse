import { Avatar, AvatarFallback, AvatarImage } from "@/common/components/ui/avatar";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { Separator } from "@/common/components/ui/separator";
import { Textarea } from "@/common/components/ui/textarea";
import { AgentDef } from "@/common/types/agent";
import {
  Bot,
  Brain,
  FileText,
  Image,
  Info,
  Lightbulb,
  MessageCircle,
  MessageSquare,
  Save,
  TrendingUp,
  User
} from "lucide-react";
import { useEffect, useState } from "react";

interface AgentEmbeddedFormProps {
  onSubmit: (agent: Omit<AgentDef, "id">) => void;
  initialData?: AgentDef;
  className?: string;
}

export function AgentEmbeddedForm({
  onSubmit,
  initialData,
  className,
}: AgentEmbeddedFormProps) {
  const [formData, setFormData] = useState<Omit<AgentDef, "id">>({
    name: initialData?.name || "",
    avatar: initialData?.avatar || "",
    prompt: initialData?.prompt || "",
    role: initialData?.role || "participant",
    personality: initialData?.personality || "",
    expertise: initialData?.expertise || [],
    bias: initialData?.bias || "",
    responseStyle: initialData?.responseStyle || "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        avatar: initialData.avatar,
        prompt: initialData.prompt,
        role: initialData.role,
        personality: initialData.personality,
        expertise: initialData.expertise,
        bias: initialData.bias,
        responseStyle: initialData.responseStyle,
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 基本信息区域 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="font-semibold text-base">基本信息</h4>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="w-3 h-3" />
                名称 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="为你的智能体起一个名字"
                required
                className="transition-all duration-200 focus:ring-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatar" className="flex items-center gap-2">
                <Image className="w-3 h-3" />
                头像URL
              </Label>
              <div className="flex gap-3">
                <Input
                  id="avatar"
                  value={formData.avatar}
                  onChange={(e) =>
                    setFormData({ ...formData, avatar: e.target.value })
                  }
                  placeholder="输入头像图片链接"
                  className="flex-1"
                />
                {formData.avatar && (
                  <Avatar className="w-10 h-10 ring-2 ring-border">
                    <AvatarImage src={formData.avatar} alt="预览" />
                    <AvatarFallback>预</AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="flex items-center gap-2">
                <Bot className="w-3 h-3" />
                角色类型
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value: "moderator" | "participant") =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="moderator">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4" />
                      主持人
                    </div>
                  </SelectItem>
                  <SelectItem value="participant">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      参与者
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Info className="w-3 h-3" />
                主持人负责引导讨论，参与者专注于特定观点
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* 性格特征区域 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center">
              <Brain className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <h4 className="font-semibold text-base">性格特征</h4>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="personality" className="flex items-center gap-2">
                <Brain className="w-3 h-3" />
                性格特征
              </Label>
              <Input
                id="personality"
                value={formData.personality}
                onChange={(e) =>
                  setFormData({ ...formData, personality: e.target.value })
                }
                placeholder="例如：理性、开放、谨慎、幽默"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expertise" className="flex items-center gap-2">
                <Lightbulb className="w-3 h-3" />
                专业领域
              </Label>
              <Input
                id="expertise"
                value={formData.expertise?.join(", ")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    expertise: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                  })
                }
                placeholder="用逗号分隔多个领域，例如：编程, 数据分析, 机器学习"
              />
              {formData.expertise && formData.expertise.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {formData.expertise.map((exp, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {exp}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bias" className="flex items-center gap-2">
                <TrendingUp className="w-3 h-3" />
                倾向性
              </Label>
              <Input
                id="bias"
                value={formData.bias}
                onChange={(e) =>
                  setFormData({ ...formData, bias: e.target.value })
                }
                placeholder="例如：保守派、创新派、实用主义"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responseStyle" className="flex items-center gap-2">
                <MessageCircle className="w-3 h-3" />
                回复风格
              </Label>
              <Input
                id="responseStyle"
                value={formData.responseStyle}
                onChange={(e) =>
                  setFormData({ ...formData, responseStyle: e.target.value })
                }
                placeholder="例如：简洁、详细、幽默、正式"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Prompt设置区域 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-950/50 flex items-center justify-center">
              <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <h4 className="font-semibold text-base">系统提示词</h4>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt" className="flex items-center gap-2">
              <FileText className="w-3 h-3" />
              Prompt <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="prompt"
              value={formData.prompt}
              onChange={(e) =>
                setFormData({ ...formData, prompt: e.target.value })
              }
              rows={8}
              placeholder="详细描述智能体的行为方式、知识背景和回答风格..."
              className="resize-none"
              required
            />
            <p className="text-xs text-muted-foreground">
              系统提示词将决定智能体的行为模式和知识范围，请详细描述
            </p>
          </div>
        </div>

        {/* 提交按钮 */}
        <div className="pt-4">
          <Button
            type="submit"
            disabled={!formData.name.trim() || !formData.prompt.trim()}
            className="w-full h-12 text-base font-medium"
            size="lg"
          >
            <Save className="w-4 h-4 mr-2" />
            保存智能体配置
          </Button>
        </div>
      </form>
    </div>
  );
} 