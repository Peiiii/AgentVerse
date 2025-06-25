import { Subject } from "rxjs";

export class RxEvent<T> extends Subject<T> {
  listen(fn: (value: T) => void) {
    const subscription = this.subscribe(fn);
    return () => subscription.unsubscribe();
  }
}
