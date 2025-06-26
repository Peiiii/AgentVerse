import { Button } from "@/common/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
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
import { AgentDef } from "@/common/types/agent";
import { useEffect, useState } from "react";

interface AgentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (agent: Omit<AgentDef, "id">) => void;
  initialData?: AgentDef;
}

export function AgentForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: AgentFormProps) {
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
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {initialData ? "编辑讨论员" : "完善讨论员信息"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                名称 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="avatar" className="text-right">
                头像URL
              </Label>
              <Input
                id="avatar"
                value={formData.avatar}
                onChange={(e) =>
                  setFormData({ ...formData, avatar: e.target.value })
                }
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                角色
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value: "moderator" | "participant") =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="moderator">主持人</SelectItem>
                  <SelectItem value="participant">参与者</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="personality" className="text-right">
                性格特征
              </Label>
              <Input
                id="personality"
                value={formData.personality}
                onChange={(e) =>
                  setFormData({ ...formData, personality: e.target.value })
                }
                placeholder="例如：理性、开放、谨慎"
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="expertise" className="text-right">
                专业领域
              </Label>
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
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bias" className="text-right">
                倾向性
              </Label>
              <Input
                id="bias"
                value={formData.bias}
                onChange={(e) =>
                  setFormData({ ...formData, bias: e.target.value })
                }
                placeholder="例如：保守派、创新派"
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="responseStyle" className="text-right">
                回复风格
              </Label>
              <Input
                id="responseStyle"
                value={formData.responseStyle}
                onChange={(e) =>
                  setFormData({ ...formData, responseStyle: e.target.value })
                }
                placeholder="例如：简洁、详细、幽默"
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="prompt" className="text-right">
                Prompt
              </Label>
              <Textarea
                id="prompt"
                value={formData.prompt}
                onChange={(e) =>
                  setFormData({ ...formData, prompt: e.target.value })
                }
                className="col-span-3"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={!formData.name.trim() || !formData.prompt.trim()}
            >
              保存
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
