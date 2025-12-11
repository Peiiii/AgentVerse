import { Button } from "@/common/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/common/components/ui/dropdown-menu";
import { cn } from "@/common/lib/utils";
import { Globe } from "lucide-react";
import { useTranslation } from "@/core/hooks/use-i18n";

interface LanguageToggleProps {
  className?: string;
}

const languages = [
  { code: "zh-CN", label: "简体中文", nativeLabel: "简体中文" },
  { code: "en-US", label: "English", nativeLabel: "English" },
] as const;

export function LanguageToggle({ className }: LanguageToggleProps) {
  const { t, currentLanguage, changeLanguage } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("hover:bg-muted/80", className)}
          title={t("settings.language.label")}
        >
          <Globe className="h-[1.2rem] w-[1.2rem]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="right" className="min-w-[120px]">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={cn(
              "cursor-pointer",
              currentLanguage === lang.code && "bg-accent font-medium"
            )}
          >
            <span className="flex items-center justify-between w-full">
              <span>{lang.nativeLabel}</span>
              {currentLanguage === lang.code && (
                <span className="text-xs">✓</span>
              )}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

