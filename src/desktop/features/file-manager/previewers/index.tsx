import { filePreviewRegistry } from '../services/file-preview-registry.service';
import { HtmlPreviewer } from './html-previewer';
import { TextPreviewer } from './text-previewer';
import { MarkdownPreviewer } from './markdown-previewer';
import { Code2, FileText } from 'lucide-react';

// HTML 预览器
const htmlPreviewer = {
  id: 'html-previewer',
  name: 'HTML 预览器',
  description: '支持 HTML 文件的预览和源码查看',
  icon: () => <Code2 className="w-5 h-5" />,
  matcher: {
    extensions: ['html', 'htm'],
    patterns: ['*.html', '*.htm'],
  },
  component: HtmlPreviewer,
  priority: 100,
  supportsEdit: true,
  supportsRefresh: true,
};

// Markdown 预览器
const markdownPreviewer = {
  id: 'markdown-previewer',
  name: 'Markdown 预览器',
  description: '支持 Markdown 文件的预览和编辑',
  icon: () => <FileText className="w-5 h-5" />,
  matcher: {
    extensions: ['md', 'markdown'],
    patterns: ['*.md', '*.markdown'],
  },
  component: MarkdownPreviewer,
  priority: 90,
  supportsEdit: true,
  supportsRefresh: false,
};

// 文本预览器（默认）
const textPreviewer = {
  id: 'text-previewer',
  name: '文本预览器',
  description: '通用文本文件预览器',
  icon: () => <FileText className="w-5 h-5" />,
  matcher: {
    extensions: ['txt', 'json', 'js', 'ts', 'jsx', 'tsx', 'css', 'scss', 'less', 'xml', 'yaml', 'yml', 'ini', 'conf', 'log'],
    patterns: ['*.txt', '*.json', '*.js', '*.ts', '*.jsx', '*.tsx', '*.css', '*.scss', '*.less', '*.xml', '*.yaml', '*.yml', '*.ini', '*.conf', '*.log'],
  },
  component: TextPreviewer,
  priority: 50,
  supportsEdit: true,
  supportsRefresh: false,
};

// 注册所有预览器
export function registerFilePreviewers() {
  filePreviewRegistry.register(htmlPreviewer);
  filePreviewRegistry.register(markdownPreviewer);
  filePreviewRegistry.register(textPreviewer);
}

// 导出预览器注册表
export { filePreviewRegistry };

// 导出预览器组件
export { HtmlPreviewer, TextPreviewer, MarkdownPreviewer };

// 导出类型
export type { FilePreviewer, FileMatcher } from '../types/file-preview.types'; 