// export type INestedBean<T> = {
//   get: () => T;
//   set: (value: T) => void;
// };

// export type INestedBeanOptions<T extends Record<string, any>, TExtra> = {
//   tree: T;
//   enhancer?: (bean: INestedBean<T>) => TExtra;
// };

// const exampleBeanOptions = {
//   tree: {
//     tabBarWidth: {
//       tree: 10000,
//       enhancer: (bean) => {
//         return {
//           getTabBarWidth: bean.get,
//           setTabBarWidth: bean.set,
//         };
//       },
//     },
//     pagination: {
//       tree: {
//         page: 1,
//         pageSize: {
//           tree: 10,
//           enhancer: (bean) => {
//             return {
//               getPageSize: bean.get,
//               setPageSize: bean.set,
//             };
//           },
//         },
//       },
//       enhancer: (bean) => {
//         return {
//           getPage: bean.get,
//           setPage: bean.set,
//           getPageSize: bean.get,
//           setPageSize: bean.set,
//         };
//       },
//     },
//     activities: {
//       tree: [],
//       enhancer: (bean) => {
//         return {
//           getActivities: bean.get,
//           setActivities: bean.set,
//         };
//       },
//     },
//   },
//   enhancer: (bean) => {
//     bean.namespaces.activities.set([]);
//     return {
//       getState: bean.get,
//     };
//   },
// };

// const createNestedBean = (_options: unknown) => {
//     // not implemented
//     return 0 as unknown;
// };

// const bean = createNestedBean(exampleBeanOptions);
