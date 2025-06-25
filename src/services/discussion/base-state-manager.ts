import { RxEvent } from "@/common/lib/rx-event";
import { WithState } from "@/common/lib/with-event";

export interface BaseDiscussionState {
  isPaused: boolean;
  currentDiscussionId: string | null;
}

export abstract class BaseStateManager<
  T extends BaseDiscussionState
> extends WithState<T> {
  onCurrentDiscussionIdChange$ = new RxEvent<string | null>();

  protected constructor(initialState: T) {
    super(initialState);

    // 监听讨论ID变化
    this.onStateChange$.listen(([prev, current]) => {
      if (prev.currentDiscussionId !== current.currentDiscussionId) {
        this.onCurrentDiscussionIdChange$.next(current.currentDiscussionId);
      }
    });
  }

  getCurrentDiscussionId(): string | null {
    return this.getState().currentDiscussionId;
  }

  setCurrentDiscussionId(id: string | null) {
    if (this.getCurrentDiscussionId() !== id) {
      this.setState({
        ...this.getState(),
        currentDiscussionId: id,
      });
    }
  }

  isPaused(): boolean {
    return this.getState().isPaused;
  }

  setPaused(paused: boolean) {
    this.setState({
      ...this.getState(),
      isPaused: paused,
    });
  }

  protected abstract validateState(state: Partial<T>): void;

  setState(state: Partial<T>) {
    this.validateState(state);
    super.setState(state);
  }
}
