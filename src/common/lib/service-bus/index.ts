export type TypedKey<T> = {
  name: string;
  typeHolder?: (arg: T) => void;
};

// export type TypedKey<T> = string & { __type__: T };

export type ExtractKeyType<T> = T extends TypedKey<infer U> ? U : never;

 
export type Key<T = unknown> = string | TypedKey<T>;

export const typedKey = <T = undefined>(name: string) => {
  return {
    name,
  } as TypedKey<T>;
};

export const getPlainKey = <T>(key: Key<T> | string): string => {
  return typeof key === "string" ? key : key.name;
};

export type ServiceHandler<Tin extends unknown[], Tout> = (...args: Tin) => Tout;

const joinKeys = (a: string, b: string) => `${a}.${b}`;

export const createServiceBus = () => {
  const serviceRegistry: Record<string, ServiceHandler<unknown[], unknown>> = {};
  const register = <Tin extends unknown[], Tout>(
    key: Key<[Tin, Tout]>,
    // handler: ServiceHandler<Tin, Tout>
    handler: (...args: Tin) => Tout
  ) => {
    const plainKey = getPlainKey(key);
    serviceRegistry[plainKey] = handler as ServiceHandler<unknown[], unknown>;
    return () => delete serviceRegistry[plainKey];
  };

  const invoke = <Tin extends unknown[], Tout>(
    key: Key<[Tin, Tout]>,
    ...args: Tin
  ): Tout => {
    const plainKey = getPlainKey(key);
    if (!serviceRegistry[plainKey]) {
      throw new Error(`Service not found: ${plainKey}`);
    }
    return serviceRegistry[plainKey](...args) as Tout;
  };

  const registerFromMap = <T extends Record<string, (...args: unknown[]) => unknown>>(
    key: Key<T>,
    handlers: T
  ) => {
    for (const subKey in handlers) {
      if (handlers[subKey]) {
        register(
          joinKeys(getPlainKey(key), subKey) as Key<[unknown[], unknown]>,
          handlers[subKey] as (...args: unknown[]) => unknown
        );
      }
    }
  };

  const createProxy = <T extends Record<string, (...args: unknown[]) => unknown>>(key: Key<T>) => {
    return new Proxy(
      {},
      {
        get: (_, prop: string) => {
          const fullKey = joinKeys(getPlainKey(key), prop) as Key<[unknown[], unknown]>;
          return (...args: unknown[]) => invoke(fullKey, ...args);
        },
      }
    ) as unknown as T;
  };

  return {
    register,
    registerFromMap,
    invoke,
    createProxy,
  };
};
