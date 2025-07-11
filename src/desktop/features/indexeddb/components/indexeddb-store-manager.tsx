import { Badge } from "@/common/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/common/components/ui/card";
import { ScrollArea } from "@/common/components/ui/scroll-area";
import { Separator } from "@/common/components/ui/separator";
import { DatabaseInfo } from "@/core/hooks/use-indexeddb-manager";
import { Database, FileText, Hash, Key } from "lucide-react";

interface IndexedDBStoreManagerProps {
  database: DatabaseInfo | null;
  onStoreSelect: (storeName: string) => void;
  selectedStore: string;
}

export function IndexedDBStoreManager({
  database,
  onStoreSelect,
  selectedStore
}: IndexedDBStoreManagerProps) {
  if (!database) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Database className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">请选择数据库</h3>
          <p className="text-muted-foreground">
            选择一个数据库来查看其存储对象
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">存储对象</h3>
          <p className="text-sm text-muted-foreground">
            数据库 "{database.name}" 包含 {database.stores.length} 个存储对象
          </p>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-4">
            {database.stores.map((storeName) => (
              <Card
                key={storeName}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedStore === storeName ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => onStoreSelect(storeName)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{storeName}</CardTitle>
                        <CardDescription className="text-xs">
                          存储对象
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Object Store
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Key className="w-3 h-3" />
                      <span>主键: id</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Hash className="w-3 h-3" />
                      <span>索引: 0 个</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {database.stores.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">暂无存储对象</h3>
              <p className="text-muted-foreground mb-4">
                此数据库中没有存储对象
              </p>
            </div>
          )}
        </ScrollArea>
      </div>

      <Separator />
      
      <div className="p-6">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">数据库信息</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">名称:</span>
                <span>{database.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">版本:</span>
                <span>v{database.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">存储对象:</span>
                <span>{database.stores.length} 个</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 