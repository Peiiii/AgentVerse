import type { AgentDef } from "@/common/types/agent";
import type { UIMessage } from "@ai-sdk/ui-utils";
import { ToolCallRenderer } from "@/common/components/chat/agent-chat/tool-call-renderer";
import { User } from "lucide-react";
import { useEffect, useRef } from "react";

export interface WorldClassChatMessageListProps {
  messages: UIMessage[];
  agentDef: AgentDef;
  isResponding?: boolean;
}

export function WorldClassChatMessageList({ messages, agentDef, isResponding }: WorldClassChatMessageListProps) {
  // 自动滚动到底部
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, isResponding]);

  // 渲染头像
  const renderAvatar = (role: "user" | "assistant") => {
    const isUser = role === "user";
    return (
      <div style={{
        width: 44,
        height: 44,
        borderRadius: 16,
        background: isUser ? "#6366f1" : "#fff",
        boxShadow: isUser ? "0 2px 8px #6366f133" : "0 1px 4px #a5b4fc22",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
      }}>
        {isUser ? <User color="#fff" size={28} /> : <img src={agentDef.avatar} alt="avatar" style={{ width: 32, height: 32, borderRadius: 12 }} />}
      </div>
    );
  };

  // 渲染消息内容（支持 parts）
  const renderMessageContent = (msg: UIMessage) => {
    if (!msg.parts) return <span>{msg.content}</span>;
    return msg.parts.map((part, idx) => {
      if (part.type === "tool-invocation") {
        return <ToolCallRenderer key={idx} {...part} />;
      }
      if (part.type === "reasoning") {
        // ReasoningUIPart: { type: "reasoning", reasoning: string }
        return <div key={idx} style={{ color: "#64748b", fontSize: 13, margin: "4px 0" }}>{part.reasoning}</div>;
      }
      if (part.type === "text") {
        // TextUIPart: { type: "text", text: string }
        return <span key={idx}>{part.text}</span>;
      }
      // 其他类型 fallback
      return <span key={idx} style={{ color: "#64748b" }}>{JSON.stringify(part)}</span>;
    });
  };

  return (
    <div ref={listRef} style={{ flex: 1, overflowY: "auto", padding: "24px 0 12px 0", width: "100%" }}>
      {messages.map((msg) => {
        const isUser = msg.role === "user";
        return (
          <div
            key={msg.id}
            style={{
              display: "flex",
              flexDirection: isUser ? "row-reverse" : "row",
              alignItems: "flex-end",
              marginBottom: 18,
              opacity: 0,
              animation: "fadeIn 0.5s forwards",
              animationDelay: "0.05s",
            }}
          >
            {renderAvatar(msg.role === "user" ? "user" : "assistant")}
            <div
              style={{
                background: isUser ? "linear-gradient(90deg,#6366f1 60%,#818cf8 100%)" : "#fff",
                color: isUser ? "#fff" : "#22223b",
                borderRadius: 18,
                padding: "14px 20px",
                fontSize: 16,
                boxShadow: isUser ? "0 2px 8px #6366f133" : "0 1px 4px #a5b4fc22",
                maxWidth: "70vw",
                minWidth: 60,
                marginLeft: isUser ? 0 : 8,
                marginRight: isUser ? 8 : 0,
                transition: "background 0.2s",
                wordBreak: "break-word",
              }}
            >
              {renderMessageContent(msg)}
            </div>
          </div>
        );
      })}
      {/* AI 回复 Loading 动画 */}
      {isResponding && (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-end",
            marginBottom: 18,
            opacity: 0,
            animation: "fadeIn 0.5s forwards",
            animationDelay: "0.05s",
          }}
        >
          {renderAvatar("assistant")}
          <div
            style={{
              background: "#fff",
              color: "#22223b",
              borderRadius: 18,
              padding: "14px 20px",
              fontSize: 16,
              boxShadow: "0 1px 4px #a5b4fc22",
              maxWidth: "70vw",
              minWidth: 60,
              marginLeft: 8,
              marginRight: 0,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 15, color: "#64748b" }}>Atlas is thinking</span>
            <span className="dot-flashing" style={{ marginLeft: 4 }} />
          </div>
        </div>
      )}
      {/* 动画样式 */}
      <style>{`
        @keyframes fadeIn {
          to { opacity: 1; }
        }
        .dot-flashing {
          position: relative;
          width: 16px;
          height: 6px;
        }
        .dot-flashing:before, .dot-flashing:after, .dot-flashing div {
          content: '';
          display: inline-block;
          position: absolute;
          top: 0;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #6366f1;
          animation: dotFlashing 1s infinite linear alternate;
        }
        .dot-flashing:before {
          left: 0;
          animation-delay: 0s;
        }
        .dot-flashing div {
          left: 5px;
          animation-delay: 0.3s;
        }
        .dot-flashing:after {
          left: 10px;
          animation-delay: 0.6s;
        }
        @keyframes dotFlashing {
          0% { opacity: 0.2; }
          50% { opacity: 1; }
          100% { opacity: 0.2; }
        }
      `}</style>
    </div>
  );
} 