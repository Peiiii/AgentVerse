import { IBusMethod, IMethodMetadata } from './types';

type MethodDecorator = (
    target: unknown,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
) => PropertyDescriptor | void;

function createMethodDecorator(metadata: Partial<IMethodMetadata>): MethodDecorator {
    return function (
        _: unknown,
        __: string | symbol,
        descriptor: PropertyDescriptor
    ): PropertyDescriptor {
        const originalMethod = descriptor.value;
        if (typeof originalMethod !== 'function') return descriptor;

        const existingMetadata = (originalMethod as IBusMethod).__metadata__;
        const combinedMetadata: IMethodMetadata = {
            ...existingMetadata,
            ...metadata
        };

        const newDescriptor = {
            ...descriptor,
            value: function (this: unknown, ...args: unknown[]) {
                return originalMethod.apply(this, args);
            }
        };

        (newDescriptor.value as IBusMethod).__metadata__ = combinedMetadata;
        return newDescriptor;
    };
}

export function syncMethod(): MethodDecorator {
    return createMethodDecorator({ isAsync: false });
}

export function asyncMethod(): MethodDecorator {
    return createMethodDecorator({ isAsync: true });
}

export function skipMiddleware(): MethodDecorator {
    return createMethodDecorator({ skipMiddleware: true });
}
