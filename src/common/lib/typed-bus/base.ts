import { Observable, Subject, Subscription } from "rxjs";
import { ITypedKey } from "./types";

type IEventHandler<T> = (data: T) => void;

export class TypedEventEmitter {
  private subjects = new Map<string, Subject<unknown>>();
  private subscriptions = new Map<
    string,
    Map<IEventHandler<unknown>, Subscription>
  >();

  emit<T>(key: ITypedKey<T>, data: T): void {
    const subject = this.getOrCreateSubject<T>(key);
    subject.next(data);
  }

  on<T>(key: ITypedKey<T>, handler: IEventHandler<T>): () => void {
    const subject = this.getOrCreateSubject<T>(key);
    const subscription = subject.subscribe({
      next: (value) => handler(value as T),
    });

    if (!this.subscriptions.has(key.id)) {
      this.subscriptions.set(key.id, new Map());
    }
    const keySubscriptions = this.subscriptions.get(key.id)!;
    keySubscriptions.set(handler as IEventHandler<unknown>, subscription);

    return () => {
      subscription.unsubscribe();
      keySubscriptions.delete(handler as IEventHandler<unknown>);
      if (keySubscriptions.size === 0) {
        this.subscriptions.delete(key.id);
      }
    };
  }

  off<T>(key: ITypedKey<T>, handler: IEventHandler<T>): void {
    const keySubscriptions = this.subscriptions.get(key.id);
    if (keySubscriptions) {
      const subscription = keySubscriptions.get(
        handler as IEventHandler<unknown>
      );
      if (subscription) {
        subscription.unsubscribe();
        keySubscriptions.delete(handler as IEventHandler<unknown>);
        if (keySubscriptions.size === 0) {
          this.subscriptions.delete(key.id);
        }
      }
    }
  }

  protected createObservable<T>(key: ITypedKey<T>): Observable<T> {
    return this.getOrCreateSubject<T>(key).asObservable() as Observable<T>;
  }

  private getOrCreateSubject<T>(key: ITypedKey<T>): Subject<unknown> {
    if (!this.subjects.has(key.id)) {
      this.subjects.set(key.id, new Subject<unknown>());
    }
    return this.subjects.get(key.id)!;
  }
}
