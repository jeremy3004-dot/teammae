import { supabase } from '../supabase';
import type { Project, CreateProjectRequest } from '@teammae/types';

export class ProjectsClient {
  async create(userId: string, data: CreateProjectRequest): Promise<Project> {
    const { data: project, error } = await supabase
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
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (error) throw error;
    return data as Project;
  }

  async list(userId: string): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Project[];
  }

  async update(projectId: string, updates: Partial<Project>): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single();

    if (error) throw error;
    return data as Project;
  }

  async delete(projectId: string): Promise<void> {
    const { error } = await supabase
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

export const projectsClient = new ProjectsClient();
