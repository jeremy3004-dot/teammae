import type { BuildContext, BuildResult, WebBuildConfig, MobileBuildConfig } from '@teammae/types';

/**
 * Build Pipeline Contract
 * All builders must implement this interface
 */
export interface Builder {
  build(context: BuildContext): Promise<BuildResult>;
  validate(context: BuildContext): Promise<{ valid: boolean; errors: string[] }>;
}

/**
 * Web Builder Contract
 */
export interface WebBuilder extends Builder {
  generatePreview(context: BuildContext): Promise<{
    html: string;
    bundle: { path: string; content: string }[];
  }>;

  buildConfig(context: BuildContext): WebBuildConfig;
}

/**
 * Mobile Builder Contract
 */
export interface MobileBuilder extends Builder {
  generateEASConfig(context: BuildContext): MobileBuildConfig;

  submitToEAS(context: BuildContext, config: MobileBuildConfig): Promise<{
    buildId: string;
    url: string;
  }>;
}
