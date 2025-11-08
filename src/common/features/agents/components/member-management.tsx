import { useAddAgentDialog } from "@/common/features/agents/components/add-agent-dialog";
import { Button } from "@/common/components/ui/button";
import { cn } from "@/common/lib/utils";
import { Users } from "lucide-react";

interface MemberManagementProps {
  className?: string;
}


export function MemberManagement({ className }: MemberManagementProps) {
const { openAddAgentDialog } = useAddAgentDialog();
  return (
    <>
      <Button
        variant="secondary"
        size="icon"
        onClick={() => openAddAgentDialog()}
        className={cn("h-9 w-9 hover:bg-muted/80", className)}
      >
        <Users className="h-[1.2rem] w-[1.2rem]" />
      </Button>
    </>
  );
} 