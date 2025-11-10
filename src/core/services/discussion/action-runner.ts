import { CapabilityRegistry as Caps } from "@/common/lib/capabilities";
import { ActionDef, ActionParser } from "@/common/lib/agent/action/action-parser";
import { DefaultActionExecutor } from "@/common/lib/agent/action";
import { AgentDef } from "@/common/types/agent";
import { ActionResultMessage, NormalMessage } from "@/common/types/discussion";
import { getPresenter } from "@/core/presenter/presenter";

type Deps = {
  create: (
    msg: Omit<ActionResultMessage, "id" | "discussionId"> & { discussionId: string }
  ) => Promise<ActionResultMessage>;
  registry?: Caps; // for testing
};

export class ActionRunner {
  private parser = new ActionParser();
  private exec = new DefaultActionExecutor();
  private reg = Caps.getInstance();

  constructor(private readonly deps: Deps) {
    if (deps.registry) this.reg = deps.registry;
  }

  async runIfAny(
    author: AgentDef | undefined,
    canUseActions: boolean,
    agentMessage: NormalMessage
  ): Promise<ActionResultMessage | null> {
    if (!author || !canUseActions) return null;

    const parsed = this.parser.parse(agentMessage.content);
    if (!parsed.length) return null;

    const results = await this.exec.execute(parsed, this.reg);
    const resultMessage: Omit<ActionResultMessage, "id" | "discussionId"> = {
      type: "action_result",
      agentId: "system",
      timestamp: new Date(),
      originMessageId: agentMessage.id,
      results: results.map((r, i) => {
        const def = parsed[i].parsed as ActionDef | undefined;
        return {
          operationId: def?.operationId ?? `op-${i}`,
          capability: r.capability,
          params: r.params || {},
          status: r.error ? "error" : "success",
          result: r.result,
          description: def?.description ?? "",
          error: r.error,
          startTime: r.startTime,
          endTime: r.endTime,
        };
      }),
    };

    const created = await this.deps.create({
      ...resultMessage,
      discussionId: agentMessage.discussionId,
    });

    // Keep the presenter in sync
    await getPresenter().messages.loadForDiscussion();

    return created as ActionResultMessage;
  }
}

