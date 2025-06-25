export interface DataProvider<T> {
  list(): Promise<T[]>;
  get(id: string): Promise<T>;
  create(data: Omit<T, "id">): Promise<T>;
  createMany(data: Omit<T, "id">[]): Promise<T[]>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

export type StorageType = 'local' | 'http'; 
