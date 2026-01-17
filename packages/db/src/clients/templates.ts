import { supabase } from '../index';
import type { Template, ProjectType } from '@teammae/types';

export class TemplatesClient {
  async list(type?: ProjectType): Promise<Template[]> {
    let query = supabase
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
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as Template | null;
  }
}

export const templatesClient = new TemplatesClient();
