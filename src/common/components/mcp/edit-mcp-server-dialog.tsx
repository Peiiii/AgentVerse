import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/common/components/ui/select";
import { Textarea } from "@/common/components/ui/textarea";
import { useModal } from "@/common/components/ui/modal";
import { useBreakpointContext } from "@/common/components/common/breakpoint-provider";
import { cn } from "@/common/lib/utils";
import { Edit, Save, X } from "lucide-react";
import React, { useCallback, useState } from "react";
import type { MCPServerConfig } from "@/core/stores/mcp-server.store";

interface EditMCPServerDialogContentProps {
  server: MCPServerConfig;
  onSubmit: (updates: Partial<MCPServerConfig>) => void;
  onClose: () => void;
}

function EditMCPServerDialogContent({ server, onSubmit, onClose }: EditMCPServerDialogContentProps) {
  const [serverName, setServerName] = useState(server.name);
  const [serverUrl, setServerUrl] = useState(server.url);
  const [serverType, setServerType] = useState<"sse" | "streamable-http">(server.type);
  const [serverDescription, setServerDescription] = useState(server.description || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updates: Partial<MCPServerConfig> = {
      name: serverName,
      url: serverUrl,
      type: serverType,
      description: serverDescription || undefined,
    };
    
    onSubmit(updates);
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="edit-server-name">服务器名称</Label>
        <Input
          id="edit-server-name"
          value={serverName}
          onChange={(e) => setServerName(e.target.value)}
          placeholder="文件系统服务器"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="edit-server-url">服务器地址</Label>
        <Input
          id="edit-server-url"
          value={serverUrl}
          onChange={(e) => setServerUrl(e.target.value)}
          placeholder="http://localhost:3000"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="edit-server-type">传输协议</Label>
        <Select value={serverType} onValueChange={(value: "sse" | "streamable-http") => setServerType(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="streamable-http">Streamable HTTP</SelectItem>
            <SelectItem value="sse">SSE</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="edit-server-description">描述（可选）</Label>
        <Textarea
          id="edit-server-description"
          value={serverDescription}
          onChange={(e) => setServerDescription(e.target.value)}
          placeholder="文件系统操作服务器"
          rows={3}
        />
      </div>
      
      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">
          <X className="w-4 h-4 mr-2" />
          取消
        </Button>
        <Button type="submit" className="flex-1">
          <Save className="w-4 h-4 mr-2" />
          保存
        </Button>
      </div>
    </form>
  );
}

// 钩子函数，用于打开编辑对话框
export function useEditMCPServerDialog() {
  const modal = useModal();
  const { isMobile } = useBreakpointContext();

  const openEditMCPServerDialog = useCallback((server: MCPServerConfig, onUpdate: (id: string, updates: Partial<MCPServerConfig>) => void) => {
    modal.show({
      title: "编辑 MCP 服务器",
      content: (
        <EditMCPServerDialogContent 
          server={server} 
          onSubmit={(updates) => {
            onUpdate(server.id, updates);
            modal.close();
          }}
          onClose={() => modal.close()}
        />
      ),
      className: cn(
        "overflow-hidden",
        isMobile 
          ? "w-[95vw] max-h-[90vh]" 
          : "sm:max-w-xl sm:max-h-[85vh]"
      ),
      showFooter: false
    });
  }, [modal, isMobile]);

  return {
    openEditMCPServerDialog
  };
}

// 编辑按钮组件
interface EditMCPServerButtonProps {
  server: MCPServerConfig;
  onUpdate: (id: string, updates: Partial<MCPServerConfig>) => void;
  size?: "sm" | "default";
  variant?: "ghost" | "outline" | "default";
}

export function EditMCPServerButton({ server, onUpdate, size = "sm", variant = "ghost" }: EditMCPServerButtonProps) {
  const { openEditMCPServerDialog } = useEditMCPServerDialog();

  const handleEdit = () => {
    openEditMCPServerDialog(server, onUpdate);
  };

  return (
    <Button
      size={size}
      variant={variant}
      onClick={handleEdit}
      title="编辑服务器"
    >
      <Edit className="w-3 h-3" />
    </Button>
  );
} 