import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface Project {
  id: string;
  name: string;
  type: string;
  created_at: string;
}

interface ProjectSelectorProps {
  currentProjectId: string | null;
  onSelectProject: (projectId: string) => void;
  onNewProject: () => void;
}

export function ProjectSelector({
  currentProjectId,
  onSelectProject,
  onNewProject,
}: ProjectSelectorProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      return;
    }

    loadProjects();
  }, []);

  const loadProjects = async () => {
    if (!supabase) return;

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('projects')
        .select('id, name, type, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProjects(data || []);

      // Auto-select first project if none selected
      if (!currentProjectId && data && data.length > 0) {
        onSelectProject(data[0].id);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentProject = projects.find((p) => p.id === currentProjectId);

  if (!isSupabaseConfigured) {
    return (
      <div className="p-3 bg-gray-100 text-sm text-gray-600">
        Mock Mode (No Database)
      </div>
    );
  }

  return (
    <div className="relative border-b border-gray-200 bg-white p-3">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-md border border-gray-200"
      >
        <div className="flex-1 text-left min-w-0">
          <p className="text-xs text-gray-500">Current Project</p>
          <p className="text-sm font-medium text-gray-900 truncate">
            {loading ? 'Loading...' : currentProject?.name || 'No project selected'}
          </p>
        </div>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${
            showDropdown ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          ></div>
          <div className="absolute left-3 right-3 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 max-h-[300px] overflow-y-auto">
            <div className="p-2">
              <button
                onClick={() => {
                  onNewProject();
                  setShowDropdown(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 rounded-md font-medium"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Project
              </button>
            </div>

            {projects.length > 0 && (
              <>
                <div className="border-t border-gray-200 my-1"></div>
                <div className="p-2 space-y-1">
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => {
                        onSelectProject(project.id);
                        setShowDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                        project.id === currentProjectId
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate">{project.name}</span>
                        <span className="text-xs text-gray-500 ml-2">{project.type}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
