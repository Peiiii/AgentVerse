import {
  useObservableFromState,
  useStateFromObservable,
} from "@/common/lib/rx-state";
import { AgentDef } from "@/common/types/agent";
import { ChatMessage } from "@/common/types/chat";
import { map } from "rxjs";
import { AgentChatHeader } from "./agent-chat-header";
import { AgentChatInput } from "./agent-chat-input";
import { AgentChatMessages } from "./agent-chat-messages";

interface AgentChatContainerProps {
  agent: AgentDef;
  messages: ChatMessage[];
  inputMessage: string;
  isThinking: boolean;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
}

export function AgentChatContainer({
  agent: agentDef,
  messages,
  inputMessage,
  isThinking,
  onInputChange,
  onSendMessage,
}: AgentChatContainerProps) {
  const agentDef$ = useObservableFromState(agentDef);
  const agent = useStateFromObservable(
    () =>
      agentDef$.pipe(
        map((agentDef) => {
          return agentDef;
        })
      ),
    agentDef
  );

  // const { chat, sendMessage } = useAgentChat({
  //   agent,
  //   messages,
  //   inputMessage,
  //   isThinking,
  //   onInputChange,
  //   onSendMessage,
  // });
  return (
    <div className="w-1/2 min-w-0 flex flex-col">
      <AgentChatHeader agent={agent} />
      <AgentChatMessages
        agent={agent}
        messages={messages}
        isThinking={isThinking}
      />
      <AgentChatInput
        agent={agent}
        value={inputMessage}
        onChange={onInputChange}
        onSend={onSendMessage}
        disabled={isThinking}
      />
    </div>
  );
}
