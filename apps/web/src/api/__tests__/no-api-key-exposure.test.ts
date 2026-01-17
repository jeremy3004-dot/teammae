/**
 * Security Test: Ensure ANTHROPIC_API_KEY is never exposed in frontend code
 *
 * This test scans frontend source files to ensure the Anthropic API key
 * is NEVER referenced via VITE_ env vars (which would expose it to the browser).
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const WEB_SRC_DIR = path.resolve(__dirname, '../..');

function getAllTsFiles(dir: string): string[] {
  const files: string[] = [];

  function walk(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules and test directories for performance
        if (entry.name !== 'node_modules' && entry.name !== '__tests__') {
          walk(fullPath);
        }
      } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
        files.push(fullPath);
      }
    }
  }

  walk(dir);
  return files;
}

describe('API Key Security', () => {
  it('should NOT reference VITE_ANTHROPIC_API_KEY in any frontend source file', () => {
    const tsFiles = getAllTsFiles(WEB_SRC_DIR);
    const violations: string[] = [];

    for (const file of tsFiles) {
      // Skip this test file itself
      if (file.includes('no-api-key-exposure.test.ts')) {
        continue;
      }

      const content = fs.readFileSync(file, 'utf-8');

      // Check for VITE_ANTHROPIC_API_KEY usage
      if (content.includes('VITE_ANTHROPIC_API_KEY')) {
        // Allow comments that explain why it's removed
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (line.includes('VITE_ANTHROPIC_API_KEY')) {
            // Skip if it's a comment explaining the removal
            const trimmed = line.trim();
            if (!trimmed.startsWith('//') && !trimmed.startsWith('*') && !trimmed.startsWith('/*')) {
              violations.push(`${file}:${i + 1}: ${line.trim()}`);
            }
          }
        }
      }
    }

    if (violations.length > 0) {
      console.error('SECURITY VIOLATION: Found VITE_ANTHROPIC_API_KEY in frontend code:');
      violations.forEach(v => console.error(`  ${v}`));
    }

    expect(violations).toEqual([]);
  });

  it('should NOT make direct calls to api.anthropic.com from frontend code', () => {
    const tsFiles = getAllTsFiles(WEB_SRC_DIR);
    const violations: string[] = [];

    for (const file of tsFiles) {
      // Skip test files
      if (file.includes('.test.ts')) {
        continue;
      }

      const content = fs.readFileSync(file, 'utf-8');

      // Check for direct Anthropic API calls
      if (content.includes('api.anthropic.com')) {
        const relativePath = path.relative(WEB_SRC_DIR, file);
        violations.push(relativePath);
      }
    }

    if (violations.length > 0) {
      console.error('SECURITY VIOLATION: Found direct Anthropic API calls in frontend:');
      violations.forEach(v => console.error(`  ${v}`));
    }

    expect(violations).toEqual([]);
  });

  it('should NOT have x-api-key header construction in frontend code', () => {
    const tsFiles = getAllTsFiles(WEB_SRC_DIR);
    const violations: string[] = [];

    for (const file of tsFiles) {
      // Skip test files
      if (file.includes('.test.ts')) {
        continue;
      }

      const content = fs.readFileSync(file, 'utf-8');

      // Check for x-api-key header (used by Anthropic API)
      // This pattern indicates direct API key usage
      if (content.includes("'x-api-key'") || content.includes('"x-api-key"')) {
        const relativePath = path.relative(WEB_SRC_DIR, file);
        violations.push(relativePath);
      }
    }

    if (violations.length > 0) {
      console.error('SECURITY VIOLATION: Found x-api-key header in frontend code:');
      violations.forEach(v => console.error(`  ${v}`));
    }

    expect(violations).toEqual([]);
  });

  it('should use Edge Function endpoint pattern for MAE builds', () => {
    const maeFile = path.join(WEB_SRC_DIR, 'api', 'mae.ts');
    const content = fs.readFileSync(maeFile, 'utf-8');

    // Should call Supabase Edge Function
    expect(content).toContain('/functions/v1/mae-build');

    // Should use Authorization: Bearer token pattern
    expect(content).toContain("'Authorization'");
    expect(content).toContain('Bearer');
  });
});
