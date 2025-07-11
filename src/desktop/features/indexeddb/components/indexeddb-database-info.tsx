import { Badge } from "@/common/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/common/components/ui/card";

import { ScrollArea } from "@/common/components/ui/scroll-area";
import { Separator } from "@/common/components/ui/separator";
import { DatabaseInfo } from "@/core/hooks/use-indexeddb-manager";
import { Database, FileText, HardDrive, Info, PieChart, Settings } from "lucide-react";

interface IndexedDBDatabaseInfoProps {
  databases: DatabaseInfo[];
  currentDatabase: DatabaseInfo | null;
}

export function IndexedDBDatabaseInfo({
  databases,
  currentDatabase
}: IndexedDBDatabaseInfoProps) {
  const totalStores = databases.reduce((sum, db) => sum + db.stores.length, 0);

  return (
    <div className="h-full flex flex-col">
      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">数据库统计</h3>
          <p className="text-sm text-muted-foreground">
            查看所有 IndexedDB 数据库的统计信息
          </p>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-6">
            {/* 总体统计 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  总体统计
                </CardTitle>
                <CardDescription>
                  IndexedDB 数据库的整体情况
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{databases.length}</div>
                    <div className="text-sm text-muted-foreground">数据库总数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{totalStores}</div>
                    <div className="text-sm text-muted-foreground">存储对象总数</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 数据库列表 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  数据库列表
                </CardTitle>
                <CardDescription>
                  所有 IndexedDB 数据库的详细信息
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {databases.map((db) => (
                    <div
                      key={db.name}
                      className={`p-4 rounded-lg border ${
                        currentDatabase?.name === db.name
                          ? 'border-primary bg-primary/5'
                          : 'border-border'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Database className="w-4 h-4 text-primary" />
                          <span className="font-medium">{db.name}</span>
                          {currentDatabase?.name === db.name && (
                            <Badge variant="default" className="text-xs">
                              当前
                            </Badge>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          v{db.version}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <FileText className="w-3 h-3" />
                          <span>存储对象: {db.stores.length} 个</span>
                        </div>
                        {db.stores.length > 0 && (
                          <div className="flex items-center gap-2">
                            <HardDrive className="w-3 h-3" />
                            <span>存储: {db.stores.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {databases.length === 0 && (
                    <div className="text-center py-8">
                      <Database className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">暂无数据库</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 当前数据库详情 */}
            {currentDatabase && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    当前数据库详情
                  </CardTitle>
                  <CardDescription>
                    数据库 "{currentDatabase.name}" 的详细信息
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">数据库名称</div>
                        <div className="text-sm">{currentDatabase.name}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">版本</div>
                        <div className="text-sm">v{currentDatabase.version}</div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-2">
                        存储对象 ({currentDatabase.stores.length})
                      </div>
                      <div className="space-y-2">
                        {currentDatabase.stores.map((storeName) => (
                          <div
                            key={storeName}
                            className="flex items-center gap-2 p-2 rounded border"
                          >
                            <FileText className="w-4 h-4 text-primary" />
                            <span className="text-sm">{storeName}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 浏览器支持信息 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  浏览器支持
                </CardTitle>
                <CardDescription>
                  IndexedDB 功能的浏览器支持情况
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">IndexedDB API</span>
                    <Badge variant="default" className="text-xs">
                      支持
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">databases() 方法</span>
                    <Badge 
                      variant={('databases' in indexedDB) ? "default" : "secondary"} 
                      className="text-xs"
                    >
                      {('databases' in indexedDB) ? "支持" : "不支持"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">存储配额</span>
                    <Badge variant="outline" className="text-xs">
                      动态
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
} 