import type { AgentDef } from "@/common/types/agent";

export interface WorldClassChatTopBarProps {
  agentDef: AgentDef;
  onClear?: () => void;
}

export function WorldClassChatTopBar({ agentDef, onClear }: WorldClassChatTopBarProps) {
  return (
    <div style={{
      width: "100%",
      minHeight: 80,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 40px",
      background: "linear-gradient(90deg, #6366f1 0%, #818cf8 100%)",
      boxShadow: "0 4px 24px 0 rgba(99,102,241,0.08)",
      position: "sticky",
      top: 0,
      zIndex: 10,
      color: "#fff",
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <img src={agentDef.avatar} alt="avatar" style={{ width: 54, height: 54, borderRadius: 16, background: "#fff", boxShadow: "0 2px 8px #6366f133" }} />
        <div>
          <div style={{ fontWeight: 800, fontSize: 24, letterSpacing: 1 }}>{agentDef.name}</div>
          <div style={{ fontWeight: 400, fontSize: 15, opacity: 0.85 }}>World-Class AI Copilot</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        {onClear && (
          <button onClick={onClear} title="清空对话" style={{ background: "rgba(255,255,255,0.12)", border: "none", borderRadius: 8, color: "#fff", fontWeight: 500, fontSize: 15, padding: "8px 18px", cursor: "pointer", transition: "background 0.2s" }}>清空</button>
        )}
      </div>
    </div>
  );
} 