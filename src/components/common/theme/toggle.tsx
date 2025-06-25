import { Button } from "@/components/ui/button";
import { cn } from "@/common/lib/utils";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./context";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <Button
      variant="ghost" 
      size="icon"
      onClick={toggleDarkMode}
      className={cn("hover:bg-muted/80", className)}
      title={isDarkMode ? "切换到浅色模式" : "切换到深色模式"}
    >
      {isDarkMode ? (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      )}
    </Button>
  );
} 