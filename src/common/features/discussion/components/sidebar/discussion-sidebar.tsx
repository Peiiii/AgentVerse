import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/common/components/ui/tabs";
import { useDiscussionMembers } from "@/core/hooks/useDiscussionMembers";
import { MemberList } from "@/common/features/discussion/components/member/member-list";
import { DiscussionNotesPanel } from "@/common/features/discussion/components/notes/discussion-notes-panel";
import { Github } from "lucide-react";

export function DiscussionSidebar() {
  const { members } = useDiscussionMembers();

  return (
    <Tabs defaultValue="members" className="h-full flex flex-col bg-background">
      <div className="px-5 py-3 border-b border-border/40 bg-muted/30 backdrop-blur-sm sticky top-0 z-20">
        <TabsList className="grid w-full grid-cols-2 bg-muted/40 p-1 h-9 rounded-lg">
          <TabsTrigger 
            value="members" 
            className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all text-xs font-medium"
          >
            成员 {members.length > 0 ? `(${members.length})` : ""}
          </TabsTrigger>
          <TabsTrigger 
            value="notes" 
            className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all text-xs font-medium"
          >
            笔记
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="members" className="flex-1 min-h-0 m-0">
        <MemberList className="h-full" />
      </TabsContent>

      <TabsContent value="notes" className="flex-1 min-h-0 m-0">
        <DiscussionNotesPanel />
      </TabsContent>

      <div className="px-5 py-3 border-t border-border/40 bg-muted/20">
        <a
          href="https://github.com/Peiiii/AgentVerse"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Github className="h-4 w-4" />
          GitHub
        </a>
      </div>
    </Tabs>
  );
}
