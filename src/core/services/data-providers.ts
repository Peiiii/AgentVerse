import { MockHttpProvider } from "@/common/lib/storage";
import { LocalStorageOptions } from "@/common/lib/storage/local";
import { DataProvider } from "@/common/lib/storage/types";
import { AgentDef } from "@/common/types/agent";
import { Discussion, AgentMessage } from "@/common/types/discussion";
import { DiscussionMember } from "@/common/types/discussion-member";
import { STORAGE_CONFIG } from "@/core/config/storage";

type BackendMode = "mock" | "http";

export interface SettingsStore {
  readAll(): Promise<Record<string, unknown>>;
  writeAll(values: Record<string, unknown>): Promise<void>;
  clear(): Promise<void>;
}

const STORAGE_BACKEND =
  (import.meta.env.VITE_STORAGE_BACKEND as BackendMode) || "mock";
const hasWindow = typeof window !== "undefined";
const memorySettingsStore: Record<string, Record<string, unknown>> = {};

class LocalSettingsStore implements SettingsStore {
  constructor(private readonly storageKey: string) {}

  async readAll(): Promise<Record<string, unknown>> {
    if (hasWindow && window.localStorage) {
      const raw = window.localStorage.getItem(this.storageKey);
      if (!raw) return {};
      try {
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        return { ...parsed };
      } catch {
        return {};
      }
    }

    const cached = memorySettingsStore[this.storageKey];
    return cached ? { ...cached } : {};
  }

  async writeAll(values: Record<string, unknown>): Promise<void> {
    if (hasWindow && window.localStorage) {
      window.localStorage.setItem(this.storageKey, JSON.stringify(values));
      return;
    }
    memorySettingsStore[this.storageKey] = { ...values };
  }

  async clear(): Promise<void> {
    if (hasWindow && window.localStorage) {
      window.localStorage.removeItem(this.storageKey);
      return;
    }
    delete memorySettingsStore[this.storageKey];
  }
}

// TODO: 实现 HTTP provider，用于真实后端接入
function createHttpProvider<T extends { id: string }>(): DataProvider<T> {
  throw new Error("HTTP provider not implemented yet");
}

// TODO: 实现 HTTP settings store，用于真实后端接入
function createHttpSettingsStore(storageKey: string): SettingsStore {
  throw new Error(
    `HTTP settings store not implemented yet for key ${storageKey}`
  );
}

class StorageHub {
  public readonly providers: {
    agents: DataProvider<AgentDef>;
    discussions: DataProvider<Discussion>;
    messages: DataProvider<AgentMessage>;
    discussionMembers: DataProvider<DiscussionMember>;
  };

  public readonly settings: SettingsStore;

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

    this.settings = this.createSettingsStore(STORAGE_CONFIG.KEYS.SETTINGS);
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

  private createSettingsStore(storageKey: string): SettingsStore {
    if (this.backend === "http") {
      try {
        return createHttpSettingsStore(storageKey);
      } catch (error) {
        console.warn(
          `[storage] http backend not implemented, fallback to local for key ${storageKey}`,
          error
        );
      }
    }
    return new LocalSettingsStore(storageKey);
  }
}

export const storageHub = new StorageHub();
export const dataProviders = storageHub.providers;
export const settingsStore = storageHub.settings;
