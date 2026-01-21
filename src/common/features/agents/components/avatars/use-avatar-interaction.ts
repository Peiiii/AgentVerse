import { useCallback, useEffect, useRef } from "react";
import { useAnimation } from "framer-motion";
import {
  useInteractionStore,
  type InteractionRect,
} from "@/common/features/chat/stores/interaction.store";

type UseAvatarInteractionOptions = {
  agentId?: string;
  isUser?: boolean;
  enableDoubleClick?: boolean;
};

export function useAvatarInteraction<T extends HTMLElement>({
  agentId,
  isUser = false,
  enableDoubleClick = false,
}: UseAvatarInteractionOptions) {
  const avatarRef = useRef<T | null>(null);
  const triggerInteraction = useInteractionStore((s) => s.triggerInteraction);
  const setUserAvatarRect = useInteractionStore((s) => s.setUserAvatarRect);
  const setAgentAvatarRect = useInteractionStore((s) => s.setAgentAvatarRect);
  const impactTimestamp = useInteractionStore(
    (s) => (agentId ? s.impacts[agentId] : 0)
  );
  const controls = useAnimation();

  useEffect(() => {
    if (!agentId || !avatarRef.current) return;

    const updateRect = () => {
      if (!avatarRef.current) return;
      const rect = avatarRef.current.getBoundingClientRect();
      const value: InteractionRect = {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      };
      setAgentAvatarRect(agentId, value);
      if (isUser) {
        setUserAvatarRect(value);
      }
    };

    updateRect();
    window.addEventListener("scroll", updateRect, true);
    window.addEventListener("resize", updateRect);
    return () => {
      window.removeEventListener("scroll", updateRect, true);
      window.removeEventListener("resize", updateRect);
      setAgentAvatarRect(agentId, null);
      if (isUser) {
        setUserAvatarRect(null);
      }
    };
  }, [agentId, isUser, setAgentAvatarRect, setUserAvatarRect]);

  useEffect(() => {
    if (impactTimestamp > 0) {
      controls.start({
        x: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.4 },
      });
    }
  }, [impactTimestamp, controls]);

  const handleDoubleClick = useCallback(() => {
    if (!enableDoubleClick || isUser || !agentId || !avatarRef.current) return;
    const rect = avatarRef.current.getBoundingClientRect();
    const types: ("poop" | "trash")[] = ["poop", "trash"];
    const randomType = types[Math.floor(Math.random() * types.length)];
    triggerInteraction({
      sourceAgentId: "user",
      targetAgentId: agentId,
      targetRect: {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      },
      type: randomType,
    });
  }, [enableDoubleClick, isUser, agentId, triggerInteraction]);

  return {
    avatarRef,
    controls,
    handleDoubleClick,
  };
}
