import { describe, it, expect } from 'vitest';
import {
  resolveBrandProfile,
  enforceBrandResolution,
  getBrandInjectionPrompt,
  validateContract,
  TEAMMAE_BRAND,
} from '@teammae/mae-core';
import type { MAEOutput } from '@teammae/types';

/**
 * E2E Pipeline Tests (Unit-style without mocked LLM)
 * These tests verify brand resolution, injection prompts, and contract validation
 */

describe('MAE Pipeline Brand Enforcement', () => {
  describe('Brand Resolution', () => {
    it('should use default brand when no override specified', () => {
      const resolved = resolveBrandProfile('Build a todo app', null);

      expect(resolved.profile.brandName).toBe('TeamMAE.ai');
      expect(resolved.source).toBe('default');
      expect(resolved.styleProfile).toBe('dark-saas');
      expect(resolved.overrideDetected).toBe(false);
    });

    it('should detect light theme from keywords', () => {
      const resolved = resolveBrandProfile('Build a light theme landing page', null);

      expect(resolved.profile.brandName).toBe('TeamMAE.ai');
      expect(resolved.source).toBe('user-implicit');
      expect(resolved.styleProfile).toBe('light-saas');
      expect(resolved.overrideDetected).toBe(true);
    });

    it('should detect colorful style from keywords', () => {
      const resolved = resolveBrandProfile('Build a colorful vibrant dashboard', null);

      expect(resolved.source).toBe('user-implicit');
      expect(resolved.styleProfile).toBe('colorful');
    });

    it('should use explicit style profile when provided', () => {
      const resolved = resolveBrandProfile('Build an app', 'light-saas');

      expect(resolved.source).toBe('user-explicit');
      expect(resolved.styleProfile).toBe('light-saas');
      expect(resolved.overrideDetected).toBe(true);
    });

    it('should throw when brand resolution fails', () => {
      expect(() => {
        enforceBrandResolution(null as any);
      }).toThrow('CRITICAL: Brand resolution failed');
    });
  });

  describe('Brand Injection Prompts', () => {
    it('should include brand information in injection prompt', () => {
      const prompt = getBrandInjectionPrompt('dark-saas');

      expect(prompt).toContain('BRAND');
      expect(prompt).toContain('TeamMAE');
      expect(prompt).toContain('Share Tech Mono');
      expect(prompt).toContain('monospace');
    });

    it('should include typography rules in prompt', () => {
      const prompt = getBrandInjectionPrompt('dark-saas');

      expect(prompt).toContain('Share Tech Mono');
      expect(prompt).toContain('Typography');
    });

    it('should include border radius rules in prompt', () => {
      const prompt = getBrandInjectionPrompt('dark-saas');

      expect(prompt).toContain('border-radius');
    });

    it('should include color token rules in prompt', () => {
      const prompt = getBrandInjectionPrompt('dark-saas');

      expect(prompt).toContain('Color');
      expect(prompt).toContain('Tokens');
    });

    it('should adapt to different style profiles', () => {
      const darkPrompt = getBrandInjectionPrompt('dark-saas');
      const lightPrompt = getBrandInjectionPrompt('light-saas');

      expect(darkPrompt).toContain('dark');
      expect(lightPrompt).toContain('light');
    });
  });

  describe('Quality Contract with Brand', () => {
    it('should include brand compliance in contract result', () => {
      const output: MAEOutput = {
        summary: 'Test app',
        files: [
          {
            path: 'src/App.tsx',
            content: `
              export default function App() {
                return (
                  <div className="font-mono bg-background text-foreground">
                    <h1 className="font-mono">Hello</h1>
                  </div>
                );
              }
            `,
          },
          {
            path: 'src/components/Header.tsx',
            content: '<header className="font-mono bg-card p-4"><h2 className="font-mono">Header</h2></header>',
          },
          {
            path: 'src/index.css',
            content: '@tailwind base;',
          },
        ],
      };

      const result = validateContract(output, TEAMMAE_BRAND);

      // Brand compliance is checked regardless of other contract rules
      expect(result.brandCompliant).toBeDefined();
      expect(result.brandName).toBe('TeamMAE.ai');
    });

    it('should fail contract when brand is violated', () => {
      const output: MAEOutput = {
        summary: 'Non-compliant app',
        files: [
          {
            path: 'src/App.tsx',
            content: `
              export default function App() {
                return (
                  <div className="font-sans bg-white text-black rounded-full">
                    <h1 className="font-sans bg-gray-900 text-gray-100 border-gray-800">Title</h1>
                    <div className="bg-blue-600 text-white">Content</div>
                    <button className="bg-red-500 hover:bg-red-600">Click</button>
                  </div>
                );
              }
            `,
          },
          {
            path: 'src/components/Card.tsx',
            content: `
              export default function Card() {
                return <div>Unstyled</div>;
              }
            `,
          },
          {
            path: 'src/index.css',
            content: '@tailwind base;',
          },
        ],
      };

      const result = validateContract(output, TEAMMAE_BRAND);

      expect(result.valid).toBe(false);
      expect(result.brandCompliant).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
      expect(result.violations.some(v => v.rule.startsWith('BRAND_'))).toBe(true);
    });

    it('should include brand violations in contract result', () => {
      const output: MAEOutput = {
        summary: 'App with brand violations',
        files: [
          {
            path: 'src/App.tsx',
            content: `
              export default function App() {
                return (
                  <div className="font-sans bg-white text-black rounded-lg">
                    <h1>Hello</h1>
                  </div>
                );
              }
            `,
          },
          {
            path: 'src/components/Hero.tsx',
            content: '<div className="font-sans">Hero</div>',
          },
          {
            path: 'src/index.css',
            content: '@tailwind base;',
          },
        ],
      };

      const result = validateContract(output, TEAMMAE_BRAND);

      const brandViolations = result.violations.filter(v => v.message.includes('BRAND VIOLATION'));
      expect(brandViolations.length).toBeGreaterThan(0);
      expect(brandViolations[0].severity).toBe('critical');
    });
  });

  describe('Brand Metadata Requirements', () => {
    it('should ensure brand profile has required properties', () => {
      expect(TEAMMAE_BRAND.brandName).toBe('TeamMAE.ai');
      expect(TEAMMAE_BRAND.styleProfileDefault).toBe('dark-saas');
      expect(TEAMMAE_BRAND.typography).toBeDefined();
      expect(TEAMMAE_BRAND.colors).toBeDefined();
      expect(TEAMMAE_BRAND.spacing).toBeDefined();
    });

    it('should have monospace font in typography', () => {
      expect(TEAMMAE_BRAND.typography.fontFamily).toContain('monospace');
      expect(TEAMMAE_BRAND.typography.fontFamily).toContain('Share Tech Mono');
    });

    it('should have spacing scale defined', () => {
      expect(TEAMMAE_BRAND.spacing.scale).toBeDefined();
      expect(Array.isArray(TEAMMAE_BRAND.spacing.scale)).toBe(true);
      expect(TEAMMAE_BRAND.spacing.scale.length).toBeGreaterThan(0);
    });
  });

  describe('Brand Resolution Edge Cases', () => {
    it('should handle empty prompt with default brand', () => {
      const resolved = resolveBrandProfile('', null);

      expect(resolved.profile.brandName).toBe('TeamMAE.ai');
      expect(resolved.source).toBe('default');
    });

    it('should prioritize explicit over keyword detection', () => {
      const resolved = resolveBrandProfile('Build a light theme app', 'colorful');

      expect(resolved.source).toBe('user-explicit');
      expect(resolved.styleProfile).toBe('colorful');
    });

    it('should handle mixed keywords by using first match', () => {
      const resolved = resolveBrandProfile('Build a light and colorful app', null);

      // Should detect 'colorful' - checks colorful keywords before light keywords
      expect(resolved.styleProfile).toBe('colorful');
    });
  });
});
