import { supabase } from './supabase';

const API_BASE_URL = import.meta.env.DEV
  ? 'http://localhost:3000/api'
  : '/api';

/**
 * Get the current auth token for API requests
 */
async function getAuthToken(): Promise<string | null> {
  if (!supabase) {
    return null;
  }
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
}

/**
 * Make an authenticated API request
 */
async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();

  if (!token) {
    throw new Error('Not authenticated');
  }

  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `API error: ${response.status}`);
  }

  return response.json();
}

// ============================================================================
// Projects API
// ============================================================================

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  type: 'web' | 'mobile';
  template_id?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  type: 'web' | 'mobile';
  template_id?: string;
}

export const projectsApi = {
  async list(): Promise<Project[]> {
    const data = await apiRequest<{ projects: Project[] }>('/projects');
    return data.projects;
  },

  async get(id: string): Promise<Project> {
    const data = await apiRequest<{ project: Project }>(`/projects/${id}`);
    return data.project;
  },

  async create(request: CreateProjectRequest): Promise<Project> {
    const data = await apiRequest<{ project: Project }>('/projects', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return data.project;
  },

  async update(id: string, updates: Partial<Project>): Promise<Project> {
    const data = await apiRequest<{ project: Project }>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return data.project;
  },

  async delete(id: string): Promise<void> {
    await apiRequest(`/projects/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// Files API
// ============================================================================

export interface ProjectFile {
  id: string;
  project_id: string;
  path: string;
  content: string;
  file_type: 'component' | 'page' | 'config' | 'asset' | 'util' | 'style' | 'other';
  size_bytes: number;
  checksum: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export const filesApi = {
  async list(projectId: string): Promise<ProjectFile[]> {
    const data = await apiRequest<{ files: ProjectFile[] }>(
      `/projects/${projectId}/files`
    );
    return data.files;
  },

  async save(
    projectId: string,
    files: Array<{ path: string; content: string; file_type?: string }>
  ): Promise<ProjectFile[]> {
    const data = await apiRequest<{ files: ProjectFile[] }>(
      `/projects/${projectId}/files`,
      {
        method: 'PUT',
        body: JSON.stringify({ files }),
      }
    );
    return data.files;
  },
};

// ============================================================================
// Builds API
// ============================================================================

export type BuildStatus = 'pending' | 'building' | 'success' | 'failed' | 'cancelled';

export interface Build {
  id: string;
  project_id: string;
  user_id: string;
  status: BuildStatus;
  trigger: 'manual' | 'auto' | 'api';
  prompt?: string;
  summary?: string;
  started_at: string;
  completed_at?: string;
  error_message?: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface BuildLog {
  id: string;
  build_id: string;
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface BuildResponse {
  buildId: string;
  projectId: string;
  filesGenerated: number;
  entryPoint?: string;
}

export const buildsApi = {
  async create(projectId: string, prompt: string): Promise<BuildResponse> {
    const data = await apiRequest<BuildResponse>(
      `/projects/${projectId}/build`,
      {
        method: 'POST',
        body: JSON.stringify({ prompt }),
      }
    );
    return data;
  },

  async getStatus(buildId: string): Promise<{ build: Build; logs: BuildLog[] }> {
    const data = await apiRequest<{ build: Build; logs: BuildLog[] }>(
      `/builds/${buildId}`
    );
    return data;
  },
};

// ============================================================================
// Health Check
// ============================================================================

export const healthApi = {
  async check(): Promise<{ status: string; timestamp: string; service: string }> {
    const data = await apiRequest<{
      status: string;
      timestamp: string;
      service: string;
    }>('/health');
    return data;
  },
};
