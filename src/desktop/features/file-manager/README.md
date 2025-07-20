# 可插拔文件预览系统

这是一个高度可扩展的文件预览系统，支持动态注册和配置不同类型的文件预览器。

## 系统架构

### 核心组件

1. **类型定义** (`types/file-preview.types.ts`)
   - `FilePreviewer`: 预览器接口
   - `FileMatcher`: 文件匹配规则
   - `FilePreviewProps`: 预览组件属性
   - `FilePreviewRegistry`: 注册表接口

2. **注册表服务** (`services/file-preview-registry.service.ts`)
   - 全局预览器注册表
   - 文件匹配逻辑
   - 优先级管理

3. **可插拔预览组件** (`components/pluggable-file-preview.tsx`)
   - 自动选择匹配的预览器
   - 文件内容管理
   - 错误处理

4. **内置预览器**
   - HTML 预览器 (`previewers/html-previewer.tsx`)
   - Markdown 预览器 (`previewers/markdown-previewer.tsx`)
   - 文本预览器 (`previewers/text-previewer.tsx`)

## 使用方法

### 基础使用

```tsx
import { PluggableFilePreview } from './components/pluggable-file-preview';
import { registerFilePreviewers } from './previewers';

function MyComponent() {
  useEffect(() => {
    // 注册内置预览器
    registerFilePreviewers();
  }, []);

  return (
    <PluggableFilePreview
      selectedFile={selectedFile}
      cwd={cwd}
      refreshNode={refreshNode}
      fileLoading={opsLoading}
    />
  );
}
```

### 创建自定义预览器

```tsx
import { FilePreviewer, FilePreviewProps } from './types/file-preview.types';
import { filePreviewRegistry } from './services/file-preview-registry.service';

// 1. 创建预览器组件
function MyCustomPreviewer({
  content,
  loading,
  error,
  onSave,
  supportsEdit = true,
}: FilePreviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);

  // 实现预览逻辑...
  
  return (
    <div>
      {/* 预览器 UI */}
    </div>
  );
}

// 2. 定义预览器配置
const myCustomPreviewer: FilePreviewer = {
  id: 'my-custom-previewer',
  name: '自定义预览器',
  description: '支持特定文件类型的预览',
  icon: () => <MyIcon className="w-5 h-5" />,
  matcher: {
    extensions: ['myext'],
    patterns: ['*.myext'],
    // 或者使用自定义匹配函数
    test: (filePath, fileName, fileExtension) => {
      return fileName.includes('special');
    },
  },
  component: MyCustomPreviewer,
  priority: 80,
  supportsEdit: true,
  supportsRefresh: false,
};

// 3. 注册预览器
filePreviewRegistry.register(myCustomPreviewer);
```

### 文件匹配规则

#### 扩展名匹配
```typescript
matcher: {
  extensions: ['txt', 'md', 'json'],
}
```

#### 文件名模式匹配（支持 glob）
```typescript
matcher: {
  patterns: ['*.txt', '*.md', 'config.*'],
}
```

#### 自定义匹配函数
```typescript
matcher: {
  test: (filePath, fileName, fileExtension) => {
    // 自定义匹配逻辑
    return fileName.startsWith('special_') || fileExtension === 'custom';
  },
}
```

#### MIME 类型匹配
```typescript
matcher: {
  mimeTypes: ['text/plain', 'application/json'],
}
```

### 优先级管理

预览器按优先级排序，数字越大优先级越高：

```typescript
const previewer: FilePreviewer = {
  // ...
  priority: 100, // 高优先级
  // ...
};
```

## 内置预览器

### HTML 预览器
- **支持格式**: `.html`, `.htm`
- **功能**: iframe 预览 + 源码查看 + 语法高亮
- **特性**: 支持编辑、刷新

### Markdown 预览器
- **支持格式**: `.md`, `.markdown`
- **功能**: 实时预览 + 源码编辑
- **特性**: 支持编辑、基础 Markdown 语法

### 文本预览器（默认）
- **支持格式**: `.txt`, `.json`, `.js`, `.ts`, `.css`, 等
- **功能**: 纯文本预览 + 编辑
- **特性**: 支持编辑、通用文本处理

## 高级功能

### 动态注册/注销

```typescript
// 注册预览器
filePreviewRegistry.register(myPreviewer);

// 注销预览器
filePreviewRegistry.unregister('my-previewer-id');

// 获取所有预览器
const allPreviewers = filePreviewRegistry.getAll();

// 清空所有预览器
filePreviewRegistry.clear();
```

### 查找匹配的预览器

```typescript
const previewer = filePreviewRegistry.findForFile(
  '/path/to/file.html',
  'file.html',
  'html'
);
```

### 配置选项

```typescript
interface PluggableFilePreviewProps {
  selectedFile: string | null;
  cwd: string;
  refreshNode?: (cwd: string) => void;
  fileLoading?: boolean;
  maxPreviewSize?: number; // 最大预览文件大小
}
```

## 扩展示例

### JSON 预览器
```typescript
const jsonPreviewer: FilePreviewer = {
  id: 'json-previewer',
  name: 'JSON 预览器',
  description: 'JSON 文件格式化预览',
  icon: () => <Code2 className="w-5 h-5" />,
  matcher: {
    extensions: ['json'],
  },
  component: JsonPreviewer,
  priority: 85,
  supportsEdit: true,
  supportsRefresh: false,
};
```

### 图片预览器
```typescript
const imagePreviewer: FilePreviewer = {
  id: 'image-previewer',
  name: '图片预览器',
  description: '图片文件预览',
  icon: () => <Image className="w-5 h-5" />,
  matcher: {
    extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  },
  component: ImagePreviewer,
  priority: 95,
  supportsEdit: false,
  supportsRefresh: false,
};
```

## 最佳实践

1. **优先级设置**: 为特定文件类型设置合适的优先级
2. **错误处理**: 在预览器组件中妥善处理错误状态
3. **性能优化**: 大文件考虑使用虚拟滚动或分页
4. **用户体验**: 提供加载状态和错误提示
5. **可访问性**: 确保预览器支持键盘导航和屏幕阅读器

## 技术特性

- ✅ **类型安全**: 完整的 TypeScript 类型定义
- ✅ **可扩展性**: 插件化架构，易于扩展
- ✅ **优先级管理**: 智能的文件类型匹配
- ✅ **错误处理**: 完善的错误处理机制
- ✅ **性能优化**: 按需加载和缓存机制
- ✅ **用户体验**: 流畅的动画和交互 