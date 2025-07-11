import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/common/components/ui/dialog";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { ScrollArea } from "@/common/components/ui/scroll-area";
import { Textarea } from "@/common/components/ui/textarea";
import { Edit, FileText, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface IndexedDBDataViewerProps {
  storeName: string;
  data: any[];
  onAddData: (data: any) => Promise<void>;
  onUpdateData: (id: string, data: any) => Promise<void>;
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
  const [editingItem, setEditingItem] = useState<any>(null);
  const [newItemData, setNewItemData] = useState<any>({});
  const [editItemData, setEditItemData] = useState<any>({});

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
    if (!editingItem) return;
    
    try {
      await onUpdateData(editingItem.id, editItemData);
      setIsEditDialogOpen(false);
      setEditingItem(null);
      setEditItemData({});
    } catch (error) {
      console.error('更新数据失败:', error);
    }
  };

  const handleEditItem = (item: any) => {
    setEditingItem(item);
    setEditItemData({ ...item });
    setIsEditDialogOpen(true);
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm('确定要删除这条数据吗？')) {
      try {
        await onDeleteData(id);
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

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
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
                    <Label htmlFor="new-id">ID</Label>
                    <Input
                      id="new-id"
                      value={newItemData.id || ''}
                      onChange={(e) => setNewItemData((prev: any) => ({ ...prev, id: e.target.value }))}
                      placeholder="输入唯一ID"
                    />
                  </div>
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
                      placeholder='{"name": "示例", "value": 123}'
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
                <Card key={item.id || index} className="hover:shadow-sm transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <CardTitle className="text-sm">ID: {item.id}</CardTitle>
                          <CardDescription className="text-xs">
                            数据记录
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {Object.keys(item).length} 字段
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditItem(item)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteItem(item.id)}
                          className="h-6 w-6 p-0 text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {Object.entries(item).map(([key, value]) => (
                        <div key={key} className="flex items-start gap-2 text-xs">
                          <span className="font-medium text-muted-foreground min-w-0 flex-shrink-0">
                            {key}:
                          </span>
                          <span className="break-all">
                            {formatValue(value)}
                          </span>
                        </div>
                      ))}
                    </div>
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