import { AgentMessage } from "@/common/types/discussion";
import { AgentDef } from "@/common/types/agent";
import { MentionResolver } from "./mention-resolver";

export type Member = { agentId: string; isAutoReply: boolean };

// Encapsulates the next-speaker selection policy.
export class NextSpeakerSelector {
  constructor(private readonly mention: MentionResolver) {}

  select(
    trigger: AgentMessage,
    members: Member[],
    defs: AgentDef[],
  ): string | null {
    if (members.length === 0) return null;

    // 1) @mention takes priority for text messages
    if (trigger.type === "text") {
      this.mention.feed(trigger);
      const mentionTarget = this.mention.takeNext(members, defs);
      if (mentionTarget) return mentionTarget;
    }

    const autos = members.filter((m) => m.isAutoReply);
    if (trigger.agentId === "user") {
      if (autos.length) return autos[0].agentId;
      // fallback to moderator if any
      const mod = members.find((m) => defs.find((a) => a.id === m.agentId)?.role === "moderator");
      return mod ? mod.agentId : members[0]?.agentId ?? null;
    }

    // 2) otherwise, next auto-reply member different from current agent
    const next = autos.find((m) => m.agentId !== trigger.agentId);
    return next ? next.agentId : null;
  }
}
