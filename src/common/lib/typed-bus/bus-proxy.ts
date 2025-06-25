import { MiddlewareChain } from './middleware-chain';
import { BusType, IBusMethod, IMethodMetadata, ITypedKey } from './types';

export class BusProxy<T extends object> {
    constructor(
        private target: T,
        private busType: BusType,
        private middlewareChain: MiddlewareChain
    ) {}

    createProxy(): T {
        return new Proxy(this.target, {
            get: (target, prop) => {
                const original = (target as Record<string | symbol, unknown>)[prop];
                if (typeof original !== 'function') return original;
                
                const metadata = (original as IBusMethod).__metadata__;
                if (metadata?.skipMiddleware) {
                    return original.bind(target);
                }

                return this.createMethodHandler(
                    prop.toString(),
                    original as (...args: unknown[]) => unknown,
                    metadata
                );
            }
        });
    }

    private createMethodHandler(
        operation: string,
        original: (...args: unknown[]) => unknown,
        metadata?: IMethodMetadata
    ) {
        const createContext = (key: ITypedKey<unknown>, data: unknown) => ({
            busType: this.busType,
            operation,
            key,
            data,
            metadata: metadata ? { ...metadata } as Record<string, unknown> : {}
        });

        if (!metadata?.isAsync) {
            return function (this: unknown, ...args: unknown[]) {
                if (args.length < 1 || !args[0]) {
                    return original.apply(this, args);
                }

                // const key = args[0] as ITypedKey<unknown>;
                // const data = args[1];
                const result = original.apply(this, args);
                return result;
            };
        }

        return async (...args: unknown[]) => {
            if (args.length < 1 || !args[0]) {
                return original.apply(this.target, args);
            }

            const key = args[0] as ITypedKey<unknown>;
            const data = args[1];
            const context = createContext(key, data);

            try {
                const processedData = await this.middlewareChain.executeBefore(context);
                args[1] = processedData;
                
                const result = await Promise.resolve(original.apply(this.target, args));
                
                return await this.middlewareChain.executeAfter({
                    ...context,
                    data: result
                });
            } catch (err) {
                const error = err instanceof Error ? err : new Error(String(err));
                await this.middlewareChain.executeError(error, context);
                throw error;
            }
        };
    }
} 