import { IndexedDBProvider } from "@/common/lib/storage/indexeddb";
import { useCallback, useEffect, useState } from "react";

export interface DatabaseInfo {
  name: string;
  version: number;
  stores: string[];
}

export interface StoreInfo {
  name: string;
  keyPath: string;
  indexes: Array<{
    name: string;
    keyPath: string | string[];
    unique: boolean;
  }>;
}

export interface IndexedDBManagerState {
  databases: DatabaseInfo[];
  currentDatabase: DatabaseInfo | null;
  currentStore: StoreInfo | null;
  storeData: unknown[];
  isLoading: boolean;
  error: string | null;
}

export function useIndexedDBManager() {
  const [state, setState] = useState<IndexedDBManagerState>({
    databases: [],
    currentDatabase: null,
    currentStore: null,
    storeData: [],
    isLoading: false,
    error: null
  });

  const [currentProvider, setCurrentProvider] = useState<IndexedDBProvider<unknown> | null>(null);

  // 刷新数据库列表
  const refreshDatabases = useCallback(async () => {
    console.log('[useIndexedDBManager] refreshDatabases called');
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const dbNames = await IndexedDBProvider.listDatabases();
      console.log('[useIndexedDBManager] dbNames from listDatabases:', dbNames);
      const databases: DatabaseInfo[] = [];
      
      for (const dbName of dbNames) {
        try {
          console.log('[useIndexedDBManager] Getting info for database:', dbName);
          // 尝试打开数据库来获取信息
          const db = await new Promise<IDBDatabase>((resolve, reject) => {
            const request = indexedDB.open(dbName);
            
            request.onerror = () => {
              reject(new Error(`Failed to open database ${dbName}: ${request.error?.message}`));
            };
            
            request.onsuccess = () => {
              resolve(request.result);
            };
          });
          
          const dbInfo = {
            name: db.name,
            version: db.version,
            stores: Array.from(db.objectStoreNames)
          };
          console.log('[useIndexedDBManager] Database info:', dbInfo);
          databases.push(dbInfo);
          
          db.close();
        } catch (error) {
          console.warn(`[useIndexedDBManager] Failed to get info for database ${dbName}:`, error);
          // 如果无法获取信息，至少添加数据库名称
          databases.push({
            name: dbName,
            version: 1,
            stores: []
          });
        }
      }
      
      console.log('[useIndexedDBManager] Final databases array:', databases);
      setState(prev => ({ 
        ...prev, 
        databases, 
        isLoading: false 
      }));
    } catch (error) {
      console.error('[useIndexedDBManager] refreshDatabases error:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : '刷新数据库列表失败',
        isLoading: false 
      }));
    }
  }, []);

  // 打开数据库
  const openDatabase = useCallback(async (dbName: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const database = state.databases.find(db => db.name === dbName);
      if (!database) {
        throw new Error('数据库不存在');
      }

      // 创建提供者实例
      const provider = new IndexedDBProvider({
        dbName,
        storeName: database.stores[0] || 'default',
        version: database.version
      });

      setCurrentProvider(provider);
      setState(prev => ({ 
        ...prev, 
        currentDatabase: database,
        isLoading: false 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : '打开数据库失败',
        isLoading: false 
      }));
    }
  }, [state.databases]);

  // 关闭数据库
  const closeDatabase = useCallback(() => {
    setCurrentProvider(null);
    setState(prev => ({ 
      ...prev, 
      currentDatabase: null,
      currentStore: null,
      storeData: []
    }));
  }, []);

  // 删除数据库
  const deleteDatabase = useCallback(async (dbName: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await IndexedDBProvider.deleteDatabase(dbName);
      
      // 如果删除的是当前数据库，关闭它
      if (state.currentDatabase?.name === dbName) {
        closeDatabase();
      }
      
      // 刷新数据库列表
      await refreshDatabases();
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : '删除数据库失败',
        isLoading: false 
      }));
    }
  }, [state.currentDatabase, closeDatabase, refreshDatabases]);

  // 创建数据库
  const createDatabase = useCallback(async (dbName: string, stores: string[]) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // 创建数据库和存储
      for (const storeName of stores) {
        const storeProvider = new IndexedDBProvider({
          dbName,
          storeName,
          version: 1
        });
        
        // 添加各种类型的测试数据
        await storeProvider.create({ 
          id: 'test-object', 
          name: 'Test Object',
          number: 123,
          boolean: true,
          nullValue: null,
          array: [1, 2, 3, 'string', true],
          nestedObject: { a: 1, b: 'test' }
        });
        
        // 添加 TypedArray 测试数据
        const smallArray = new Uint8Array([1, 2, 3, 4, 5]);
        await storeProvider.create({ 
          id: 'test-typedarray-small', 
          name: 'Small TypedArray',
          data: smallArray
        });
        
        // 添加大型 TypedArray 测试数据（但不会太大）
        const largeArray = new Uint8Array(1000);
        for (let i = 0; i < largeArray.length; i++) {
          largeArray[i] = i % 256;
        }
        await storeProvider.create({ 
          id: 'test-typedarray-large', 
          name: 'Large TypedArray',
          data: largeArray
        });
        
        // 添加原始值测试数据
        await storeProvider.create('test-string');
        await storeProvider.create(123);
        await storeProvider.create(true);
        await storeProvider.create(null);
      }

      await refreshDatabases();
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : '创建数据库失败',
        isLoading: false 
      }));
    }
  }, [refreshDatabases]);

  console.log("[useIndexedDBManager] render", {
    currentProvider,
    state
  });
  // 获取存储数据
  const getStoreData = useCallback(async (storeName: string) => {
    if (!currentProvider || !state.currentDatabase) {
      setState(prev => ({ ...prev, isLoading: false, error: '未选择数据库或存储' }));
      return;
    }
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const storeProvider = new IndexedDBProvider({
        dbName: state.currentDatabase.name,
        storeName,
        version: state.currentDatabase.version
      });
      const data = await storeProvider.list();
      console.log("[useIndexedDBManager] getStoreData data", data);
      setState(prev => ({ 
        ...prev, 
        storeData: data,
        isLoading: false 
      }));
    } catch (error) {
      console.error("[useIndexedDBManager] getStoreData error", error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : '获取存储数据失败',
        isLoading: false 
      }));
    }
  }, [currentProvider, state.currentDatabase]);

  // 添加数据
  const addData = useCallback(async (data: unknown, storeName?: string) => {
    if (!currentProvider || !state.currentDatabase) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const targetStoreName = storeName || state.currentStore?.name || 'default';
      const storeProvider = new IndexedDBProvider({
        dbName: state.currentDatabase.name,
        storeName: targetStoreName,
        version: state.currentDatabase.version
      });

      await storeProvider.create(data);
      await getStoreData(targetStoreName); // 刷新数据
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : '添加数据失败',
        isLoading: false 
      }));
    }
  }, [currentProvider, state.currentDatabase, state.currentStore, getStoreData]);

  // 更新数据
  const updateData = useCallback(async (id: string, data: unknown, storeName?: string) => {
    if (!currentProvider || !state.currentDatabase) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const targetStoreName = storeName || state.currentStore?.name || 'default';
      const storeProvider = new IndexedDBProvider({
        dbName: state.currentDatabase.name,
        storeName: targetStoreName,
        version: state.currentDatabase.version
      });

      await storeProvider.update(id, data as Record<string, unknown>);
      await getStoreData(targetStoreName);
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : '更新数据失败',
        isLoading: false 
      }));
    }
  }, [currentProvider, state.currentDatabase, state.currentStore, getStoreData]);

  // 删除数据
  const deleteData = useCallback(async (id: string, storeName?: string) => {
    if (!currentProvider || !state.currentDatabase) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const targetStoreName = storeName || state.currentStore?.name || 'default';
      const storeProvider = new IndexedDBProvider({
        dbName: state.currentDatabase.name,
        storeName: targetStoreName,
        version: state.currentDatabase.version
      });

      await storeProvider.delete(id);
      await getStoreData(targetStoreName);
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : '删除数据失败',
        isLoading: false 
      }));
    }
  }, [currentProvider, state.currentDatabase, state.currentStore, getStoreData]);

  // 清空存储
  const clearStore = useCallback(async (storeName: string) => {
    if (!currentProvider || !state.currentDatabase) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const storeProvider = new IndexedDBProvider({
        dbName: state.currentDatabase.name,
        storeName,
        version: state.currentDatabase.version
      });

      await storeProvider.clear();
      await getStoreData(storeName);
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : '清空存储失败',
        isLoading: false 
      }));
    }
  }, [currentProvider, state.currentDatabase, getStoreData]);

  // 初始化时刷新数据库列表
  useEffect(() => {
    refreshDatabases();
  }, [refreshDatabases]);

  return {
    ...state,
    refreshDatabases,
    openDatabase,
    closeDatabase,
    deleteDatabase,
    createDatabase,
    getStoreData,
    addData,
    updateData,
    deleteData,
    clearStore
  };
} 