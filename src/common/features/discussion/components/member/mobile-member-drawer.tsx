import { Sheet, SheetContent } from "@/common/components/ui/sheet";
import { MobileMemberList } from "./mobile-member-list";

interface MobileMemberDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileMemberDrawer({
  open,
  onOpenChange,
}: MobileMemberDrawerProps) {
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
    >
      <SheetContent side="right" className="w-full sm:w-[400px] p-0">
        <MobileMemberList onClose={() => onOpenChange(false)} />
      </SheetContent>
    </Sheet>
  );
}
