import { useState, useEffect } from 'react';
import type { Project, ProjectFile } from '@teammae/types';
import { projectsClient, filesClient } from '@teammae/db';

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Projects</h2>
        <button
          onClick={createProject}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Create Project
        </button>
      </div>

      {loading && <p className="text-gray-600">Loading...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <button
            key={project.id}
            onClick={() => selectProject(project)}
            className={`p-4 border rounded-lg text-left hover:border-blue-500 transition-colors ${
              selectedProject?.id === project.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
            }`}
          >
            <h3 className="font-semibold text-gray-900">{project.name}</h3>
            <p className="text-sm text-gray-600">{project.description}</p>
            <span className="inline-block mt-2 px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800">
              {project.type}
            </span>
          </button>
        ))}
      </div>

      {selectedProject && (
        <div className="mt-8 border-t pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Files for {selectedProject.name}
            </h3>
            <button
              onClick={saveFile}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Add File
            </button>
          </div>

          <div className="bg-white border rounded-lg overflow-hidden">
            {files.length === 0 ? (
              <p className="p-4 text-gray-600">No files yet</p>
            ) : (
              <ul className="divide-y">
                {files.map((file) => (
                  <li key={file.id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-mono text-sm text-gray-900">{file.path}</p>
                        <p className="text-xs text-gray-500">
                          {file.size_bytes} bytes • v{file.version}
                        </p>
                      </div>
                      <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded">
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
  );
}
