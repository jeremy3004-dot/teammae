import { Sandpack } from '@codesandbox/sandpack-react';

interface ProjectFile {
  path: string;
  content: string;
}

interface LivePreviewPaneProps {
  files: ProjectFile[];
}

export function LivePreviewPane({ files }: LivePreviewPaneProps) {
  // Convert project files to Sandpack format
  // Sandpack expects files in format: { '/App.js': 'code...' }
  const sandpackFiles: Record<string, string> = {};

  // Find the main App file and CSS
  let hasApp = false;
  let hasCss = false;

  for (const file of files) {
    // Normalize path: remove 'src/' prefix and convert .tsx to .jsx for Sandpack
    let sandpackPath = file.path;

    // Remove src/ prefix if present
    if (sandpackPath.startsWith('src/')) {
      sandpackPath = sandpackPath.substring(4);
    }

    // Add leading slash
    if (!sandpackPath.startsWith('/')) {
      sandpackPath = '/' + sandpackPath;
    }

    // Convert TypeScript to JavaScript for Sandpack (simpler setup)
    // Also strip TypeScript-specific syntax
    let content = file.content;

    if (sandpackPath.endsWith('.tsx') || sandpackPath.endsWith('.ts')) {
      // Convert extension
      sandpackPath = sandpackPath.replace(/\.tsx?$/, '.jsx');

      // Strip TypeScript syntax
      content = stripTypeScript(content);
    }

    sandpackFiles[sandpackPath] = content;

    if (sandpackPath === '/App.jsx' || sandpackPath === '/App.js') {
      hasApp = true;
    }
    if (sandpackPath.endsWith('.css')) {
      hasCss = true;
    }
  }

  // If no App file found, create a placeholder
  if (!hasApp) {
    sandpackFiles['/App.jsx'] = `export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">No App Component Found</h1>
        <p className="text-gray-600">Generate an app to see it here!</p>
      </div>
    </div>
  );
}`;
  }

  // Always include index.css with Tailwind
  if (!hasCss) {
    sandpackFiles['/index.css'] = `@tailwind base;
@tailwind components;
@tailwind utilities;`;
  }

  return (
    <div className="h-full w-full">
      <Sandpack
        template="react"
        theme="dark"
        files={sandpackFiles}
        options={{
          showNavigator: false,
          showTabs: false,
          showLineNumbers: false,
          editorHeight: 0,
          editorWidthPercentage: 0,
          showConsole: false,
          showConsoleButton: false,
          externalResources: [
            'https://cdn.tailwindcss.com',
          ],
        }}
        customSetup={{
          dependencies: {
            'react': '^18.2.0',
            'react-dom': '^18.2.0',
          },
        }}
      />
    </div>
  );
}

// Strip TypeScript syntax from code
function stripTypeScript(code: string): string {
  return code
    // Remove import type statements
    .replace(/^import\s+type\s+.*$/gm, '')
    // Remove type-only imports from mixed imports: import { type Foo, Bar } -> import { Bar }
    .replace(/,?\s*type\s+\w+/g, '')
    // Remove interface declarations
    .replace(/^(export\s+)?interface\s+\w+\s*\{[\s\S]*?\n\}/gm, '')
    // Remove type declarations
    .replace(/^(export\s+)?type\s+\w+\s*=[\s\S]*?(?=\n\n|\nexport|\nfunction|\nconst|\nclass|\n\/\/|$)/gm, '')
    // Remove type annotations after colons (but not in objects)
    .replace(/:\s*React\.\w+(<[^>]*>)?/g, '')
    .replace(/:\s*\w+\[\]/g, '')
    // Remove function parameter type annotations
    .replace(/\(\s*(\w+)\s*:\s*[^)]+\)/g, '($1)')
    // Remove return type annotations
    .replace(/\)\s*:\s*\w+(\[\])?\s*(\{|=>)/g, ') $2')
    // Remove generic type parameters
    .replace(/<[A-Z]\w*(\s*,\s*[A-Z]\w*)*>/g, '')
    // Remove 'as' type assertions
    .replace(/\s+as\s+\w+/g, '')
    // Remove simple type annotations
    .replace(/:\s*(string|number|boolean|any|void|null|undefined|never)(\[\])?/g, '')
    // Remove FC type
    .replace(/:\s*React\.FC/g, '')
    // Clean up empty lines
    .replace(/\n{3,}/g, '\n\n');
}
