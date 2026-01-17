import { getSupabase } from '../supabase';
import type { Template, ProjectType } from '@teammae/types';

export class TemplatesClient {
  async list(type?: ProjectType): Promise<Template[]> {
    let query = getSupabase()
      .from('templates')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []) as Template[];
  }

  async get(templateId: string): Promise<Template | null> {
    const { data, error } = await getSupabase()
      .from('templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as Template | null;
  }
}

// Lazy initialization to avoid calling getSupabase() at module load time
let _templatesClient: TemplatesClient | null = null;
export const templatesClient = new Proxy({} as TemplatesClient, {
  get(_target, prop) {
    if (!_templatesClient) {
      _templatesClient = new TemplatesClient();
    }
    return (_templatesClient as any)[prop];
  }
});
