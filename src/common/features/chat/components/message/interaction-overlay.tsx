import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { InteractionEvent, useInteractionStore } from "../../stores/interaction.store";

const EMOJI_MAP = {
    poop: "💩",
    trash: "🗑️",
};

const PARTICLE_COLORS = {
    poop: ["#8B4513", "#A0522D", "#6B4423", "#D2691E"],
    trash: ["#666", "#999", "#CCC", "#F0F0F0"],
};

function Splat({ x, y, type }: { x: number; y: number; type: 'poop' | 'trash' }) {
    const colors = PARTICLE_COLORS[type];
    return (
        <div style={{ position: 'fixed', left: x, top: y, zIndex: 9998, pointerEvents: 'none' }}>
            {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i / 12) * Math.PI * 2 + Math.random();
                const dist = 40 + Math.random() * 50;
                const tx = Math.cos(angle) * dist;
                const ty = Math.sin(angle) * dist;
                const color = colors[i % colors.length];

                return (
                    <motion.div
                        key={i}
                        initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                        animate={{ x: tx, y: ty, scale: 0, opacity: 0 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="absolute rounded-full"
                        style={{
                            width: 6,
                            height: 6,
                            backgroundColor: color,
                            transform: 'translate(-50%, -50%)',
                        }}
                    />
                );
            })}
        </div>
    );
}

function FlyingEmoji({ interaction, onComplete }: { interaction: InteractionEvent; onComplete: (id: string) => void }) {
    const { sourceRect, targetRect, type, id } = interaction;
    const [phase, setPhase] = useState<'flying' | 'impact'>('flying');

    const startX = sourceRect.left + sourceRect.width / 2 - 20;
    const startY = sourceRect.top + sourceRect.height / 2 - 20;
    const endX = targetRect.left + targetRect.width / 2 - 20;
    const endY = targetRect.top + targetRect.height / 2 - 20;

    const duration = interaction.durationMs / 1000;
    const dx = endX - startX;
    const dy = endY - startY;
    const distanceRaw = Math.hypot(dx, dy);
    const distance = distanceRaw || 1;
    const ux = dx / distance;
    const uy = dy / distance;
    let nx = -uy;
    let ny = ux;
    if (distanceRaw < 1) {
        nx = 1;
        ny = 0;
    }
    const arcOffset = Math.max(120, Math.min(260, distance * 0.35));
    const midX = (startX + endX) / 2 + nx * arcOffset;
    const midY = (startY + endY) / 2 + ny * arcOffset;

    return (
        <>
            <AnimatePresence>
                {phase === 'flying' && (
                    <motion.div
                        key={`${id}-emoji`}
                        initial={{
                            x: startX,
                            y: startY,
                            scale: 0.5,
                            opacity: 0,
                            rotate: 0
                        }}
                        animate={{
                            x: [startX, midX, endX],
                            y: [startY, midY, endY],
                            scale: [0.6, 1.1, 1],
                            opacity: [0, 1, 1],
                            rotate: 300,
                        }}
                        transition={{
                            x: { duration, ease: "easeInOut", times: [0, 0.5, 1] },
                            y: { duration, ease: "easeInOut", times: [0, 0.5, 1] },
                            scale: { duration, ease: "easeOut", times: [0, 0.6, 1] },
                            rotate: { duration, ease: "linear" },
                            opacity: { duration: Math.min(0.6, duration * 0.2) },
                        }}
                        onAnimationComplete={() => setPhase('impact')}
                        style={{
                            position: 'fixed',
                            left: 0,
                            top: 0,
                            fontSize: '2.3rem',
                            zIndex: 9999,
                            pointerEvents: 'none',
                            willChange: 'transform',
                        }}
                    >
                        {EMOJI_MAP[type]}
                    </motion.div>
                )}
            </AnimatePresence>

            {phase === 'impact' && (
                <div key={`${id}-impact`}>
                    <Splat x={endX + 20} y={endY + 20} type={type} />
                    <motion.div
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        onAnimationComplete={() => onComplete(id)}
                    />
                </div>
            )}
        </>
    );
}

export function InteractionOverlay() {
    const interactions = useInteractionStore(s => s.interactions);
    const removeInteraction = useInteractionStore(s => s.removeInteraction);

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
            {interactions.map((interaction) => (
                <FlyingEmoji
                    key={interaction.id}
                    interaction={interaction}
                    onComplete={removeInteraction}
                />
            ))}
        </div>
    );
}
