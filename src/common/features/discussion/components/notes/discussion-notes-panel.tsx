import { Button } from "@/common/components/ui/button";
import { Textarea } from "@/common/components/ui/textarea";
import { useDiscussions } from "@/core/hooks/useDiscussions";
import { usePresenter } from "@/core/presenter";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

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
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/40 bg-muted/5">
        <div className="space-y-0.5">
          <div className="text-sm font-semibold tracking-tight text-foreground">共享笔记</div>
          <div className="text-[11px] text-muted-foreground/70">
            所有讨论组成员实时可见
          </div>
        </div>
        <div className="flex items-center gap-3">
          <AnimatePresence>
            {savedAt && !isDirty && (
              <motion.span 
                initial={{ opacity: 0, x: 5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full"
              >
                已保存
              </motion.span>
            )}
          </AnimatePresence>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!currentDiscussion || !isDirty || isSaving}
            className="h-8 px-4 font-medium transition-all shadow-sm hover:shadow-md"
          >
            {isSaving ? "保存中..." : "保存"}
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 p-5">
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="记录讨论要点、行动项或待办事项..."
          className="h-full min-h-0 resize-none bg-muted/20 border-border/40 focus-visible:bg-background focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:ring-indigo-500/30 transition-all rounded-xl p-4 text-sm leading-relaxed"
        />
      </div>
    </div>
  );
}
