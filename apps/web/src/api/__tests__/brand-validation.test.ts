import { describe, it, expect } from 'vitest';
import { validateBrand, TEAMMAE_BRAND } from '@teammae/mae-core';
import type { MAEOutput } from '@teammae/types';

describe('Brand Validation Regression Tests', () => {
  it('should fail when using non-monospace font', () => {
    const output: MAEOutput = {
      summary: 'Test app with wrong font',
      files: [
        {
          path: 'src/App.tsx',
          content: `
            export default function App() {
              return (
                <div className="font-sans text-lg">
                  <h1 className="font-sans">Hello</h1>
                </div>
              );
            }
          `,
        },
      ],
    };

    const result = validateBrand(output, TEAMMAE_BRAND);

    expect(result.valid).toBe(false);
    expect(result.violations.some(v => v.rule === 'BRAND_TYPOGRAPHY')).toBe(true);
  });

  it('should fail when using large rounded borders', () => {
    const output: MAEOutput = {
      summary: 'Test app with rounded borders',
      files: [
        {
          path: 'src/components/Card.tsx',
          content: `
            export default function Card() {
              return (
                <div className="rounded-lg p-4">
                  <button className="rounded-full px-4">Click</button>
                </div>
              );
            }
          `,
        },
      ],
    };

    const result = validateBrand(output, TEAMMAE_BRAND);

    expect(result.valid).toBe(false);
    expect(result.violations.some(v => v.rule === 'BRAND_BORDER_RADIUS')).toBe(true);
  });

  it('should fail when using hard-coded color values', () => {
    const output: MAEOutput = {
      summary: 'Test app with hard-coded colors',
      files: [
        {
          path: 'src/App.tsx',
          content: `
            export default function App() {
              return (
                <div className="bg-gray-900 text-gray-100 border-gray-800">
                  <h1 className="text-blue-600 bg-blue-100">Title</h1>
                  <div className="bg-red-500 text-white">Error</div>
                  <button className="bg-green-600 hover:bg-green-700">Submit</button>
                </div>
              );
            }
          `,
        },
      ],
    };

    const result = validateBrand(output, TEAMMAE_BRAND);

    expect(result.valid).toBe(false);
    expect(result.violations.some(v => v.rule === 'BRAND_COLOR_TOKENS')).toBe(true);
  });

  it('should fail when using light background instead of dark mode', () => {
    const output: MAEOutput = {
      summary: 'Test app with light background',
      files: [
        {
          path: 'src/App.tsx',
          content: `
            export default function App() {
              return (
                <div className="bg-white text-black min-h-screen">
                  <h1 className="text-black">Hello</h1>
                  <p className="bg-white">Content</p>
                </div>
              );
            }
          `,
        },
      ],
    };

    const result = validateBrand(output, TEAMMAE_BRAND);

    expect(result.valid).toBe(false);
    expect(result.violations.some(v => v.rule === 'BRAND_DARK_MODE')).toBe(true);
  });

  it('should fail when using unstyled HTML elements', () => {
    const output: MAEOutput = {
      summary: 'Test app with unstyled elements',
      files: [
        {
          path: 'src/App.tsx',
          content: `
            export default function App() {
              return (
                <div>
                  <h1>Unstyled heading</h1>
                  <p>Unstyled paragraph</p>
                </div>
              );
            }
          `,
        },
      ],
    };

    const result = validateBrand(output, TEAMMAE_BRAND);

    expect(result.valid).toBe(false);
    expect(result.violations.some(v => v.rule === 'BRAND_NO_UNSTYLED')).toBe(true);
  });

  it('should pass when following all brand rules', () => {
    const output: MAEOutput = {
      summary: 'Compliant app',
      files: [
        {
          path: 'src/App.tsx',
          content: `
            export default function App() {
              return (
                <div className="font-mono bg-background text-foreground min-h-screen">
                  <h1 className="font-mono text-3xl">Hello TeamMAE</h1>
                  <div className="rounded-sm bg-card p-4">
                    <button className="rounded-sm bg-primary text-primary-foreground px-4 py-2">
                      Click me
                    </button>
                  </div>
                </div>
              );
            }
          `,
        },
        {
          path: 'src/components/Feature.tsx',
          content: `
            export default function Feature() {
              return (
                <div className="font-mono bg-card p-6 rounded-md">
                  <h2 className="font-mono text-xl">Feature</h2>
                </div>
              );
            }
          `,
        },
      ],
    };

    const result = validateBrand(output, TEAMMAE_BRAND);

    expect(result.valid).toBe(true);
    expect(result.violations).toHaveLength(0);
    expect(result.brandName).toBe('TeamMAE.ai');
  });

  it('should return multiple violations for multiple issues', () => {
    const output: MAEOutput = {
      summary: 'Test app with multiple violations',
      files: [
        {
          path: 'src/App.tsx',
          content: `
            export default function App() {
              return (
                <div className="font-sans bg-white text-black rounded-full">
                  <h1 className="bg-gray-900 text-gray-100 border-gray-800">Hello</h1>
                  <div className="bg-blue-600 text-white">Content</div>
                  <button className="bg-red-500 hover:bg-red-600">Click</button>
                  <section>Unstyled</section>
                  <p>No className</p>
                </div>
              );
            }
          `,
        },
      ],
    };

    const result = validateBrand(output, TEAMMAE_BRAND);

    expect(result.valid).toBe(false);
    expect(result.violations.length).toBeGreaterThanOrEqual(2);
  });

  it('should include brand name in result', () => {
    const output: MAEOutput = {
      summary: 'Test app',
      files: [
        {
          path: 'src/App.tsx',
          content: '<div className="font-mono">Test</div>',
        },
      ],
    };

    const result = validateBrand(output, TEAMMAE_BRAND);

    expect(result.brandName).toBe('TeamMAE.ai');
  });
});
