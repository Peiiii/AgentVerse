import { create } from 'zustand';

export type InteractionType = 'poop' | 'trash';

export interface InteractionRect {
    top: number;
    left: number;
    width: number;
    height: number;
}

export interface InteractionEvent {
    id: string;
    sourceRect: InteractionRect;
    targetRect: InteractionRect;
    type: InteractionType;
    durationMs: number;
}

export const INTERACTION_FLIGHT_MS = 1400;

interface InteractionState {
    interactions: InteractionEvent[];
    impacts: Record<string, number>; // agentId -> timestamp of last impact
    userAvatarRect: InteractionRect | null;
    agentAvatarRects: Record<string, InteractionRect>;
    triggerInteraction: (options: {
        sourceAgentId?: string;
        sourceRect?: InteractionRect;
        targetAgentId: string;
        targetRect?: InteractionRect;
        type?: InteractionType;
    }) => void;
    setUserAvatarRect: (rect: InteractionRect | null) => void;
    setAgentAvatarRect: (agentId: string, rect: InteractionRect | null) => void;
    removeInteraction: (id: string) => void;
}

export const useInteractionStore = create<InteractionState>((set, get) => ({
    interactions: [],
    impacts: {},
    userAvatarRect: null,
    agentAvatarRects: {},

    setUserAvatarRect: (rect) => set({ userAvatarRect: rect }),
    setAgentAvatarRect: (agentId, rect) =>
        set((state) => {
            if (!rect) {
                const next = { ...state.agentAvatarRects };
                delete next[agentId];
                return { agentAvatarRects: next };
            }
            return {
                agentAvatarRects: {
                    ...state.agentAvatarRects,
                    [agentId]: rect,
                },
            };
        }),

    triggerInteraction: ({
        sourceAgentId,
        sourceRect,
        targetAgentId,
        targetRect,
        type = 'poop',
    }) => {
        const { userAvatarRect, agentAvatarRects } = get();
        const resolvedSource =
            sourceRect ||
            (sourceAgentId ? agentAvatarRects[sourceAgentId] : null) ||
            userAvatarRect;
        const resolvedTarget =
            targetRect || agentAvatarRects[targetAgentId];

        if (!resolvedTarget) {
            return;
        }

        // Default source if user avatar rect is not available
        const fallbackSource: InteractionRect = {
            top: window.innerHeight - 100,
            left: window.innerWidth - 100,
            width: 40,
            height: 40,
        };

        const finalSource = resolvedSource || fallbackSource;
        const sourceCenterX = finalSource.left + finalSource.width / 2;
        const sourceCenterY = finalSource.top + finalSource.height / 2;
        const targetCenterX = resolvedTarget.left + resolvedTarget.width / 2;
        const targetCenterY = resolvedTarget.top + resolvedTarget.height / 2;
        const distance = Math.hypot(targetCenterX - sourceCenterX, targetCenterY - sourceCenterY);

        const newInteraction: InteractionEvent = {
            id: Math.random().toString(36).substring(7),
            sourceRect: finalSource,
            targetRect: {
                top: resolvedTarget.top,
                left: resolvedTarget.left,
                width: resolvedTarget.width,
                height: resolvedTarget.height,
            },
            durationMs: Math.max(
                INTERACTION_FLIGHT_MS,
                Math.min(3200, Math.round(distance * 4))
            ),
            type,
        };

        set((state) => ({
            interactions: [...state.interactions, newInteraction],
        }));

        // Trigger impact effect when the animation hits
        setTimeout(() => {
            set((state) => ({
                impacts: {
                    ...state.impacts,
                    [targetAgentId]: Date.now(),
                },
            }));
        }, newInteraction.durationMs);
    },

    removeInteraction: (id) => set((state) => ({
        interactions: state.interactions.filter((i) => i.id !== id),
    })),
}));
