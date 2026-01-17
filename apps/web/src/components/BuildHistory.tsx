import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface Build {
  id: string;
  prompt: string;
  summary: string | null;
  status: string;
  created_at: string;
  started_at: string;
}

interface BuildHistoryProps {
  projectId: string | null;
  onSelectBuild: (buildId: string) => void;
}

export function BuildHistory({ projectId, onSelectBuild }: BuildHistoryProps) {
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !projectId) {
      return;
    }

    loadBuilds();
  }, [projectId]);

  const loadBuilds = async () => {
    if (!supabase || !projectId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('builds')
        .select('id, prompt, summary, status, created_at, started_at')
        .eq('project_id', projectId)
        .order('started_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setBuilds(data || []);
    } catch (error) {
      console.error('Error loading builds:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isSupabaseConfigured) {
    return null;
  }

  if (!projectId) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">
        No project selected
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200 bg-gray-50 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Build History</h3>
        {builds.length > 0 && (
          <button
            onClick={loadBuilds}
            disabled={loading}
            className="text-xs text-blue-600 hover:text-blue-700 disabled:text-gray-400"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        )}
      </div>

      {loading && builds.length === 0 ? (
        <div className="text-center text-sm text-gray-500 py-4">Loading...</div>
      ) : builds.length === 0 ? (
        <div className="text-center text-sm text-gray-500 py-4">
          No builds yet. Start building to see history here.
        </div>
      ) : (
        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {builds.map((build) => (
            <button
              key={build.id}
              onClick={() => onSelectBuild(build.id)}
              className="w-full text-left p-2 rounded-md hover:bg-white border border-transparent hover:border-gray-200 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">
                    {build.prompt || 'Untitled build'}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(build.started_at).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    build.status === 'success'
                      ? 'bg-green-100 text-green-700'
                      : build.status === 'failed'
                      ? 'bg-red-100 text-red-700'
                      : build.status === 'building'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {build.status}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
