/**
 * Preview HTML Sanitizer
 * Detects corruption patterns in generated preview HTML
 */

export interface SanitizeResult {
  ok: boolean;
  html: string;
  violations: string[];
}

/**
 * Sanitize preview HTML by detecting corruption patterns
 * Returns the original HTML with ok=false if issues detected
 * This is a detector, not a fixer - corruption should be prevented upstream
 */
export function sanitizePreviewHtml(html: string): SanitizeResult {
  const violations: string[] = [];

  // Corruption patterns that indicate malformed JSX/HTML
  const patterns = [
    {
      regex: /href=\s*(?!["'{])/,
      message: 'Detected unquoted href attributes',
    },
    {
      regex: /class=\s*(?!["'])/,
      message: 'Detected unquoted class attributes',
    },
    {
      regex: />\s*\)\)\}/,
      message: 'Detected malformed JSX closures (> ))})',
    },
    {
      regex: /<[a-z]+\s+[^>]*(?:className|href|src)=[^"'{][^>\s]*/i,
      message: 'Detected unquoted React props (not including onClick with arrow functions)',
    },
  ];

  for (const pattern of patterns) {
    if (pattern.regex.test(html)) {
      violations.push(pattern.message);
    }
  }

  return {
    ok: violations.length === 0,
    html,
    violations,
  };
}
