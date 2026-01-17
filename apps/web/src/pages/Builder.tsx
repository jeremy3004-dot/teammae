import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PreviewPane } from '../components/PreviewPane';
import { LogsDrawer } from '../components/LogsDrawer';
import { buildsApi, filesApi, type BuildLog as ApiBuildLog, type ProjectFile } from '../lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface BuildLog {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: Date;
}

interface BuildStep {
  label: string;
  status: 'pending' | 'active' | 'complete';
}

type RightPaneTab = 'preview' | 'files';

export function Builder() {
  const location = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [_currentBuildId, setCurrentBuildId] = useState<string | null>(null);
  const [logs, setLogs] = useState<BuildLog[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [buildSteps, setBuildSteps] = useState<BuildStep[]>([]);
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const [rightPaneTab, setRightPaneTab] = useState<RightPaneTab>('preview');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle initial prompt and project from Home page
  useEffect(() => {
    const state = location.state as { initialPrompt?: string; projectId?: string } | null;

    if (state?.projectId) {
      setCurrentProjectId(state.projectId);
      // Load existing files for this project
      loadProjectFiles(state.projectId);
    }

    if (state?.initialPrompt && state?.projectId) {
      setInput(state.initialPrompt);
      // Auto-submit after a brief delay
      setTimeout(() => {
        handleSubmitWithPrompt(state.initialPrompt!, state.projectId!);
      }, 100);
    }
  }, [location.state]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const loadProjectFiles = async (projectId: string) => {
    try {
      const files = await filesApi.list(projectId);
      setProjectFiles(files);

      // Generate preview HTML from files
      if (files.length > 0) {
        const html = generatePreviewHtml(files);
        setPreviewHtml(html);
      }
    } catch (error) {
      console.error('Failed to load project files:', error);
    }
  };

  /**
   * Generate a self-contained HTML preview from project files
   */
  const generatePreviewHtml = (files: ProjectFile[]): string => {
    const fileMap = new Map(files.map(f => [f.path, f.content]));

    // Find App.tsx or main component
    const appContent = fileMap.get('apps/web/src/App.tsx') ||
                       fileMap.get('src/App.tsx') ||
                       fileMap.get('App.tsx') || '';

    // Find CSS
    const cssContent = fileMap.get('apps/web/src/index.css') ||
                       fileMap.get('src/index.css') ||
                       fileMap.get('index.css') ||
                       '@tailwind base;\n@tailwind components;\n@tailwind utilities;';

    // Collect all component files
    const componentCode: string[] = [];
    for (const [path, content] of fileMap.entries()) {
      if ((path.includes('/components/') || path.includes('/pages/')) &&
          (path.endsWith('.tsx') || path.endsWith('.jsx'))) {
        // Transform the component to be usable inline
        const transformed = content
          .replace(/^import.*from.*['"].*['"];?\s*$/gm, '') // Remove imports
          .replace(/export default /g, 'const _Component = ')
          .replace(/export /g, '');
        componentCode.push(`// ${path}\n${transformed}`);
      }
    }

    // Transform App.tsx
    const transformedApp = appContent
      .replace(/^import.*from.*['"].*['"];?\s*$/gm, '') // Remove imports
      .replace(/export default App;?/g, '')
      .replace(/export default /g, 'const App = ');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            background: '#0a0a0f',
            foreground: '#f0f0f5',
            card: '#12121a',
            border: '#2a2a3e',
            primary: '#6366f1',
            'primary-foreground': '#ffffff',
            muted: '#1a1a24',
            'muted-foreground': '#a0a0b0',
          }
        }
      }
    }
  </script>
  <style>
    ${cssContent.replace(/@tailwind\s+(base|components|utilities);/g, '')}
    body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module">
    import React, { useState, useEffect, useCallback, useMemo } from 'https://esm.sh/react@18.2.0';
    import ReactDOM from 'https://esm.sh/react-dom@18.2.0/client';

    // Component definitions
    ${componentCode.join('\n\n')}

    // App component
    ${transformedApp}

    // Render
    try {
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(React.createElement(App));
    } catch (e) {
      document.getElementById('root').innerHTML = '<div style="padding: 20px; color: red;">Preview Error: ' + e.message + '</div>';
      console.error('Preview render error:', e);
    }
  </script>
</body>
</html>`;
  };

  const addLog = (level: BuildLog['level'], message: string) => {
    setLogs((prev) => [...prev, { level, message, timestamp: new Date() }]);
  };

  const startBuildPolling = (buildId: string) => {
    // Clear any existing polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    let pollCount = 0;
    const maxPolls = 45; // 45 * 2s = 90 seconds

    pollingIntervalRef.current = setInterval(async () => {
      pollCount++;

      if (pollCount >= maxPolls) {
        // Timeout after 90 seconds
        clearInterval(pollingIntervalRef.current!);
        pollingIntervalRef.current = null;
        addLog('error', 'Build timeout after 90 seconds');
        setIsBuilding(false);
        setBuildSteps([]);

        const timeoutMsg: Message = {
          role: 'assistant',
          content: 'Build timed out after 90 seconds. Please try again or simplify your request.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, timeoutMsg]);
        return;
      }

      try {
        const { build, logs: buildLogs } = await buildsApi.getStatus(buildId);

        // Update logs from server
        const newLogs: BuildLog[] = buildLogs.map((log: ApiBuildLog) => ({
          level: log.level,
          message: log.message,
          timestamp: new Date(log.timestamp),
        }));
        setLogs(newLogs);

        // Update build steps based on logs
        updateBuildSteps(buildLogs);

        // Check if build is complete
        if (build.status === 'success' || build.status === 'failed') {
          clearInterval(pollingIntervalRef.current!);
          pollingIntervalRef.current = null;
          setIsBuilding(false);
          setBuildSteps([]);

          if (build.status === 'success') {
            addLog('info', 'Build completed successfully');

            const successMsg: Message = {
              role: 'assistant',
              content: 'Build complete! Your app is ready. Check the Preview tab to see your app live!',
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, successMsg]);

            // Load the generated files and generate preview
            if (currentProjectId) {
              await loadProjectFiles(currentProjectId);
              // Switch to preview tab to show results
              setRightPaneTab('preview');
            }
          } else {
            addLog('error', build.error_message || 'Build failed');

            const errorMsg: Message = {
              role: 'assistant',
              content: `Build failed: ${build.error_message || 'Unknown error'}`,
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMsg]);
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
        // Don't stop polling on network errors, just log
        addLog('warn', 'Failed to fetch build status');
      }
    }, 2000); // Poll every 2 seconds
  };

  const updateBuildSteps = (buildLogs: ApiBuildLog[]) => {
    const steps: BuildStep[] = [
      { label: 'Analyzing requirements', status: 'pending' },
      { label: 'Generating application code', status: 'pending' },
      { label: 'Saving files', status: 'pending' },
      { label: 'Build complete', status: 'pending' },
    ];

    // Map log messages to steps
    let currentStep = 0;
    for (const log of buildLogs) {
      if (log.message.includes('Starting build') || log.message.includes('Analyzing')) {
        currentStep = Math.max(currentStep, 0);
      } else if (log.message.includes('Generating')) {
        currentStep = Math.max(currentStep, 1);
      } else if (log.message.includes('Saving')) {
        currentStep = Math.max(currentStep, 2);
      } else if (log.message.includes('completed successfully')) {
        currentStep = 3;
      }
    }

    setBuildSteps(steps.map((step, i) => ({
      ...step,
      status: i < currentStep ? 'complete' : i === currentStep ? 'active' : 'pending',
    })));
  };

  const handleSubmitWithPrompt = async (promptText: string, projectId?: string) => {
    if (!promptText.trim() || isBuilding) return;

    const effectiveProjectId = projectId || currentProjectId;

    if (!effectiveProjectId) {
      addLog('error', 'No project selected');
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: promptText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsBuilding(true);

    // Initialize build steps
    setBuildSteps([
      { label: 'Analyzing requirements', status: 'active' },
      { label: 'Generating application code', status: 'pending' },
      { label: 'Saving files', status: 'pending' },
      { label: 'Build complete', status: 'pending' },
    ]);

    addLog('info', `Building: ${userMessage.content}`);

    try {
      const result = await buildsApi.create(effectiveProjectId, userMessage.content);

      setCurrentBuildId(result.buildId);
      addLog('info', `Build started with ID: ${result.buildId}`);

      // Start polling for build status
      startBuildPolling(result.buildId);
    } catch (error) {
      setIsBuilding(false);
      setBuildSteps([]);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog('error', errorMessage);

      const errorMsg: Message = {
        role: 'assistant',
        content: `Error: ${errorMessage}`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    return handleSubmitWithPrompt(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Require project to be selected
  if (!currentProjectId) {
    return (
      <div className="flex h-[calc(100vh-73px)] items-center justify-center bg-[#0a0a0f]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-[#1a1a24] flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#6366f1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-mono font-semibold text-[#f0f0f5] mb-2">No Project Selected</h3>
          <p className="text-sm text-[#555] mb-6">Please go back to the home page and start a new build</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 bg-white text-[#0a0a0f] rounded-xl font-mono font-semibold text-sm uppercase tracking-wider hover:bg-[#f0f0f5] transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-73px)]">
      {/* Left Pane: Chat */}
      <div className="w-1/2 flex flex-col border-r border-[#2a2a3e] bg-[#0a0a0f]">
        {/* MAE Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#2a2a3e]">
          <div className="relative">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#2a2a3e] bg-[#12121a]">
              <img
                src="/images/mae-mascot.png"
                alt="MAE"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement!.innerHTML = `
                    <div class="w-full h-full bg-gradient-to-br from-[#6366f1] to-[#7c3aed] flex items-center justify-center">
                      <span class="text-lg font-bold text-white font-mono">M</span>
                    </div>
                  `;
                }}
              />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0a0a0f]"></div>
          </div>
          <div>
            <h2 className="font-mono font-semibold text-[#f0f0f5] text-sm">MAE</h2>
            <p className="text-xs text-green-400">Ready</p>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-[#2a2a3e] bg-[#12121a] shrink-0">
                <img
                  src="/images/mae-mascot.png"
                  alt="MAE"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = `
                      <div class="w-full h-full bg-gradient-to-br from-[#6366f1] to-[#7c3aed] flex items-center justify-center">
                        <span class="text-sm font-bold text-white font-mono">M</span>
                      </div>
                    `;
                  }}
                />
              </div>
              <div className="bg-[#12121a] border border-[#2a2a3e] rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                <p className="text-sm text-[#a0a0b0]">
                  Hey! I'm MAE, your AI engineer. Tell me what you want to build and I'll create it for you.
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {msg.role === 'assistant' ? (
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-[#2a2a3e] bg-[#12121a] shrink-0">
                    <img
                      src="/images/mae-mascot.png"
                      alt="MAE"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = `
                          <div class="w-full h-full bg-gradient-to-br from-[#6366f1] to-[#7c3aed] flex items-center justify-center">
                            <span class="text-sm font-bold text-white font-mono">M</span>
                          </div>
                        `;
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6366f1] to-[#7c3aed] flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-white">Y</span>
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-[#6366f1] to-[#7c3aed] text-white rounded-tr-sm'
                      : 'bg-[#12121a] border border-[#2a2a3e] text-[#f0f0f5] rounded-tl-sm'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))
          )}
          {isBuilding && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-[#2a2a3e] bg-[#12121a] shrink-0">
                <img
                  src="/images/mae-mascot.png"
                  alt="MAE"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = `
                      <div class="w-full h-full bg-gradient-to-br from-[#6366f1] to-[#7c3aed] flex items-center justify-center">
                        <span class="text-sm font-bold text-white font-mono">M</span>
                      </div>
                    `;
                  }}
                />
              </div>
              <div className="bg-[#12121a] border border-[#2a2a3e] rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex items-center gap-2 text-[#6366f1] mb-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm font-medium">Building...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-[#2a2a3e] p-4 bg-[#12121a]">
          <form onSubmit={handleSubmit} className="flex items-end gap-3">
            <div className="flex-1 bg-[#1a1a24] border border-[#2a2a3e] rounded-xl focus-within:border-[#6366f1] transition-colors">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tell MAE what to build or change..."
                className="w-full px-4 py-3 bg-transparent text-[#f0f0f5] placeholder-[#555] focus:outline-none resize-none text-sm"
                rows={2}
                disabled={isBuilding}
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim() || isBuilding}
              className="px-6 py-3 bg-white text-[#0a0a0f] rounded-xl font-mono font-semibold text-sm hover:bg-[#f0f0f5] hover:-translate-y-0.5 disabled:bg-[#2a2a3e] disabled:text-[#555] disabled:cursor-not-allowed disabled:transform-none transition-all"
            >
              {isBuilding ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Right Pane: Tabs (Files | Preview) */}
      <div className="w-1/2 bg-[#12121a] flex flex-col">
        {/* Tab Headers */}
        <div className="flex border-b border-[#2a2a3e]">
          <button
            onClick={() => setRightPaneTab('files')}
            className={`flex-1 px-4 py-3 text-sm font-mono font-medium transition-colors ${
              rightPaneTab === 'files'
                ? 'text-[#f0f0f5] border-b-2 border-[#6366f1] bg-[#12121a]'
                : 'text-[#666] hover:text-[#a0a0b0] bg-[#0a0a0f]'
            }`}
          >
            Files ({projectFiles.length})
          </button>
          <button
            onClick={() => setRightPaneTab('preview')}
            className={`flex-1 px-4 py-3 text-sm font-mono font-medium transition-colors ${
              rightPaneTab === 'preview'
                ? 'text-[#f0f0f5] border-b-2 border-[#6366f1] bg-[#12121a]'
                : 'text-[#666] hover:text-[#a0a0b0] bg-[#0a0a0f]'
            }`}
          >
            Preview
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          {rightPaneTab === 'files' ? (
            // Files Tab
            <div className="h-full overflow-y-auto">
              {isBuilding && buildSteps.length > 0 ? (
                // Show build steps while building
                <div className="flex flex-col items-center justify-center h-full p-8">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-[#2a2a3e] mb-6 animate-pulse">
                    <img
                      src="/images/mae-mascot.png"
                      alt="MAE"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = `
                          <div class="w-full h-full bg-gradient-to-br from-[#6366f1] to-[#7c3aed] flex items-center justify-center">
                            <span class="text-2xl font-bold text-white font-mono">M</span>
                          </div>
                        `;
                      }}
                    />
                  </div>
                  <h3 className="text-xl font-mono font-semibold text-[#f0f0f5] mb-8">Building...</h3>
                  <div className="space-y-3 w-full max-w-sm">
                    {buildSteps.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                          step.status === 'complete' ? 'bg-green-500' :
                          step.status === 'active' ? 'bg-[#6366f1]' :
                          'bg-[#2a2a3e]'
                        }`}>
                          {step.status === 'complete' ? (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : step.status === 'active' ? (
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          ) : (
                            <div className="w-2 h-2 bg-[#555] rounded-full"></div>
                          )}
                        </div>
                        <span className={`text-sm ${
                          step.status === 'complete' ? 'text-green-400' :
                          step.status === 'active' ? 'text-[#f0f0f5]' :
                          'text-[#555]'
                        }`}>
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : projectFiles.length === 0 ? (
                // No files yet
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <div className="w-20 h-20 rounded-full bg-[#1a1a24] flex items-center justify-center mb-6">
                    <svg className="w-10 h-10 text-[#2a2a3e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-mono font-semibold text-[#f0f0f5] mb-2">No Files Yet</h3>
                  <p className="text-sm text-[#555] max-w-xs">
                    Generated files will appear here once MAE completes the build
                  </p>
                </div>
              ) : (
                // File tree
                <div className="p-4">
                  <div className="space-y-1">
                    {projectFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center gap-2 px-3 py-2 bg-[#1a1a24] hover:bg-[#2a2a3e] border border-[#2a2a3e] rounded-lg transition-colors cursor-pointer group"
                      >
                        <svg className="w-4 h-4 text-[#6366f1] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm text-[#f0f0f5] font-mono flex-1 truncate group-hover:text-white transition-colors">
                          {file.path}
                        </span>
                        <span className="text-xs text-[#555] font-mono">
                          {(file.size_bytes / 1024).toFixed(1)}KB
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Preview Tab
            <div className="h-full">
              {previewHtml ? (
                <PreviewPane html={previewHtml} />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center h-full p-8 text-center">
                  <div className="w-20 h-20 rounded-full bg-[#1a1a24] flex items-center justify-center mb-6">
                    <svg className="w-10 h-10 text-[#2a2a3e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-mono font-semibold text-[#f0f0f5] mb-2">Preview</h3>
                  <p className="text-sm text-[#555] max-w-xs">
                    Preview functionality coming soon. For now, check the Files tab to see generated code.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Logs Drawer */}
      {showLogs && <LogsDrawer logs={logs} onClose={() => setShowLogs(false)} />}
    </div>
  );
}
