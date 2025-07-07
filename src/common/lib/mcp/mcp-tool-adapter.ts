import type { ToolDefinition } from "@agent-labs/agent-chat";
import type { MCPTool, MCPConnection } from "./mcp-connection-manager";

/**
 * 将MCP工具转换为@agent-labs/agent-chat的ToolDefinition格式
 */
export function adaptMCPToolToToolDefinition(
  mcpTool: MCPTool,
  connectionId: string
): ToolDefinition {
  return {
    name: `mcp_${connectionId}_${mcpTool.name}`,
    description: mcpTool.description,
    parameters: {
      type: mcpTool.inputSchema.type as any,
      properties: mcpTool.inputSchema.properties,
      required: mcpTool.inputSchema.required || [],
    },
  };
}

/**
 * 从ToolDefinition名称中提取MCP连接ID和工具名称
 */
export function extractMCPToolInfo(toolName: string): {
  connectionId: string;
  toolName: string;
} | null {
  const match = toolName.match(/^mcp_(.+)_(.+)$/);
  if (!match) return null;
  
  return {
    connectionId: match[1],
    toolName: match[2],
  };
}

/**
 * 批量转换MCP工具
 */
export function adaptMCPToolsToToolDefinitions(
  connection: MCPConnection
): ToolDefinition[] {
  return connection.tools.map((tool) =>
    adaptMCPToolToToolDefinition(tool, connection.id)
  );
}

/**
 * 获取所有连接的MCP工具定义
 */
export function getAllMCPToolDefinitions(
  connections: MCPConnection[]
): ToolDefinition[] {
  return connections.flatMap((connection) =>
    adaptMCPToolsToToolDefinitions(connection)
  );
}

/**
 * 验证MCP工具参数
 */
export function validateMCPToolParameters(
  tool: MCPTool,
  parameters: Record<string, any>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const { properties, required = [] } = tool.inputSchema;

  // 检查必需参数
  for (const requiredParam of required) {
    if (!(requiredParam in parameters)) {
      errors.push(`Missing required parameter: ${requiredParam}`);
    }
  }

  // 检查参数类型
  for (const [paramName, paramValue] of Object.entries(parameters)) {
    const paramSchema = properties[paramName];
    if (!paramSchema) {
      errors.push(`Unknown parameter: ${paramName}`);
      continue;
    }

    const paramType = paramSchema.type;
    if (!validateParameterType(paramValue, paramType)) {
      errors.push(
        `Invalid type for parameter ${paramName}: expected ${paramType}, got ${typeof paramValue}`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 验证参数类型
 */
function validateParameterType(value: any, expectedType: string): boolean {
  switch (expectedType) {
    case "string":
      return typeof value === "string";
    case "number":
      return typeof value === "number" && !isNaN(value);
    case "boolean":
      return typeof value === "boolean";
    case "object":
      return typeof value === "object" && value !== null;
    case "array":
      return Array.isArray(value);
    default:
      return true; // 未知类型默认通过
  }
}

/**
 * 格式化MCP工具描述
 */
export function formatMCPToolDescription(
  tool: MCPTool,
  connectionName: string
): string {
  const requiredParams = tool.inputSchema.required || [];
  const optionalParams = Object.keys(tool.inputSchema.properties).filter(
    (key) => !requiredParams.includes(key)
  );

  let description = `${tool.description}\n\n`;
  description += `**来源**: ${connectionName}\n\n`;

  if (requiredParams.length > 0) {
    description += `**必需参数**: ${requiredParams.join(", ")}\n\n`;
  }

  if (optionalParams.length > 0) {
    description += `**可选参数**: ${optionalParams.join(", ")}\n\n`;
  }

  return description.trim();
} 