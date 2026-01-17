import type { MAEOutput, MAEFile, FileType } from '@teammae/types';

/**
 * MAE Output Contract Validator
 * Ensures all MAE responses follow the strict JSON schema
 */

export class MAEOutputBuilder {
  private summary: string = '';
  private files: MAEFile[] = [];
  private warnings: string[] = [];
  private meta: Record<string, any> = {};

  setSummary(summary: string): this {
    this.summary = summary;
    return this;
  }

  addFile(path: string, content: string, type?: FileType): this {
    this.files.push({ path, content, type });
    return this;
  }

  addFiles(files: MAEFile[]): this {
    this.files.push(...files);
    return this;
  }

  addWarning(warning: string): this {
    this.warnings.push(warning);
    return this;
  }

  setMeta(key: string, value: any): this {
    this.meta[key] = value;
    return this;
  }

  build(): MAEOutput {
    if (!this.summary) {
      throw new Error('MAEOutput requires a summary');
    }

    if (this.files.length === 0) {
      throw new Error('MAEOutput requires at least one file');
    }

    return {
      summary: this.summary,
      files: this.files,
      warnings: this.warnings.length > 0 ? this.warnings : undefined,
      meta: Object.keys(this.meta).length > 0 ? this.meta : undefined,
    };
  }
}

export function validateMAEOutput(output: any): output is MAEOutput {
  if (!output || typeof output !== 'object') {
    return false;
  }

  if (typeof output.summary !== 'string' || !output.summary) {
    return false;
  }

  if (!Array.isArray(output.files) || output.files.length === 0) {
    return false;
  }

  for (const file of output.files) {
    if (!file.path || typeof file.path !== 'string') {
      return false;
    }
    if (!file.content || typeof file.content !== 'string') {
      return false;
    }
  }

  return true;
}

export function parseMAEOutput(json: string): MAEOutput {
  let parsed: any;

  try {
    parsed = JSON.parse(json);
  } catch (error) {
    throw new Error(`Invalid JSON: ${error}`);
  }

  if (!validateMAEOutput(parsed)) {
    throw new Error('Invalid MAE output format');
  }

  return parsed;
}
