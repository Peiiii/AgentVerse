import { Button } from "@/common/components/ui/button";
import { Textarea } from "@/common/components/ui/textarea";
import { useDiscussions } from "@/core/hooks/useDiscussions";
import { usePresenter } from "@/core/presenter";
import { useEffect, useMemo, useState } from "react";

export function DiscussionNotesPanel() {
  const presenter = usePresenter();
  const { currentDiscussion } = useDiscussions();
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  const currentNote = useMemo(
    () => currentDiscussion?.note || "",
    [currentDiscussion?.note]
  );

  useEffect(() => {
    setNote(currentNote);
    setSavedAt(null);
  }, [currentDiscussion?.id, currentNote]);

  const isDirty = note !== currentNote;

  const handleSave = async () => {
    if (!currentDiscussion) return;
    setIsSaving(true);
    try {
      await presenter.discussions.update(currentDiscussion.id, { note });
      setSavedAt(new Date());
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
        <div>
          <div className="text-sm font-semibold text-foreground">共享笔记</div>
          <div className="text-xs text-muted-foreground">
            所有成员可见
          </div>
        </div>
        <div className="flex items-center gap-2">
          {savedAt && !isDirty && (
            <span className="text-xs text-muted-foreground">已保存</span>
          )}
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!currentDiscussion || !isDirty || isSaving}
          >
            {isSaving ? "保存中..." : "保存"}
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 p-4">
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="记录讨论要点、行动项或待办事项..."
          className="h-full min-h-0 resize-none"
        />
      </div>
    </div>
  );
}
