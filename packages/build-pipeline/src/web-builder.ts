import type { BuildContext, BuildResult, WebBuildConfig, ProjectFile } from '@teammae/types';
import type { WebBuilder } from './contracts';
import { Logger } from '@teammae/mae-core';

/**
 * Web Builder (Lovable-style)
 * Builds React + Vite + Tailwind + shadcn/ui web apps
 */
export class WebBuilderImpl implements WebBuilder {
  private logger: Logger;

  constructor() {
    this.logger = new Logger('WebBuilder');
  }

  async build(context: BuildContext): Promise<BuildResult> {
    this.logger.info('Starting web build', { projectId: context.project_id });

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

      // Generate preview bundle
      const preview = await this.generatePreview(context);

      logs.push({
        level: 'info',
        message: 'Preview bundle generated',
        timestamp: new Date().toISOString(),
      });

      // In production, this would run Vite build, upload to storage, etc.
      const artifacts: BuildResult['artifacts'] = [
        {
          type: 'preview_bundle',
          path: `/previews/${context.user_id}/${context.project_id}/index.html`,
          url: `https://storage.example.com/previews/${context.project_id}`,
        },
      ];

      const duration = Date.now() - startTime;
      logs.push({
        level: 'info',
        message: `Build completed in ${duration}ms`,
        timestamp: new Date().toISOString(),
      });

      return {
        status: 'success',
        artifacts,
        logs,
      };
    } catch (error: any) {
      this.logger.error('Build failed', { error: error.message });

      return {
        status: 'failed',
        artifacts: [],
        logs: [
          ...logs,
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
    const requiredFiles = ['package.json', 'index.html', 'src/main.tsx'];
    for (const required of requiredFiles) {
      const found = context.files.some((f) => f.path === required);
      if (!found) {
        errors.push(`Missing required file: ${required}`);
      }
    }

    // Check for at least one component
    const hasComponents = context.files.some((f) => f.path.includes('/components/'));
    if (!hasComponents) {
      errors.push('No components found in project');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  async generatePreview(context: BuildContext): Promise<{
    html: string;
    bundle: { path: string; content: string }[];
  }> {
    // Generate entry HTML with runtime scaffolding
    const html = this.generateEntryHTML(context.files);

    // Bundle all files for preview
    const bundle = context.files.map((file) => ({
      path: file.path,
      content: file.content,
    }));

    return { html, bundle };
  }

  buildConfig(context: BuildContext): WebBuildConfig {
    return {
      entry_point: 'src/main.tsx',
      output_dir: 'dist',
      base_url: '/',
      env_vars: {
        NODE_ENV: 'production',
      },
    };
  }

  private generateEntryHTML(files: ProjectFile[]): string {
    // Find or create index.html
    const indexHTML = files.find((f) => f.path === 'index.html');

    if (indexHTML) {
      return indexHTML.content;
    }

    // Generate default HTML if not found
    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TeamMAE App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;
  }
}

export const webBuilder = new WebBuilderImpl();
