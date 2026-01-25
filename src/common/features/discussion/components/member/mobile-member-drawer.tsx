import { Button } from "@/common/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/common/components/ui/tabs";
import { DiscussionNotesPanel } from "@/common/features/discussion/components/notes/discussion-notes-panel";
import { useDiscussionMembers } from "@/core/hooks/useDiscussionMembers";
import { cn } from "@/common/lib/utils";
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
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => onOpenChange(false)}
        />
      )}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 h-full border-l border-border bg-card shadow-lg",
          "transition-transform duration-300 ease-in-out",
          "w-full sm:w-[400px] p-0",
          open ? "translate-x-0" : "translate-x-full pointer-events-none"
        )}
      >
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
      </div>
    </>
  );
}
