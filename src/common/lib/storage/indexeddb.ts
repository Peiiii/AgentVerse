import { DataProvider } from "./types";

export interface IndexedDBOptions {
  /** 数据库名称 */
  dbName: string;
  /** 存储名称 */
  storeName: string;
  /** 数据库版本 */
  version?: number;
  /** 主键字段名 */
  keyPath?: string;
  /** 是否自动创建索引 */
  autoIncrement?: boolean;
  /** 索引配置 */
  indexes?: Array<{
    name: string;
    keyPath: string | string[];
    options?: IDBIndexParameters;
  }>;
}

export interface IndexedDBQueryOptions {
  /** 查询索引名称 */
  indexName?: string;
  /** 查询范围 */
  range?: IDBKeyRange;
  /** 查询方向 */
  direction?: IDBCursorDirection;
  /** 限制返回数量 */
  limit?: number;
  /** 偏移量 */
  offset?: number;
}

export class IndexedDBProvider<T = any> implements DataProvider<T> {
  private dbName: string;
  private storeName: string;
  private version: number;
  private keyPath: string;
  private autoIncrement: boolean;
  private indexes: Array<{
    name: string;
    keyPath: string | string[];
    options?: IDBIndexParameters;
  }>;

  constructor(options: IndexedDBOptions) {
    this.dbName = options.dbName;
    this.storeName = options.storeName;
    this.version = options.version || 1;
    this.keyPath = options.keyPath || 'id';
    this.autoIncrement = options.autoIncrement || false;
    this.indexes = options.indexes || [];
    
    // 将数据库添加到列表中
    IndexedDBProvider.addDatabaseToList(this.dbName);
  }

  /**
   * 打开数据库连接
   */
  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        reject(new Error(`Failed to open database: ${request.error?.message}`));
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // 如果存储已存在则删除
        if (db.objectStoreNames.contains(this.storeName)) {
          db.deleteObjectStore(this.storeName);
        }

        // 创建对象存储
        const store = db.createObjectStore(this.storeName, {
          keyPath: this.keyPath,
          autoIncrement: this.autoIncrement
        });

        // 创建索引
        this.indexes.forEach(index => {
          store.createIndex(index.name, index.keyPath, index.options);
        });
      };
    });
  }

  /**
   * 执行事务
   */
  private async executeTransaction<TResult>(
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => Promise<TResult>
  ): Promise<TResult> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      let finished = false;
      try {
        const transaction = db.transaction(this.storeName, mode);
        const store = transaction.objectStore(this.storeName);

        transaction.oncomplete = () => {
          if (!finished) db.close();
        };

        transaction.onerror = () => {
          if (!finished) db.close();
          reject(new Error(`Transaction failed: ${transaction.error?.message}`));
        };

        Promise.resolve(operation(store))
          .then((result) => {
            finished = true;
            db.close();
            resolve(result);
          })
          .catch((err) => {
            finished = true;
            db.close();
            reject(err);
          });
      } catch (err) {
        db.close();
        reject(err);
      }
    });
  }

  /**
   * 获取所有数据
   */
  async list(): Promise<T[]> {
    return this.executeTransaction('readonly', (store) => {
      return new Promise((resolve, reject) => {
        // 检查 store 是否存在
        if (!store) {
          reject(new Error('Object store not found'));
          return;
        }
        let request: IDBRequest;
        try {
          request = store.getAll();
        } catch (err) {
          reject(new Error('Failed to get all data: ' + (err instanceof Error ? err.message : String(err))));
          return;
        }
        request.onsuccess = () => {
          resolve(request.result);
        };
        request.onerror = () => {
          reject(new Error(`Failed to get all data: ${request.error?.message}`));
        };
      });
    });
  }

  /**
   * 根据查询条件获取数据
   */
  async query(options: IndexedDBQueryOptions = {}): Promise<T[]> {
    return this.executeTransaction('readonly', (store) => {
      return new Promise((resolve, reject) => {
        let request: IDBRequest;
        
        if (options.indexName) {
          const index = store.index(options.indexName);
          request = options.range 
            ? index.getAll(options.range, options.limit)
            : index.getAll(null, options.limit);
        } else {
          request = options.range 
            ? store.getAll(options.range, options.limit)
            : store.getAll(null, options.limit);
        }
        
        request.onsuccess = () => {
          let result = request.result;
          
          // 应用偏移量
          if (options.offset && options.offset > 0) {
            result = result.slice(options.offset);
          }
          
          resolve(result);
        };
        
        request.onerror = () => {
          reject(new Error(`Query failed: ${request.error?.message}`));
        };
      });
    });
  }

  /**
   * 根据 ID 获取单个数据
   */
  async get(id: string): Promise<T> {
    return this.executeTransaction('readonly', (store) => {
      return new Promise((resolve, reject) => {
        const request = store.get(id);
        
        request.onsuccess = () => {
          if (request.result === undefined) {
            reject(new Error('Item not found'));
          } else {
            resolve(request.result);
          }
        };
        
        request.onerror = () => {
          reject(new Error(`Failed to get item: ${request.error?.message}`));
        };
      });
    });
  }

  /**
   * 创建新数据
   */
  async create(data: T): Promise<T> {
    // 如果数据是对象且有 id 属性，直接使用；否则生成 id
    let newItem: T;
    if (typeof data === 'object' && data !== null && 'id' in data) {
      newItem = data;
    } else {
      // 对于原始值，包装成对象
      newItem = { id: this.generateId(), value: data } as T;
    }
    
    return this.executeTransaction('readwrite', (store) => {
      return new Promise((resolve, reject) => {
        const request = store.add(newItem);
        
        request.onsuccess = () => {
          resolve(newItem);
        };
        
        request.onerror = () => {
          reject(new Error(`Failed to create item: ${request.error?.message}`));
        };
      });
    });
  }

  /**
   * 批量创建数据
   */
  async createMany(dataArray: T[]): Promise<T[]> {
    return this.executeTransaction('readwrite', (store) => {
      return new Promise((resolve, reject) => {
        const results: T[] = [];
        let completed = 0;
        let hasError = false;

        if (dataArray.length === 0) {
          resolve(results);
          return;
        }

        dataArray.forEach((data, index) => {
          // 如果数据是对象且有 id 属性，直接使用；否则生成 id
          let newItem: T;
          if (typeof data === 'object' && data !== null && 'id' in data) {
            newItem = data;
          } else {
            // 对于原始值，包装成对象
            newItem = { id: this.generateId(), value: data } as T;
          }

          const request = store.add(newItem);
          
          request.onsuccess = () => {
            results[index] = newItem;
            completed++;
            if (completed === dataArray.length && !hasError) {
              resolve(results);
            }
          };
          
          request.onerror = () => {
            if (!hasError) {
              hasError = true;
              reject(new Error(`Failed to create item at index ${index}: ${request.error?.message}`));
            }
          };
        });
      });
    });
  }

  /**
   * 更新数据
   */
  async update(id: string, data: Partial<T>): Promise<T> {
    return this.executeTransaction('readwrite', (store) => {
      return new Promise((resolve, reject) => {
        // 先获取现有数据
        const getRequest = store.get(id);
        
        getRequest.onsuccess = () => {
          const existingItem = getRequest.result;
          if (!existingItem) {
            reject(new Error('Item not found'));
            return;
          }

          // 合并数据
          const updatedItem = { ...existingItem, ...data };
          
          const putRequest = store.put(updatedItem);
          
          putRequest.onsuccess = () => {
            resolve(updatedItem);
          };
          
          putRequest.onerror = () => {
            reject(new Error(`Failed to update item: ${putRequest.error?.message}`));
          };
        };
        
        getRequest.onerror = () => {
          reject(new Error(`Failed to get item for update: ${getRequest.error?.message}`));
        };
      });
    });
  }

  /**
   * 删除数据
   */
  async delete(id: string): Promise<void> {
    return this.executeTransaction('readwrite', (store) => {
      return new Promise((resolve, reject) => {
        const request = store.delete(id);
        
        request.onsuccess = () => {
          resolve();
        };
        
        request.onerror = () => {
          reject(new Error(`Failed to delete item: ${request.error?.message}`));
        };
      });
    });
  }

  /**
   * 清空存储
   */
  async clear(): Promise<void> {
    return this.executeTransaction('readwrite', (store) => {
      return new Promise((resolve, reject) => {
        const request = store.clear();
        
        request.onsuccess = () => {
          resolve();
        };
        
        request.onerror = () => {
          reject(new Error(`Failed to clear store: ${request.error?.message}`));
        };
      });
    });
  }

  /**
   * 获取数据总数
   */
  async count(): Promise<number> {
    return this.executeTransaction('readonly', (store) => {
      return new Promise((resolve, reject) => {
        const request = store.count();
        
        request.onsuccess = () => {
          resolve(request.result);
        };
        
        request.onerror = () => {
          reject(new Error(`Failed to count items: ${request.error?.message}`));
        };
      });
    });
  }

  /**
   * 检查数据是否存在
   */
  async exists(id: string): Promise<boolean> {
    return this.executeTransaction('readonly', (store) => {
      return new Promise((resolve, reject) => {
        const request = store.count(IDBKeyRange.only(id));
        
        request.onsuccess = () => {
          resolve(request.result > 0);
        };
        
        request.onerror = () => {
          reject(new Error(`Failed to check existence: ${request.error?.message}`));
        };
      });
    });
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * 删除数据库
   */
  static async deleteDatabase(dbName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(dbName);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = () => {
        reject(new Error(`Failed to delete database: ${request.error?.message}`));
      };

      // 从列表中移除数据库
      IndexedDBProvider.removeDatabaseFromList(dbName);
    });
  }

  /**
   * 列出所有数据库
   */
  static async listDatabases(): Promise<string[]> {
    console.log('[IndexedDBProvider] listDatabases called');
    
    // 尝试使用现代的 databases() API
    if ('databases' in indexedDB) {
      try {
        console.log('[IndexedDBProvider] Using databases() API');
        const databases = await indexedDB.databases();
        const dbNames = databases.map(db => db.name as string);
        console.log('[IndexedDBProvider] databases() API result:', dbNames);
        return dbNames;
      } catch (error) {
        console.warn('[IndexedDBProvider] databases() API not supported, falling back to localStorage:', error);
      }
    } else {
      console.log('[IndexedDBProvider] databases() API not available');
    }
    
    // 回退到 localStorage 中存储的数据库列表
    try {
      console.log('[IndexedDBProvider] Using localStorage fallback');
      const dbList = localStorage.getItem('indexedDB_database_list');
      const databases = dbList ? JSON.parse(dbList) : [];
      console.log('[IndexedDBProvider] localStorage result:', databases);
      return databases;
    } catch (error) {
      console.warn('[IndexedDBProvider] Failed to get database list from localStorage:', error);
      return [];
    }
  }

  /**
   * 添加数据库到列表
   */
  private static addDatabaseToList(dbName: string): void {
    try {
      const dbList = localStorage.getItem('indexedDB_database_list');
      const databases = dbList ? JSON.parse(dbList) : [];
      
      if (!databases.includes(dbName)) {
        databases.push(dbName);
        localStorage.setItem('indexedDB_database_list', JSON.stringify(databases));
      }
    } catch (error) {
      console.warn('Failed to add database to list:', error);
    }
  }

  /**
   * 从列表中移除数据库
   */
  private static removeDatabaseFromList(dbName: string): void {
    try {
      const dbList = localStorage.getItem('indexedDB_database_list');
      const databases = dbList ? JSON.parse(dbList) : [];
      
      const filteredDatabases = databases.filter((name: string) => name !== dbName);
      localStorage.setItem('indexedDB_database_list', JSON.stringify(filteredDatabases));
    } catch (error) {
      console.warn('Failed to remove database from list:', error);
    }
  }

  /**
   * 获取数据库信息
   */
  async getDatabaseInfo(): Promise<{
    name: string;
    version: number;
    storeNames: string[];
  }> {
    const db = await this.openDB();
    const info = {
      name: db.name,
      version: db.version,
      storeNames: Array.from(db.objectStoreNames)
    };
    db.close();
    return info;
  }
} 