import React from "react";

export interface SidePanelProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  zIndex?: number;
  hideCloseButton?: boolean;
}

export function SidePanel({ visible, onClose, children, zIndex = 30, hideCloseButton = false }: SidePanelProps) {
  return (
    <div className="relative min-w-0 max-w-1/2 h-full flex-1">
      <div
        className={`absolute inset-0 bg-white/70 backdrop-blur-xl border-l border-indigo-200/30 shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
          ${visible ? 'translate-x-0 opacity-100 pointer-events-auto' : 'translate-x-[20px] opacity-0 pointer-events-none'}
        `}
        style={{ willChange: 'transform, opacity', zIndex }}
      >
        {/* 关闭按钮（右上角浮动） */}
        {!hideCloseButton && (
          <button
            className="absolute top-4 right-4 z-40 text-gray-400 hover:text-indigo-600 text-2xl font-light hover:bg-white/80 rounded-full w-9 h-9 flex items-center justify-center transition-all duration-200"
            onClick={onClose}
            title="关闭"
          >
            ×
          </button>
        )}
        <div className="h-full w-full overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
 