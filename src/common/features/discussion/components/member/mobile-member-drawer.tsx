import { Button } from "@/common/components/ui/button";
import { Sheet, SheetContent } from "@/common/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/common/components/ui/tabs";
import { DiscussionNotesPanel } from "@/common/features/discussion/components/notes/discussion-notes-panel";
import { useDiscussionMembers } from "@/core/hooks/useDiscussionMembers";
import { X } from "lucide-react";
import { MobileMemberList } from "./mobile-member-list";

interface MobileMemberDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileMemberDrawer({
  open,
  onOpenChange,
}: MobileMemberDrawerProps) {
  const { members } = useDiscussionMembers();
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
    >
      <SheetContent side="right" className="w-full sm:w-[400px] p-0">
        <Tabs defaultValue="members" className="flex-1 min-h-0 flex flex-col h-full">
          <div className="flex items-center gap-3 px-4 py-3 border-b">
            <TabsList className="flex-1 grid grid-cols-2 h-9 rounded-full bg-muted/70 p-1">
              <TabsTrigger value="members" className="rounded-full">
                成员 {members.length > 0 ? `(${members.length})` : ""}
              </TabsTrigger>
              <TabsTrigger value="notes" className="rounded-full">
                笔记
              </TabsTrigger>
            </TabsList>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-muted"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <TabsContent value="members" className="flex-1 min-h-0 m-0">
            <MobileMemberList className="h-full" showHeader={false} />
          </TabsContent>

          <TabsContent value="notes" className="flex-1 min-h-0 m-0">
            <DiscussionNotesPanel />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
