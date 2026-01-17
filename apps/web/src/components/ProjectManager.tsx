import { useState, useEffect } from 'react';
import type { Project, ProjectFile } from '@teammae/types';

// Stubbed clients - db package not available in browser build
// In production, these would call the backend API
const projectsClient = {
  list: async (_userId: string): Promise<Project[]> => [],
  create: async (_userId: string, data: { name: string; type: string; description?: string }): Promise<Project> => ({
    id: crypto.randomUUID(),
    user_id: _userId,
    name: data.name,
    type: data.type as 'web' | 'mobile',
    description: data.description || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    metadata: {},
  }),
};

const filesClient = {
  list: async (_projectId: string): Promise<ProjectFile[]> => [],
  save: async (_projectId: string, files: Array<{ path: string; content: string }>): Promise<ProjectFile[]> =>
    files.map(f => ({
      id: crypto.randomUUID(),
      project_id: _projectId,
      path: f.path,
      content: f.content,
      file_type: 'other' as const,
      size_bytes: f.content.length,
      checksum: '',
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })),
};

export function ProjectManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock user ID (in production, this comes from auth)
  const userId = 'test-user-id';

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await projectsClient.list(userId);
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async () => {
    const name = prompt('Enter project name:');
    if (!name) return;

    const type = confirm('Web project? (Cancel for Mobile)') ? 'web' : 'mobile';

    setLoading(true);
    try {
      const project = await projectsClient.create(userId, {
        name,
        type,
        description: `A ${type} project built with TeamMAE`,
      });

      setProjects([project, ...projects]);
      setSelectedProject(project);
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const loadFiles = async (projectId: string) => {
    setLoading(true);
    try {
      const data = await filesClient.list(projectId);
      setFiles(data);
    } catch (error) {
      console.error('Failed to load files:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveFile = async () => {
    if (!selectedProject) return;

    const path = prompt('Enter file path (e.g., src/App.tsx):');
    if (!path) return;

    const content = prompt('Enter file content:') || '// Empty file';

    setLoading(true);
    try {
      const saved = await filesClient.save(selectedProject.id, [{ path, content }]);
      setFiles([...files.filter((f) => f.path !== path), ...saved]);
      alert('File saved!');
    } catch (error) {
      console.error('Failed to save file:', error);
      alert('Failed to save file');
    } finally {
      setLoading(false);
    }
  };

  const selectProject = (project: Project) => {
    setSelectedProject(project);
    loadFiles(project.id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="font-mono text-lg font-semibold text-[#f0f0f5] uppercase tracking-wider">Projects</h2>
          <button
            onClick={createProject}
            disabled={loading}
            className="px-5 py-2.5 bg-white text-[#0a0a0f] rounded-lg font-mono font-medium text-xs uppercase tracking-wider hover:bg-[#f0f0f5] hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none transition-all"
          >
            Create Project
          </button>
        </div>

        {loading && <p className="text-[#a0a0b0]">Loading...</p>}

        {projects.length === 0 && !loading && (
          <div className="text-center py-16 bg-[#12121a] border border-[#2a2a3e] rounded-xl">
            <div className="w-16 h-16 bg-[#1a1a24] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#6366f1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="font-mono text-sm font-semibold text-[#f0f0f5] uppercase tracking-wider mb-2">No Projects Yet</h3>
            <p className="text-sm text-[#a0a0b0] mb-6">Create your first project to get started with MAE</p>
            <button
              onClick={createProject}
              className="px-6 py-3 bg-gradient-to-r from-[#6366f1] to-[#7c3aed] text-white rounded-lg font-mono font-medium text-xs uppercase tracking-wider hover:opacity-90 transition-opacity"
            >
              Create Your First Project
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => selectProject(project)}
              className={`p-5 border rounded-xl text-left transition-all duration-300 hover:-translate-y-1 ${
                selectedProject?.id === project.id
                  ? 'border-[#6366f1] bg-[#6366f1]/10'
                  : 'border-[#2a2a3e] bg-[#12121a] hover:border-[#6366f1]/50'
              }`}
            >
              <h3 className="font-semibold text-[#f0f0f5] mb-1">{project.name}</h3>
              <p className="text-sm text-[#a0a0b0] mb-3">{project.description}</p>
              <span className={`inline-block px-2.5 py-1 text-xs font-mono font-medium rounded-full uppercase tracking-wider ${
                project.type === 'web'
                  ? 'bg-[#6366f1]/10 text-[#6366f1] border border-[#6366f1]/30'
                  : 'bg-[#7c3aed]/10 text-[#a78bfa] border border-[#7c3aed]/30'
              }`}>
                {project.type}
              </span>
            </button>
          ))}
        </div>

        {selectedProject && (
          <div className="mt-8 border-t border-[#2a2a3e] pt-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-mono text-base font-semibold text-[#f0f0f5] uppercase tracking-wider">
                Files for {selectedProject.name}
              </h3>
              <button
                onClick={saveFile}
                disabled={loading}
                className="px-4 py-2 bg-[#1a1a24] text-[#f0f0f5] border border-[#2a2a3e] rounded-lg font-mono font-medium text-xs uppercase tracking-wider hover:bg-[#2a2a3e] hover:border-[#6366f1] disabled:opacity-50 transition-all"
              >
                Add File
              </button>
            </div>

            <div className="bg-[#12121a] border border-[#2a2a3e] rounded-xl overflow-hidden">
              {files.length === 0 ? (
                <p className="p-6 text-[#a0a0b0] text-center">No files yet</p>
              ) : (
                <ul className="divide-y divide-[#2a2a3e]">
                  {files.map((file) => (
                    <li key={file.id} className="p-4 hover:bg-[#1a1a24] transition-colors">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-mono text-sm text-[#f0f0f5]">{file.path}</p>
                          <p className="text-xs text-[#666] mt-1">
                            {file.size_bytes} bytes • v{file.version}
                          </p>
                        </div>
                        <span className="text-xs font-mono font-medium px-2.5 py-1 bg-[#1a1a24] border border-[#2a2a3e] rounded-full text-[#a0a0b0]">
                          {file.file_type}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
