interface PortalDemoStatusProps {
  status: string;
}

export function PortalDemoStatus({ status }: PortalDemoStatusProps) {
  return (
    <div style={{ 
      padding: '10px', 
      margin: '10px 0', 
      border: '1px solid #ccc', 
      borderRadius: '4px',
      backgroundColor: '#f9f9f9'
    }}>
      <strong>Status:</strong> {status}
    </div>
  );
} 