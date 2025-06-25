import { RxEvent } from "@/common/lib/rx-event";

export type TypingStatus = "typing" | "thinking" | null;

export interface ITypingIndicator {
  memberId: string;
  status: TypingStatus;
  timestamp: number;
}

export interface TypingIndicatorOptions {
  /**
   * 状态过期时间（毫秒）
   */
  expirationTime?: number;
  /**
   * 是否启用自动清理
   */
  enableAutoCleanup?: boolean;
  /**
   * 清理检查间隔（毫秒）
   */
  cleanupInterval?: number;
}

export class TypingIndicatorService {
  private indicators = new Map<string, ITypingIndicator>();
  private cleanupTimer?: NodeJS.Timeout;
  private DEFAULT_CLEANUP_INTERVAL = 60000;
  private DEFAULT_EXPIRATION_TIME = 60000;

  readonly onIndicatorsChange$ = new RxEvent<Map<string, ITypingIndicator>>();

  constructor(private options: TypingIndicatorOptions = {}) {
    const {
      enableAutoCleanup = true,
      cleanupInterval = this.DEFAULT_CLEANUP_INTERVAL,
    } = options;

    if (enableAutoCleanup) {
      this.startCleanupTimer(cleanupInterval);
    }
  }

  /**
   * 更新成员的输入状态
   */
  updateStatus(memberId: string, status: TypingStatus) {
    if (!status) {
      this.indicators.delete(memberId);
    } else {
      this.indicators.set(memberId, {
        memberId,
        status,
        timestamp: Date.now(),
      });
    }

    this.notifyChange();
  }

  /**
   * 获取当前所有状态
   */
  getIndicators() {
    return new Map(this.indicators);
  }

  /**
   * 获取指定成员的状态
   */
  getStatus(memberId: string) {
    return this.indicators.get(memberId);
  }

  /**
   * 清除指定成员的状态
   */
  clearStatus(memberId: string) {
    if (this.indicators.delete(memberId)) {
      this.notifyChange();
    }
  }

  /**
   * 清除所有状态
   */
  clearAll() {
    if (this.indicators.size > 0) {
      this.indicators.clear();
      this.notifyChange();
    }
  }

  /**
   * 销毁服务实例
   */
  destroy() {
    this.stopCleanupTimer();
    this.clearAll();
  }

  private notifyChange() {
    this.onIndicatorsChange$.next(this.getIndicators());
  }

  private startCleanupTimer(interval: number) {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, interval);
  }

  private stopCleanupTimer() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
  }

  private cleanup() {
    const now = Date.now();
    const { expirationTime = this.DEFAULT_EXPIRATION_TIME } = this.options;
    let hasChanges = false;

    for (const [memberId, indicator] of this.indicators) {
      if (now - indicator.timestamp > expirationTime) {
        this.indicators.delete(memberId);
        hasChanges = true;
      }
    }

    if (hasChanges) {
      this.notifyChange();
    }
  }
}

// 创建默认实例
export const typingIndicatorService = new TypingIndicatorService();
