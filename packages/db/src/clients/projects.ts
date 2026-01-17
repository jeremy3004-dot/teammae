import { getSupabase } from '../supabase';
import type { Project, CreateProjectRequest } from '@teammae/types';

export class ProjectsClient {
  async create(userId: string, data: CreateProjectRequest): Promise<Project> {
    const { data: project, error } = await getSupabase()
      .from('projects')
      .insert({
        user_id: userId,
        name: data.name,
        description: data.description,
        type: data.type,
        template_id: data.template_id,
        metadata: {},
      })
      .select()
      .single();

    if (error) throw error;
    return project as Project;
  }

  async get(projectId: string): Promise<Project | null> {
    const { data, error } = await getSupabase()
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (error) throw error;
    return data as Project;
  }

  async list(userId: string): Promise<Project[]> {
    const { data, error } = await getSupabase()
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false});

    if (error) throw error;
    return (data || []) as Project[];
  }

  async update(projectId: string, updates: Partial<Project>): Promise<Project> {
    const { data, error } = await getSupabase()
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single();

    if (error) throw error;
    return data as Project;
  }

  async delete(projectId: string): Promise<void> {
    const { error } = await getSupabase()
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) throw error;
  }

  async getOrCreateDefault(userId: string): Promise<Project> {
    // Try to get user's most recent project
    const projects = await this.list(userId);
    if (projects.length > 0) {
      return projects[0];
    }

    // Create a default project
    return this.create(userId, {
      name: 'My First Project',
      description: 'Default project created automatically',
      type: 'web',
    });
  }
}

// Lazy initialization to avoid calling getSupabase() at module load time
let _projectsClient: ProjectsClient | null = null;
export const projectsClient = new Proxy({} as ProjectsClient, {
  get(_target, prop) {
    if (!_projectsClient) {
      _projectsClient = new ProjectsClient();
    }
    return (_projectsClient as any)[prop];
  }
});
