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
  storeData: any[];
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

  const [currentProvider, setCurrentProvider] = useState<IndexedDBProvider<any> | null>(null);

  // 刷新数据库列表
  const refreshDatabases = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const dbNames = await IndexedDBProvider.listDatabases();
      const databases: DatabaseInfo[] = [];
      
      for (const dbName of dbNames) {
        try {
          const provider = new IndexedDBProvider({
            dbName,
            storeName: 'temp', // 临时存储名，用于获取数据库信息
            version: 1
          });
          
          const info = await provider.getDatabaseInfo();
          databases.push({
            name: info.name,
            version: info.version,
            stores: info.storeNames
          });
        } catch (error) {
          console.warn(`Failed to get info for database ${dbName}:`, error);
        }
      }
      
      setState(prev => ({ 
        ...prev, 
        databases, 
        isLoading: false 
      }));
    } catch (error) {
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
      const provider = new IndexedDBProvider({
        dbName,
        storeName: stores[0] || 'default',
        version: 1
      });

      // 创建数据库和存储
      for (const storeName of stores) {
        const storeProvider = new IndexedDBProvider({
          dbName,
          storeName,
          version: 1
        });
        
        // 添加一些测试数据
        await storeProvider.create({ id: 'test', name: 'Test Item' });
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

  // 获取存储数据
  const getStoreData = useCallback(async (storeName: string) => {
    if (!currentProvider || !state.currentDatabase) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const storeProvider = new IndexedDBProvider({
        dbName: state.currentDatabase.name,
        storeName,
        version: state.currentDatabase.version
      });

      const data = await storeProvider.list();
      
      setState(prev => ({ 
        ...prev, 
        storeData: data,
        isLoading: false 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : '获取存储数据失败',
        isLoading: false 
      }));
    }
  }, [currentProvider, state.currentDatabase]);

  // 添加数据
  const addData = useCallback(async (data: any) => {
    if (!currentProvider || !state.currentDatabase) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const storeProvider = new IndexedDBProvider({
        dbName: state.currentDatabase.name,
        storeName: 'default', // 这里需要根据实际选择的存储来设置
        version: state.currentDatabase.version
      });

      await storeProvider.create(data);
      await getStoreData('default'); // 刷新数据
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : '添加数据失败',
        isLoading: false 
      }));
    }
  }, [currentProvider, state.currentDatabase, getStoreData]);

  // 更新数据
  const updateData = useCallback(async (id: string, data: any) => {
    if (!currentProvider || !state.currentDatabase) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const storeProvider = new IndexedDBProvider({
        dbName: state.currentDatabase.name,
        storeName: 'default',
        version: state.currentDatabase.version
      });

      await storeProvider.update(id, data);
      await getStoreData('default');
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : '更新数据失败',
        isLoading: false 
      }));
    }
  }, [currentProvider, state.currentDatabase, getStoreData]);

  // 删除数据
  const deleteData = useCallback(async (id: string) => {
    if (!currentProvider || !state.currentDatabase) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const storeProvider = new IndexedDBProvider({
        dbName: state.currentDatabase.name,
        storeName: 'default',
        version: state.currentDatabase.version
      });

      await storeProvider.delete(id);
      await getStoreData('default');
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : '删除数据失败',
        isLoading: false 
      }));
    }
  }, [currentProvider, state.currentDatabase, getStoreData]);

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