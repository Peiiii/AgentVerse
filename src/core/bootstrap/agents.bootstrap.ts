import { getPresenter } from "@/core/presenter";
import { MODERATORS_MAP, PARTICIPANTS_MAP } from "@/core/config/agents";

/**
 * Ensure all default agents exist and are up to date.
 * Long-term note: switch to slug+version matching; currently matches by name for backward-compat.
 * This function is idempotent and safe to call on every app start.
 */
export async function ensureDefaultAgents() {
  // Build canonical entries with slug derived from map keys, version default 1
  const entries: Array<{ slug: string; def: Omit<import("@/common/types/agent").AgentDef, "id"> }> = [];
  for (const [slug, def] of Object.entries(MODERATORS_MAP)) {
    entries.push({ slug, def: { ...def, slug, version: def.version ?? 1 } });
  }
  for (const [slug, def] of Object.entries(PARTICIPANTS_MAP)) {
    entries.push({ slug, def: { ...def, slug, version: def.version ?? 1 } });
  }
  await getPresenter().agents.ensureDefaults(entries);
}
