import React, { useRef, useState } from "react";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
}

const MOCK_HISTORY: Message[] = [
  { id: 1, role: "assistant", content: "你好，我是你的智能助手，有什么可以帮你？" },
];

export const SmartAssistantDialog: React.FC<{
  open: boolean;
  onClose: () => void;
}> = ({ open, onClose }) => {
  const [messages, setMessages] = useState<Message[]>(MOCK_HISTORY);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      content: input,
    };
    setMessages(msgs => [
      ...msgs,
      userMsg,
      { id: Date.now() + 1, role: "assistant", content: "（模拟回复）收到：" + input },
    ]);
    setInput("");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <div style={{
      position: "fixed",
      right: 40,
      bottom: 40,
      width: 400,
      maxWidth: "90vw",
      height: 520,
      background: "#fff",
      borderRadius: 16,
      boxShadow: "0 8px 32px 0 rgba(99,102,241,0.18)",
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      animation: "fadeIn 0.3s cubic-bezier(.4,0,.2,1)",
    }}>
      {/* 头部 */}
      <div style={{
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        borderBottom: "1px solid #e0e7ef",
        fontWeight: 700,
        fontSize: 18,
        color: "#3730a3",
      }}>
        智能助手
        <button onClick={onClose} style={{ border: "none", background: "none", fontSize: 22, color: "#a5b4fc", cursor: "pointer" }}>×</button>
      </div>
      {/* 消息区 */}
      <div style={{ flex: 1, overflowY: "auto", padding: 20, background: "#f8fafc" }}>
        {messages.map(msg => (
          <div key={msg.id} style={{
            display: "flex",
            justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            marginBottom: 12,
          }}>
            <div style={{
              background: msg.role === "user" ? "#6366f1" : "#fff",
              color: msg.role === "user" ? "#fff" : "#3730a3",
              borderRadius: 12,
              padding: "8px 16px",
              maxWidth: 260,
              fontSize: 15,
              boxShadow: msg.role === "user" ? "0 2px 8px 0 #6366f133" : "0 1px 4px 0 #a5b4fc22",
            }}>{msg.content}</div>
          </div>
        ))}
      </div>
      {/* 输入区 */}
      <div style={{
        padding: 16,
        borderTop: "1px solid #e0e7ef",
        display: "flex",
        gap: 8,
        background: "#fff",
      }}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") handleSend(); }}
          placeholder="请输入你的问题..."
          style={{
            flex: 1,
            border: "1px solid #e0e7ef",
            borderRadius: 8,
            padding: "8px 12px",
            fontSize: 15,
            outline: "none",
          }}
        />
        <button
          onClick={handleSend}
          style={{
            background: "#6366f1",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "0 18px",
            fontWeight: 600,
            fontSize: 15,
            cursor: "pointer",
            transition: "background 0.2s",
          }}
        >发送</button>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
}; 