import { Loader2 } from "lucide-react";

export function AppLoading() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="w-full max-w-[280px] sm:max-w-[320px] px-6 text-center">
        {/* Logo 动画 */}
        <div className="relative mb-8">
          <h1 className="text-[2rem] sm:text-[2.5rem] font-bold leading-none">
            <span className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600 bg-[200%_auto] animate-gradient-x bg-clip-text text-transparent select-none">
              AgentVerse
            </span>
            <span className="invisible">AgentVerse</span>
          </h1>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground font-medium">
            多Agent讨论空间
          </p>
        </div>

        {/* 加载动画 */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-xl" />
          <div className="relative bg-background/80 backdrop-blur-sm border border-purple-500/20 rounded-xl px-4 py-3">
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="text-sm font-medium text-muted-foreground">
                正在加载...
              </span>
            </div>
          </div>
        </div>

        {/* 底部装饰 */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600 opacity-20" />
      </div>
    </div>
  );
}
