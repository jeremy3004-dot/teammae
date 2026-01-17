import { describe, it, expect } from 'vitest';
import { sanitizePreviewHtml } from '../preview-sanitizer';

describe('Preview Sanitizer Regression Tests', () => {
  it('should detect unquoted href attributes', () => {
    const badHtml = `
      <div>
        <a href= class="link">Click me</a>
      </div>
    `;

    const result = sanitizePreviewHtml(badHtml);

    expect(result.ok).toBe(false);
    expect(result.violations).toContain('Detected unquoted href attributes');
  });

  it('should detect unquoted class attributes', () => {
    const badHtml = `
      <div>
        <span class= text-lg>Hello</span>
      </div>
    `;

    const result = sanitizePreviewHtml(badHtml);

    expect(result.ok).toBe(false);
    expect(result.violations).toContain('Detected unquoted class attributes');
  });

  it('should detect malformed JSX closures', () => {
    const badHtml = '<div><span>))}</span></div>';

    const result = sanitizePreviewHtml(badHtml);

    expect(result.ok).toBe(false);
    expect(result.violations.length).toBeGreaterThan(0);
  });

  it('should detect unquoted React props', () => {
    const badHtml = `
      <div>
        <a href=https://example.com className=link>Link</a>
      </div>
    `;

    const result = sanitizePreviewHtml(badHtml);

    expect(result.ok).toBe(false);
    expect(result.violations).toContain('Detected unquoted href attributes');
  });

  it('should detect multiple violations in same HTML', () => {
    const badHtml = `
      <div>
        <a href= class= >Link</a>
        <span>))}</span>
      </div>
    `;

    const result = sanitizePreviewHtml(badHtml);

    expect(result.ok).toBe(false);
    expect(result.violations.length).toBeGreaterThan(1);
  });

  it('should pass valid HTML without violations', () => {
    const goodHtml = `
      <!DOCTYPE html>
      <html>
        <body>
          <div className="container">
            <a href="/home" className="link">Home</a>
            <button onClick={() => handleClick()}>Click</button>
          </div>
        </body>
      </html>
    `;

    const result = sanitizePreviewHtml(goodHtml);

    expect(result.ok).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it('should return original HTML in result', () => {
    const html = '<div>Test</div>';
    const result = sanitizePreviewHtml(html);

    expect(result.html).toBe(html);
  });

  it('should handle empty HTML', () => {
    const result = sanitizePreviewHtml('');

    expect(result.ok).toBe(true);
    expect(result.violations).toHaveLength(0);
  });
});
