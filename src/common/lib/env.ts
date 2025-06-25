import { EnvironmentBus } from "./typed-bus/implementations/environment-bus";
import { createKey } from "./typed-bus/key";

// 创建全局环境总线实例
export const env = new EnvironmentBus();

// 定义用户交互事件的key
export const USER_INTERACTION = createKey<{
  operationId: string;
  capability: string;
  result: unknown;
}>("user.interaction");

// 导出一些常用的bus实例
export const {
  eventBus,
  stateBus,
  messageBus,
  resourceBus,
  capabilityBus
} = env; 