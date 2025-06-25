import { SheetTitle } from "@/common/components/ui/sheet";
import { cn } from "@/common/lib/utils";
import { MemberList } from "./member-list";
import { Button } from "@/common/components/ui/button";
import { X } from "lucide-react";

interface MobileMemberListProps {
  className?: string;
  onClose?: () => void;
}

export function MobileMemberList({ className, onClose }: MobileMemberListProps) {
  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex-none px-4 py-4 border-b">
        <div className="flex items-center justify-between">
          <SheetTitle>成员管理</SheetTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-muted"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <MemberList
          className="h-full"
          headerClassName="px-4"
          listClassName="px-4"
        />
      </div>
    </div>
  );
}
