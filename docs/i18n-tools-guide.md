# 国际化工具使用指南

## ✅ 已配置的工具

### 1. i18n Ally (VS Code 扩展)

**安装方式：**
1. 在 VS Code 扩展市场搜索 "i18n Ally"
2. 点击安装
3. 或使用命令行：`code --install-extension Lokalise.i18n-ally`

**功能：**
- ✅ 在编辑器中实时显示翻译预览
- ✅ 检测缺失的翻译键
- ✅ 显示未使用的翻译键
- ✅ 快速跳转到翻译文件
- ✅ 内联显示翻译内容

**使用方法：**
1. 打开任意 `.tsx` 或 `.ts` 文件
2. 当使用 `t("xxx")` 时，会在代码上方显示翻译预览
3. 点击翻译键可以快速跳转到翻译文件
4. 缺失的翻译会显示警告

**配置位置：**
- `.vscode/settings.json` - VS Code 工作区配置
- `.i18n-ally.yml` - i18n Ally 专用配置

### 2. i18next-scanner (命令行工具)

**已安装：** ✅ `i18next-scanner` 已添加到 devDependencies

**功能：**
- ✅ 扫描代码中已使用的 `t()` 函数
- ✅ 检测翻译键是否存在
- ✅ 更新翻译文件

**使用方法：**

```bash
# 扫描代码并更新翻译文件
pnpm i18n:scan
```

**扫描规则：**
- 扫描 `src/**/*.{js,jsx,ts,tsx}` 文件
- 自动识别 `t()`, `i18next.t()`, `i18n.t()` 函数调用
- 更新 `src/core/locales/zh-CN.json` 和 `src/core/locales/en-US.json`

**配置文件：**
- `i18next-scanner.config.cjs` - 扫描器配置

## 📝 实际使用示例

### 示例：国际化一个组件

**之前（硬编码）：**
```tsx
const AGENT_DEF: AgentDef = {
  name: "Atlas 超级智能体",
  prompt: "你是世界级的超级智能助手",
};
```

**之后（国际化）：**
```tsx
import { useTranslation } from "@/core/hooks/use-i18n";

export function MyComponent() {
  const { t } = useTranslation();
  
  const AGENT_DEF: AgentDef = useMemo(() => ({
    name: t("allInOneAgent.name"),
    prompt: t("allInOneAgent.prompt"),
  }), [t]);
}
```

**添加翻译：**
在 `src/core/locales/zh-CN.json` 和 `src/core/locales/en-US.json` 中添加：

```json
{
  "allInOneAgent": {
    "name": "Atlas 超级智能体",
    "prompt": "你是世界级的超级智能助手"
  }
}
```

```json
{
  "allInOneAgent": {
    "name": "Atlas Super Agent",
    "prompt": "You are a world-class super intelligent assistant"
  }
}
```

## 🔄 工作流程

### 日常开发流程

1. **编写代码时：**
   - 使用 `t("key")` 替代硬编码文本
   - i18n Ally 会实时显示翻译预览
   - 如果翻译缺失，i18n Ally 会提示

2. **添加新翻译：**
   - 在 `src/core/locales/zh-CN.json` 中添加中文翻译
   - 在 `src/core/locales/en-US.json` 中添加英文翻译
   - i18n Ally 会自动检测并显示

3. **检查翻译完整性：**
   - 运行 `pnpm i18n:scan` 扫描代码
   - 检查是否有缺失的翻译键
   - i18n Ally 会在编辑器中显示未使用的翻译键

### 批量迁移现有代码

1. **识别硬编码文本：**
   - 手动查找代码中的中文文本
   - 或使用搜索功能查找包含中文的文件

2. **替换为国际化：**
   - 将硬编码文本替换为 `t("key")`
   - 添加对应的翻译键到翻译文件

3. **验证：**
   - 运行 `pnpm i18n:scan` 确保所有键都被识别
   - 运行 `pnpm build` 确保没有编译错误
   - 在浏览器中切换语言测试

## ⚠️ 注意事项

1. **i18next-scanner 的限制：**
   - 只扫描已使用 `t()` 函数的代码
   - 不会自动提取硬编码文本（需要手动替换）
   - TypeScript 解析可能有警告，但不影响功能
   - 扫描器会修改翻译文件，建议先提交代码再运行

2. **翻译键命名规范：**
   - 使用嵌套结构：`category.subcategory.key`
   - 保持语义清晰：`settings.title` 而不是 `s1`
   - 保持一致性：相同含义的文本使用相同的键

3. **性能考虑：**
   - 使用 `useMemo` 缓存包含 `t()` 的对象
   - 避免在渲染函数中频繁调用 `t()`

4. **翻译质量：**
   - 扫描后需要手动检查生成的翻译键是否合理
   - 英文翻译需要人工审核，不要完全依赖自动翻译

## 🎯 快速开始

1. ✅ 安装 i18n Ally 扩展：`code --install-extension Lokalise.i18n-ally`
2. ✅ 运行 `pnpm i18n:scan` 检查现有翻译
3. ✅ 逐步将硬编码文本替换为国际化
4. ✅ 在设置中切换语言测试效果

## 📚 相关文件

- 翻译文件：`src/core/locales/zh-CN.json`, `src/core/locales/en-US.json`
- i18n 配置：`src/core/config/i18n.ts`
- Hook：`src/core/hooks/use-i18n.ts`
- 扫描配置：`i18next-scanner.config.cjs`
- VS Code 配置：`.vscode/settings.json`, `.i18n-ally.yml`
