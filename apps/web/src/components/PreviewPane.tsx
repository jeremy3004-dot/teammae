import { useState, useEffect, useRef } from 'react';

interface PreviewPaneProps {
  html: string;
  onError?: (error: string) => void;
}

export function PreviewPane({ html, onError }: PreviewPaneProps) {
  const [iframeKey, setIframeKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleRefresh = () => {
    setIframeKey((prev) => prev + 1);
  };

  // Inject error capturing script into HTML
  const htmlWithErrorCapture = html ? html.replace(
    '</head>',
    `<script>
      // Capture errors and send to parent
      window.onerror = function(message, source, lineno, colno, error) {
        window.parent.postMessage({
          type: 'preview-error',
          error: message + (source ? ' at ' + source + ':' + lineno + ':' + colno : '')
        }, '*');
        return false;
      };
      // Capture unhandled promise rejections
      window.onunhandledrejection = function(event) {
        window.parent.postMessage({
          type: 'preview-error',
          error: 'Unhandled Promise: ' + (event.reason?.message || event.reason || 'Unknown')
        }, '*');
      };
      // Capture console errors
      const originalConsoleError = console.error;
      console.error = function(...args) {
        window.parent.postMessage({
          type: 'preview-error',
          error: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')
        }, '*');
        originalConsoleError.apply(console, args);
      };
      // Send ready message when scripts load
      window.addEventListener('DOMContentLoaded', function() {
        window.parent.postMessage({ type: 'preview-loaded' }, '*');
      });
    <\/script></head>`
  ) : '';

  // Listen for messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'preview-error' && onError) {
        onError(event.data.error);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onError]);

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-gray-200 px-4 py-2 bg-gray-50 flex items-center justify-between">
        <h3 className="font-medium text-gray-700">Preview</h3>
        {html && (
          <button
            onClick={handleRefresh}
            className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-200 rounded-md"
          >
            Refresh
          </button>
        )}
      </div>
      <div className="flex-1 relative bg-white" style={{ minHeight: 0 }}>
        {!html ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <p className="mt-2 text-sm">No preview yet</p>
              <p className="text-xs text-gray-400 mt-1">Start building to see your app</p>
            </div>
          </div>
        ) : (
          <iframe
            key={iframeKey}
            ref={iframeRef}
            title="App Preview"
            className="absolute inset-0 w-full h-full border-0"
            srcDoc={htmlWithErrorCapture}
          />
        )}
      </div>
    </div>
  );
}
