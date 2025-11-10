import { AgentDef } from "@/common/types/agent";
import { AgentMessage, NormalMessage } from "@/common/types/discussion";

// Lightweight @mention resolver extracted from DiscussionControlService
// - Keeps an internal queue of mention targets for a given source message
// - Resolves to agent ids by slug first, then by name with a word-boundary check
// - Stateless towards external services; agents list is provided by caller

export class MentionResolver {
  private pending: string[] = [];
  private sourceId: string | null = null;

  feed(trigger: AgentMessage) {
    if (trigger.type !== "text") return;

    // If we already have a queue for this message, do not re-parse
    if (this.sourceId === trigger.id && this.pending.length > 0) {
      return;
    }

    const mentions = this.extractMentions((trigger as NormalMessage).content)
      .map((m) => this.normalizeMentionTarget(m))
      .filter((m): m is string => Boolean(m));

    if (mentions.length > 0) {
      this.pending = mentions;
      this.sourceId = trigger.id;
    } else if (this.sourceId === trigger.id) {
      // Clear state if the same message no longer contains mentions
      this.pending = [];
      this.sourceId = null;
    }
  }

  takeNext(members: { agentId: string }[], defs: AgentDef[]): string | null {
    if (!this.pending.length) return null;

    while (this.pending.length) {
      const target = this.pending.shift()!;
      const targetLower = target.toLowerCase();
      const firstTokenLower = targetLower.split(/\s+/)[0];

      // 1) Prefer exact slug match on the first token (stable across renames / i18n)
      const bySlug = defs.find((a) => a.slug && a.slug.toLowerCase() === firstTokenLower);
      if (bySlug && members.find((m) => m.agentId === bySlug.id)) {
        if (!this.pending.length) {
          this.sourceId = null;
        }
        return bySlug.id;
      }

      // 2) Fallback: name-prefix with boundary (legacy behavior)
      const byName = defs.find((a) => {
        const nameLower = a.name.toLowerCase();
        if (!targetLower.startsWith(nameLower)) {
          return false;
        }
        const nextChar = targetLower.charAt(nameLower.length);
        return this.isBoundaryChar(nextChar);
      });
      if (byName && members.find((m) => m.agentId === byName.id)) {
        if (!this.pending.length) {
          this.sourceId = null;
        }
        return byName.id;
      }
    }

    this.sourceId = null;
    return null;
  }

  // --- internals ---
  private extractMentions(content: string): string[] {
    const re =
      /@(?:"([^"]+)"|'([^']+)'|“([^”]+)”|‘([^’]+)’|「([^」]+)」|『([^』]+)』|（([^）]+)）|【([^】]+)】|《([^》]+)》|〈([^〉]+)〉|([^\s@，。,！？!?:：；;]+(?:\s+[^\s@，。,！？!?:：；;]+)*))/giu;
    const results: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = re.exec(content)) !== null) {
      const [, ...groups] = match;
      const candidate = groups.find(Boolean);
      if (candidate) {
        results.push(candidate);
      }
    }
    return results;
  }

  private normalizeMentionTarget(target: string | null): string | null {
    if (!target) return null;
    const cleaned = target
      .trim()
      .replace(/^["'“”‘’「」『』【】《》〈〉（）()]+/, "")
      .replace(/["'“”‘’「」『』【】《》〈〉（）()\s，。,。！？!?:：；;、]+$/u, "")
      .replace(/\s{2,}/g, " ")
      .trim();
    return cleaned.length ? cleaned : null;
  }

  private isBoundaryChar(char: string | undefined) {
    if (!char) return true;
    return /\s|[，。,。！？!?:：；;、]/u.test(char);
  }
}

