# Cursor Rules 使用说明

## 命名规范规则

### 文件位置
- 规则文件：`.cursor/rules/naming-conventions.mdc`
- 修复脚本：`scripts/rename-hooks-to-kebab-case.sh`

### 规则内容

#### 1. 文件命名规范
- 所有文件和文件夹必须使用 **kebab-case** 命名
- Service文件必须以 `.service.ts` 结尾

#### 2. Hook命名规范
- Hook名称应当语义化，清晰表达功能用途
- 避免可能与其他功能混淆的命名
- 确保命名具有清晰的识别性

### 当前项目修复状态

#### ✅ 已符合规范
- Service文件命名：所有service文件都已正确使用 `.service.ts` 后缀
- 部分Hook文件：`use-connect-navigation-store.ts`, `use-extensions.ts` 等

#### ❌ 需要修复
- 大部分Hook文件仍使用camelCase命名，需要改为kebab-case

### 修复步骤

#### 1. 运行重命名脚本
```bash
./scripts/rename-hooks-to-kebab-case.sh
```

#### 2. 更新import语句
运行以下命令查找需要更新的import：
```bash
grep -r 'from.*use[A-Z]' src/ --include='*.ts' --include='*.tsx'
```

#### 3. 手动更新import
将找到的import语句从：
```typescript
import { useAgentChat } from "@/core/hooks/useAgentChat";
```
更新为：
```typescript
import { useAgentChat } from "@/core/hooks/use-agent-chat";
```

### 规则应用

这些规则会在Cursor中自动应用，帮助：
- 在创建新文件时提供命名建议
- 在代码审查时检查命名规范
- 保持项目代码风格一致性

### 注意事项

1. **重命名前备份**：建议在运行重命名脚本前提交当前代码
2. **测试功能**：重命名后需要测试所有功能是否正常
3. **团队协作**：确保团队成员都了解并遵循这些规范 