import { PortalDemoHeader, PortalDemoControls, PortalDemoLogs, PortalDemoStatus } from '../components';
import { usePortalDemo } from '../hooks/use-portal-demo';

export function PortalDemoPage() {
  const { status } = usePortalDemo();

  return (
    <div className="portal-demo-page" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <PortalDemoHeader />
      <PortalDemoStatus status={status} />
      <PortalDemoControls />
      <PortalDemoLogs />
    </div>
  );
} 