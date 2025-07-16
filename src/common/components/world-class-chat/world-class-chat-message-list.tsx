import { Markdown } from "@/common/components/ui/markdown";
import "@/common/components/ui/markdown/world-class-markdown.css";
import { useChatAutoScroll } from "@/common/hooks/use-chat-auto-scroll";
import type { AgentDef } from "@/common/types/agent";
import type { UIMessage } from "@ai-sdk/ui-utils";
import { User } from "lucide-react";
import { forwardRef, useImperativeHandle } from "react";
import { WorldClassToolCallRenderer } from "./world-class-tool-call-renderer";
import { CopyMessageButton } from "./copy-message-button";

export interface WorldClassChatMessageListProps {
  messages: UIMessage[];
  agentDef: AgentDef;
  isResponding?: boolean;
}

export interface WorldClassChatMessageListRef {
  scrollToBottom: () => void;
}

export const WorldClassChatMessageList = forwardRef<WorldClassChatMessageListRef, WorldClassChatMessageListProps>(
  ({ messages, agentDef, isResponding }, ref) => {
    // 自动滚动到底部和 sticky 支持
    const { containerRef, isSticky, scrollToBottom } = useChatAutoScroll({ deps: [messages, isResponding] });
    useImperativeHandle(ref, () => ({ scrollToBottom }), [scrollToBottom]);

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
      if (!msg.parts) return <Markdown content={msg.content || ""} className="world-class-markdown" />;
      return msg.parts.map((part, idx) => {
        if (part.type === "tool-invocation") {
          return <WorldClassToolCallRenderer key={idx} {...part} />;
        }
        if (part.type === "reasoning") {
          // ReasoningUIPart: { type: "reasoning", reasoning: string }
          return <div key={idx} style={{ color: "#64748b", fontSize: 13, margin: "4px 0" }}>{part.reasoning}</div>;
        }
        if (part.type === "text") {
          // TextUIPart: { type: "text", text: string }
          return <Markdown key={idx} content={part.text} className="world-class-markdown" />;
        }
        // 其他类型 fallback
        return <span key={idx} style={{ color: "#64748b" }}>{JSON.stringify(part)}</span>;
      });
    };

    return (
      <div style={{ position: "relative", flex: 1, height: "100%", display: "flex", flexDirection: "column" }}>
        {/* 世界级表格样式，仅作用于 world-class-markdown 区域 */}
        <style>{`
          .world-class-markdown table {
            border-collapse: separate;
            border-spacing: 0;
            width: 100%;
            background: transparent;
            font-size: 15px;
            margin: 18px 0;
            box-shadow: 0 2px 12px 0 rgba(99,102,241,0.04);
            border-radius: 12px;
            overflow: hidden;
          }
          .world-class-markdown th, .world-class-markdown td {
            border: 1px solid #e5e7eb;
            padding: 10px 16px;
            text-align: left;
            transition: background 0.18s;
          }
          .world-class-markdown th {
            background: #f4f6fb;
            font-weight: 700;
            color: #22223b;
          }
          .world-class-markdown tr {
            background: #fff;
            transition: background 0.18s;
          }
          .world-class-markdown tr:hover {
            background: #f0f4ff;
          }
          .world-class-markdown td {
            color: #22223b;
          }
          .dark .world-class-markdown table {
            background: transparent;
            box-shadow: 0 2px 12px 0 rgba(99,102,241,0.10);
          }
          .dark .world-class-markdown th {
            background: #23263a;
            color: #e0e7ff;
          }
          .dark .world-class-markdown td {
            color: #e0e7ff;
            border-color: #374151;
          }
          .dark .world-class-markdown tr {
            background: #181a29;
          }
          .dark .world-class-markdown tr:hover {
            background: #23263a;
          }
          .world-class-message-bubble:hover .copy-btn-wrapper {
            opacity: 1 !important;
            pointer-events: auto !important;
          }
          .copy-btn-wrapper {
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.18s;
          }
        `}</style>
        <div
          ref={containerRef}
          className={isSticky ? "sticky-bottom" : undefined}
          style={{ flex: 1, overflowY: "auto", padding: "24px 0 12px 0", width: "100%" }}
        >
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            // 提取纯文本内容用于复制
            const plainText = msg.parts
              ? msg.parts.map(part => part.type === "text" ? part.text : (part.type === "reasoning" ? part.reasoning : "")).join("\n")
              : msg.content || "";
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
                    position: "relative",
                  }}
                  className="world-class-message-bubble"
                >
                  {/* 复制按钮，仅 hover 时显示 */}
                  <span style={{ position: "absolute", top: 0, right: 0, opacity: 0, pointerEvents: "none", transition: "opacity 0.18s" }} className="copy-btn-wrapper">
                    <CopyMessageButton text={plainText} />
                  </span>
                  <span style={{ display: "block" }}>{renderMessageContent(msg)}</span>
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
        {/* 滚动到底部按钮，仅 isSticky=false 时显示 */}
        {!isSticky && (
          <button
            onClick={scrollToBottom}
            style={{
              position: "absolute",
              bottom: 24,
              right: 24,
              width: 40,
              height: 40,
              borderRadius: 20,
              background: "#e0e7ff",
              color: "#6366f1",
              border: "none",
              boxShadow: "0 2px 8px #6366f133",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              zIndex: 10,
              transition: "background 0.2s, color 0.2s",
            }}
            title="滚动到底部"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M6 9l5 5 5-5" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        )}
      </div>
    );
  }
);

WorldClassChatMessageList.displayName = "WorldClassChatMessageList"; 