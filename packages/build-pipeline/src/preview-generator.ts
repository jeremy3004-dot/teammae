import type { WebPreviewBundle, ProjectFile } from '@teammae/types';

/**
 * Preview Generator
 * Creates self-contained preview bundles for web apps
 * CRITICAL: Always ensures entry + runtime scaffolding, never relies on App.tsx alone
 */

export class PreviewGenerator {
  /**
   * Generate complete web preview bundle with all necessary runtime files
   */
  generateWebPreview(files: ProjectFile[]): WebPreviewBundle {
    const fileMap = new Map(files.map((f) => [f.path, f.content]));

    // Generate entry HTML
    const entryHTML = this.generateEntryHTML(fileMap);

    // Ensure we have all runtime files
    const bundleFiles = this.ensureRuntimeFiles(files);

    return {
      entry_html: entryHTML,
      files: bundleFiles.map((f) => ({
        path: f.path,
        content: f.content,
      })),
    };
  }

  /**
   * Generate mobile preview (Expo Snack URL or QR code)
   */
  generateMobilePreview(files: ProjectFile[]): {
    snackUrl: string;
    qrCode: string;
  } {
    // Stub: In production, this would create an Expo Snack
    const snackId = `snack-${Date.now()}`;

    return {
      snackUrl: `https://snack.expo.dev/${snackId}`,
      qrCode: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`,
    };
  }

  private generateEntryHTML(fileMap: Map<string, string>): string {
    // Check if custom index.html exists
    if (fileMap.has('index.html')) {
      return fileMap.get('index.html')!;
    }

    // Generate default HTML with proper runtime scaffolding
    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TeamMAE App</title>
    <script type="module">
      import RefreshRuntime from '/@react-refresh'
      RefreshRuntime.injectIntoGlobalHook(window)
      window.$RefreshReg$ = () => {}
      window.$RefreshSig$ = () => (type) => type
      window.__vite_plugin_react_preamble_installed__ = true
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;
  }

  private ensureRuntimeFiles(files: ProjectFile[]): ProjectFile[] {
    const fileMap = new Map(files.map((f) => [f.path, f.content]));
    const runtimeFiles: ProjectFile[] = [...files];

    // Ensure main.tsx exists
    if (!fileMap.has('src/main.tsx')) {
      runtimeFiles.push({
        id: 'runtime-main',
        project_id: files[0]?.project_id || '',
        path: 'src/main.tsx',
        content: this.generateMainTsx(fileMap),
        file_type: 'config',
        size_bytes: 0,
        checksum: '',
        version: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    // Ensure package.json exists
    if (!fileMap.has('package.json')) {
      runtimeFiles.push({
        id: 'runtime-package',
        project_id: files[0]?.project_id || '',
        path: 'package.json',
        content: this.generatePackageJson(),
        file_type: 'config',
        size_bytes: 0,
        checksum: '',
        version: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    return runtimeFiles;
  }

  private generateMainTsx(fileMap: Map<string, string>): string {
    // Check if App.tsx exists
    const hasApp = fileMap.has('src/App.tsx');

    return `import React from 'react';
import ReactDOM from 'react-dom/client';
${hasApp ? "import App from './App';" : ''}
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    ${hasApp ? '<App />' : '<div>Welcome to TeamMAE</div>'}
  </React.StrictMode>
);`;
  }

  private generatePackageJson(): string {
    return JSON.stringify(
      {
        name: 'teammae-app',
        private: true,
        version: '0.0.0',
        type: 'module',
        scripts: {
          dev: 'vite',
          build: 'tsc && vite build',
          preview: 'vite preview',
        },
        dependencies: {
          react: '^18.2.0',
          'react-dom': '^18.2.0',
        },
        devDependencies: {
          '@types/react': '^18.2.43',
          '@types/react-dom': '^18.2.17',
          '@vitejs/plugin-react': '^4.2.1',
          typescript: '^5.3.3',
          vite: '^5.0.8',
          tailwindcss: '^3.4.0',
          autoprefixer: '^10.4.16',
          postcss: '^8.4.32',
        },
      },
      null,
      2
    );
  }
}

export const previewGenerator = new PreviewGenerator();
