import { Button } from "@/common/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/common/components/ui/select";
import { Textarea } from "@/common/components/ui/textarea";
import { Plus } from "lucide-react";
import React, { useState } from "react";
import type { MCPServerConfig } from "@/core/stores/mcp-server.store";

interface MCPServerFormProps {
  onSubmit: (config: Omit<MCPServerConfig, 'id'>) => void;
  title?: string;
  description?: string;
  showDescription?: boolean;
  className?: string;
}

export function MCPServerForm({
  onSubmit,
  title = "添加MCP服务器",
  description,
  showDescription = true,
  className = "",
}: MCPServerFormProps) {
  const [serverName, setServerName] = useState("");
  const [serverUrl, setServerUrl] = useState("");
  const [serverType, setServerType] = useState<"sse" | "streamable-http">("streamable-http");
  const [serverDescription, setServerDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!serverUrl.trim()) return;

    const config: Omit<MCPServerConfig, 'id'> = {
      name: serverName || new URL(serverUrl).hostname,
      url: serverUrl,
      type: serverType,
      description: serverDescription || undefined,
    };
    
    onSubmit(config);
    
    // 清空表单
    setServerName("");
    setServerUrl("");
    setServerType("streamable-http");
    setServerDescription("");
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" />
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-xs">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="server-name">服务器名称</Label>
            <Input
              id="server-name"
              value={serverName}
              onChange={(e) => setServerName(e.target.value)}
              placeholder="文件系统服务器"
            />
          </div>
          
          <div>
            <Label htmlFor="server-url">服务器地址</Label>
            <Input
              id="server-url"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              placeholder="http://localhost:3000"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="server-type">传输协议</Label>
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
          
          {showDescription && (
            <div>
              <Label htmlFor="server-description">描述（可选）</Label>
              <Input
                id="server-description"
                value={serverDescription}
                onChange={(e) => setServerDescription(e.target.value)}
                placeholder="文件系统操作服务器"
              />
            </div>
          )}
          
          <Button type="submit" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            添加服务器
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// JSON导入组件
interface MCPImportFormProps {
  onImport: (configs: Omit<MCPServerConfig, 'id'>[]) => void;
  title?: string;
  description?: string;
  className?: string;
}

export function MCPImportForm({
  onImport,
  title = "批量导入",
  description = "通过JSON格式批量导入服务器配置",
  className = "",
}: MCPImportFormProps) {
  const [importJson, setImportJson] = useState("");
  const [importError, setImportError] = useState<string | null>(null);

  const handleImport = () => {
    if (!importJson.trim()) return;

    try {
      const parsed = JSON.parse(importJson);
      let configs: Array<Omit<MCPServerConfig, 'id'>> = [];

      // 支持多种格式：
      // 1. 数组格式: [{name: "server1", url: "...", type: "http"}]
      // 2. 对象格式: {mcpServers: {proxy: {type: "sse", url: "..."}}}
      if (Array.isArray(parsed)) {
        configs = parsed;
      } else {
        // 处理嵌套对象格式
        const extractServers = (obj: Record<string, unknown>, prefix = ''): Array<Omit<MCPServerConfig, 'id'>> => {
          const servers: Array<Omit<MCPServerConfig, 'id'>> = [];

          for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'object' && value !== null && 'url' in value) {
              // 这是一个服务器配置
              const serverConfig = value as Record<string, unknown>;
              servers.push({
                name: prefix ? `${prefix}-${key}` : key,
                url: String(serverConfig.url || ''),
                type: (serverConfig.type as 'sse' | 'streamable-http') || 'streamable-http',
                description: String(serverConfig.description || `${key} MCP服务器`),
              });
            } else if (typeof value === 'object' && value !== null) {
              // 继续递归查找
              const nestedServers = extractServers(value as Record<string, unknown>, prefix ? `${prefix}-${key}` : key);
              servers.push(...nestedServers);
            }
          }

          return servers;
        };

        configs = extractServers(parsed as Record<string, unknown>);
      }

      if (configs.length === 0) {
        throw new Error("未找到有效的服务器配置");
      }

      onImport(configs);
      setImportJson("");
      setImportError(null);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "JSON格式错误");
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">{title}</CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label htmlFor="import-json">JSON配置</Label>
          <Textarea
            id="import-json"
            value={importJson}
            onChange={(e) => setImportJson(e.target.value)}
            placeholder={`// 支持数组格式:
[
  {
    "name": "文件系统服务器",
    "url": "http://localhost:3000",
    "type": "streamable-http",
    "description": "文件系统操作"
  }
]

// 或嵌套对象格式:
{
  "mcpServers": {
    "proxy": {
      "type": "sse",
      "url": "http://127.0.0.1:8080/sse"
    }
  }
}`}
            rows={4}
          />
        </div>
        {importError && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <div className="w-4 h-4 text-red-600">⚠️</div>
            {importError}
          </div>
        )}
        <Button onClick={handleImport} className="w-full">
          导入服务器
        </Button>
      </CardContent>
    </Card>
  );
} 