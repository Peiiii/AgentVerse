import { useEffect, useRef } from "react";
import type { AgentDef } from "@/common/types/agent";
import type { AgentMessage } from "@/common/types/discussion";
import type {
  InteractionRect,
  InteractionType,
} from "@/common/features/chat/stores/interaction.store";

type TriggerInteraction = (options: {
  sourceAgentId?: string;
  sourceRect?: InteractionRect;
  targetAgentId: string;
  targetRect?: InteractionRect;
  type?: InteractionType;
}) => void;

type UsePoopTriggerOptions = {
  messages: AgentMessage[];
  agents: AgentDef[];
  triggerInteraction: TriggerInteraction;
  streamingDebounceMs?: number;
  finalDebounceMs?: number;
};

export function usePoopTriggerFromMessages({
  messages,
  agents,
  triggerInteraction,
  streamingDebounceMs = 120,
  finalDebounceMs = 240,
}: UsePoopTriggerOptions) {
  const poopTriggeredRef = useRef(new Set<string>());
  const poopTimersRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (!messages.length || !agents.length) return;

    const activeKeys = new Set<string>();
    const regex =
      /@💩->@?([^\s@，。,！？!?:：；;]+(?:\s+[^\s@，。,！？!?:：；;]+)*)/giu;

    const normalizeTarget = (value: string) =>
      value
        .trim()
        .replace(/^["'“”‘’「」『』【】《》〈〉（）()]+/, "")
        .replace(/["'“”‘’「」『』【】《》〈〉（）()\s，。,。！？!?:：；;、]+$/u, "")
        .replace(/\s{2,}/g, " ")
        .trim();

    const isBoundaryChar = (char: string | undefined) => {
      if (!char) return true;
      return /\s|[，。,。！？!?:：；;、]/u.test(char);
    };

    const resolveAgentId = (target: string, list: AgentDef[]) => {
      const targetLower = target.toLowerCase();
      const firstTokenLower = targetLower.split(/\s+/)[0];
      const bySlug = list.find(
        (a) => a.slug && a.slug.toLowerCase() === firstTokenLower
      );
      if (bySlug) return bySlug.id;

      const byName = list.find((a) => {
        const nameLower = a.name.toLowerCase();
        if (!targetLower.startsWith(nameLower)) {
          return false;
        }
        const nextChar = targetLower.charAt(nameLower.length);
        return isBoundaryChar(nextChar);
      });
      return byName?.id;
    };

    messages.forEach((message) => {
      if (message.type !== "text") return;
      regex.lastIndex = 0;
      const isStreaming = message.status === "streaming";
      let match: RegExpExecArray | null;
      while ((match = regex.exec(message.content)) !== null) {
        const rawTarget = match[1];
        const target = normalizeTarget(rawTarget);
        if (!target) continue;
        const targetId = resolveAgentId(target, agents);
        if (!targetId) continue;
        if (targetId === message.agentId) {
          continue;
        }
        const key = `${message.id}:${targetId}`;
        activeKeys.add(key);
        if (poopTriggeredRef.current.has(key)) {
          continue;
        }
        const pending = poopTimersRef.current.get(key);
        if (pending) {
          clearTimeout(pending);
        }
        const debounceMs = isStreaming ? streamingDebounceMs : finalDebounceMs;
        const timer = window.setTimeout(() => {
          triggerInteraction({
            sourceAgentId: message.agentId,
            targetAgentId: targetId,
            type: "poop",
          });
          poopTriggeredRef.current.add(key);
          poopTimersRef.current.delete(key);
        }, debounceMs);
        poopTimersRef.current.set(key, timer);
      }
    });

    poopTimersRef.current.forEach((timer, key) => {
      if (!activeKeys.has(key)) {
        clearTimeout(timer);
        poopTimersRef.current.delete(key);
      }
    });
  }, [agents, messages, triggerInteraction, streamingDebounceMs, finalDebounceMs]);

  useEffect(() => {
    const timers = poopTimersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);
}
