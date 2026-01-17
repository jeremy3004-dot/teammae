interface BuildLog {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: Date;
}

interface LogsDrawerProps {
  logs: BuildLog[];
  onClose: () => void;
}

export function LogsDrawer({ logs, onClose }: LogsDrawerProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
        <h3 className="font-medium text-gray-700">Build Logs</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="h-64 overflow-y-auto p-4 font-mono text-xs bg-gray-900 text-gray-100">
        {logs.length === 0 ? (
          <p className="text-gray-500">No logs yet</p>
        ) : (
          logs.map((log, idx) => (
            <div key={idx} className="mb-1">
              <span className="text-gray-500">[{log.timestamp.toLocaleTimeString()}]</span>{' '}
              <span
                className={
                  log.level === 'error'
                    ? 'text-red-400'
                    : log.level === 'warn'
                    ? 'text-yellow-400'
                    : log.level === 'debug'
                    ? 'text-gray-500'
                    : 'text-blue-400'
                }
              >
                [{log.level.toUpperCase()}]
              </span>{' '}
              <span>{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
