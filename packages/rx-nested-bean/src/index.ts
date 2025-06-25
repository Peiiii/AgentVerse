 
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  DependencyList,
  EffectCallback,
  MutableRefObject,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { BehaviorSubject, Observable } from "rxjs";
export function useEffectOnce(effect: () => void | (() => void)): void {
  return useEffect(effect, []);
}

export function useUpdateEffect(
  effect: EffectCallback,
  deps: DependencyList = []
): void {
  const firstRun: MutableRefObject<boolean> = React.useRef(true);

  React.useEffect(() => {
    if (firstRun.current === true) {
      firstRun.current = false;
      return () => {};
    }
    return effect();
  }, deps);
}

type BeanControlNode = {
  $: BehaviorSubject<any>;
  set?: (value: any) => void;
  get?: () => any;
  use?: () => any;
  children: Record<string, BeanControlNode>;
};

type DataTree<T = Record<string, any>> = {
  data: T;
};

const createTaskManager = () => {
  let frozen = false;
  const waitingList: (() => void)[] = [];
  const freeze = () => {
    frozen = true;
  };
  const submit = (task: () => void) => {
    if (frozen) {
      waitingList.push(task);
    } else {
      task();
    }
  };

  const unfreeze = () => {
    //  truely unfreeze will be executed after all the tasks in the waitingList are executed.
    while (waitingList.length > 0) {
      const task = waitingList.shift()!;
      task();
    }
    frozen = false;
  };
  return {
    isFrozen: () => frozen,
    freeze,
    unfreeze,
    submit,
  };
};

const taskManager = createTaskManager();

export class FreezableBehaviorSubject<T> extends BehaviorSubject<T> {
  next(value: T): void {
    taskManager.submit(() => super.next(value));
  }
}

const getNodeData = (dataTree: DataTree, path?: string) => {
  if (!path) return dataTree.data;
  else {
    const route = path.split("::");
    let current = dataTree.data;
    for (let i = 0; i < route.length; i += 1) {
      if (!current[route[i]]) return current[route[i]];
      current = current[route[i]];
    }
    return current;
  }
};

const shallowCopy = (value: any) => {
  if (typeof value === "object" && value !== null) {
    if (Array.isArray(value)) {
      // 如果是数组，执行数组的浅拷贝
      return [...value];
    } else {
      // 如果是对象，执行对象的浅拷贝
      return { ...value };
    }
  }
  // 其他类型，直接返回原值
  return value;
};

const setNodeData = (
  dataTree: DataTree,
  controlTree: BeanControlNode,
  path: string | undefined,
  value: any
) => {
  const prevValue = getNodeData(dataTree, path);
  if (value === prevValue) return; // no change
  // notify children where the value changed caused by setting the value
  // Todo: do a better diff, now there is no diff, which is bad for the performance
  const notify = (
    subscriberNode: BeanControlNode,
    data: any,
    prevData: any
  ) => {
    if (data !== prevData) {
      subscriberNode.$.next(data);
    }
    Object.entries(subscriberNode.children).forEach(([key, child]) => {
      notify(child, data?.[key], prevData?.[key]);
    });
  };
  taskManager.freeze();
  if (!path) {
     
    dataTree.data = value;
    notify(controlTree, value, prevValue);
  } else {
    const route = path.split("::");
    let parentData = dataTree.data;
    let parentSubscriberNode = controlTree; // initial parentSubscriberNode

    const changed: [BeanControlNode, any, string | undefined][] = [
      [parentSubscriberNode, parentData, undefined],
    ]; // the nodes that are effected：[subscriberNode, data, keyInParentData]
    for (let i = 0; i < route.length - 1; i += 1) {
      if (parentData[route[i]] === undefined) {
        parentData[route[i]] = {};
      }
      parentData = parentData[route[i]];
      parentSubscriberNode = parentSubscriberNode?.children[route[i]];
      changed.push([parentSubscriberNode, parentData, route[i]]);
    }

    // // make the set take effect by setting at the cooresponding key in the parentData
    // @deprecated should not change the original data
    // parentData[route[route.length - 1]] = value;
    // parentData[route[route.length - 1]] = value;
    // get the subscriber node that is cooresponding to the path
    const targetSubscriberNode =
      parentSubscriberNode?.children[route[route.length - 1]];
    changed.push([targetSubscriberNode, value, route[route.length - 1]]); // the last one is the target, which is also changed

    const tasks: (() => void)[] = [];
    // from the lower level to the upper level, notify the subscribers
    const changedListWithNewData: [BeanControlNode, any][] = [];
    let changedChildKey: any;
    let changedChildValue: any;
    for (let i = changed.length - 1; i >= 0; i -= 1) {
      const [subscriberNode, newData, key] = changed[i];
      if (i === changed.length - 1) {
        changedListWithNewData.unshift([subscriberNode, newData]);
        changedChildKey = key;
        changedChildValue = newData;
      } else {
        const realNewData = shallowCopy(newData);
        realNewData[changedChildKey!] = changedChildValue;
        changedListWithNewData.unshift([subscriberNode, realNewData]);
        changedChildKey = key;
        changedChildValue = realNewData;
      }
    }
     
    dataTree.data = changedChildValue;

    // from the upper level to the lower level, notify the subscribers
    for (let i = 0; i < changedListWithNewData.length; i += 1) {
      const [subscriberNode, newData] = changedListWithNewData[i];

      if (subscriberNode) {
        // notify the subscriber from the upper level to the lower level
        tasks.push(() => subscriberNode.$.next(newData));
      } else break;
    }

    tasks.reverse().forEach((task) => task());

    if (targetSubscriberNode)
      Object.entries(targetSubscriberNode.children).forEach(([key, child]) => {
        notify(child, value?.[key], prevValue?.[key]);
      });
  }
  taskManager.unfreeze();
};

const getControlNode = (
  dataTree: DataTree,
  controlTree: BeanControlNode,
  path?: string
) => {
  if (!path) {
    return controlTree;
  } else {
    const route = path.split("::");
    let currentData = dataTree.data;
    let currentNode = controlTree;
    for (let i = 0; i < route.length; i += 1) {
      // loop for route.length times to make parentData be the target
      if (i < route.length - 1 && currentData[route[i]] === undefined) {
        currentData[route[i]] = {};
      }
      // no subsriber yet
      if (currentNode.children[route[i]] === undefined)
        currentNode.children[route[i]] = {
          $: new FreezableBehaviorSubject(currentData[route[i]]),
          children: {},
        };
      currentData = currentData[route[i]];
      currentNode = currentNode.children[route[i]];
    }
    return currentNode;
  }
};

const useNodeData = (
  dataTree: DataTree,
  controlTree: BeanControlNode,
  path?: string
) => {
  const { $ } = getControlNode(dataTree, controlTree, path);

  // const subscribe = useCallback(
  //   (next: any) => {
  //     const sub = $.subscribe(next);
  //     return () => {
  //       sub.unsubscribe();
  //     };
  //   },
  //   [$]
  // );
  // // useSyncExternalStore not supported by react 16
  //   const state = useSyncExternalStore(subscribe, $.getValue.bind($));
  const [state, setState] = useState(() => $.getValue());
  useEffect(() => {
    const sub = $.subscribe((value) => {
      setState(value);
    });
    return () => sub.unsubscribe();
  }, [$]);

  // useEffect(() => {
  //   console.log("$ changed");
  // }, [$]);

  // useEffect(() => {
  //   console.log("dataTree changed:", dataTree);
  // }, [dataTree]);

  // useEffect(() => {
  //   console.log("controlTree changed:", controlTree);
  // }, [controlTree]);

  // useEffect(() => {
  //   console.log("path changed:", path);
  // }, [path]);

  // useEffect(() => {
  //   // skip 会有问题，如果useEffect之前，$在其它地方被修改了，那么那次修改就会被skip掉
  //   // 但是如果不skip我记得是有问题的？至少有一个问题是会导致二次运行，某些情况下可能引发无线循环？
  //   // 假设path是一个顶层的路径，而顶层的状态每次获取都是不一样的，这样setState会触发render
  //   // const sub = $.pipe(skip(1)).subscribe((value) => {
  //   //   setState(value);
  //   // });
  //   const sub = $.pipe(skip(1)).subscribe((value) => {
  //     setState(value);
  //   });

  //   if (path?.includes("currentFilePath")) {
  //     console.log("use:", path);

  //     $.subscribe((value) => {
  //       console.log(`no skip: ${path}`, value);
  //     });
  //     $.pipe(skip(1)).subscribe((value) => {
  //       console.log(`skip: ${path}`, value);
  //     });
  //   }

  //   return () => sub.unsubscribe();
  // }, [$]);
  return state;
};

export type IBeanOpName = "get" | "set" | "use" | "$";

type StringKey<T> = Extract<keyof T, string>;
export interface INestedBean<T> {
  get: () => T;
  set: (value: T | ((prevValue: T) => T)) => void;
  use: () => T;
  $: BehaviorSubject<T>;
  namespaces: {
    [K in StringKey<T>]: INestedBean<T[K]>;
  };
  $$isBean: true;
}

type AnyFunc = (...args: any[]) => any;

export type IWrappedNestedBean<T> = INestedBean<T> & {
  //   $on: ReturnType<typeof createEventBus>["on"];
  //   $emit: ReturnType<typeof createEventBus>["emit"];
  $render: RenderingTask;
  $cleanup: CleanupTask;
  $withLatestState: <T2 extends AnyFunc>(
    fn: (state: ReturnType<INestedBean<T>["get"]>) => T2
  ) => T2;
  $defineMethodsGetter: <T2 extends Record<string, AnyFunc>>(
    fn: (state: ReturnType<INestedBean<T>["get"]>) => T2
  ) => () => T2;
  $defineMethods: <T2 extends Record<string, AnyFunc>>(
    fn: (state: ReturnType<INestedBean<T>["get"]>) => T2
  ) => T2;
};

const createNestedBeanInner = <T extends Record<string, any>>(
  dataTree: DataTree<T>,
  initialControlTree?: BeanControlNode,
  scope?: string
): INestedBean<T> => {
  const controlTree = initialControlTree || {
    $: new FreezableBehaviorSubject(dataTree.data),
    children: {},
  };
  const normalizeKey = (key: string) => {
    return scope ? `${scope}::${key}` : key;
  };
  return new Proxy({ $$isBean: true } as INestedBean<T>, {
    ownKeys(target) {
      return Reflect.ownKeys(target).concat([
        "use",
        "get",
        "set",
        "$",
        "namespaces",
      ]);
    },
     
    get(target: any, actionAndProp) {
      if (actionAndProp in target) {
        return target[actionAndProp];
      }
      if (typeof actionAndProp === "string") {
        if (["$", "get", "set", "use"].includes(actionAndProp)) {
          const controlNode = getControlNode(
            dataTree as any,
            controlTree,
            scope
          );
          if (actionAndProp === "$") {
            return controlNode.$;
          } else if (actionAndProp === "get") {
            if (!controlNode.get)
              controlNode.get = () => getNodeData(dataTree as any, scope);
            return controlNode.get!;
          } else if (actionAndProp === "set") {
            if (!controlNode.set)
              controlNode.set = (value: any) =>
                setNodeData(
                  dataTree as any,
                  controlTree,
                  scope,
                  typeof value === "function"
                    ? value(getNodeData(dataTree as any, scope))
                    : value
                );
            return controlNode.set!;
          } else if (actionAndProp === "use") {
            if (!controlNode.use)
              controlNode.use = () =>
                // eslint-disable-next-line react-hooks/rules-of-hooks
                useNodeData(dataTree as any, controlTree, scope);
            return controlNode.use!;
          }
        } else if (actionAndProp === "namespaces") {
          return new Proxy(
            {},
            {
              get(_: any, prop: string) {
                return createNestedBeanInner(
                  dataTree,
                  controlTree,
                  normalizeKey(prop)
                );
              },
            }
          );
        }
      } else {
        return target[actionAndProp];
      }
    },
  });
};

export const createNestedBean = <T extends Record<string, any>>(
  data: T,
  initialSubscriberTree?: BeanControlNode,
  scope?: string
): INestedBean<T> => {
  return createNestedBeanInner({ data }, initialSubscriberTree, scope);
};

type RenderingTask = () => void;
type CleanupTask = () => void;
const execution = {
  renderingTasks: [] as RenderingTask[], // tasks that are executed in the rendering phase
  cleanupTasks: [] as CleanupTask[], // tasks that are executed in the cleanup phase
};
export const onRender = (fn: RenderingTask) => {
  execution.renderingTasks.push(fn);
};
export const onEffect = (fn: RenderingTask) => {
  return onRender(() => {
    useEffect(fn, []);
  });
};
export const onCleanup = (fn: CleanupTask | CleanupTask[]) => {
  if (Array.isArray(fn)) execution.cleanupTasks.push(...fn);
  else execution.cleanupTasks.push(fn);
};
export const executeInit = (
  init: ((bean: any) => any) | undefined,
  bean: any
) => {
  execution.renderingTasks = [];
  execution.cleanupTasks = [];
  const result = init ? Object.assign(bean, init(bean)) : bean;
  const { renderingTasks } = execution;
  const { cleanupTasks } = execution;
  execution.renderingTasks = [];
  execution.cleanupTasks = [];
  return [
    result,
    () => renderingTasks.forEach((render) => render()),
    () => cleanupTasks.forEach((cleanup) => cleanup()),
  ] as const;
};

// export const define = <O extends Record<string, any>, TInitArgs extends any[]>(
//   init: (...args: TInitArgs) => O
// ) => {
//   type TFinalBean = O;

//   const create = (...args: TInitArgs) => {
//     return init(...args);
//   };

//   const useInstance = (...args: TInitArgs) => {
//     return useMemo(() => create(...args), []) as TFinalBean;
//   };

//   const Context = createContext<TFinalBean | undefined>(undefined);
//   const { Provider } = Context;
//   const useExistingInstance = () =>
//     useContext(Context) as TFinalBean | undefined;

//   return {
//     create,
//     useInstance,
//     Provider,
//     useExistingInstance,
//   };
// };

interface IWeakRefImpl<T> {
  deref(): T | undefined;
}

interface IWeakRefConstructor {
  new <T>(target: T): IWeakRefImpl<T>;
}

export const defineBean = <
  T extends Record<string, any>,
  O extends Record<string, any> | void,
  TInitArgs extends any[]
>(
  getData: (...args: TInitArgs) => T,
  init?: (bean: IWrappedNestedBean<T>) => O
) => {
  type TFinalBean = typeof init extends undefined
    ? IWrappedNestedBean<T>
    : IWrappedNestedBean<T> & (O extends void ? object : O);
  
  // 使用条件类型存储实例引用
  const instanceStorage = (() => {
    const globalWeakRef = (globalThis as any).WeakRef as IWeakRefConstructor | undefined;
    
    if (globalWeakRef) {
      const weakRefs: IWeakRefImpl<TFinalBean>[] = [];
      return {
        add: (instance: TFinalBean) => weakRefs.push(new globalWeakRef(instance)),
        find: (predicate: (bean: TFinalBean) => boolean) => {
          const ref = weakRefs.find(ref => {
            const instance = ref.deref();
            return instance ? predicate(instance) : false;
          });
          return ref?.deref();
        }
      };
    } else {
      const instances: TFinalBean[] = [];
      return {
        add: (instance: TFinalBean) => instances.push(instance),
        find: (predicate: (bean: TFinalBean) => boolean) => instances.find(predicate)
      };
    }
  })();

  const create = (...args: TInitArgs): TFinalBean => {
    const renderingTasks: RenderingTask[] = [];
    const cleanupTasks: CleanupTask[] = [];
    
    const $cleanup = () => {
      [...cleanupTasks].forEach((cleanup) => {
        cleanup();
        cleanupTasks.splice(cleanupTasks.indexOf(cleanup), 1);
      });
    };
    const $render = () => {
      [...renderingTasks].forEach((render) => {
        render();
      });
    };

    const rawBean = createNestedBean(getData(...args));
    const $withLatestState = <T2 extends (...args: any[]) => any>(
      fn: (state: ReturnType<INestedBean<T>["get"]>) => T2
    ) => {
      return (...args: Parameters<T2>) => {
        return fn(rawBean.get())(...args);
      };
    };

    const $defineMethodsGetter = <T2 extends Record<string, AnyFunc>>(
      fn: (state: ReturnType<INestedBean<T>["get"]>) => T2
    ) => {
      return () => {
        return fn(rawBean.get());
      };
    };

    const $defineMethods = <T2 extends Record<string, AnyFunc>>(
      fn: (state: ReturnType<INestedBean<T>["get"]>) => T2
    ) => {
      return new Proxy(
        {},
        {
          get(_: any, p: string) {
            return (...args: Parameters<T2[typeof p]>) => {
              return fn(rawBean.get())[p](...args);
            };
          },
        }
      );
    };

    const bean = Object.assign(rawBean, {
      $cleanup,
      $render,
      $withLatestState,
      $defineMethodsGetter,
      $defineMethods,
    });
    const [instance, renderingTask, cleanupTask] = executeInit(init, bean);
    renderingTasks.push(renderingTask);
    cleanupTasks.push(cleanupTask);
    
    instanceStorage.add(instance);
    
    return instance;
  };
  const useInstance = (...args: TInitArgs): TFinalBean => {
    const instance = useMemo(() => create(...args), []) as any;
    instance.$render();
    return instance;
  };
  const Context = createContext<TFinalBean | undefined>(undefined);
  const { Provider } = Context;
  const useExistingInstance = () =>
    useContext(Context) as TFinalBean | undefined;
  const find = (predicate: (bean: TFinalBean) => boolean) => {
    return instanceStorage.find(predicate);
  };
  return {
    create,
    useInstance,
    useExistingInstance,
    Provider,
    find,
  };
};

export function useStateFromObservable<T>(
  subject: Observable<T>
): T | undefined;
export function useStateFromObservable<T>(
  subject: Observable<T>,
  defaultValue: T
): T;
export function useStateFromObservable<T>(
  subject: Observable<T>,
  defaultValue?: T
) {
  const [state, setState] = useState(defaultValue);
  useEffect(() => {
    const sub = subject.subscribe((value) => setState(value));
    return () => sub.unsubscribe();
  }, []);
  return state;
}

export const useBehaviorSubjectFromState = <T>(state: T) => {
  const subject = useMemo(() => new FreezableBehaviorSubject(state), []);
  useUpdateEffect(() => {
    subject.next(state);
  }, [state]);
  return subject;
};

// export const useStateFromBehaviorSubject = <T, T2>(
//   subject: BehaviorSubject<T>,
//   mapper?: Parameters<typeof map<T, T2>>[0]
// ) => {
//   const mapperRef = useRef(mapper);
//   const [state, setState] = useState(() => {
//     let value;
//     (subject as any)
//       .pipe(map(mapperRef.current || ((x) => x)))
//       .subscribe((v: T2) => (value = v));
//     return value as typeof mapper extends undefined ? T : T2;
//   });
//   useEffect(() => {
//     const sub = (subject as any)
//       .pipe(map(mapperRef.current || ((x) => x)))
//       .subscribe((value: any) => setState(value as any));
//     return () => sub.unsubscribe();
//   }, []);
//   return state;
// };

export const useSyncStateToBehaviorSubject = <T>(
  state: T,
  subject: BehaviorSubject<T>
) => {
  useEffectOnce(() => {
    const current = subject.getValue();
    if (current !== state) subject.next(state);
  });
  useUpdateEffect(() => {
    subject.next(state);
  }, [state]);
};

type PathImpl<T, Key extends keyof T> = Key extends string
  ? T[Key] extends Record<string, any>
    ? Key | `${Key}.${PathImpl<T[Key], Exclude<keyof T[Key], keyof any[]>>}`
    : Key
  : never;

export type BeanPath<T> = PathImpl<T, keyof T> | keyof T;

type PathValue<T, P extends BeanPath<T>> = P extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T
    ? Rest extends BeanPath<T[Key]>
      ? PathValue<T[Key], Rest>
      : never
    : never
  : P extends keyof T
  ? T[P]
  : never;

export const createProxyBean = <
  T extends Record<string, any>,
  P extends BeanPath<T>
>(
  bean: INestedBean<T>,
  path: P
): INestedBean<PathValue<T, P>> => {
  const pathParts = (path as string).split(".");
  return pathParts.reduce((currentBean, part) => {
    return currentBean.namespaces[part] as any;
  }, bean as any) as INestedBean<PathValue<T, P>>;
};

export const useProxyBeanState = <
  T extends Record<string, any>,
  P extends BeanPath<T>
>(
  bean: INestedBean<T>,
  path: P
) => {
  const [b] = useState(() => createProxyBean(bean, path));
  const data = b.use();
  return {
    data,
    set: b.set,
    get: b.get,
  };
};

export const useBeanState = <T>(bean: INestedBean<T>) => {
  const [b] = useState(() => bean);
  const data = b.use();
  return {
    data,
    set: b.set,
    get: b.get,
  };
};

// const bean = createNestedBean({
//   messages: [] as string[],
//   pagination: {
//     page: 1,
//     pageSize: 10,
//   },
// });

// const messagesBean = createProxyBean(bean, 'messages');

// const pageBean = createProxyBean(bean, 'pagination.page');
// pageBean.set(2);  // ✅ 类型正确
// pageBean.set('2'); // ❌ 类型错误，期望 number 类型

// const messagesBean = createProxyBean(bean, 'messages');
// messagesBean.set(['new message']); // ✅ 类型正确
// messagesBean.set([123]); // ❌
/**
 * 需要实现这样的功能，支持嵌套的状态
 *
 * const bean = createNestedBean({
 *   messages: [],
 *   isPaused: false,
 *   lastParticipantIndex: -1,
 *   pagination: {
 *     page: 1,
 *     pageSize: 10,
 *   },
 * });
 *
 * const proxyBean = createProxyBean(bean, 'pagination.page');
 *
 * proxyBean.set(2);
 *
 * console.log(bean.namespaces.pagination.namespaces.page.get()); // 2
 */
