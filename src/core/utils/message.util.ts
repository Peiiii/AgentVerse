import { AgentMessage, NormalMessage } from "@/common/types/discussion";

export const filterNormalMessages = (
  messages: AgentMessage[]
): NormalMessage[] => {
  return messages.filter((m) => m.type !== "action_result");
};
