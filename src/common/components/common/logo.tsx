export function Logo() {
  return (
    <h1 className="relative font-bold text-2xl">
      <span className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600 bg-[200%_auto] animate-gradient-x bg-clip-text text-transparent">
        AgentVerse
      </span>
      <span className="invisible">AgentVerse</span>
      <span className="text-base font-medium text-muted-foreground ml-2">
        多Agent讨论空间
      </span>
    </h1>
  );
} 