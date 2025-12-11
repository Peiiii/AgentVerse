import { Button } from "@/common/components/ui/button";
import { cn } from "@/common/lib/utils";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./context";
import { useTranslation } from "@/core/hooks/use-i18n";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { t } = useTranslation();
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <Button
      variant="ghost" 
      size="icon"
      onClick={toggleDarkMode}
      className={cn("hover:bg-muted/80", className)}
      title={isDarkMode ? t("theme.switchToLight") : t("theme.switchToDark")}
    >
      {isDarkMode ? (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      )}
    </Button>
  );
} 