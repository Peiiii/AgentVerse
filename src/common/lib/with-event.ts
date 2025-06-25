import { RxEvent } from "@/common/lib/rx-event";
import { createNestedBean } from "packages/rx-nested-bean/src";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class WithState<T extends Record<string, any>> {
  store: ReturnType<typeof createNestedBean<T>>;

  onStateChange$ = new RxEvent<[T, T]>();

  constructor(initialState: T) {
    this.store = createNestedBean(initialState);
  }

  getState() {
    return this.store.get();
  }

  setState(updates: Partial<T>) {
    const prev = this.getState();
    this.store.set((prev) => ({ ...prev, ...updates }));
    this.onStateChange$.next([prev, this.getState()]);
  }

}
