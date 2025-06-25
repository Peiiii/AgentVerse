import { CapabilityRegistry } from "@/common/lib/capabilities";
import { ActionDef, ActionParseResult } from "./action-parser";

// action-executor.ts
export interface ActionExecutionResult {
  capability: string;
  params?: Record<string, unknown>;
  result?: unknown;
  error?: string;
  status: "success" | "parse_error" | "execution_error" | "invalid_action";
  startTime?: number;
  endTime?: number;
}

export abstract class BaseActionExecutor {
  abstract execute(
    actions: ActionParseResult[],
    registry: CapabilityRegistry
  ): Promise<ActionExecutionResult[]>;
}

export class DefaultActionExecutor extends BaseActionExecutor {
  async execute(
    actions: ActionParseResult[],
    registry: CapabilityRegistry
  ): Promise<ActionExecutionResult[]> {
    const results: ActionExecutionResult[] = [];
    const startTime = Date.now();

    for (const action of actions) {
      if (!action.parsed) {
        results.push({
          capability: "unknown",
          status: "parse_error",
          error: action.error,
        });
        continue;
      }

      const { capability, params = {} } = action.parsed as ActionDef;
      try {
        if (!registry.hasCapability(capability)) {
          throw new Error(`Capability ${capability} not found`);
        }

        const result = await registry.execute(capability, params);
        results.push({
          capability,
          params,
          result,
          status: "success",
          startTime,
          endTime: Date.now(),
        });
      } catch (executionError) {
        results.push({
          capability,
          params,
          status: "execution_error",
          error:
            executionError instanceof Error
              ? executionError.message
              : String(executionError),
          startTime,
          endTime: Date.now(),
        });
      }
    }

    return results;
  }
}
