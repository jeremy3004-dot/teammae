/**
 * MAE Types for Edge Functions (Deno-compatible)
 */

export type FileType = 'component' | 'page' | 'config' | 'asset' | 'util' | 'style' | 'other';

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
    qualityScore?: number;
    componentCount?: number;
    designSystemCompliance?: number;
    buildPlan?: BuildPlan;
    planExplanation?: string;
    buildExplanation?: string;
    attempts?: number;
    brandName?: string;
    brandSource?: string;
    styleProfile?: string;
    brandCompliant?: boolean;
    brandViolations?: string[];
    [key: string]: unknown;
  };
}

export interface BuildPlan {
  type: 'web' | 'mobile';
  pages: string[];
  layout: string[];
  components: string[];
  styleProfile: 'light-saas' | 'dark-saas' | 'colorful' | 'minimal' | 'custom';
  stateUsage: boolean;
  forms: boolean;
  backendRequired: boolean;
  dataFlow?: string;
  routing?: boolean;
}

export interface BuildRequest {
  prompt: string;
  projectId?: string;
  styleProfile?: string | null;
  existingFiles?: MAEFile[];
}

export interface BuildResponse extends MAEOutput {
  previewHtml?: string;
}
