import { useState, useMemo, useCallback, useEffect } from "react";
import { AgentDef } from "@/common/types/agent";
import match from "pinyin-match";

export interface MentionState {
  isActive: boolean;
  query: string;
  startIndex: number;
  endIndex: number;
}

export interface UseMentionOptions {
  value: string;
  onChange: (value: string) => void;
  agents: AgentDef[];
  getAgentName: (agentId: string) => string;
  inputRef: React.RefObject<HTMLTextAreaElement>;
}

export interface UseMentionResult {
  mentionState: MentionState | null;
  filteredAgents: AgentDef[];
  selectedIndex: number;
  selectMention: (agent: AgentDef) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  handleInputChange: (value: string) => void;
}

export function useMention({
  value,
  onChange,
  agents,
  getAgentName,
  inputRef,
}: UseMentionOptions): UseMentionResult {
  const [mentionState, setMentionState] = useState<MentionState | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const detectMention = useCallback((text: string, cursorPosition: number): MentionState | null => {
    const textBeforeCursor = text.slice(0, cursorPosition);
    const match = textBeforeCursor.match(/@([^\s@]*)$/);
    
    if (!match) {
      return null;
    }

    const startIndex = match.index!;
    const query = match[1] || "";
    
    return {
      isActive: true,
      query,
      startIndex,
      endIndex: startIndex + match[0].length,
    };
  }, []);

  const handleInputChange = useCallback((newValue: string) => {
    onChange(newValue);
    
    requestAnimationFrame(() => {
      if (!inputRef.current) return;
      const cursorPos = inputRef.current.selectionStart || newValue.length;
      const state = detectMention(newValue, cursorPos);
      setMentionState(state);
      if (state?.isActive) {
        setSelectedIndex(0);
      }
    });
  }, [onChange, detectMention, inputRef]);

  const filteredAgents = useMemo(() => {
    if (!mentionState?.isActive) return [];
    
    const query = mentionState.query.toLowerCase();
    if (!query) {
      return agents;
    }

    return agents.filter((agent) => {
      const name = getAgentName(agent.id).toLowerCase();
      return name.includes(query) || match.match(getAgentName(agent.id), query);
    });
  }, [mentionState, agents, getAgentName]);

  const selectMention = useCallback((agent: AgentDef) => {
    if (!mentionState || !inputRef.current) return;

    const agentName = getAgentName(agent.id);
    const beforeMention = value.slice(0, mentionState.startIndex);
    const afterMention = value.slice(mentionState.endIndex);
    const newValue = `${beforeMention}@${agentName} ${afterMention}`;
    
    onChange(newValue);
    setMentionState(null);
    
    setTimeout(() => {
      if (inputRef.current) {
        const newCursorPos = beforeMention.length + agentName.length + 2;
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
        inputRef.current.focus();
      }
    }, 0);
  }, [mentionState, value, onChange, getAgentName, inputRef]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!mentionState?.isActive) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => 
        prev < filteredAgents.length - 1 ? prev + 1 : 0
      );
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => 
        prev > 0 ? prev - 1 : filteredAgents.length - 1
      );
      return;
    }

    if (e.key === "Enter" || e.key === "Tab") {
      if (filteredAgents.length > 0) {
        e.preventDefault();
        selectMention(filteredAgents[selectedIndex]);
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setMentionState(null);
      return;
    }
  }, [mentionState, filteredAgents, selectedIndex, selectMention]);

  useEffect(() => {
    if (mentionState && filteredAgents.length > 0) {
      setSelectedIndex(0);
    } else if (!mentionState) {
      setSelectedIndex(0);
    }
  }, [mentionState, filteredAgents.length]);

  return {
    mentionState,
    filteredAgents,
    selectedIndex,
    selectMention,
    handleKeyDown,
    handleInputChange,
  };
}

