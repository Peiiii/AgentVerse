import { useEffect, useRef, useState } from "react";
import {
  MermaidRenderer,
  MermaidRenderState,
  MermaidRenderResult,
} from "./mermaid-renderer";

interface MermaidProps {
  chart: string;
}

export function MermaidChart({ chart }: MermaidProps) {
  const [renderResult, setRenderResult] = useState<MermaidRenderResult>({
    state: MermaidRenderState.IDLE,
    chart: "",
  });

  const rendererRef = useRef<MermaidRenderer | null>(null);

  useEffect(() => {
    // 创建渲染器实例
    if (!rendererRef.current) {
      rendererRef.current = new MermaidRenderer();
    }

    const renderer = rendererRef.current;

    // 订阅渲染结果
    const subscription = renderer.getRenderResult().subscribe(setRenderResult);

    // 清理订阅
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 更新图表内容
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.updateChart(chart);
    }
  }, [chart]);

  useEffect(() => {
    // 组件卸载时清理渲染器
    return () => {
      if (rendererRef.current) {
        rendererRef.current.destroy();
        rendererRef.current = null;
      }
    };
  }, []);

  // console.log("[MermaidChart] ", { renderResult, state: renderResult.state });

  // 根据状态渲染不同的UI
  switch (renderResult.state) {
    case MermaidRenderState.IDLE:
      return null;

    case MermaidRenderState.LOADING:
      return (
        <div className="my-4 p-4 bg-gray-100 dark:bg-gray-800 rounded">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              渲染中...
            </span>
          </div>
        </div>
      );

    case MermaidRenderState.SUCCESS:
      return (
        <div className="my-4 flex justify-center">
          <div dangerouslySetInnerHTML={{ __html: renderResult.svg! }} />
        </div>
      );

    case MermaidRenderState.ERROR:
      return (
        <div className="my-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
          <p className="text-red-600 dark:text-red-400 text-sm">
            Mermaid 图表渲染失败: {renderResult.error}
          </p>
          <pre className="mt-2 text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">
            {renderResult.chart}
          </pre>
        </div>
      );

    case MermaidRenderState.FALLBACK:
      return (
        <pre className="my-4 p-4 bg-gray-100 dark:bg-gray-800 rounded overflow-x-auto text-sm">
          <code className="language-mermaid">{renderResult.chart}</code>
        </pre>
      );

    default:
      return null;
  }
}
