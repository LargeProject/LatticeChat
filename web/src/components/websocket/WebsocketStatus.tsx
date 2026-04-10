import { useWebsocketContext } from '#/lib/context/WebsocketContext';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

export function WebsocketStatus() {
  const { connectionState, error, isAuthenticated } = useWebsocketContext();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (error) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (!show && isAuthenticated) return null;

  const statusMessages = {
    disconnected: 'Disconnected from server',
    connecting: 'Connecting...',
    connected: 'Connected',
    authenticated: 'Connected',
    error: error || 'Connection error',
  };

  const statusColors = {
    disconnected: 'bg-amber-50 border-amber-200 text-amber-800',
    connecting: 'bg-blue-50 border-blue-200 text-blue-800',
    connected: 'bg-green-50 border-green-200 text-green-800',
    authenticated: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
  };

  return (
    <div
      className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg border ${statusColors[connectionState]} transition-all duration-300`}
    >
      <span className="text-sm font-medium">
        {statusMessages[connectionState]}
      </span>
      <span className="text-xs font-medium">{error}</span>
    </div>
  );
}

export function WebsocketErrorBoundary({ children }: { children: ReactNode }) {
  const { connectionState } = useWebsocketContext();

  if (connectionState === 'error') {
    return (
      <div className="flex items-center justify-center h-screen bg-red-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-900 mb-2">
            Connection Error
          </h1>
          <p className="text-red-700 mb-4">
            Failed to connect to the server. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
