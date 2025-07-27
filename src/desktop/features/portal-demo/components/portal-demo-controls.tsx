import { usePortalDemo } from '../hooks/use-portal-demo';
import { WorkerLogViewer } from './worker-log-viewer';

export function PortalDemoControls() {
  const { 
    runWorkerExample, 
    runIframeExample, 
    runComprehensiveExample, 
    isRunning,
    logs,
    clearLogs
  } = usePortalDemo();

  return (
    <div style={{ marginBottom: '20px' }}>
      <h3>Portal Examples</h3>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={runWorkerExample}
          disabled={isRunning}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            opacity: isRunning ? 0.6 : 1
          }}
        >
          Run Worker Example
        </button>

        <button
          onClick={runIframeExample}
          disabled={isRunning}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            opacity: isRunning ? 0.6 : 1
          }}
        >
          Run Iframe Example
        </button>

        <button
          onClick={runComprehensiveExample}
          disabled={isRunning}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            opacity: isRunning ? 0.6 : 1
          }}
        >
          Run Comprehensive Example
        </button>
      </div>
      
      {/* Worker 日志查看器 */}
      <div style={{ marginTop: '20px' }}>
        <WorkerLogViewer 
          logs={logs} 
          isRunning={isRunning} 
          onClear={clearLogs} 
        />
      </div>
    </div>
  );
} 