import type { BuildContext, BuildResult, MobileBuildConfig } from '@teammae/types';
import type { MobileBuilder } from './contracts';
import { Logger } from '@teammae/mae-core';

/**
 * Mobile Builder (Emergent-style)
 * Builds React Native + Expo + EAS mobile apps
 */
export class MobileBuilderImpl implements MobileBuilder {
  private logger: Logger;

  constructor() {
    this.logger = new Logger('MobileBuilder');
  }

  async build(context: BuildContext): Promise<BuildResult> {
    this.logger.info('Starting mobile build', { projectId: context.project_id });

    const startTime = Date.now();
    const logs: BuildResult['logs'] = [];

    try {
      // Validate project structure
      const validation = await this.validate(context);
      if (!validation.valid) {
        return {
          status: 'failed',
          artifacts: [],
          logs: validation.errors.map((err) => ({
            level: 'error',
            message: err,
            timestamp: new Date().toISOString(),
          })),
          error: 'Validation failed',
        };
      }

      logs.push({
        level: 'info',
        message: 'Validation passed',
        timestamp: new Date().toISOString(),
      });

      // Generate EAS config
      const easConfig = this.generateEASConfig(context);

      logs.push({
        level: 'info',
        message: 'EAS configuration generated',
        timestamp: new Date().toISOString(),
      });

      // In production, this would submit to EAS Build
      const easSubmission = await this.submitToEAS(context, easConfig);

      logs.push({
        level: 'info',
        message: `Submitted to EAS Build: ${easSubmission.buildId}`,
        timestamp: new Date().toISOString(),
      });

      const duration = Date.now() - startTime;
      logs.push({
        level: 'info',
        message: `Build initiated in ${duration}ms`,
        timestamp: new Date().toISOString(),
      });

      return {
        status: 'success',
        artifacts: [
          {
            type: 'preview_bundle',
            path: `/mobile/${context.project_id}/expo-snack`,
            url: easSubmission.url,
          },
        ],
        logs,
      };
    } catch (error: any) {
      this.logger.error('Build failed', { error: error.message });

      return {
        status: 'failed',
        artifacts: [],
        logs: [
          {
            level: 'error',
            message: error.message,
            timestamp: new Date().toISOString(),
          },
        ],
        error: error.message,
      };
    }
  }

  async validate(context: BuildContext): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check for required files
    const requiredFiles = ['package.json', 'app.json', 'App.tsx'];
    for (const required of requiredFiles) {
      const found = context.files.some((f) => f.path === required);
      if (!found) {
        errors.push(`Missing required file: ${required}`);
      }
    }

    // Validate app.json
    const appJson = context.files.find((f) => f.path === 'app.json');
    if (appJson) {
      try {
        const config = JSON.parse(appJson.content);
        if (!config.expo) {
          errors.push('app.json must contain expo configuration');
        }
      } catch {
        errors.push('app.json is not valid JSON');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  generateEASConfig(context: BuildContext): MobileBuildConfig {
    return {
      platform: 'both',
      build_profile: 'preview',
      eas_config: {
        projectId: context.project_id,
        owner: context.user_id,
      },
    };
  }

  async submitToEAS(
    context: BuildContext,
    config: MobileBuildConfig
  ): Promise<{ buildId: string; url: string }> {
    // Stub: In production, this would call EAS Build API
    this.logger.info('Submitting to EAS Build (stub)', { config });

    return {
      buildId: `eas-build-${Date.now()}`,
      url: `https://expo.dev/@${config.eas_config?.owner}/${context.project_id}`,
    };
  }
}

export const mobileBuilder = new MobileBuilderImpl();
