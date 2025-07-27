import React, { useState, useEffect } from 'react';

interface WorkerLogViewerProps {
  logs: string[];
  isRunning: boolean;
  onClear: () => void;
}

export function WorkerLogViewer({ logs, isRunning, onClear }: WorkerLogViewerProps) {
  const [autoScroll, setAutoScroll] = useState(true);
  const logContainerRef = React.useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const formatLog = (log: string) => {
    if (log.includes('[Worker Error]')) {
      return <span className="text-red-500">{log}</span>;
    }
    if (log.includes('[Worker] ready:')) {
      return <span className="text-green-500">{log}</span>;
    }
    if (log.includes('[Worker] services-completed:')) {
      return <span className="text-blue-500">{log}</span>;
    }
    return <span className="text-gray-700">{log}</span>;
  };

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">Worker 日志查看器</h3>
        <div className="flex gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="w-4 h-4"
            />
            自动滚动
          </label>
          <button
            onClick={onClear}
            className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
          >
            清空日志
          </button>
        </div>
      </div>
      
      <div
        ref={logContainerRef}
        className="h-64 overflow-y-auto bg-white border rounded p-3 font-mono text-sm"
      >
        {logs.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            {isRunning ? '等待 Worker 日志...' : '暂无日志'}
          </div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="mb-1">
              {formatLog(log)}
            </div>
          ))
        )}
      </div>
      
      <div className="mt-2 text-xs text-gray-500">
        日志数量: {logs.length} | 
        状态: {isRunning ? '运行中' : '已停止'}
      </div>
    </div>
  );
} 