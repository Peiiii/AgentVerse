export interface ITypedKey<T> {
  readonly _type: T;
  readonly id: string;
}

export interface IObserver<T> {
  next: (value: T) => void;
  error?: (error: Error) => void;
  complete?: () => void;
}

export interface ISubscription {
  unsubscribe: () => void;
}

export interface IObservable<T> {
  subscribe: (observer: IObserver<T> | ((data: T) => void)) => ISubscription;
}

export interface IEventBus {
  emit<T>(key: ITypedKey<T>, data: T): void;
  on<T>(key: ITypedKey<T>, handler: (data: T) => void): () => void;
  off<T>(key: ITypedKey<T>, handler: (data: T) => void): void;
  observe<T>(key: ITypedKey<T>): IObservable<T>;
}

export interface IStateBus {
  get<T>(key: ITypedKey<T>): T | undefined;
  set<T>(key: ITypedKey<T>, value: T): void;
  watch<T>(key: ITypedKey<T>): IObservable<T>;
  reset<T>(key: ITypedKey<T>): void;
}

export interface IMessageBus {
  send<T>(key: ITypedKey<T>, data: T): Promise<void>;
  receive<T>(key: ITypedKey<T>): Promise<T[]>;
  observe<T>(key: ITypedKey<T>): IObservable<T>;
  clear<T>(key: ITypedKey<T>): Promise<void>;
}

export interface IResourceBus {
  acquire<T>(key: ITypedKey<T>): Promise<T>;
  release<T>(key: ITypedKey<T>): Promise<void>;
  status<T>(key: ITypedKey<T>): ResourceStatus;
}

export interface ICapabilityBus {
  invoke<T, R>(key: ITypedKey<[T, R]>, params: T): Promise<R>;
  register<T, R>(key: ITypedKey<[T, R]>, impl: (params: T) => Promise<R>): void;
  unregister<T, R>(key: ITypedKey<[T, R]>): void;
  list(): Array<ITypedKey<[unknown, unknown]>>;
}

export type ResourceStatus = "available" | "busy" | "error";

export interface IBusOptions {
  enableLogging?: boolean;
  errorHandler?: (error: Error) => void;
}

export class BusError extends Error {
  constructor(
    public readonly bus: string,
    public readonly operation: string,
    public readonly key: ITypedKey<unknown>,
    message: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = "BusError";
  }
}

export interface IOperationContext<T> {
  busType: string;
  operation: string;
  key: ITypedKey<T>;
  data: T;
  metadata: Record<string, unknown>;
}

export interface IMiddleware<TBefore = unknown, TAfter = TBefore> {
  name: string;
  priority?: number;
  before?: <T = TBefore>(context: IOperationContext<T>) => Promise<T>;
  after?: <T = TAfter>(context: IOperationContext<T>) => Promise<T>;
  error?: (
    error: Error,
    context: IOperationContext<TBefore | TAfter>
  ) => Promise<void>;
}

export interface IEnvironmentBus {
  eventBus: IEventBus;
  stateBus: IStateBus;
  messageBus: IMessageBus;
  resourceBus: IResourceBus;
  capabilityBus: ICapabilityBus;

  use(middleware: IMiddleware<unknown>): () => void;
  removeMiddleware(middleware: IMiddleware<unknown>): void;
  reset(): Promise<void>;
  status(): IBusStatus;
}

export interface IBusStatus {
  event: boolean;
  state: boolean;
  message: boolean;
  resource: boolean;
  capability: boolean;
}

export type BusType = "event" | "state" | "message" | "resource" | "capability";

export interface IMethodMetadata {
    isAsync?: boolean;
    skipMiddleware?: boolean;
    priority?: number;
}

export interface IBusMethod {
    (...args: unknown[]): unknown;
    __metadata__?: IMethodMetadata;
}

// 内部接口
export interface IInternalBus {
    reset(): void;
}

export interface IInternalResourceBus extends IResourceBus, IInternalBus {
    register<T>(key: ITypedKey<T>, resource: T): void;
}

export interface IInternalStateBus extends IStateBus {
    states: Map<string, unknown>;
}

export interface IInternalMessageBus extends IMessageBus, IInternalBus {
    messages: Map<string, unknown[]>;
}

export interface IInternalCapabilityBus extends ICapabilityBus, IInternalBus {
    reset(): void;
}