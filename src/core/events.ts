import { createKey } from "@/common/lib/typed-bus/key";

// 用户选择事件
export const USER_SELECT = createKey<{
  operationId: string;
  selected: string | string[];
}>("user.select");

// 这里可以定义其他业务事件... 