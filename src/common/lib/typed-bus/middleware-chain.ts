import { IMiddleware, IOperationContext } from './types';

export class MiddlewareChain {
    private beforeChain: Array<NonNullable<IMiddleware['before']>> = [];
    private afterChain: Array<NonNullable<IMiddleware['after']>> = [];
    private errorHandlers: Array<NonNullable<IMiddleware['error']>> = [];

    add(middleware: IMiddleware) {
        if (middleware.before) this.beforeChain.push(middleware.before);
        if (middleware.after) this.afterChain.unshift(middleware.after);
        if (middleware.error) this.errorHandlers.push(middleware.error);
    }

    remove(middleware: IMiddleware) {
        if (middleware.before) {
            this.beforeChain = this.beforeChain.filter(handler => handler !== middleware.before);
        }
        if (middleware.after) {
            this.afterChain = this.afterChain.filter(handler => handler !== middleware.after);
        }
        if (middleware.error) {
            this.errorHandlers = this.errorHandlers.filter(handler => handler !== middleware.error);
        }
    }

    async executeBefore<T>(context: IOperationContext<T>): Promise<T> {
        let data = context.data;
        try {
            for (const handler of this.beforeChain) {
                const result = await handler({ ...context, data });
                data = result === undefined ? data : result;
            }
            return data;
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            await this.executeError(error, { ...context, data });
            throw error;
        }
    }

    async executeAfter<T>(context: IOperationContext<T>): Promise<T> {
        let data = context.data;
        try {
            for (const handler of this.afterChain) {
                const result = await handler({ ...context, data });
                data = result === undefined ? data : result;
            }
            return data;
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            await this.executeError(error, { ...context, data });
            throw error;
        }
    }

    async executeError(error: Error, context: IOperationContext<unknown>): Promise<void> {
        const handlers = [...this.errorHandlers];
        const errors: Error[] = [];

        await Promise.all(
            handlers.map(async (handler) => {
                try {
                    await handler(error, context);
                } catch (err) {
                    const handlerError = err instanceof Error ? err : new Error(String(err));
                    errors.push(handlerError);
                }
            })
        );

        if (errors.length > 0) {
            console.error('Error handlers failed:', errors);
        }
    }
} 