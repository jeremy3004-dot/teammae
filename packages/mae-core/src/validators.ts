import type { ProjectType, FileType } from '@teammae/types';

/**
 * Common validation utilities
 */

export function isValidProjectType(type: string): type is ProjectType {
  return type === 'web' || type === 'mobile';
}

export function isValidFileType(type: string): type is FileType {
  return ['component', 'page', 'config', 'asset', 'util', 'style', 'other'].includes(type);
}

export function validateProjectName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Project name cannot be empty' };
  }

  if (name.length > 100) {
    return { valid: false, error: 'Project name must be less than 100 characters' };
  }

  if (!/^[a-zA-Z0-9\s\-_]+$/.test(name)) {
    return { valid: false, error: 'Project name can only contain letters, numbers, spaces, hyphens, and underscores' };
  }

  return { valid: true };
}

export function validateFilePath(path: string): { valid: boolean; error?: string } {
  if (!path || path.trim().length === 0) {
    return { valid: false, error: 'File path cannot be empty' };
  }

  if (path.startsWith('/') || path.startsWith('\\')) {
    return { valid: false, error: 'File path must be relative' };
  }

  if (path.includes('..')) {
    return { valid: false, error: 'File path cannot contain ..' };
  }

  if (path.length > 500) {
    return { valid: false, error: 'File path must be less than 500 characters' };
  }

  return { valid: true };
}

export function sanitizeProjectName(name: string): string {
  return name
    .trim()
    .replace(/[^a-zA-Z0-9\s\-_]/g, '')
    .substring(0, 100);
}
