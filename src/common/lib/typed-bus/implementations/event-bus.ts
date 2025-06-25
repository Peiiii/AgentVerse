import { TypedEventEmitter } from '../base';
import { skipMiddleware } from '../decorators';
import { IEventBus, IObservable, ITypedKey } from '../types';

export class EventBus extends TypedEventEmitter implements IEventBus {
    emit<T>(key: ITypedKey<T>, data: T): void {
        super.emit(key, data);
    }

    on<T>(key: ITypedKey<T>, handler: (data: T) => void) {
       return super.on(key, handler);
    }

    off<T>(key: ITypedKey<T>, handler: (data: T) => void): void {
        return super.off(key, handler);
    }

    @skipMiddleware()
    observe<T>(key: ITypedKey<T>): IObservable<T> {
        return super.createObservable(key);
    }
} 