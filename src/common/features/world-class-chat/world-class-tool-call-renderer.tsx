import type { ToolInvocation } from '@ai-sdk/ui-utils';
import type { ToolRenderer, ToolResult, ToolCall } from '@agent-labs/agent-chat';
import React, { useContext, useState, useRef, useEffect } from 'react';
import { AgentToolRendererManagerContext } from '@agent-labs/agent-chat';

interface WorldClassToolCallRendererProps {
  toolInvocation: ToolInvocation;
  toolRenderers?: Record<string, ToolRenderer>;
  onToolResult?: (result: ToolResult) => void;
}

function ellipsis(str: string, maxLen = 60): string {
  if (!str) return '';
  return str.length > maxLen ? str.slice(0, maxLen) + '...' : str;
}

export const WorldClassToolCallRenderer: React.FC<WorldClassToolCallRendererProps> = ({
  toolInvocation,
  onToolResult,
}) => {
  const toolRendererManager = useContext(AgentToolRendererManagerContext);
  const toolRenderers = Object.fromEntries(
    toolRendererManager
      .getToolRenderers()
      .map((renderer) => [renderer.definition.name, renderer]),
  );
  const renderer = toolRenderers[toolInvocation.toolName];
  const [expanded, setExpanded] = useState(false);
  const detailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (expanded && detailRef.current) {
      detailRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [expanded]);

  // header样式：展开前后完全一致，安静淡灰蓝色块
  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 15,
    color: '#22223b',
    background: '#f4f6fb',
    border: 'none',
    borderRadius: 10,
    padding: '0 14px',
    minHeight: 44,
    maxHeight: 44,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    cursor: 'pointer',
    fontWeight: 700,
    letterSpacing: 0.2,
    boxShadow: '0 1px 0 #e0e7ef',
    userSelect: 'text',
    transition: 'background 0.18s, color 0.18s',
  };

  // 判断参数是否为空对象
  const argsStr = JSON.stringify(toolInvocation.args);
  const isArgsEmpty = argsStr === '{}' || argsStr === undefined || argsStr === 'null';

  // header内容
  const header = (
    <div
      style={headerStyle}
      title={`工具：${toolInvocation.toolName}${isArgsEmpty ? '' : ' 参数：' + ellipsis(argsStr, 80)}`}
      onClick={() => setExpanded(e => !e)}
    >
      <span style={{ display: 'flex', alignItems: 'center', marginRight: 8 }}>
        <svg width="18" height="18" viewBox="0 0 16 16" fill="none" style={{ marginRight: 6, display: 'block' }}><path d="M13.5 8.5A5 5 0 0 1 7.5 2.5c0-.28.02-.56.07-.83a.5.5 0 0 0-.85-.45l-2.1 2.1a2.5 2.5 0 0 0 0 3.54l.7.7-3.09 3.09a1.5 1.5 0 0 0 2.12 2.12l3.09-3.09.7.7a2.5 2.5 0 0 0 3.54 0l2.1-2.1a.5.5 0 0 0-.45-.85c-.27.05-.55.07-.83.07Z" stroke="#22223b" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
        {toolInvocation.toolName}
      </span>
      {!isArgsEmpty && (
        <span style={{ color: '#22223b', margin: '0 4px', fontWeight: 500, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block' }}>{ellipsis(argsStr, 80)}</span>
      )}
      <span style={{ marginLeft: 'auto', color: '#a5b4fc', fontSize: 15, display: 'flex', alignItems: 'center', transition: 'color 0.18s' }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ display: 'block', transform: expanded ? 'rotate(-90deg)' : 'rotate(90deg)', transition: 'transform 0.18s' }}><path d="M5 6l3 3 3-3" stroke="#22223b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </span>
    </div>
  );

  if (!expanded) return header;

  // 展开时，优先自定义渲染，否则降级为JSON
  return (
    <div style={{ margin: '16px 0', borderRadius: 12, boxShadow: '0 2px 12px 0 rgba(99,102,241,0.06)', border: '1px solid #e0e7ef', maxWidth: 520, background: '#fff', overflow: 'hidden' }} ref={detailRef}>
      {header}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f7fafd', padding: 0 }}>
        {renderer && typeof renderer.render === 'function' ? (
          <div style={{ width: '100%' }}>
            {(() => {
              const maybeResult = (toolInvocation as { result?: unknown }).result;
              const toolCall: ToolCall & { result?: unknown } = {
                id: toolInvocation.toolCallId,
                type: 'function',
                function: {
                  name: toolInvocation.toolName,
                  arguments: JSON.stringify(toolInvocation.args),
                },
                ...(maybeResult !== undefined ? { result: maybeResult } : {}),
              };
              return renderer.render(
                toolCall,
                onToolResult || (() => {})
              );
            })()}
          </div>
        ) : (
          <pre style={{
            fontFamily: 'Menlo, monospace',
            fontSize: 15,
            background: '#fff',
            borderRadius: 0,
            padding: '20px 24px',
            margin: 0,
            color: '#22223b',
            border: 'none',
            maxHeight: 240,
            minWidth: 0,
            maxWidth: 480,
            overflow: 'auto',
            lineHeight: 1.7,
            letterSpacing: 0.01,
            textAlign: 'left',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            boxShadow: 'none',
          }}>
            {JSON.stringify(toolInvocation, null, 2)}
          </pre>
        )}
      </div>
      <style>{`
        pre::-webkit-scrollbar {
          width: 6px;
          background: #f7fafd;
        }
        pre::-webkit-scrollbar-thumb {
          background: #e0e7ef;
          border-radius: 6px;
        }
        pre::-webkit-scrollbar-thumb:hover {
          background: #a5b4fc;
        }
      `}</style>
    </div>
  );
}; 
