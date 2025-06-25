import { IResourceBus, ITypedKey, ResourceStatus } from '../types';
import { syncMethod } from '../decorators';

export class ResourceBus implements IResourceBus {
    private resources = new Map<string, unknown>();
    private resourceStatus = new Map<string, ResourceStatus>();

    @syncMethod()
    async acquire<T>(key: ITypedKey<T>): Promise<T> {
        const status = this.status(key);
        if (status === 'busy') {
            throw new Error(`Resource ${key.id} is busy`);
        }

        const resource = this.resources.get(key.id) as T;
        if (!resource) {
            throw new Error(`Resource ${key.id} not found`);
        }

        this.resourceStatus.set(key.id, 'busy');
        return resource;
    }

    @syncMethod()
    async release<T>(key: ITypedKey<T>): Promise<void> {
        if (!this.resources.has(key.id)) {
            throw new Error(`Resource ${key.id} not found`);
        }
        this.resourceStatus.set(key.id, 'available');
    }

    @syncMethod()
    status<T>(key: ITypedKey<T>): ResourceStatus {
        return this.resourceStatus.get(key.id) || 'available';
    }

    // 内部方法：注册资源
    register<T>(key: ITypedKey<T>, resource: T): void {
        this.resources.set(key.id, resource);
        this.resourceStatus.set(key.id, 'available');
    }

    // 内部方法：重置
    reset(): void {
        this.resources.clear();
        this.resourceStatus.clear();
    }
} 