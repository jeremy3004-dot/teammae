import { useState, useRef, useEffect } from 'react';

interface PreviewPaneProps {
  html: string;
  onError?: (error: string) => void;
}

export function PreviewPane({ html }: PreviewPaneProps) {
  const [iframeKey, setIframeKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [blobUrl, setBlobUrl] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const previousUrlRef = useRef<string>('');

  const handleRefresh = () => {
    setIsLoaded(false);
    setIframeKey((prev) => prev + 1);
  };

  // Use Blob URL instead of data URI or srcDoc
  // Blob URLs have better browser support and no length limits
  useEffect(() => {
    if (!html) {
      setBlobUrl('');
      return;
    }

    console.log('[PreviewPane] Creating blob URL, html length:', html.length);
    console.log('[PreviewPane] HTML preview (first 500 chars):', html.substring(0, 500));

    // Create blob from HTML
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    console.log('[PreviewPane] Created blob URL:', url);

    // Store previous URL for cleanup
    if (previousUrlRef.current) {
      URL.revokeObjectURL(previousUrlRef.current);
    }
    previousUrlRef.current = url;

    setBlobUrl(url);
    setIsLoaded(false);

    // Only cleanup on unmount, not on html change (to prevent race conditions)
    return () => {
      // Delay cleanup to ensure iframe has loaded
      setTimeout(() => {
        if (previousUrlRef.current === url) {
          URL.revokeObjectURL(url);
          previousUrlRef.current = '';
        }
      }, 1000);
    };
  }, [html, iframeKey]);

  const handleIframeLoad = () => {
    console.log('[PreviewPane] Iframe loaded successfully');
    setIsLoaded(true);
  };

  const handleIframeError = () => {
    console.error('[PreviewPane] Iframe failed to load');
  };

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
        ) : blobUrl ? (
          <iframe
            key={iframeKey}
            ref={iframeRef}
            title="App Preview"
            className="absolute inset-0 w-full h-full border-0"
            src={blobUrl}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  );
}
