import { Capability } from "@/common/lib/capabilities";

// 类型定义
interface DBIndex {
  name: string;
  keyPath: string;
  unique: boolean;
}

interface DBStore {
  name: string;
  keyPath: string;
  indexes?: DBIndex[];
}

interface DBInitParams {
  name: string;
  version: number;
  stores: DBStore[];
}

interface DBStoreInfo {
  keyPath: string;
  indexes: DBIndex[];
}

interface DBStoresResponse extends DBResponse {
  data?: {
    stores: string[];
    indexes: {
      [storeName: string]: DBStoreInfo;
    };
  };
}

interface DBResponse {
  success: boolean;
  error?: string;
  data?: unknown;
}

const defaultSchema = {
  type: "object",
  additionalProperties: true,
};

// 数据库管理能力
export const dbCapabilities: Capability[] = [
  {
    name: "db_list_stores",
    schema: defaultSchema,
    description: `<capability>
  <name>列出数据库中的所有存储</name>
  <params>
    <schema>
      dbName: string    // 数据库名称
    </schema>
  </params>
  <returns>
    <type>查询结果</type>
    <schema>
      success: boolean  // 是否成功
      data?: {         // 存储信息
        stores: string[],     // 存储名称列表
        indexes?: {          // 每个存储的索引信息
          [storeName: string]: {
            keyPath: string,  // 主键
            indexes: Array<{  // 索引列表
              name: string,
              keyPath: string,
              unique: boolean
            }>
          }
        }
      }
      error?: string   // 错误信息
    </schema>
  </returns>
</capability>`,
    execute: async (params: unknown): Promise<DBStoresResponse> => {
      try {
        const { dbName } = params as { dbName: string };
        return new Promise((resolve, reject) => {
          const request = indexedDB.open(dbName);
          
          request.onerror = () => {
            reject({ success: false, error: "打开数据库失败" });
          };
          
          request.onsuccess = () => {
            const db = request.result;
            const storeNames = Array.from(db.objectStoreNames);
            const storeInfo: { [key: string]: DBStoreInfo } = {};
            
            // 收集每个store的信息
            storeNames.forEach(storeName => {
              const tx = db.transaction(storeName, "readonly");
              const store = tx.objectStore(storeName);
              
              storeInfo[storeName] = {
                keyPath: store.keyPath as string,
                indexes: Array.from(store.indexNames).map(indexName => {
                  const index = store.index(indexName);
                  return {
                    name: indexName,
                    keyPath: index.keyPath as string,
                    unique: index.unique
                  };
                })
              };
            });
            
            db.close();
            resolve({
              success: true,
              data: {
                stores: storeNames,
                indexes: storeInfo
              }
            });
          };
        });
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "未知错误"
        };
      }
    }
  },

  {
    name: "db_list_databases",
    schema: defaultSchema,
    description: `<capability>
  <name>列出所有数据库</name>
  <params>无</params>
  <returns>
    <type>查询结果</type>
    <schema>
      success: boolean  // 是否成功
      data?: string[]  // 数据库名称列表
      error?: string   // 错误信息
    </schema>
  </returns>
</capability>`,
    execute: async (): Promise<DBResponse> => {
      try {
        return new Promise((resolve) => {
          // 在新版浏览器中使用 indexedDB.databases()
          if ('databases' in indexedDB) {
            indexedDB.databases().then(databases => {
              resolve({
                success: true,
                data: databases.map(db => db.name as string)
              });
            }).catch(() => {
              // 如果 databases() 方法失败，回退到存储数据库列表的方案
              const dbList = localStorage.getItem('indexedDB_database_list');
              resolve({
                success: true,
                data: dbList ? JSON.parse(dbList) : []
              });
            });
          } else {
            // 在不支持 databases() 的浏览器中，使用存储的数据库列表
            const dbList = localStorage.getItem('indexedDB_database_list');
            resolve({
              success: true,
              data: dbList ? JSON.parse(dbList) : []
            });
          }
        });
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "未知错误"
        };
      }
    }
  },

  {
    name: "db_init",
    schema: defaultSchema,
    description: `<capability>
  <name>初始化数据库和存储</name>
  <params>
    <schema>
      name: string      // 数据库名称
      version: number   // 数据库版本
      stores: Array<{   // 存储配置
        name: string    // 存储名称
        keyPath: string // 主键
        indexes?: Array<{
          name: string,
          keyPath: string,
          unique: boolean
        }>
      }>
    </schema>
  </params>
  <returns>
    <type>操作结果</type>
    <schema>
      success: boolean  // 是否成功
      error?: string   // 错误信息
    </schema>
  </returns>
</capability>`,
    execute: async (params: unknown): Promise<DBResponse> => {
      try {
        const { name, version, stores } = params as DBInitParams;
        return new Promise((resolve, reject) => {
          const request = indexedDB.open(name, version);
          
          request.onerror = () => {
            reject({ success: false, error: "数据库初始化失败" });
          };
          
          request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            stores.forEach((store: DBStore) => {
              // 如果存储已存在则删除
              if (db.objectStoreNames.contains(store.name)) {
                db.deleteObjectStore(store.name);
              }
              // 创建新的存储
              const objectStore = db.createObjectStore(store.name, { keyPath: store.keyPath });
              // 创建索引
              if (store.indexes) {
                store.indexes.forEach((index: DBIndex) => {
                  objectStore.createIndex(index.name, index.keyPath, { unique: index.unique });
                });
              }
            });
          };
          
          request.onsuccess = () => {
            const db = request.result;
            db.close();
            
            // 将数据库名称添加到列表中
            try {
              const dbList = localStorage.getItem('indexedDB_database_list');
              const databases = dbList ? JSON.parse(dbList) : [];
              if (!databases.includes(name)) {
                databases.push(name);
                localStorage.setItem('indexedDB_database_list', JSON.stringify(databases));
              }
            } catch (e) {
              console.warn('Failed to update database list:', e);
            }
            
            resolve({ success: true });
          };
        });
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "未知错误"
        };
      }
    }
  },
  
  {
    name: "db_add",
    schema: defaultSchema,
    description: `<capability>
  <name>添加数据</name>
  <params>
    <schema>
      dbName: string    // 数据库名称
      storeName: string // 存储名称
      data: unknown     // 要添加的数据(必须包含store定义的主键字段)
    </schema>
  </params>
  <returns>
    <type>操作结果</type>
    <schema>
      success: boolean  // 是否成功
      error?: string   // 错误信息
    </schema>
  </returns>
</capability>`,
    execute: async (params: unknown): Promise<DBResponse> => {
      try {
        const { dbName, storeName, data } = params as { dbName: string; storeName: string; data: unknown };
        return new Promise((resolve, reject) => {
          const request = indexedDB.open(dbName);
          
          request.onerror = () => {
            reject({ success: false, error: "打开数据库失败" });
          };
          
          request.onsuccess = () => {
            const db = request.result;
            const tx = db.transaction(storeName, "readwrite");
            const store = tx.objectStore(storeName);
            
            // 验证数据中是否包含主键
            const keyPath = store.keyPath as string;
            if (!keyPath) {
              reject({ success: false, error: "存储没有定义主键" });
              return;
            }

            // 检查数据中是否包含主键值
            const record = data as Record<string, unknown>;
            if (!(keyPath in record) || record[keyPath] === undefined || record[keyPath] === null) {
              reject({ 
                success: false, 
                error: `数据缺少必需的主键字段: ${keyPath}` 
              });
              return;
            }
            
            const addRequest = store.add(data);
            
            addRequest.onsuccess = () => {
              resolve({ success: true });
            };
            
            addRequest.onerror = (event) => {
              const error = event.target as IDBRequest;
              reject({ 
                success: false, 
                error: error.error?.message || "添加数据失败" 
              });
            };
            
            tx.oncomplete = () => {
              db.close();
            };
          };
        });
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "未知错误"
        };
      }
    }
  },
  
  {
    name: "db_get",
    schema: defaultSchema,
    description: `<capability>
  <name>获取数据</name>
  <params>
    <schema>
      dbName: string    // 数据库名称
      storeName: string // 存储名称
      key: string | number // 主键值
    </schema>
  </params>
  <returns>
    <type>查询结果</type>
    <schema>
      success: boolean  // 是否成功
      data?: unknown   // 查询到的数据
      error?: string   // 错误信息
    </schema>
  </returns>
</capability>`,
    execute: async (params: unknown): Promise<DBResponse> => {
      try {
        const { dbName, storeName, key } = params as { dbName: string; storeName: string; key: string | number };
        return new Promise((resolve, reject) => {
          const request = indexedDB.open(dbName);
          
          request.onerror = () => {
            reject({ success: false, error: "打开数据库失败" });
          };
          
          request.onsuccess = () => {
            const db = request.result;
            const tx = db.transaction(storeName, "readonly");
            const store = tx.objectStore(storeName);
            
            const getRequest = store.get(key);
            
            getRequest.onsuccess = () => {
              resolve({ 
                success: true, 
                data: getRequest.result 
              });
            };
            
            getRequest.onerror = () => {
              reject({ success: false, error: "获取数据失败" });
            };
            
            tx.oncomplete = () => {
              db.close();
            };
          };
        });
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "未知错误"
        };
      }
    }
  },
  
  {
    name: "db_update",
    schema: defaultSchema,
    description: `<capability>
  <name>更新数据</name>
  <params>
    <schema>
      dbName: string    // 数据库名称
      storeName: string // 存储名称
      data: unknown     // 要更新的数据(必须包含主键)
    </schema>
  </params>
  <returns>
    <type>操作结果</type>
    <schema>
      success: boolean  // 是否成功
      error?: string   // 错误信息
    </schema>
  </returns>
</capability>`,
    execute: async (params: unknown): Promise<DBResponse> => {
      try {
        const { dbName, storeName, data } = params as { dbName: string; storeName: string; data: unknown };
        return new Promise((resolve, reject) => {
          const request = indexedDB.open(dbName);
          
          request.onerror = () => {
            reject({ success: false, error: "打开数据库失败" });
          };
          
          request.onsuccess = () => {
            const db = request.result;
            const tx = db.transaction(storeName, "readwrite");
            const store = tx.objectStore(storeName);
            
            const putRequest = store.put(data);
            
            putRequest.onsuccess = () => {
              resolve({ success: true });
            };
            
            putRequest.onerror = () => {
              reject({ success: false, error: "更新数据失败" });
            };
            
            tx.oncomplete = () => {
              db.close();
            };
          };
        });
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "未知错误"
        };
      }
    }
  },
  
  {
    name: "db_delete",
    schema: defaultSchema,
    description: `<capability>
  <name>删除数据</name>
  <params>
    <schema>
      dbName: string    // 数据库名称
      storeName: string // 存储名称
      key: string | number // 要删除的数据主键
    </schema>
  </params>
  <returns>
    <type>操作结果</type>
    <schema>
      success: boolean  // 是否成功
      error?: string   // 错误信息
    </schema>
  </returns>
</capability>`,
    execute: async (params: unknown): Promise<DBResponse> => {
      try {
        const { dbName, storeName, key } = params as { dbName: string; storeName: string; key: string | number };
        return new Promise((resolve, reject) => {
          const request = indexedDB.open(dbName);
          
          request.onerror = () => {
            reject({ success: false, error: "打开数据库失败" });
          };
          
          request.onsuccess = () => {
            const db = request.result;
            const tx = db.transaction(storeName, "readwrite");
            const store = tx.objectStore(storeName);
            
            const deleteRequest = store.delete(key);
            
            deleteRequest.onsuccess = () => {
              resolve({ success: true });
            };
            
            deleteRequest.onerror = () => {
              reject({ success: false, error: "删除数据失败" });
            };
            
            tx.oncomplete = () => {
              db.close();
            };
          };
        });
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "未知错误"
        };
      }
    }
  },
  
  {
    name: "db_list",
    schema: defaultSchema,
    description: `<capability>
  <name>列出所有数据</name>
  <params>
    <schema>
      dbName: string    // 数据库名称
      storeName: string // 存储名称
    </schema>
  </params>
  <returns>
    <type>查询结果</type>
    <schema>
      success: boolean  // 是否成功
      data?: unknown[] // 数据列表
      error?: string   // 错误信息
    </schema>
  </returns>
</capability>`,
    execute: async (params: unknown): Promise<DBResponse> => {
      try {
        const { dbName, storeName } = params as { dbName: string; storeName: string };
        return new Promise((resolve, reject) => {
          const request = indexedDB.open(dbName);
          
          request.onerror = () => {
            reject({ success: false, error: "打开数据库失败" });
          };
          
          request.onsuccess = () => {
            const db = request.result;
            const tx = db.transaction(storeName, "readonly");
            const store = tx.objectStore(storeName);
            
            const getAllRequest = store.getAll();
            
            getAllRequest.onsuccess = () => {
              resolve({ 
                success: true, 
                data: getAllRequest.result 
              });
            };
            
            getAllRequest.onerror = () => {
              reject({ success: false, error: "获取数据列表失败" });
            };
            
            tx.oncomplete = () => {
              db.close();
            };
          };
        });
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "未知错误"
        };
      }
    }
  }
]; 
