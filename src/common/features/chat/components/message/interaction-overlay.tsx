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

const IMPACT_CONFIG = {
    poop: {
        chunks: 28,
        spray: 40,
        blobs: 4,
        streaks: 8,
        chunkSize: [7, 14],
        spraySize: [3, 7],
        blobSize: [18, 34],
        streakLength: [40, 90],
        streakThickness: [4, 7],
        chunkDistance: [60, 150],
        sprayDistance: [110, 230],
        blobDistance: [10, 28],
        ringSize: 190,
        ringWidth: 4,
        ringColor: "rgba(139, 69, 19, 0.65)",
        ringSizeInner: 120,
        ringColorInner: "rgba(210, 105, 30, 0.5)",
        coreSize: 60,
        coreColor: "rgba(210, 105, 30, 0.55)",
        flashOpacity: 0.22,
        flashColor: "rgba(210, 105, 30, 0.3)",
    },
    trash: {
        chunks: 12,
        spray: 14,
        blobs: 2,
        streaks: 4,
        chunkSize: [5, 9],
        spraySize: [2, 4],
        blobSize: [12, 22],
        streakLength: [28, 60],
        streakThickness: [3, 5],
        chunkDistance: [35, 90],
        sprayDistance: [70, 130],
        blobDistance: [6, 18],
        ringSize: 110,
        ringWidth: 2,
        ringColor: "rgba(120, 120, 120, 0.45)",
        ringSizeInner: 74,
        ringColorInner: "rgba(200, 200, 200, 0.35)",
        coreSize: 34,
        coreColor: "rgba(200, 200, 200, 0.35)",
        flashOpacity: 0.12,
        flashColor: "rgba(180, 180, 180, 0.2)",
    },
};

function Splat({ x, y, type }: { x: number; y: number; type: 'poop' | 'trash' }) {
    const colors = PARTICLE_COLORS[type];
    const config = IMPACT_CONFIG[type];
    return (
        <div style={{ position: 'fixed', left: x, top: y, zIndex: 9998, pointerEvents: 'none' }}>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, config.flashOpacity, 0] }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                style={{
                    position: "fixed",
                    inset: 0,
                    background: `radial-gradient(circle at ${x}px ${y}px, ${config.flashColor} 0%, rgba(0,0,0,0) 60%)`,
                    zIndex: 9997,
                    pointerEvents: "none",
                }}
            />
            <motion.div
                initial={{ scale: 0.3, opacity: 0.9 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute rounded-full"
                style={{
                    width: config.ringSize,
                    height: config.ringSize,
                    border: `${config.ringWidth}px solid ${config.ringColor}`,
                    left: 0,
                    top: 0,
                    transform: 'translate(-50%, -50%)',
                }}
            />
            <motion.div
                initial={{ scale: 0.4, opacity: 0.7 }}
                animate={{ scale: 1.4, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="absolute rounded-full"
                style={{
                    width: config.ringSizeInner,
                    height: config.ringSizeInner,
                    border: `${Math.max(1, config.ringWidth - 1)}px solid ${config.ringColorInner}`,
                    left: 0,
                    top: 0,
                    transform: 'translate(-50%, -50%)',
                }}
            />
            <motion.div
                initial={{ scale: 0.5, opacity: 0.8 }}
                animate={{ scale: 1.3, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="absolute rounded-full"
                style={{
                    width: config.coreSize,
                    height: config.coreSize,
                    backgroundColor: config.coreColor,
                    filter: 'blur(0.6px)',
                    left: 0,
                    top: 0,
                    transform: 'translate(-50%, -50%)',
                }}
            />
            {Array.from({ length: config.blobs }).map((_, i) => {
                const angle = Math.random() * Math.PI * 2;
                const dist = config.blobDistance[0] + Math.random() * (config.blobDistance[1] - config.blobDistance[0]);
                const size = config.blobSize[0] + Math.random() * (config.blobSize[1] - config.blobSize[0]);
                const tx = Math.cos(angle) * dist;
                const ty = Math.sin(angle) * dist;
                const color = colors[i % colors.length];
                return (
                    <motion.div
                        key={`blob-${i}`}
                        initial={{ x: 0, y: 0, scale: 0.6, opacity: 0.8 }}
                        animate={{ x: tx, y: ty, scale: [0.6, 1.2, 0.8], opacity: [0.8, 0.9, 0] }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="absolute rounded-full"
                        style={{
                            width: size,
                            height: size,
                            backgroundColor: color,
                            filter: "blur(0.4px)",
                            transform: 'translate(-50%, -50%)',
                        }}
                    />
                );
            })}
            {Array.from({ length: config.chunks }).map((_, i) => {
                const angle = (i / config.chunks) * Math.PI * 2 + Math.random() * 0.8;
                const dist = config.chunkDistance[0] + Math.random() * (config.chunkDistance[1] - config.chunkDistance[0]);
                const size = config.chunkSize[0] + Math.random() * (config.chunkSize[1] - config.chunkSize[0]);
                const tx = Math.cos(angle) * dist;
                const ty = Math.sin(angle) * dist;
                const color = colors[i % colors.length];

                return (
                    <motion.div
                        key={`chunk-${i}`}
                        initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                        animate={{ x: tx, y: ty, scale: 0, opacity: 0 }}
                        transition={{ duration: 1.1, ease: "easeOut" }}
                        className="absolute rounded-full"
                        style={{
                            width: size,
                            height: size,
                            backgroundColor: color,
                            boxShadow: `0 0 8px ${color}55`,
                            transform: 'translate(-50%, -50%)',
                        }}
                    />
                );
            })}
            {Array.from({ length: config.streaks }).map((_, i) => {
                const angle = Math.random() * Math.PI * 2;
                const dist = config.sprayDistance[0] * 0.6 + Math.random() * (config.sprayDistance[1] * 0.5);
                const length = config.streakLength[0] + Math.random() * (config.streakLength[1] - config.streakLength[0]);
                const thickness = config.streakThickness[0] + Math.random() * (config.streakThickness[1] - config.streakThickness[0]);
                const tx = Math.cos(angle) * dist;
                const ty = Math.sin(angle) * dist;
                const color = colors[i % colors.length];
                return (
                    <motion.div
                        key={`streak-${i}`}
                        initial={{ x: 0, y: 0, scaleX: 0.6, opacity: 0.8 }}
                        animate={{ x: tx, y: ty, scaleX: 1, opacity: 0 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className="absolute"
                        style={{
                            width: length,
                            height: thickness,
                            backgroundColor: color,
                            borderRadius: 999,
                            transform: `translate(-50%, -50%) rotate(${(angle * 180) / Math.PI}deg)`,
                            transformOrigin: "left center",
                            boxShadow: `0 0 10px ${color}66`,
                        }}
                    />
                );
            })}
            {Array.from({ length: config.spray }).map((_, i) => {
                const angle = Math.random() * Math.PI * 2;
                const dist = config.sprayDistance[0] + Math.random() * (config.sprayDistance[1] - config.sprayDistance[0]);
                const size = config.spraySize[0] + Math.random() * (config.spraySize[1] - config.spraySize[0]);
                const tx = Math.cos(angle) * dist;
                const ty = Math.sin(angle) * dist;
                const color = colors[i % colors.length];

                return (
                    <motion.div
                        key={`spray-${i}`}
                        initial={{ x: 0, y: 0, scale: 1, opacity: 0.9 }}
                        animate={{ x: tx, y: ty, scale: 0, opacity: 0 }}
                        transition={{ duration: 0.9, ease: "easeOut" }}
                        className="absolute rounded-full"
                        style={{
                            width: size,
                            height: size,
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
                        initial={{ x: endX, y: endY, scale: 1, opacity: 1, rotate: 0 }}
                        animate={{ scale: [1, 1.6, 0.9], opacity: [1, 1, 0], rotate: [0, -12, 8] }}
                        transition={{ duration: 0.55, ease: "easeOut" }}
                        style={{
                            position: 'fixed',
                            left: 0,
                            top: 0,
                            fontSize: '2.6rem',
                            zIndex: 9999,
                            pointerEvents: 'none',
                            filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.25))',
                            willChange: 'transform',
                        }}
                    >
                        {EMOJI_MAP[type]}
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 0 }}
                        transition={{ duration: 1.1 }}
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
