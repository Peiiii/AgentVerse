import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/common/components/ui/dialog";
import { Label } from "@/common/components/ui/label";
import { ScrollArea } from "@/common/components/ui/scroll-area";
import { Textarea } from "@/common/components/ui/textarea";
import { Edit, FileText, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface IndexedDBDataViewerProps {
  storeName: string;
  data: unknown[];
  onAddData: (data: unknown) => Promise<void>;
  onUpdateData: (id: string, data: unknown) => Promise<void>;
  onDeleteData: (id: string) => Promise<void>;
  onClearStore: (storeName: string) => Promise<void>;
  isLoading: boolean;
}

export function IndexedDBDataViewer({
  storeName,
  data,
  onAddData,
  onUpdateData,
  onDeleteData,
  onClearStore,
  isLoading
}: IndexedDBDataViewerProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [newItemData, setNewItemData] = useState<Record<string, unknown>>({});
  const [editItemData, setEditItemData] = useState<Record<string, unknown>>({});

  const handleAddData = async () => {
    try {
      await onAddData(newItemData);
      setIsAddDialogOpen(false);
      setNewItemData({});
    } catch (error) {
      console.error('添加数据失败:', error);
    }
  };

  const handleUpdateData = async () => {
    if (editingIndex === -1) return;
    
    try {
      // 使用索引作为ID，因为原始值可能没有id属性
      await onUpdateData(editingIndex.toString(), editItemData);
      setIsEditDialogOpen(false);
      setEditingIndex(-1);
      setEditItemData({});
    } catch (error) {
      console.error('更新数据失败:', error);
    }
  };

  const handleEditItem = (item: unknown, index: number) => {
    setEditingIndex(index);
    setEditItemData(item as Record<string, unknown>);
    setIsEditDialogOpen(true);
  };

  const handleDeleteItem = async (index: number) => {
    if (confirm('确定要删除这条数据吗？')) {
      try {
        await onDeleteData(index.toString());
      } catch (error) {
        console.error('删除数据失败:', error);
      }
    }
  };

  const handleClearStore = async () => {
    if (confirm('确定要清空所有数据吗？此操作不可恢复！')) {
      try {
        await onClearStore(storeName);
      } catch (error) {
        console.error('清空存储失败:', error);
      }
    }
  };

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return 'null';
    
    // 处理 TypedArray 和 ArrayBuffer
    if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) {
      const size = value instanceof ArrayBuffer ? value.byteLength : value.byteLength;
      const type = value.constructor.name;
      return `${type}(${size} bytes)`;
    }
    
    // 处理数组
    if (Array.isArray(value)) {
      const length = value.length;
      if (length > 100) {
        return `Array(${length} items) - 显示前100项`;
      }
      return JSON.stringify(value, null, 2);
    }
    
    // 处理对象
    if (typeof value === 'object') {
      const keys = Object.keys(value);
      if (keys.length > 50) {
        return `Object(${keys.length} properties) - 显示前50个属性`;
      }
      return JSON.stringify(value, null, 2);
    }
    
    return String(value);
  };

  const getItemType = (item: unknown): string => {
    if (item === null) return 'null';
    if (item === undefined) return 'undefined';
    if (Array.isArray(item)) return 'array';
    if (typeof item === 'object') return 'object';
    return typeof item;
  };

  const getItemId = (item: unknown, index: number): string => {
    if (item && typeof item === 'object' && (item as Record<string, unknown>).id !== undefined) {
      return String((item as Record<string, unknown>).id);
    }
    return `索引 ${index}`;
  };

  const getItemFields = (item: unknown): number => {
    if (item === null || item === undefined) return 0;
    if (typeof item === 'object') {
      return Object.keys(item).length;
    }
    return 1; // 原始值算作1个字段
  };

  const renderItemContent = (item: unknown) => {
    console.log("[IndexedDBDataViewer] renderItemContent item", item);
    
    if (item === null || item === undefined) {
      return (
        <div className="text-xs text-muted-foreground">
          {item === null ? 'null' : 'undefined'}
        </div>
      );
    }

    // 处理 TypedArray 和 ArrayBuffer
    if (ArrayBuffer.isView(item) || item instanceof ArrayBuffer) {
      const size = item instanceof ArrayBuffer ? item.byteLength : item.byteLength;
      const type = item.constructor.name;
      return (
        <div className="text-xs">
          <div className="font-medium text-muted-foreground mb-1">
            {type} ({size} bytes)
          </div>
          <div className="text-muted-foreground">
            {size > 1024 ? `${(size / 1024).toFixed(1)} KB` : `${size} bytes`}
          </div>
          {size <= 100 && (
            <div className="mt-2 p-2 bg-muted/20 rounded text-xs font-mono break-all">
              {Array.from(new Uint8Array(item instanceof ArrayBuffer ? item : item.buffer)).slice(0, 50).map((byte) => 
                byte.toString(16).padStart(2, '0')
              ).join(' ')}
              {size > 50 ? '...' : ''}
            </div>
          )}
        </div>
      );
    }

    // 处理数组
    if (Array.isArray(item)) {
      const length = item.length;
      return (
        <div className="text-xs">
          <div className="font-medium text-muted-foreground mb-1">
            Array ({length} items)
          </div>
          {length <= 10 ? (
            <div className="space-y-1">
              {item.map((value, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="font-medium text-muted-foreground min-w-0 flex-shrink-0">
                    [{index}]:
                  </span>
                  <span className="break-all">
                    {formatValue(value)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground">
              显示前 10 项，共 {length} 项
              <div className="mt-2 space-y-1">
                {item.slice(0, 10).map((value, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="font-medium text-muted-foreground min-w-0 flex-shrink-0">
                      [{index}]:
                    </span>
                    <span className="break-all">
                      {formatValue(value)}
                    </span>
                  </div>
                ))}
                <div className="text-muted-foreground italic">
                  ... 还有 {length - 10} 项
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // 处理普通对象
    if (typeof item === 'object') {
      const keys = Object.keys(item);
      const length = keys.length;
      
      return (
        <div className="space-y-2">
          <div className="font-medium text-muted-foreground text-xs">
            对象 ({length} 属性)
          </div>
          {length <= 20 ? (
            keys.map((key) => (
              <div key={key} className="flex items-start gap-2 text-xs">
                <span className="font-medium text-muted-foreground min-w-0 flex-shrink-0">
                  {key}:
                </span>
                <span className="break-all">
                  {formatValue((item as Record<string, unknown>)[key])}
                </span>
              </div>
            ))
          ) : (
            <div className="text-muted-foreground">
              显示前 20 个属性，共 {length} 个
              {keys.slice(0, 20).map((key) => (
                <div key={key} className="flex items-start gap-2 text-xs">
                  <span className="font-medium text-muted-foreground min-w-0 flex-shrink-0">
                    {key}:
                  </span>
                                  <span className="break-all">
                  {formatValue((item as Record<string, unknown>)[key])}
                </span>
                </div>
              ))}
              <div className="text-muted-foreground italic text-xs">
                ... 还有 {length - 20} 个属性
              </div>
            </div>
          )}
        </div>
      );
    }

    // 处理原始值
    return (
      <div className="text-xs">
        <span className="break-all">{formatValue(item)}</span>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* 头部工具栏 */}
      <div className="p-4 border-b bg-muted/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5" />
              数据记录
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              存储 "{storeName}" 包含 {data.length} 条记录
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  添加数据
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>添加新数据</DialogTitle>
                  <DialogDescription>
                    为存储 "{storeName}" 添加新的数据记录
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="new-data">数据 (JSON)</Label>
                    <Textarea
                      id="new-data"
                      value={JSON.stringify(newItemData, null, 2)}
                      onChange={(e) => {
                        try {
                          const parsed = JSON.parse(e.target.value);
                          setNewItemData(parsed);
                        } catch {
                          // 忽略无效的 JSON
                        }
                      }}
                      placeholder='{"name": "示例", "value": 123} 或 "字符串" 或 123'
                      rows={6}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    取消
                  </Button>
                  <Button onClick={handleAddData} disabled={isLoading}>
                    添加
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearStore}
              disabled={data.length === 0 || isLoading}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              清空
            </Button>
          </div>
        </div>
      </div>

      {/* 数据列表 */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">加载数据中...</p>
              </div>
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">暂无数据</h3>
              <p className="text-muted-foreground mb-4">
                存储 "{storeName}" 中还没有数据记录
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                添加第一条数据
              </Button>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {data.map((item, index) => (
                <Card key={index} className="hover:shadow-sm transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <CardTitle className="text-sm">ID: {getItemId(item, index)}</CardTitle>
                          <CardDescription className="text-xs">
                            {getItemType(item)} 类型
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {getItemFields(item)} 字段
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditItem(item, index)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteItem(index)}
                          className="h-6 w-6 p-0 text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {renderItemContent(item)}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* 编辑对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑数据</DialogTitle>
            <DialogDescription>
              编辑存储 "{storeName}" 中的数据记录
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-data">数据 (JSON)</Label>
              <Textarea
                id="edit-data"
                value={JSON.stringify(editItemData, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setEditItemData(parsed);
                  } catch {
                    // 忽略无效的 JSON
                  }
                }}
                rows={8}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleUpdateData} disabled={isLoading}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 