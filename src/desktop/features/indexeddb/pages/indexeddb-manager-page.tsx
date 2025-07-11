import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { ScrollArea } from "@/common/components/ui/scroll-area";
import { DatabaseInfo, useIndexedDBManager } from "@/core/hooks/use-indexeddb-manager";
import {
    ChevronRight,
    Database,
    DatabaseIcon,
    File,
    FileText,
    FolderOpen,
    Home,
    Plus,
    RefreshCw,
    Search
} from "lucide-react";
import { useMemo, useState, useEffect, useCallback } from "react";
import { IndexedDBDataViewer } from "../components/indexeddb-data-viewer";

export function IndexedDBManagerPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDatabase, setSelectedDatabase] = useState<string>("");
  const [selectedStore, setSelectedStore] = useState<string>("");
  
  const {
    databases,
    currentDatabase,
    storeData,
    isLoading,
    refreshDatabases,
    openDatabase,
    createDatabase,
    getStoreData,
    addData,
    updateData,
    deleteData,
    clearStore
  } = useIndexedDBManager();

  // 过滤数据库
  const filteredDatabases = useMemo(() => {
    if (!searchQuery.trim()) return databases;
    
    return databases.filter((db: DatabaseInfo) => 
      db.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [databases, searchQuery]);

  // 处理数据库选择
  const handleDatabaseSelect = useCallback(async (dbName: string) => {
    setSelectedDatabase(dbName);
    setSelectedStore("");
    await openDatabase(dbName);
    
    // 自动选择第一个存储对象
    const database = databases.find(db => db.name === dbName);
    if (database && database.stores.length > 0) {
      const firstStore = database.stores[0];
      setSelectedStore(firstStore);
      await getStoreData(firstStore);
    }
  }, [databases, openDatabase, getStoreData]);

  // 处理存储选择
  const handleStoreSelect = async (storeName: string) => {
    setSelectedStore(storeName);
    await getStoreData(storeName);
  };

  // 当数据库信息更新时，自动选择第一个存储对象
  useEffect(() => {
    if (currentDatabase && currentDatabase.stores.length > 0 && !selectedStore) {
      const firstStore = currentDatabase.stores[0];
      setSelectedStore(firstStore);
      getStoreData(firstStore);
    }
  }, [currentDatabase, selectedStore, getStoreData]);

  // 当数据库列表加载完成后，自动选择第一个数据库
  useEffect(() => {
    if (databases.length > 0 && !selectedDatabase) {
      const firstDatabase = databases[0];
      handleDatabaseSelect(firstDatabase.name);
    }
  }, [databases, selectedDatabase, handleDatabaseSelect]);

  // 面包屑导航
  const renderBreadcrumb = () => (
    <div className="flex items-center gap-2 text-sm text-muted-foreground px-6 py-3 border-b">
      <Home className="w-4 h-4" />
      <span>IndexedDB 管理器</span>
      {selectedDatabase && (
        <>
          <ChevronRight className="w-4 h-4" />
          <FolderOpen className="w-4 h-4" />
          <span>{selectedDatabase}</span>
        </>
      )}
      {selectedStore && (
        <>
          <ChevronRight className="w-4 h-4" />
          <File className="w-4 h-4" />
          <span>{selectedStore}</span>
        </>
      )}
    </div>
  );

  // 顶部工具栏
  const renderToolbar = () => (
    <div className="flex items-center justify-between px-6 py-3 border-b bg-muted/20">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索数据库..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-64"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshDatabases}
          disabled={isLoading}
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => createDatabase('test-db-' + Date.now(), ['users', 'posts'])}
          disabled={isLoading}
        >
          <Plus className="w-4 h-4" />
          创建测试数据库
        </Button>
      </div>
      
      <div className="flex items-center gap-2">
        <Button size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          新建数据库
        </Button>
      </div>
    </div>
  );

  // 左侧数据库列表
  const renderDatabaseList = () => (
    <div className="w-80 border-r bg-muted/20">
      <div className="p-4 border-b">
        <h3 className="font-semibold flex items-center gap-2">
          <DatabaseIcon className="w-5 h-5" />
          数据库
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {databases.length} 个数据库
        </p>
      </div>
      
      <ScrollArea className="h-full">
        <div className="p-2 space-y-1">
          {filteredDatabases.map((db: DatabaseInfo) => (
            <div
              key={db.name}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                selectedDatabase === db.name
                  ? 'bg-primary/10 border border-primary/20'
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => handleDatabaseSelect(db.name)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">{db.name}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  v{db.version}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                {db.stores.length} 个存储对象
              </div>
            </div>
          ))}
          
          {filteredDatabases.length === 0 && (
            <div className="text-center py-8">
              <DatabaseIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "没有找到匹配的数据库" : "暂无数据库"}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );

  // 中间存储列表
  const renderStoreList = () => (
    <div className="w-80 border-r bg-muted/10">
      <div className="p-4 border-b">
        <h3 className="font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5" />
          存储对象
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {currentDatabase ? `${currentDatabase.stores.length} 个存储对象` : "请选择数据库"}
        </p>
      </div>
      
      {currentDatabase ? (
        <ScrollArea className="h-full">
          <div className="p-2 space-y-1">
            {currentDatabase.stores.map((storeName) => (
              <div
                key={storeName}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedStore === storeName
                    ? 'bg-primary/10 border border-primary/20'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => handleStoreSelect(storeName)}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span className="font-medium text-sm">{storeName}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  主键: id
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">请选择数据库</p>
          </div>
        </div>
      )}
    </div>
  );

  // 右侧数据区域
  const renderDataArea = () => (
    <div className="flex-1 flex flex-col">
      {selectedStore ? (
        <IndexedDBDataViewer
          storeName={selectedStore}
          data={storeData}
          onAddData={(data) => addData(data, selectedStore)}
          onUpdateData={(id, data) => updateData(id, data, selectedStore)}
          onDeleteData={(id) => deleteData(id, selectedStore)}
          onClearStore={clearStore}
          isLoading={isLoading}
        />
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {selectedDatabase ? "请选择存储对象" : "请选择数据库"}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="h-full w-full flex flex-col">
      {/* 面包屑导航 */}
      {renderBreadcrumb()}
      
      {/* 工具栏 */}
      {renderToolbar()}
      
      {/* 主内容区域 */}
      <div className="flex-1 flex min-h-0">
        {/* 左侧数据库列表 */}
        {renderDatabaseList()}
        
        {/* 中间存储列表 */}
        {renderStoreList()}
        
        {/* 右侧数据区域 */}
        {renderDataArea()}
      </div>
    </div>
  );
} 