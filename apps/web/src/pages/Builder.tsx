import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PreviewPane } from '../components/PreviewPane';
import { LogsDrawer } from '../components/LogsDrawer';
import { supabase } from '../lib/supabase';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface BuildLog {
  level: 'info' | 'warn' | 'error';
  message: string;
  timestamp: Date;
}

interface BuildStep {
  label: string;
  status: 'pending' | 'active' | 'complete';
}

export function Builder() {
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [logs, setLogs] = useState<BuildLog[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [buildSteps, setBuildSteps] = useState<BuildStep[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle initial prompt from Home page
  useEffect(() => {
    const state = location.state as { initialPrompt?: string; projectId?: string } | null;
    if (state?.initialPrompt) {
      setInput(state.initialPrompt);
      // Auto-submit after a brief delay
      setTimeout(() => {
        const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
        handleSubmitWithPrompt(state.initialPrompt!, fakeEvent);
      }, 100);
    }
    if (state?.projectId) {
      setCurrentProjectId(state.projectId);
    }
  }, [location.state]);

  const addLog = (level: BuildLog['level'], message: string) => {
    setLogs((prev) => [...prev, { level, message, timestamp: new Date() }]);
  };

  const getAuthHeaders = async (): Promise<Record<string, string>> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
    }

    return headers;
  };

  const simulateBuildSteps = () => {
    const steps: BuildStep[] = [
      { label: 'Analyzing requirements', status: 'active' },
      { label: 'Generating React components', status: 'pending' },
      { label: 'Applying styles', status: 'pending' },
      { label: 'Compiling preview', status: 'pending' },
    ];
    setBuildSteps(steps);

    // Simulate step progression
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep >= steps.length) {
        clearInterval(interval);
        return;
      }
      setBuildSteps(prev => prev.map((step, i) => ({
        ...step,
        status: i < currentStep ? 'complete' : i === currentStep ? 'active' : 'pending'
      })));
    }, 1500);

    return () => clearInterval(interval);
  };

  const handleSubmitWithPrompt = async (promptText: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim() || isBuilding) return;

    const userMessage: Message = {
      role: 'user',
      content: promptText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsBuilding(true);

    // Start build step simulation
    const cleanupSteps = simulateBuildSteps();

    addLog('info', `Building: ${userMessage.content}`);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/mae/build', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          projectId: currentProjectId,
          prompt: userMessage.content,
          existingFiles: [],
        }),
      });

      if (!response.ok) {
        throw new Error(`Build failed: ${response.statusText}`);
      }

      const result = await response.json();

      addLog('info', `Received ${result.files?.length || 0} files`);

      // Mark all steps complete
      setBuildSteps(prev => prev.map(step => ({ ...step, status: 'complete' as const })));

      const assistantMessage: Message = {
        role: 'assistant',
        content: result.summary || 'Build complete! Your app is ready.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (result.previewHtml) {
        setPreviewHtml(result.previewHtml);
        addLog('info', 'Preview generated successfully');
      }
    } catch (error) {
      cleanupSteps();
      setBuildSteps([]);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog('error', errorMessage);

      const errorMsg: Message = {
        role: 'assistant',
        content: `Error: ${errorMessage}`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsBuilding(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    return handleSubmitWithPrompt(input, e);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

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

      {/* Right Pane: Preview */}
      <div className="w-1/2 bg-[#12121a] flex flex-col">
        {isBuilding && buildSteps.length > 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
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
        ) : previewHtml ? (
          <PreviewPane html={previewHtml} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-[#1a1a24] flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-[#2a2a3e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-mono font-semibold text-[#f0f0f5] mb-2">Preview</h3>
            <p className="text-sm text-[#555] max-w-xs">
              Your app preview will appear here once MAE starts building
            </p>
          </div>
        )}
      </div>

      {/* Logs Drawer */}
      {showLogs && <LogsDrawer logs={logs} onClose={() => setShowLogs(false)} />}
    </div>
  );
}
