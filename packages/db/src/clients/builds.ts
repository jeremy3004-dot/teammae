import { getSupabase } from '../supabase';
import type { Build, BuildLog, BuildArtifact, BuildStatus } from '@teammae/types';

export class BuildsClient {
  async create(
    projectId: string,
    userId: string,
    options: {
      trigger?: 'manual' | 'auto' | 'api';
      prompt?: string;
      summary?: string;
    } = {}
  ): Promise<Build> {
    const { data, error } = await getSupabase()
      .from('builds')
      .insert({
        project_id: projectId,
        user_id: userId,
        status: 'pending',
        trigger: options.trigger || 'manual',
        prompt: options.prompt || null,
        summary: options.summary || null,
        metadata: {},
      })
      .select()
      .single();

    if (error) throw error;
    return data as Build;
  }

  async get(buildId: string): Promise<Build | null> {
    const { data, error } = await getSupabase()
      .from('builds')
      .select('*')
      .eq('id', buildId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as Build | null;
  }

  async list(projectId: string, limit = 50): Promise<Build[]> {
    const { data, error } = await getSupabase()
      .from('builds')
      .select('*')
      .eq('project_id', projectId)
      .order('started_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []) as Build[];
  }

  async updateStatus(
    buildId: string,
    status: BuildStatus,
    errorMessage?: string
  ): Promise<Build> {
    const updates: any = {
      status,
      error_message: errorMessage,
    };

    if (status === 'success' || status === 'failed' || status === 'cancelled') {
      updates.completed_at = new Date().toISOString();
    }

    const { data, error } = await getSupabase()
      .from('builds')
      .update(updates)
      .eq('id', buildId)
      .select()
      .single();

    if (error) throw error;
    return data as Build;
  }

  async addLog(
    buildId: string,
    level: BuildLog['level'],
    message: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const { error } = await getSupabase().from('build_logs').insert({
      build_id: buildId,
      level,
      message,
      metadata: metadata || null,
    });

    if (error) throw error;
  }

  async getLogs(buildId: string): Promise<BuildLog[]> {
    const { data, error } = await getSupabase()
      .from('build_logs')
      .select('*')
      .eq('build_id', buildId)
      .order('timestamp', { ascending: true });

    if (error) throw error;
    return (data || []) as BuildLog[];
  }

  async addArtifact(
    buildId: string,
    artifactType: BuildArtifact['artifact_type'],
    storagePath: string,
    sizeBytes: number,
    url?: string
  ): Promise<BuildArtifact> {
    const { data, error } = await getSupabase()
      .from('build_artifacts')
      .insert({
        build_id: buildId,
        artifact_type: artifactType,
        storage_path: storagePath,
        size_bytes: sizeBytes,
        url: url || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data as BuildArtifact;
  }

  async getArtifacts(buildId: string): Promise<BuildArtifact[]> {
    const { data, error } = await getSupabase()
      .from('build_artifacts')
      .select('*')
      .eq('build_id', buildId);

    if (error) throw error;
    return (data || []) as BuildArtifact[];
  }
}

export const buildsClient = new BuildsClient();
