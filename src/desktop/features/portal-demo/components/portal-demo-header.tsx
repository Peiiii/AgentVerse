export function PortalDemoHeader() {
  return (
    <div style={{ marginBottom: '20px' }}>
      <h1>@cardos/service-bus-portal Demo</h1>
              <p>
          This demo showcases the <code>@cardos/service-bus-portal</code> package for cross-context communication.
          <strong>✅ This demo uses the REAL @cardos/service-bus-portal package from CDN!</strong> 
          The worker and iframe examples load the actual package from <code>https://esm.sh/@cardos/service-bus-portal@1.0.2</code>.
        </p>
      <p>
        <strong>🏗️ Architecture:</strong> Main thread provides services, Worker/Iframe consume them via portal system.
        This follows the correct pattern where capabilities are provided by the main thread and consumed by isolated contexts.
      </p>
    </div>
  );
} 