import { ICapabilityBus, ITypedKey } from "../types";
import { syncMethod } from '../decorators';

export class CapabilityBus implements ICapabilityBus {
  private capabilities = new Map<
    string,
    (params: unknown) => Promise<unknown>
  >();
  private registeredKeys = new Set<ITypedKey<[unknown, unknown]>>();

  @syncMethod()
  async invoke<T, R>(key: ITypedKey<[T, R]>, params: T): Promise<R> {
    const impl = this.capabilities.get(key.id);
    if (!impl) {
      throw new Error(`Capability ${key.id} not found`);
    }
    try {
      const result = await impl(params);
      return result as R;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to invoke capability ${key.id}: ${errorMessage}`);
    }
  }

  @syncMethod()
  register<T, R>(
    key: ITypedKey<[T, R]>,
    impl: (params: T) => Promise<R>
  ): void {
    this.capabilities.set(key.id, impl as (params: unknown) => Promise<unknown>);
    this.registeredKeys.add(key);
  }

  @syncMethod()
  unregister<T, R>(key: ITypedKey<[T, R]>): void {
    this.capabilities.delete(key.id);
    this.registeredKeys.delete(key);
  }

  @syncMethod()
  list(): Array<ITypedKey<[unknown, unknown]>> {
    return Array.from(this.registeredKeys);
  }

  // 内部方法：重置
  reset(): void {
    this.capabilities.clear();
    this.registeredKeys.clear();
  }
}
