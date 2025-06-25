import { EnvironmentBus } from "@/common/lib/typed-bus/implementations/environment-bus";

// 创建全局环境总线实例
export const env = new EnvironmentBus();

// 导出常用的bus实例
export const {
  eventBus,
  stateBus,
  messageBus,
  resourceBus,
  capabilityBus
} = env; 