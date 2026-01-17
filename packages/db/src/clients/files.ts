import { getSupabase } from '../supabase';
import type { ProjectFile, FileType } from '@teammae/types';
import crypto from 'crypto';

export class FilesClient {
  async save(
    projectId: string,
    files: Array<{ path: string; content: string; file_type?: FileType }>
  ): Promise<ProjectFile[]> {
    const savedFiles: ProjectFile[] = [];

    for (const file of files) {
      const checksum = crypto.createHash('sha256').update(file.content).digest('hex');
      const sizeBytes = Buffer.byteLength(file.content, 'utf8');

      // Upsert file (insert or update if exists)
      const { data, error } = await getSupabase()
        .from('files')
        .upsert(
          {
            project_id: projectId,
            path: file.path,
            content: file.content,
            file_type: file.file_type || this.inferFileType(file.path),
            size_bytes: sizeBytes,
            checksum,
            version: 1, // Would increment in real implementation
          },
          {
            onConflict: 'project_id,path',
          }
        )
        .select()
        .single();

      if (error) throw error;
      savedFiles.push(data as ProjectFile);
    }

    return savedFiles;
  }

  async get(projectId: string, path: string): Promise<ProjectFile | null> {
    const { data, error } = await getSupabase()
      .from('files')
      .select('*')
      .eq('project_id', projectId)
      .eq('path', path)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
    return data as ProjectFile | null;
  }

  async list(projectId: string): Promise<ProjectFile[]> {
    const { data, error } = await getSupabase()
      .from('files')
      .select('*')
      .eq('project_id', projectId)
      .order('path', { ascending: true });

    if (error) throw error;
    return (data || []) as ProjectFile[];
  }

  async delete(projectId: string, path: string): Promise<void> {
    const { error } = await getSupabase()
      .from('files')
      .delete()
      .eq('project_id', projectId)
      .eq('path', path);

    if (error) throw error;
  }

  async deleteAll(projectId: string): Promise<void> {
    const { error } = await getSupabase()
      .from('files')
      .delete()
      .eq('project_id', projectId);

    if (error) throw error;
  }

  private inferFileType(path: string): FileType {
    const ext = path.split('.').pop()?.toLowerCase() || '';
    const fileName = path.split('/').pop()?.toLowerCase() || '';

    if (path.includes('/components/') || ext === 'tsx' || ext === 'jsx') {
      return 'component';
    }
    if (path.includes('/pages/') || fileName.includes('page')) {
      return 'page';
    }
    if (['json', 'yaml', 'yml', 'toml', 'env'].includes(ext)) {
      return 'config';
    }
    if (['css', 'scss', 'sass', 'less'].includes(ext)) {
      return 'style';
    }
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'webp'].includes(ext)) {
      return 'asset';
    }
    if (path.includes('/utils/') || path.includes('/lib/') || path.includes('/helpers/')) {
      return 'util';
    }

    return 'other';
  }
}

export const filesClient = new FilesClient();
