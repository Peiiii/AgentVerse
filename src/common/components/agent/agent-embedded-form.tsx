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
import { Textarea } from "@/common/components/ui/textarea";
import { Agent } from "@/common/types/agent";
import { useEffect, useState } from "react";

interface AgentEmbeddedFormProps {
  onSubmit: (agent: Omit<Agent, "id">) => void;
  initialData?: Agent;
  className?: string;
}

export function AgentEmbeddedForm({
  onSubmit,
  initialData,
  className,
}: AgentEmbeddedFormProps) {
  const [formData, setFormData] = useState<Omit<Agent, "id">>({
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
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              名称 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatar">头像URL</Label>
            <Input
              id="avatar"
              value={formData.avatar}
              onChange={(e) =>
                setFormData({ ...formData, avatar: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">角色</Label>
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
                <SelectItem value="moderator">主持人</SelectItem>
                <SelectItem value="participant">参与者</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="personality">性格特征</Label>
            <Input
              id="personality"
              value={formData.personality}
              onChange={(e) =>
                setFormData({ ...formData, personality: e.target.value })
              }
              placeholder="例如：理性、开放、谨慎"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expertise">专业领域</Label>
            <Input
              id="expertise"
              value={formData.expertise?.join(", ")}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  expertise: e.target.value.split(",").map((s) => s.trim()),
                })
              }
              placeholder="用逗号分隔多个领域"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bias">倾向性</Label>
            <Input
              id="bias"
              value={formData.bias}
              onChange={(e) =>
                setFormData({ ...formData, bias: e.target.value })
              }
              placeholder="例如：保守派、创新派"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="responseStyle">回复风格</Label>
            <Input
              id="responseStyle"
              value={formData.responseStyle}
              onChange={(e) =>
                setFormData({ ...formData, responseStyle: e.target.value })
              }
              placeholder="例如：简洁、详细、幽默"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              id="prompt"
              value={formData.prompt}
              onChange={(e) =>
                setFormData({ ...formData, prompt: e.target.value })
              }
              rows={6}
            />
          </div>
        </div>
        
        <Button
          type="submit"
          disabled={!formData.name.trim() || !formData.prompt.trim()}
          className="w-full"
        >
          保存修改
        </Button>
      </form>
    </div>
  );
} 