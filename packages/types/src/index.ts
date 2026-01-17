// ============================================================================
// Core Entity Types
// ============================================================================

export type ProjectType = 'web' | 'mobile';
export type BuildStatus = 'pending' | 'building' | 'success' | 'failed' | 'cancelled';
export type FileType = 'component' | 'page' | 'config' | 'asset' | 'util' | 'style' | 'other';

// ============================================================================
// Database Entities
// ============================================================================

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  type: ProjectType;
  template_id?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ProjectFile {
  id: string;
  project_id: string;
  path: string;
  content: string;
  file_type: FileType;
  size_bytes: number;
  checksum: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface Build {
  id: string;
  project_id: string;
  user_id: string;
  status: BuildStatus;
  trigger: 'manual' | 'auto' | 'api';
  started_at: string;
  completed_at?: string;
  error_message?: string;
  metadata: Record<string, any>;
}

export interface BuildArtifact {
  id: string;
  build_id: string;
  artifact_type: 'preview_bundle' | 'ios_ipa' | 'android_apk' | 'android_aab' | 'source_zip';
  storage_path: string;
  size_bytes: number;
  url?: string;
  expires_at?: string;
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

export interface Template {
  id: string;
  name: string;
  description: string;
  type: ProjectType;
  preview_url?: string;
  is_public: boolean;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Integration {
  id: string;
  user_id: string;
  provider: 'github' | 'vercel' | 'eas' | 'supabase';
  credentials: Record<string, any>;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// MAE Output Contract (STRICT)
// ============================================================================

export interface MAEFile {
  path: string;
  content: string;
  type?: FileType;
}

export interface MAEOutput {
  summary: string;
  files: MAEFile[];
  warnings?: string[];
  meta?: {
    model?: string;
    tokens?: number;
    duration_ms?: number;
    [key: string]: any;
  };
}

// ============================================================================
// Build Pipeline Contracts
// ============================================================================

export interface BuildContext {
  project_id: string;
  project_type: ProjectType;
  files: ProjectFile[];
  trigger: Build['trigger'];
  user_id: string;
}

export interface BuildResult {
  status: BuildStatus;
  artifacts: Array<{
    type: BuildArtifact['artifact_type'];
    path: string;
    url?: string;
  }>;
  logs: Array<{
    level: BuildLog['level'];
    message: string;
    timestamp: string;
  }>;
  error?: string;
}

export interface WebBuildConfig {
  entry_point: string;
  output_dir: string;
  base_url?: string;
  env_vars?: Record<string, string>;
}

export interface MobileBuildConfig {
  platform: 'ios' | 'android' | 'both';
  build_profile: 'development' | 'preview' | 'production';
  eas_config?: Record<string, any>;
}

// ============================================================================
// Preview Contracts
// ============================================================================

export interface WebPreviewBundle {
  entry_html: string;
  files: Array<{
    path: string;
    content: string;
  }>;
  assets?: Array<{
    path: string;
    url: string;
  }>;
}

export interface MobilePreviewConfig {
  expo_snack_url?: string;
  qr_code?: string;
  deep_link?: string;
}

// ============================================================================
// Logging & Telemetry
// ============================================================================

export interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: string;
  context?: string;
  metadata?: Record<string, any>;
}

export interface TelemetryEvent {
  event_name: string;
  user_id?: string;
  project_id?: string;
  properties?: Record<string, any>;
  timestamp: string;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface CreateProjectRequest {
  name: string;
  description?: string;
  type: ProjectType;
  template_id?: string;
}

export interface CreateProjectResponse {
  project: Project;
}

export interface SaveFilesRequest {
  project_id: string;
  files: Array<{
    path: string;
    content: string;
    file_type?: FileType;
  }>;
}

export interface SaveFilesResponse {
  saved: ProjectFile[];
}

export interface ListFilesRequest {
  project_id: string;
}

export interface ListFilesResponse {
  files: ProjectFile[];
}

export interface TriggerBuildRequest {
  project_id: string;
  trigger?: Build['trigger'];
}

export interface TriggerBuildResponse {
  build: Build;
}
