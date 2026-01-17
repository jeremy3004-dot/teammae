import { useState, useRef, useEffect } from 'react';
import { PreviewPane } from '../components/PreviewPane';
import { LogsDrawer } from '../components/LogsDrawer';
import { ProjectSelector } from '../components/ProjectSelector';
import { BuildHistory } from '../components/BuildHistory';
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

interface DemoResult {
  prompt: string;
  status: 'pass' | 'fail';
  reason?: string;
}

interface BuildPlanPreview {
  type: string;
  pages: string[];
  layout: string[];
  components: string[];
  styleProfile: string;
  explanation: string;
}

export function Builder() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [logs, setLogs] = useState<BuildLog[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [demoResults, setDemoResults] = useState<DemoResult[]>([]);
  const [isBeautyDemoRunning, setIsBeautyDemoRunning] = useState(false);
  const [beautyDemoResults, setBeautyDemoResults] = useState<DemoResult[]>([]);
  const [buildPlanPreview, setBuildPlanPreview] = useState<BuildPlanPreview | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  const checkPreviewIntegrity = (html: string): { valid: boolean; issues: string[] } => {
    const issues: string[] = [];

    // Check for corruption patterns
    if (/href=(?!["'])/.test(html)) {
      issues.push('Detected unquoted href attributes');
    }
    if (/class=(?!["'])/.test(html)) {
      issues.push('Detected unquoted class attributes');
    }
    if (/>\s*\)\s*\}\s*\)/.test(html)) {
      issues.push('Detected malformed JSX closures');
    }
    if (/<[a-z]+\s+[^>]*(?:className|href|src)=[^"'][^>\s]*/i.test(html)) {
      issues.push('Detected unquoted React props');
    }

    return { valid: issues.length === 0, issues };
  };

  const runDemo = async () => {
    setIsDemoRunning(true);
    setDemoResults([]);
    setShowLogs(true);

    const demoPrompts = [
      'Build a simple Hello World app with a centered greeting',
      'Build a landing page with hero section, features grid, and call-to-action',
      'Build a todo list app with add, complete, and delete functionality',
    ];

    const results: DemoResult[] = [];

    for (const prompt of demoPrompts) {
      addLog('info', `🧪 Demo: ${prompt}`);

      try {
        const headers = await getAuthHeaders();
        const response = await fetch('/api/mae/build', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            projectId: `demo-${Date.now()}`,
            prompt,
            existingFiles: [],
          }),
        });

        if (!response.ok) {
          results.push({
            prompt,
            status: 'fail',
            reason: `HTTP ${response.status}: ${response.statusText}`,
          });
          addLog('error', `Demo FAIL: ${response.statusText}`);
          continue;
        }

        const result = await response.json();

        if (!result.previewHtml) {
          results.push({
            prompt,
            status: 'fail',
            reason: 'No preview HTML generated',
          });
          addLog('error', 'Demo FAIL: No preview HTML');
          continue;
        }

        // Check integrity
        const integrity = checkPreviewIntegrity(result.previewHtml);

        if (!integrity.valid) {
          results.push({
            prompt,
            status: 'fail',
            reason: `Preview integrity check failed: ${integrity.issues.join(', ')}`,
          });
          addLog('error', `Demo FAIL: ${integrity.issues.join(', ')}`);
          continue;
        }

        // Check that files were saved
        if (!result.savedCount || result.savedCount === 0) {
          results.push({
            prompt,
            status: 'fail',
            reason: 'No files saved to database',
          });
          addLog('error', 'Demo FAIL: No files saved');
          continue;
        }

        // All checks passed
        results.push({
          prompt,
          status: 'pass',
        });

        addLog('info', `✅ Demo PASS: ${result.savedCount} files saved, preview valid`);
        setPreviewHtml(result.previewHtml);

        // Wait 1 second between demos
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        results.push({
          prompt,
          status: 'fail',
          reason: error instanceof Error ? error.message : 'Unknown error',
        });
        addLog('error', `Demo FAIL: ${error instanceof Error ? error.message : 'Unknown'}`);
      }
    }

    setDemoResults(results);
    setIsDemoRunning(false);

    const passCount = results.filter((r) => r.status === 'pass').length;
    addLog('info', `🎯 Demo complete: ${passCount}/${results.length} passed`);
  };

  const runBeautyDemo = async () => {
    setIsBeautyDemoRunning(true);
    setBeautyDemoResults([]);
    setShowLogs(true);

    const beautyPrompts = [
      'Build a calorie tracker app with a friendly pig avatar, pink aesthetic',
      'Build a modern dashboard for a SaaS product with sidebar navigation and stat cards',
    ];

    const results: DemoResult[] = [];

    for (const prompt of beautyPrompts) {
      addLog('info', `✨ Beauty Demo: ${prompt}`);

      try {
        const headers = await getAuthHeaders();
        const response = await fetch('/api/mae/build', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            projectId: `beauty-demo-${Date.now()}`,
            prompt,
            existingFiles: [],
          }),
        });

        if (!response.ok) {
          results.push({
            prompt,
            status: 'fail',
            reason: `HTTP ${response.status}: ${response.statusText}`,
          });
          addLog('error', `Beauty Demo FAIL: ${response.statusText}`);
          continue;
        }

        const result = await response.json();

        // Check quality score
        const qualityScore = result.meta?.qualityScore || 0;
        const hasMultipleComponents = result.files?.filter((f: any) =>
          f.path.startsWith('src/components/')
        ).length >= 2;

        if (!result.previewHtml) {
          results.push({
            prompt,
            status: 'fail',
            reason: 'No preview HTML generated',
          });
          addLog('error', 'Beauty Demo FAIL: No preview HTML');
          continue;
        }

        if (qualityScore < 70) {
          results.push({
            prompt,
            status: 'fail',
            reason: `Quality score too low: ${qualityScore}/100`,
          });
          addLog('error', `Beauty Demo FAIL: Quality score ${qualityScore}/100`);
          continue;
        }

        if (!hasMultipleComponents) {
          results.push({
            prompt,
            status: 'fail',
            reason: 'Insufficient component breakdown (expected 2+ components)',
          });
          addLog('error', 'Beauty Demo FAIL: Not enough components');
          continue;
        }

        // All checks passed
        results.push({
          prompt,
          status: 'pass',
        });

        addLog('info', `✅ Beauty Demo PASS: Quality ${qualityScore}/100, ${result.files?.length || 0} files, ${result.files?.filter((f: any) => f.path.startsWith('src/components/')).length} components`);
        setPreviewHtml(result.previewHtml);

        // Wait 2 seconds between demos
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        results.push({
          prompt,
          status: 'fail',
          reason: error instanceof Error ? error.message : 'Unknown error',
        });
        addLog('error', `Beauty Demo FAIL: ${error instanceof Error ? error.message : 'Unknown'}`);
      }
    }

    setBeautyDemoResults(results);
    setIsBeautyDemoRunning(false);

    const passCount = results.filter((r) => r.status === 'pass').length;
    addLog('info', `✨ Beauty Demo complete: ${passCount}/${results.length} passed`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isBuilding) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsBuilding(true);
    setBuildPlanPreview(null);

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

      // Log brand resolution
      if (result.meta?.brandName) {
        const brandSource =
          result.meta.brandSource === 'default'
            ? 'TeamMAE Default'
            : result.meta.brandSource === 'user-explicit'
            ? 'User Selected'
            : 'Detected from Prompt';
        addLog('info', `Brand: ${result.meta.brandName} (${brandSource})`);
        addLog('info', `Style: ${result.meta.styleProfile || 'dark-saas'}`);

        if (result.meta.brandCompliant === false) {
          addLog('warn', 'Brand compliance: FAILED');
          if (result.meta.brandViolations && result.meta.brandViolations.length > 0) {
            result.meta.brandViolations.forEach((violation: string) => {
              addLog('warn', `Brand violation: ${violation}`);
            });
          }
        } else {
          addLog('info', 'Brand compliance: PASSED');
        }
      }

      // Show build plan if available
      if (result.meta?.buildPlan) {
        const plan = result.meta.buildPlan;
        setBuildPlanPreview({
          type: plan.type,
          pages: plan.pages || [],
          layout: plan.layout || [],
          components: plan.components || [],
          styleProfile: plan.styleProfile || 'light-saas',
          explanation: result.meta.planExplanation || '',
        });
        addLog('info', `Build Plan: ${plan.components.length} components planned`);
      }

      addLog('info', `Received ${result.files?.length || 0} files`);

      if (result.warnings && result.warnings.length > 0) {
        result.warnings.forEach((warning: string) => {
          addLog('warn', warning);
        });
      }

      // Show build explanation if available
      let assistantContent = result.summary || 'Build complete';
      if (result.meta?.buildExplanation) {
        assistantContent = result.meta.buildExplanation;
      }

      // Add brand information (MANDATORY)
      if (result.meta?.brandName) {
        const brandSource =
          result.meta.brandSource === 'default'
            ? 'TeamMAE Default'
            : result.meta.brandSource === 'user-explicit'
            ? 'User Selected'
            : 'Detected from Prompt';

        assistantContent += `\n\nBrand: ${result.meta.brandName} (${brandSource})`;
        assistantContent += `\nStyle: ${result.meta.styleProfile || 'dark-saas'}`;

        if (result.meta.brandCompliant === false) {
          assistantContent += `\n⚠️ Brand compliance: FAILED`;
          if (result.meta.brandViolations && result.meta.brandViolations.length > 0) {
            assistantContent += `\nViolations: ${result.meta.brandViolations.join(', ')}`;
          }
        } else {
          assistantContent += `\n✅ Brand compliance: PASSED`;
        }
      }

      // Add quality score info
      if (result.meta?.qualityScore !== undefined) {
        assistantContent += `\n\nQuality Score: ${result.meta.qualityScore}/100`;
        if (result.meta.attempts > 1) {
          assistantContent += ` (${result.meta.attempts} attempts)`;
        }
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (result.previewHtml) {
        setPreviewHtml(result.previewHtml);
        addLog('info', 'Preview generated successfully');
      }
    } catch (error) {
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSelectProject = (projectId: string) => {
    setCurrentProjectId(projectId);
    addLog('info', `Switched to project ${projectId}`);
  };

  const handleNewProject = async () => {
    if (!supabase) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const projectName = prompt('Enter project name:');
      if (!projectName) return;

      // Create project directly via Supabase
      const { data, error } = await supabase.from('projects').insert({
        user_id: user.id,
        name: projectName,
        type: 'web',
        description: 'Created from builder',
      }).select().single();

      if (error) throw error;

      setCurrentProjectId(data.id);
      addLog('info', `Created new project: ${projectName}`);
    } catch (error) {
      console.error('Error creating project:', error);
      addLog('error', 'Failed to create project');
    }
  };

  const handleSelectBuild = async (buildId: string) => {
    if (!supabase) return;

    try {
      // Load build details and files
      const { data: build, error: buildError } = await supabase
        .from('builds')
        .select('*')
        .eq('id', buildId)
        .single();

      if (buildError) throw buildError;

      addLog('info', `Loaded build: ${build.prompt}`);

      // Load files for this build's project
      // For now, we'll just log - full file restoration could be added
      setMessages([
        {
          role: 'user',
          content: build.prompt || 'Previous build',
          timestamp: new Date(build.started_at),
        },
        {
          role: 'assistant',
          content: build.summary || 'Build completed',
          timestamp: new Date(build.completed_at || build.started_at),
        },
      ]);
    } catch (error) {
      console.error('Error loading build:', error);
      addLog('error', 'Failed to load build');
    }
  };

  return (
    <div className="flex h-[calc(100vh-73px)]">
      {/* Left Pane: Chat */}
      <div className="w-1/2 flex flex-col border-r border-[#2a2a3e] bg-[#0a0a0f]">
        <ProjectSelector
          currentProjectId={currentProjectId}
          onSelectProject={handleSelectProject}
          onNewProject={handleNewProject}
        />
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-[#a0a0b0] mt-8">
              <p className="text-lg font-mono font-medium text-[#f0f0f5]">Start building with MAE</p>
              <p className="text-sm mt-2">
                Describe the app you want to create and MAE will build it for you
              </p>
              <div className="mt-6 text-left max-w-md mx-auto space-y-2">
                <p className="text-xs font-mono font-semibold text-[#a0a0b0] uppercase tracking-wider">Try asking:</p>
                <button
                  onClick={() => setInput('Build a landing page with hero section and features')}
                  className="block w-full text-left px-4 py-3 text-sm bg-[#12121a] hover:bg-[#1a1a24] border border-[#2a2a3e] hover:border-[#6366f1]/50 rounded-lg text-[#a0a0b0] hover:text-[#f0f0f5] transition-all"
                >
                  Build a landing page with hero section and features
                </button>
                <button
                  onClick={() => setInput('Create a todo app with add, delete, and complete tasks')}
                  className="block w-full text-left px-4 py-3 text-sm bg-[#12121a] hover:bg-[#1a1a24] border border-[#2a2a3e] hover:border-[#6366f1]/50 rounded-lg text-[#a0a0b0] hover:text-[#f0f0f5] transition-all"
                >
                  Create a todo app with add, delete, and complete tasks
                </button>
                <button
                  onClick={() => setInput('Build a dashboard with stats cards and a chart')}
                  className="block w-full text-left px-4 py-3 text-sm bg-[#12121a] hover:bg-[#1a1a24] border border-[#2a2a3e] hover:border-[#6366f1]/50 rounded-lg text-[#a0a0b0] hover:text-[#f0f0f5] transition-all"
                >
                  Build a dashboard with stats cards and a chart
                </button>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-[#6366f1] to-[#7c3aed] text-white'
                      : 'bg-[#12121a] border border-[#2a2a3e] text-[#f0f0f5]'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.role === 'user' ? 'text-white/60' : 'text-[#666]'
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
          {isBuilding && (
            <div className="flex justify-start">
              <div className="bg-[#12121a] border border-[#2a2a3e] rounded-xl px-4 py-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-[#6366f1] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#6366f1] rounded-full animate-bounce" style={{animationDelay: '100ms'}}></div>
                  <div className="w-2 h-2 bg-[#6366f1] rounded-full animate-bounce" style={{animationDelay: '200ms'}}></div>
                  <span className="text-sm text-[#a0a0b0] ml-2">MAE is building...</span>
                </div>
              </div>
            </div>
          )}
          {buildPlanPreview && (
            <div className="flex justify-start">
              <div className="max-w-[80%] bg-[#6366f1]/10 border border-[#6366f1]/30 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[#6366f1] font-mono font-semibold text-sm">Build Plan</span>
                </div>
                <div className="text-xs text-[#a0a0b0] space-y-1">
                  <div><span className="font-medium text-[#f0f0f5]">Type:</span> {buildPlanPreview.type}</div>
                  <div><span className="font-medium text-[#f0f0f5]">Style:</span> {buildPlanPreview.styleProfile}</div>
                  <div><span className="font-medium text-[#f0f0f5]">Components:</span> {buildPlanPreview.components.length} ({buildPlanPreview.components.slice(0, 3).join(', ')}...)</div>
                  <div><span className="font-medium text-[#f0f0f5]">Layout:</span> {buildPlanPreview.layout.join(' → ')}</div>
                </div>
                <p className="text-xs text-[#666] mt-2 italic whitespace-pre-wrap">{buildPlanPreview.explanation}</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <BuildHistory projectId={currentProjectId} onSelectBuild={handleSelectBuild} />

        {/* Input Area */}
        <div className="border-t border-[#2a2a3e] p-4 bg-[#12121a]">
          <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe what you want to build..."
              className="w-full px-4 py-3 bg-[#1a1a24] border border-[#2a2a3e] rounded-xl text-[#f0f0f5] placeholder-[#555] focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent resize-none transition-all"
              rows={3}
              disabled={isBuilding}
            />
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowLogs(!showLogs)}
                  className="px-3 py-1.5 text-xs font-mono text-[#a0a0b0] hover:text-[#f0f0f5] hover:bg-[#1a1a24] rounded-lg transition-colors"
                >
                  {showLogs ? 'Hide' : 'Show'} Logs ({logs.length})
                </button>
                <button
                  type="button"
                  onClick={runDemo}
                  disabled={isDemoRunning || isBuilding || isBeautyDemoRunning}
                  className="px-3 py-1.5 text-xs font-mono bg-[#7c3aed] text-white hover:bg-[#7c3aed]/80 disabled:bg-[#2a2a3e] disabled:text-[#555] disabled:cursor-not-allowed rounded-lg font-medium transition-all"
                >
                  {isDemoRunning ? 'Running...' : 'Demo'}
                </button>
                <button
                  type="button"
                  onClick={runBeautyDemo}
                  disabled={isBeautyDemoRunning || isBuilding || isDemoRunning}
                  className="px-3 py-1.5 text-xs font-mono bg-pink-600 text-white hover:bg-pink-600/80 disabled:bg-[#2a2a3e] disabled:text-[#555] disabled:cursor-not-allowed rounded-lg font-medium transition-all"
                >
                  {isBeautyDemoRunning ? 'Running...' : 'Beauty'}
                </button>
              </div>
              <button
                type="submit"
                disabled={!input.trim() || isBuilding || isDemoRunning}
                className="px-5 py-2 bg-white text-[#0a0a0f] rounded-lg font-mono font-medium text-xs uppercase tracking-wider hover:bg-[#f0f0f5] hover:-translate-y-0.5 disabled:bg-[#2a2a3e] disabled:text-[#555] disabled:cursor-not-allowed disabled:transform-none transition-all"
              >
                {isBuilding ? 'Building...' : 'Build'}
              </button>
            </div>
            {demoResults.length > 0 && (
              <div className="mt-2 p-3 bg-[#1a1a24] border border-[#2a2a3e] rounded-xl space-y-1">
                <p className="text-xs font-mono font-semibold text-[#a0a0b0] mb-2 uppercase tracking-wider">Demo Results:</p>
                {demoResults.map((result, idx) => (
                  <div key={idx} className="text-xs flex items-start gap-2">
                    <span className={result.status === 'pass' ? 'text-green-400' : 'text-red-400'}>
                      {result.status === 'pass' ? '✓' : '✗'}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-[#f0f0f5]">{result.prompt}</p>
                      {result.reason && (
                        <p className="text-red-400 mt-0.5">{result.reason}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {beautyDemoResults.length > 0 && (
              <div className="mt-2 p-3 bg-pink-500/10 border border-pink-500/30 rounded-xl space-y-1">
                <p className="text-xs font-mono font-semibold text-pink-400 mb-2 uppercase tracking-wider">Beauty Demo Results:</p>
                {beautyDemoResults.map((result, idx) => (
                  <div key={idx} className="text-xs flex items-start gap-2">
                    <span className={result.status === 'pass' ? 'text-green-400' : 'text-red-400'}>
                      {result.status === 'pass' ? '✓' : '✗'}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-[#f0f0f5]">{result.prompt}</p>
                      {result.reason && (
                        <p className="text-red-400 mt-0.5">{result.reason}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Right Pane: Preview */}
      <div className="w-1/2 bg-[#12121a]">
        <PreviewPane html={previewHtml} />
      </div>

      {/* Logs Drawer */}
      {showLogs && <LogsDrawer logs={logs} onClose={() => setShowLogs(false)} />}
    </div>
  );
}
