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
        className={`absolute inset-0 bg-white shadow-lg transition-transform transition-opacity duration-350 ease-[cubic-bezier(.4,0,.2,1)]
          ${visible ? 'translate-x-0 opacity-100 pointer-events-auto' : 'translate-x-full opacity-0 pointer-events-none'}
        `}
        style={{ willChange: 'transform, opacity', zIndex }}
      >
        {/* 关闭按钮（右上角浮动） */}
        {!hideCloseButton && (
          <button
            className="absolute top-4 right-4 z-40 text-gray-400 hover:text-gray-700 text-2xl font-bold bg-white/80 rounded-full w-9 h-9 flex items-center justify-center shadow"
            onClick={onClose}
            title="关闭"
          >
            ×
          </button>
        )}
        <div className="h-full w-full overflow-auto">{children}</div>
      </div>
    </div>
  );
} 