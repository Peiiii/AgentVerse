/// <reference types="jest" />

import { EnvironmentBus } from '../implementations/environment-bus';
import { createKey } from '../key';
import { IMiddleware, IInternalResourceBus } from '../types';

describe('EnvironmentBus', () => {
    let bus: EnvironmentBus;

    beforeEach(() => {
        bus = new EnvironmentBus();
    });

    describe('Event Bus', () => {    
        it('should handle event emission and subscription', () => {
            const key = createKey<string>('test-event');
            const handler = jest.fn();
            
            bus.eventBus.on(key, handler);
            bus.eventBus.emit(key, 'test-data');
            
            expect(handler).toHaveBeenCalledWith('test-data');
        });

        it('should support observable pattern', (done) => {
            const key = createKey<number>('counter');
            const values: number[] = [];
            
            bus.eventBus.observe(key).subscribe({
                next: (value) => {
                    values.push(value);
                    if (values.length === 3) {
                        expect(values).toEqual([1, 2, 3]);
                        done();
                    }
                }
            });

            bus.eventBus.emit(key, 1);
            bus.eventBus.emit(key, 2);
            bus.eventBus.emit(key, 3);
        });
    });

    describe('State Bus', () => {
        it('should manage state correctly', () => {
            const key = createKey<{ count: number }>('app-state');
            
            bus.stateBus.set(key, { count: 1 });
            expect(bus.stateBus.get(key)).toEqual({ count: 1 });
            
            bus.stateBus.set(key, { count: 2 });
            expect(bus.stateBus.get(key)).toEqual({ count: 2 });
        });

        it('should notify state changes', (done) => {
            const key = createKey<string>('user-name');
            
            const observable = bus.stateBus.watch(key);
            
            // 确保 observable 是一个有效的可观察对象
            expect(observable).toBeDefined();
            expect(typeof observable.subscribe).toBe('function');
            
            const subscription = observable.subscribe({
                next: (value) => {
                    expect(value).toBe('Alice');
                    subscription.unsubscribe();
                    done();
                }
            });

            bus.stateBus.set(key, 'Alice');
        });
    });

    describe('Message Bus', () => {
        it('should handle async message passing', async () => {
            const key = createKey<string>('chat');
            
            await bus.messageBus.send(key, 'Hello');
            await bus.messageBus.send(key, 'World');
            
            const messages = await bus.messageBus.receive(key);
            expect(messages).toEqual(['Hello', 'World']);
        });

        it('should clear messages', async () => {
            const key = createKey<string>('notifications');
            
            await bus.messageBus.send(key, 'Notice 1');
            await bus.messageBus.clear(key);
            
            const messages = await bus.messageBus.receive(key);
            expect(messages).toEqual([]);
        });
    });

    describe('Resource Bus', () => {
        beforeEach(() => {
            // 注册测试资源
            const resourceBus = (bus as unknown as { internalResource: IInternalResourceBus }).internalResource;
            resourceBus.register(
                createKey<string>('database'),
                'test-resource'
            );
            resourceBus.register(
                createKey<string>('shared-resource'),
                'test-resource'
            );
        });

        it('should manage resource lifecycle', async () => {
            const key = createKey<string>('database');
            
            expect(bus.resourceBus.status(key)).toBe('available');
            
            const resource = await bus.resourceBus.acquire(key);
            expect(resource).toBe('test-resource');
            expect(bus.resourceBus.status(key)).toBe('busy');
            
            await bus.resourceBus.release(key);
            expect(bus.resourceBus.status(key)).toBe('available');
        });
    });

    describe('Capability Bus', () => {
        it('should register and invoke capabilities', async () => {
            const key = createKey<[string, number]>('string-length');
            
            bus.capabilityBus.register(key, async (str) => str.length);
            
            const result = await bus.capabilityBus.invoke(key, 'hello');
            expect(result).toBe(5);
        });

        it('should handle capability unregistration', async () => {
            const key = createKey<[void, string]>('get-time');
            
            bus.capabilityBus.register(key, async () => 'current-time');
            bus.capabilityBus.unregister(key);
            
            await expect(bus.capabilityBus.invoke(key, undefined))
                .rejects
                .toThrow('Capability get-time not found');
        });
    });

    describe('Middleware', () => {
        it('should execute middleware chain', async () => {
            const operations: string[] = [];
            
            const middleware: IMiddleware = {
                name: 'test-middleware',
                before: async (context) => {
                    operations.push('before');
                    return context.data;
                },
                after: async (context) => {
                    operations.push('after');
                    return context.data;
                }
            };

            bus.use(middleware);

            const key = createKey<string>('test');
            await bus.messageBus.send(key, 'test-data');
            await new Promise(resolve => setTimeout(resolve, 0));

            expect(operations).toEqual(['before', 'after']);
        });

        // it('should handle middleware errors', (done) => {
        //     const errorHandler = jest.fn();
        //     let errorHandled = false;
            
        //     const middleware: IMiddleware = {
        //         name: 'error-middleware',
        //         before: async () => {
        //             throw new Error('Middleware error');
        //         },
        //         error: async (error: Error, context) => {
        //             try {
        //                 errorHandler(error.message, context.busType);
        //                 errorHandled = true;
        //             } catch (e) {
        //                 done(e);
        //             }
        //         }
        //     };

        //     bus.use(middleware);
        //     const key = createKey<string>('error-test');


        //     console.log('[bus]', bus);
        //     bus.message.send(key, 'data').catch(error => {
        //         console.log('[error]', error);
        //         try {
        //             expect(error).toBeInstanceOf(Error);
        //             expect(error.message).toBe('Middleware error');
        //             // 使用setTimeout确保错误处理器有机会执行
        //             setTimeout(() => {
        //                 try {
        //                     expect(errorHandler).toHaveBeenCalledWith('Middleware error', 'message');
        //                     expect(errorHandled).toBe(true);
        //                     done();
        //                 } catch (e) {
        //                     done(e);
        //                 }
        //             }, 100);
        //         } catch (e) {
        //             done(e);
        //         }
        //     }).then(() => {
        //         console.log('[done]');
        //         setTimeout(() => {
        //           done();
        //         }, 100);
        //     });
        // });
    });

    describe('Environment Reset', () => {
        it('should reset all buses', async () => {
            // Setup initial state
            const eventKey = createKey<string>('test-event');
            const stateKey = createKey<number>('test-state');
            const messageKey = createKey<string>('test-message');
            const capabilityKey = createKey<[void, string]>('test-capability');

            bus.eventBus.on(eventKey, () => {});
            bus.stateBus.set(stateKey, 42);
            await bus.messageBus.send(messageKey, 'test');
            bus.capabilityBus.register(capabilityKey, async () => 'result');

            // Reset
            await bus.reset();

            // Verify reset
            expect(bus.stateBus.get(stateKey)).toBeUndefined();
            expect(await bus.messageBus.receive(messageKey)).toEqual([]);
            await expect(bus.capabilityBus.invoke(capabilityKey, undefined))
                .rejects
                .toThrow();
        });
    });

    describe('Error Handling', () => {
        beforeEach(() => {
            // 注册测试资源
            const resourceBus = (bus as unknown as { internalResource: IInternalResourceBus }).internalResource;
            resourceBus.register(
                createKey<string>('shared-resource'),
                'test-resource'
            );
        });

        it('should handle concurrent resource access', async () => {
            const key = createKey<string>('shared-resource');
            
            await bus.resourceBus.acquire(key);
            await expect(bus.resourceBus.acquire(key)).rejects.toThrow('Resource shared-resource is busy');
            await bus.resourceBus.release(key);
        });

        it('should handle invalid capability parameters', async () => {
            const key = createKey<[number, string]>('number-to-string');
            
            bus.capabilityBus.register(key, async (num: number) => {
                if (typeof num !== 'number') {
                    throw new Error('Invalid parameter type');
                }
                return num.toString();
            });
            
            // @ts-expect-error 测试类型安全
            await expect(bus.capabilityBus.invoke(key, 'not-a-number'))
                .rejects
                .toThrow('Invalid parameter type');
        });
    });

    describe('Performance', () => {
        it('should handle multiple state updates efficiently', () => {
            const key = createKey<number>('perf-counter');
            const iterations = 1000;
            
            const start = performance.now();
            for (let i = 0; i < iterations; i++) {
                bus.stateBus.set(key, i);
            }
            const end = performance.now();
            
            expect(end - start).toBeLessThan(1000); // 应该在1秒内完成
            expect(bus.stateBus.get(key)).toBe(iterations - 1);
        });

        it('should handle multiple event subscribers efficiently', () => {
            const key = createKey<number>('perf-event');
            const iterations = 100;
            const handlers = Array.from({ length: iterations }, () => jest.fn());
            
            handlers.forEach(handler => bus.eventBus.on(key, handler));
            
            const start = performance.now();
            bus.eventBus.emit(key, 42);
            const end = performance.now();
            
            expect(end - start).toBeLessThan(100); // 应该在100ms内完成
            handlers.forEach(handler => {
                expect(handler).toHaveBeenCalledWith(42);
            });
        });
    });

    describe('Type Safety', () => {
        it('should enforce type safety in state operations', () => {
            const key = createKey<string>('typed-state');
            
            bus.stateBus.set(key, 'valid');
            
            // @ts-expect-error 测试类型安全
            bus.stateBus.set(key, 123);
        });

        it('should enforce type safety in capability operations', () => {
            const key = createKey<[string, number]>('typed-capability');
            
            bus.capabilityBus.register(key, async (str) => str.length);
            
            // @ts-expect-error 测试类型安全
            bus.capabilityBus.register(key, async (num: number) => num.toString());
        });
    });
});

describe('EnvironmentBus Integration', () => {
    let bus: EnvironmentBus;

    beforeEach(() => {
        bus = new EnvironmentBus();
    });

    afterEach(async () => {
        await bus.reset();
    });

    describe('Cross-Bus Communication', () => {
        it('should coordinate between event and state buses', () => {
            const stateKey = createKey<number>('counter');
            const eventKey = createKey<void>('increment');
            
            bus.stateBus.set(stateKey, 0);
            bus.eventBus.on(eventKey, () => {
                const current = bus.stateBus.get(stateKey) || 0;
                bus.stateBus.set(stateKey, current + 1);
            });

            bus.eventBus.emit(eventKey, undefined);
            bus.eventBus.emit(eventKey, undefined);
            
            expect(bus.stateBus.get(stateKey)).toBe(2);
        });

        it('should coordinate between message and capability buses', async () => {
            const messageKey = createKey<string>('input');
            const capabilityKey = createKey<[string, string]>('transform');
            
            // 注册一个将字符串转换为大写的能力
            bus.capabilityBus.register(capabilityKey, async (str) => str.toUpperCase());

            // 发送消息并使用能力处理
            await bus.messageBus.send(messageKey, 'hello');
            const messages = await bus.messageBus.receive(messageKey);
            const results = await Promise.all(
                messages.map(msg => bus.capabilityBus.invoke(capabilityKey, msg))
            );

            expect(results).toEqual(['HELLO']);
        });
    });

    describe('Complex State Management', () => {
        it('should handle nested state updates', () => {
            const key = createKey<{ user: { name: string; age: number } }>('user-data');
            
            bus.stateBus.set(key, { user: { name: 'John', age: 25 } });
            
            const state = bus.stateBus.get(key);
            if (state) {
                bus.stateBus.set(key, {
                    user: { ...state.user, age: 26 }
                });
            }

            expect(bus.stateBus.get(key)).toEqual({
                user: { name: 'John', age: 26 }
            });
        });

        it('should handle array state updates', () => {
            const key = createKey<string[]>('items');
            
            bus.stateBus.set(key, ['a', 'b']);
            const items = bus.stateBus.get(key) || [];
            bus.stateBus.set(key, [...items, 'c']);

            expect(bus.stateBus.get(key)).toEqual(['a', 'b', 'c']);
        });
    });

    describe('Error Handling', () => {
        beforeEach(() => {
            // 注册测试资源
            const resourceBus = (bus as unknown as { internalResource: IInternalResourceBus }).internalResource;
            resourceBus.register(
                createKey<string>('shared-resource'),
                'test-resource'
            );
        });

        it('should handle concurrent resource access', async () => {
            const key = createKey<string>('shared-resource');
            
            await bus.resourceBus.acquire(key);
            await expect(bus.resourceBus.acquire(key)).rejects.toThrow('Resource shared-resource is busy');
            await bus.resourceBus.release(key);
        });

        it('should handle invalid capability parameters', async () => {
            const key = createKey<[number, string]>('number-to-string');
            
            bus.capabilityBus.register(key, async (num: number) => {
                if (typeof num !== 'number') {
                    throw new Error('Invalid parameter type');
                }
                return num.toString();
            });
            
            // @ts-expect-error 测试类型安全
            await expect(bus.capabilityBus.invoke(key, 'not-a-number'))
                .rejects
                .toThrow('Invalid parameter type');
        });
    });

    describe('Performance', () => {
        it('should handle multiple state updates efficiently', () => {
            const key = createKey<number>('perf-counter');
            const iterations = 1000;
            
            const start = performance.now();
            for (let i = 0; i < iterations; i++) {
                bus.stateBus.set(key, i);
            }
            const end = performance.now();
            
            expect(end - start).toBeLessThan(1000); // 应该在1秒内完成
            expect(bus.stateBus.get(key)).toBe(iterations - 1);
        });

        it('should handle multiple event subscribers efficiently', () => {
            const key = createKey<number>('perf-event');
            const iterations = 100;
            const handlers = Array.from({ length: iterations }, () => jest.fn());
            
            handlers.forEach(handler => bus.eventBus.on(key, handler));
            
            const start = performance.now();
            bus.eventBus.emit(key, 42);
            const end = performance.now();
            
            expect(end - start).toBeLessThan(100); // 应该在100ms内完成
            handlers.forEach(handler => {
                expect(handler).toHaveBeenCalledWith(42);
            });
        });
    });

    describe('Type Safety', () => {
        it('should enforce type safety in state operations', () => {
            const key = createKey<string>('typed-state');
            
            bus.stateBus.set(key, 'valid');
            
            // @ts-expect-error 测试类型安全
            bus.stateBus.set(key, 123);
        });

        it('should enforce type safety in capability operations', () => {
            const key = createKey<[string, number]>('typed-capability');
            
            bus.capabilityBus.register(key, async (str) => str.length);
            
            // @ts-expect-error 测试类型安全
            bus.capabilityBus.register(key, async (num: number) => num.toString());
        });
    });
}); 