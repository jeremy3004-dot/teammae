import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface Project {
  id: string;
  name: string;
  type: string;
  description: string;
  updated_at: string;
}

export function Home() {
  const [prompt, setPrompt] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuild = async () => {
    if (!prompt.trim()) return;

    // Navigate to builder with the prompt
    navigate('/builder', { state: { initialPrompt: prompt } });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleBuild();
    }
  };

  const handleProjectClick = (projectId: string) => {
    navigate('/builder', { state: { projectId } });
  };

  return (
    <div className="min-h-[calc(100vh-73px)] bg-[#0a0a0f] flex flex-col items-center px-4 py-12">
      {/* MAE Mascot & Header */}
      <div className="flex flex-col items-center mb-8 animate-fade-in-down opacity-0">
        <div className="relative mb-6">
          {/* Status indicator */}
          <div className="absolute -top-2 -right-2 z-10">
            <div className="relative">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <div className="absolute inset-0 w-4 h-4 bg-green-500 rounded-full animate-ping opacity-75"></div>
            </div>
          </div>
          {/* Mascot image */}
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#2a2a3e] bg-[#12121a] animate-float">
            <img
              src="/images/mae-mascot.png"
              alt="MAE Mascot"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback if image doesn't exist
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement!.innerHTML = `
                  <div class="w-full h-full bg-gradient-to-br from-[#6366f1] to-[#7c3aed] flex items-center justify-center">
                    <span class="text-4xl font-bold text-white font-mono">M</span>
                  </div>
                `;
              }}
            />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-[#f0f0f5] font-mono tracking-wider mb-2">MAE</h1>
        <p className="text-lg text-[#a0a0b0] mb-4">Master AI Engineer</p>

        {/* Status badges */}
        <div className="flex items-center gap-3 text-xs text-[#666]">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#6366f1] rounded-full"></span>
            Fast by default
          </span>
          <span className="text-[#2a2a3e]">·</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#7c3aed] rounded-full"></span>
            Upgrades when needed
          </span>
        </div>
      </div>

      {/* Main Input Area */}
      <div className="w-full max-w-2xl mb-12 animate-fade-in-up opacity-0 delay-100">
        <div className="bg-[#12121a] border border-[#2a2a3e] rounded-2xl p-1 focus-within:border-[#6366f1] transition-colors">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe the app you want to build..."
            className="w-full px-5 py-4 bg-transparent text-[#f0f0f5] placeholder-[#555] focus:outline-none resize-none text-base"
            rows={4}
          />
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#2a2a3e]">
            <button
              onClick={() => navigate('/templates')}
              className="text-sm text-[#a0a0b0] hover:text-[#f0f0f5] transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              Browse Templates
            </button>
            <button
              onClick={handleBuild}
              disabled={!prompt.trim()}
              className="px-8 py-2.5 bg-white text-[#0a0a0f] rounded-xl font-mono font-semibold text-sm uppercase tracking-wider hover:bg-[#f0f0f5] hover:-translate-y-0.5 disabled:bg-[#2a2a3e] disabled:text-[#555] disabled:cursor-not-allowed disabled:transform-none transition-all"
            >
              Build
            </button>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="w-full max-w-4xl animate-fade-in-up opacity-0 delay-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-mono font-semibold text-[#a0a0b0] uppercase tracking-wider flex items-center gap-2">
            Your Projects
            {!loading && (
              <span className="text-xs text-[#555]">({projects.length})</span>
            )}
          </h2>
          <button
            onClick={() => navigate('/projects')}
            className="text-xs text-[#6366f1] hover:text-[#7c3aed] transition-colors font-medium"
          >
            View All →
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-[#12121a] border border-[#2a2a3e] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 bg-[#12121a] border border-[#2a2a3e] rounded-xl">
            <div className="w-12 h-12 bg-[#1a1a24] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-[#6366f1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <p className="text-sm text-[#a0a0b0] mb-1">No projects yet</p>
            <p className="text-xs text-[#555]">Describe your idea above to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => handleProjectClick(project.id)}
                className="text-left p-5 bg-[#12121a] border border-[#2a2a3e] rounded-xl hover:border-[#6366f1]/50 hover:-translate-y-1 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-[#f0f0f5] group-hover:text-white transition-colors truncate pr-2">
                    {project.name}
                  </h3>
                  <span className={`shrink-0 px-2 py-0.5 text-[10px] font-mono font-medium rounded uppercase tracking-wider ${
                    project.type === 'web'
                      ? 'bg-[#6366f1]/10 text-[#6366f1] border border-[#6366f1]/30'
                      : 'bg-[#7c3aed]/10 text-[#a78bfa] border border-[#7c3aed]/30'
                  }`}>
                    {project.type}
                  </span>
                </div>
                <p className="text-sm text-[#666] line-clamp-2 mb-3">
                  {project.description || 'No description'}
                </p>
                <p className="text-xs text-[#444]">
                  {new Date(project.updated_at).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
