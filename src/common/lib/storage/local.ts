import { nanoid } from "nanoid";
import { DataProvider } from "./types";

export type CompareFn<T> = (a: T, b: T) => number;

export interface SortField<T, K extends keyof T> {
  field: K;
  direction?: "asc" | "desc";
  comparator?: CompareFn<T[K]>;
}

export interface LocalStorageOptions<T> {
  maxItems?: number;
  // 完全自定义排序函数，优先级最高
  comparator?: CompareFn<T>;
  // 多字段排序配置
  sortFields?: SortField<T, keyof T>[];
}

export class LocalStorageProvider<T extends { id: string }>
  implements DataProvider<T>
{
  constructor(
    private readonly storageKey: string,
    private readonly options: LocalStorageOptions<T> = {}
  ) {}

  private getStoredItems(): T[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  private setStoredItems(items: T[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(items));
  }

  private compareValues<V>(
    a: V,
    b: V,
    direction: "asc" | "desc" = "asc"
  ): number {
    if (a === b) return 0;
    const order = direction === "asc" ? 1 : -1;
    return (a > b ? 1 : -1) * order;
  }

  private sortItems(items: T[]): T[] {
    // 1. 如果提供了自定义比较函数，优先使用
    if (this.options.comparator) {
      return [...items].sort(this.options.comparator);
    }

    // 2. 如果提供了多字段排序配置，使用多字段排序
    if (this.options.sortFields?.length) {
      return [...items].sort((a, b) => {
        for (const { field, direction = "asc", comparator } of this.options
          .sortFields!) {
          const aValue = a[field];
          const bValue = b[field];
          if (aValue === bValue) return 0;

          // 如果提供了字段专用的比较器，使用它
          if (comparator) {
            const result = comparator(aValue, bValue);
            if (result !== 0) return result;
          } else {
            // 否则使用默认比较
            const result = this.compareValues(aValue, bValue, direction);
            if (result !== 0) return result;
          }
        }
        return 0;
      });
    }

    return items;
  }

  async list(): Promise<T[]> {
    let items = this.getStoredItems();
    items = this.sortItems(items);
    return this.options.maxItems
      ? items.slice(0, this.options.maxItems)
      : items;
  }

  async get(id: string): Promise<T> {
    const item = this.getStoredItems().find((item) => item.id === id);
    if (!item) throw new Error("Item not found");
    return item;
  }

  async create(data: Omit<T, "id">): Promise<T> {
    const items = this.getStoredItems();
    const newItem = { ...data, id: nanoid() } as T;
    this.setStoredItems([newItem, ...items]);
    return newItem;
  }

  async createMany(dataArray: Omit<T, "id">[]): Promise<T[]> {
    const items = this.getStoredItems();
    const newItems = dataArray.map((data) => ({ ...data, id: nanoid() } as T));
    this.setStoredItems([...items, ...newItems]);
    return newItems;
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const items = this.getStoredItems();
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) throw new Error("Item not found");

    // 过滤掉 undefined 值
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined)
    );

    const updatedItem = { ...items[index], ...filteredData };
    items[index] = updatedItem;
    this.setStoredItems(items);
    return updatedItem;
  }

  async delete(id: string): Promise<void> {
    const items = this.getStoredItems();
    this.setStoredItems(items.filter((item) => item.id !== id));
  }
}
