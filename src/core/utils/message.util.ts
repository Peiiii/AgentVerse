import { AgentMessage, NormalMessage } from "@/common/types/discussion";

const isTextMessage = (message: AgentMessage): message is NormalMessage =>
  message.type === "text";

export const filterNormalMessages = (
  messages: AgentMessage[]
): NormalMessage[] => {
  return messages.filter(isTextMessage);
};
