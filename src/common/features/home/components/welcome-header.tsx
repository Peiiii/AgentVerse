import { cn } from "@/common/lib/utils";
import { motion } from "framer-motion";
import { useTranslation } from "@/core/hooks/use-i18n";

interface WelcomeHeaderProps {
  className?: string;
}

export function WelcomeHeader({ className }: WelcomeHeaderProps) {
  const { t } = useTranslation();
  return (
    <div className={cn("space-y-4", className)}>
      <motion.div className="relative">
        <motion.h1
          className="relative text-4xl md:text-5xl font-bold tracking-tight"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 bg-[200%_auto] animate-gradient-x bg-clip-text text-transparent select-none">
            AgentVerse
          </span>
          <span className="invisible">AgentVerse</span>
        </motion.h1>
        <div className="absolute -inset-x-20 -inset-y-10 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10 blur-2xl opacity-30" />
        </div>
      </motion.div>
      <motion.p 
        className="relative text-lg md:text-xl text-foreground/80"
      >
        {t("home.welcomeHeader.description")}
      </motion.p>
    </div>
  );
} 