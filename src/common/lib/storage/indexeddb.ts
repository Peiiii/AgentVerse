import { DataProvider } from "./types";

export interface IndexedDBOptions<T> {
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

export class IndexedDBProvider<T extends { id: string }> implements DataProvider<T> {
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

  constructor(options: IndexedDBOptions<T>) {
    this.dbName = options.dbName;
    this.storeName = options.storeName;
    this.version = options.version || 1;
    this.keyPath = options.keyPath || 'id';
    this.autoIncrement = options.autoIncrement || false;
    this.indexes = options.indexes || [];
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
      const transaction = db.transaction(this.storeName, mode);
      const store = transaction.objectStore(this.storeName);

      transaction.oncomplete = () => {
        db.close();
      };

      transaction.onerror = () => {
        db.close();
        reject(new Error(`Transaction failed: ${transaction.error?.message}`));
      };

      operation(store)
        .then(resolve)
        .catch(reject);
    });
  }

  /**
   * 获取所有数据
   */
  async list(): Promise<T[]> {
    return this.executeTransaction('readonly', (store) => {
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        
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
  async create(data: Omit<T, "id">): Promise<T> {
    const newItem = { ...data, id: this.generateId() } as T;
    
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
  async createMany(dataArray: Omit<T, "id">[]): Promise<T[]> {
    const newItems = dataArray.map(data => ({ ...data, id: this.generateId() } as T));
    
    return this.executeTransaction('readwrite', (store) => {
      return new Promise((resolve, reject) => {
        const promises = newItems.map(item => {
          return new Promise<void>((resolveItem, rejectItem) => {
            const request = store.add(item);
            
            request.onsuccess = () => resolveItem();
            request.onerror = () => rejectItem(new Error(`Failed to create item: ${request.error?.message}`));
          });
        });

        Promise.all(promises)
          .then(() => resolve(newItems))
          .catch(reject);
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
          if (getRequest.result === undefined) {
            reject(new Error('Item not found'));
            return;
          }

          // 合并数据
          const updatedItem = { ...getRequest.result, ...data, id };
          
          // 更新数据
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
   * 清空所有数据
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
    try {
      await this.get(id);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 生成唯一 ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
    });
  }

  /**
   * 列出所有数据库
   */
  static async listDatabases(): Promise<string[]> {
    if ('databases' in indexedDB) {
      try {
        const databases = await indexedDB.databases();
        return databases.map(db => db.name as string);
      } catch {
        // 回退到存储的数据库列表
        const dbList = localStorage.getItem('indexedDB_database_list');
        return dbList ? JSON.parse(dbList) : [];
      }
    } else {
      // 在不支持 databases() 的浏览器中，使用存储的数据库列表
      const dbList = localStorage.getItem('indexedDB_database_list');
      return dbList ? JSON.parse(dbList) : [];
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