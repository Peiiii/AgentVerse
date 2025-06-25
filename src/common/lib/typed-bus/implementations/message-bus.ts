import { TypedEventEmitter } from "../base";
import { asyncMethod, skipMiddleware } from "../decorators";
import { IInternalMessageBus, IObservable, ITypedKey } from "../types";

export class MessageBus
  extends TypedEventEmitter
  implements IInternalMessageBus
{
  messages = new Map<string, unknown[]>();

  @asyncMethod()
  async send<T>(key: ITypedKey<T>, data: T): Promise<void> {
    if (!this.messages.has(key.id)) {
      this.messages.set(key.id, []);
    }
    this.messages.get(key.id)!.push(data);
    this.emit(key, data);
  }

  @asyncMethod()
  async receive<T>(key: ITypedKey<T>): Promise<T[]> {
    return (this.messages.get(key.id) || []) as T[];
  }

  @skipMiddleware()
  observe<T>(key: ITypedKey<T>): IObservable<T> {
    return this.createObservable(key);
  }

  @asyncMethod()
  async clear<T>(key: ITypedKey<T>): Promise<void> {
    this.messages.delete(key.id);
  }

  reset(): void {
    this.messages.clear();
  }
}
