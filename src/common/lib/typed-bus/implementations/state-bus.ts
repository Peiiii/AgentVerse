import { TypedEventEmitter } from '../base';
import { skipMiddleware, syncMethod } from '../decorators';
import { IInternalStateBus, IObservable, IObserver, ITypedKey } from '../types';

export class StateBus extends TypedEventEmitter implements IInternalStateBus {
    states = new Map<string, unknown>();

    @syncMethod()
    get<T>(key: ITypedKey<T>): T | undefined {
        return this.states.get(key.id) as T | undefined;
    }

    @syncMethod()
    set<T>(key: ITypedKey<T>, value: T): void {
        if (value === undefined) {
            throw new Error(`Cannot set undefined value for key ${key.id}`);
        }
        this.states.set(key.id, value);
        this.emit(key, value);
    }

    @syncMethod()
    @skipMiddleware()
    watch<T>(key: ITypedKey<T>): IObservable<T> {
        return {
            subscribe: (observer: IObserver<T> | ((data: T) => void)) => {
                const handler = (value: T) => {
                    if (typeof observer === 'function') {
                        observer(value);
                    } else {
                        observer.next(value);
                    }
                };
                this.on(key, handler);
                return {
                    unsubscribe: () => {
                        this.off(key, handler);
                    }
                };
            }
        };
    }

    @syncMethod()
    reset<T>(key: ITypedKey<T>): void {
        this.states.delete(key.id);
        this.emit(key, undefined as T);
    }
} 