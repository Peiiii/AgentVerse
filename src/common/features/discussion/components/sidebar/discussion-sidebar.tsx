import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/common/components/ui/tabs";
import { useDiscussionMembers } from "@/core/hooks/useDiscussionMembers";
import { MemberList } from "@/common/features/discussion/components/member/member-list";
import { DiscussionNotesPanel } from "@/common/features/discussion/components/notes/discussion-notes-panel";

export function DiscussionSidebar() {
  const { members } = useDiscussionMembers();

  return (
    <Tabs defaultValue="members" className="h-full flex flex-col">
      <div className="px-3 py-2 border-b border-border/40 bg-background/95">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="members">
            成员 {members.length > 0 ? `(${members.length})` : ""}
          </TabsTrigger>
          <TabsTrigger value="notes">笔记</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="members" className="flex-1 min-h-0 m-0">
        <MemberList className="h-full" />
      </TabsContent>

      <TabsContent value="notes" className="flex-1 min-h-0 m-0">
        <DiscussionNotesPanel />
      </TabsContent>
    </Tabs>
  );
}
