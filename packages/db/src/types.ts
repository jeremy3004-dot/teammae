// Supabase database type definitions
// Auto-generated types would go here in production

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          type: 'web' | 'mobile';
          template_id: string | null;
          metadata: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          type: 'web' | 'mobile';
          template_id?: string | null;
          metadata?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          type?: 'web' | 'mobile';
          template_id?: string | null;
          metadata?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
      };
      files: {
        Row: {
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
        };
        Insert: {
          id?: string;
          project_id: string;
          path: string;
          content: string;
          file_type?: 'component' | 'page' | 'config' | 'asset' | 'util' | 'style' | 'other';
          size_bytes: number;
          checksum: string;
          version?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          path?: string;
          content?: string;
          file_type?: 'component' | 'page' | 'config' | 'asset' | 'util' | 'style' | 'other';
          size_bytes?: number;
          checksum?: string;
          version?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      builds: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          status: 'pending' | 'building' | 'success' | 'failed' | 'cancelled';
          trigger: 'manual' | 'auto' | 'api';
          started_at: string;
          completed_at: string | null;
          error_message: string | null;
          metadata: Record<string, any>;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          status?: 'pending' | 'building' | 'success' | 'failed' | 'cancelled';
          trigger?: 'manual' | 'auto' | 'api';
          started_at?: string;
          completed_at?: string | null;
          error_message?: string | null;
          metadata?: Record<string, any>;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          user_id?: string;
          status?: 'pending' | 'building' | 'success' | 'failed' | 'cancelled';
          trigger?: 'manual' | 'auto' | 'api';
          started_at?: string;
          completed_at?: string | null;
          error_message?: string | null;
          metadata?: Record<string, any>;
          created_at?: string;
        };
      };
      build_artifacts: {
        Row: {
          id: string;
          build_id: string;
          artifact_type: 'preview_bundle' | 'ios_ipa' | 'android_apk' | 'android_aab' | 'source_zip';
          storage_path: string;
          size_bytes: number;
          url: string | null;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          build_id: string;
          artifact_type: 'preview_bundle' | 'ios_ipa' | 'android_apk' | 'android_aab' | 'source_zip';
          storage_path: string;
          size_bytes: number;
          url?: string | null;
          expires_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          build_id?: string;
          artifact_type?: 'preview_bundle' | 'ios_ipa' | 'android_apk' | 'android_aab' | 'source_zip';
          storage_path?: string;
          size_bytes?: number;
          url?: string | null;
          expires_at?: string | null;
          created_at?: string;
        };
      };
      build_logs: {
        Row: {
          id: string;
          build_id: string;
          timestamp: string;
          level: 'debug' | 'info' | 'warn' | 'error';
          message: string;
          metadata: Record<string, any> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          build_id: string;
          timestamp?: string;
          level: 'debug' | 'info' | 'warn' | 'error';
          message: string;
          metadata?: Record<string, any> | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          build_id?: string;
          timestamp?: string;
          level?: 'debug' | 'info' | 'warn' | 'error';
          message?: string;
          metadata?: Record<string, any> | null;
          created_at?: string;
        };
      };
      templates: {
        Row: {
          id: string;
          name: string;
          description: string;
          type: 'web' | 'mobile';
          preview_url: string | null;
          is_public: boolean;
          config: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          type: 'web' | 'mobile';
          preview_url?: string | null;
          is_public?: boolean;
          config?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          type?: 'web' | 'mobile';
          preview_url?: string | null;
          is_public?: boolean;
          config?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
      };
      integrations: {
        Row: {
          id: string;
          user_id: string;
          provider: 'github' | 'vercel' | 'eas' | 'supabase';
          credentials: Record<string, any>;
          metadata: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          provider: 'github' | 'vercel' | 'eas' | 'supabase';
          credentials?: Record<string, any>;
          metadata?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          provider?: 'github' | 'vercel' | 'eas' | 'supabase';
          credentials?: Record<string, any>;
          metadata?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
