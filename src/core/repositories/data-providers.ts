import { MockHttpProvider } from "@/common/lib/storage";
import { LocalStorageOptions } from "@/common/lib/storage/local";
import { DataProvider } from "@/common/lib/storage/types";
import { AgentDef } from "@/common/types/agent";
import { Discussion, AgentMessage } from "@/common/types/discussion";
import { DiscussionMember } from "@/common/types/discussion-member";
import { STORAGE_CONFIG } from "@/core/config/storage";

type BackendMode = "mock" | "http";

const STORAGE_BACKEND =
  (import.meta.env.VITE_STORAGE_BACKEND as BackendMode) || "mock";

// TODO: 实现 HTTP provider，用于真实后端接入
function createHttpProvider<T extends { id: string }>(): DataProvider<T> {
  throw new Error("HTTP provider not implemented yet");
}

class StorageHub {
  public readonly providers: {
    agents: DataProvider<AgentDef>;
    discussions: DataProvider<Discussion>;
    messages: DataProvider<AgentMessage>;
    discussionMembers: DataProvider<DiscussionMember>;
  };

  constructor(private readonly backend: BackendMode = STORAGE_BACKEND) {
    this.providers = {
      agents: this.createProvider<AgentDef>(STORAGE_CONFIG.KEYS.AGENTS, {
        delay: STORAGE_CONFIG.MOCK_DELAY_MS,
      }),
      discussions: this.createProvider<Discussion>(
        STORAGE_CONFIG.KEYS.DISCUSSIONS,
        {
          delay: STORAGE_CONFIG.MOCK_DELAY_MS,
          maxItems: 1000,
          comparator: (a, b) =>
            new Date(b.lastMessageTime || b.createdAt).getTime() -
            new Date(a.lastMessageTime || a.createdAt).getTime(),
        }
      ),
      messages: this.createProvider<AgentMessage>(
        STORAGE_CONFIG.KEYS.MESSAGES,
        {
          delay: STORAGE_CONFIG.MOCK_DELAY_MS,
        }
      ),
      discussionMembers: this.createProvider<DiscussionMember>(
        STORAGE_CONFIG.KEYS.DISCUSSION_MEMBERS,
        { delay: STORAGE_CONFIG.MOCK_DELAY_MS }
      ),
    };
  }

  private createProvider<T extends { id: string }>(
    storageKey: string,
    options?: LocalStorageOptions<T> & { delay?: number }
  ): DataProvider<T> {
    if (this.backend === "http") {
      try {
        return createHttpProvider<T>();
      } catch (error) {
        console.warn(
          `[storage] http backend not implemented, fallback to mock for key ${storageKey}`,
          error
        );
      }
    }
    return new MockHttpProvider<T>(storageKey, options);
  }
}

export const storageHub = new StorageHub();
export const dataProviders = storageHub.providers;
