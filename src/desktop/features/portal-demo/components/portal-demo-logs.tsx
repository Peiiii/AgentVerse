import { usePortalDemo } from '../hooks/use-portal-demo';

export function PortalDemoLogs() {
  const { logs, clearLogs } = usePortalDemo();

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3>Console Logs</h3>
        <button
          onClick={clearLogs}
          style={{
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Clear Logs
        </button>
      </div>
      <div style={{
        height: '400px',
        overflowY: 'auto',
        border: '1px solid #ccc',
        borderRadius: '4px',
        padding: '10px',
        backgroundColor: '#f8f9fa',
        fontFamily: 'monospace',
        fontSize: '12px'
      }}>
        {logs.length === 0 ? (
          <div style={{ color: '#6c757d', fontStyle: 'italic' }}>
            No logs yet. Run an example to see the output.
          </div>
        ) : (
          logs.map((log, index) => (
            <div key={index} style={{ 
              marginBottom: '2px',
              color: log.includes('[ERROR]') ? '#dc3545' : '#212529'
            }}>
              {log}
            </div>
          ))
        )}
      </div>
    </div>
  );
} 