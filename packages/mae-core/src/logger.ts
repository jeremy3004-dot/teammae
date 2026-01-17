import type { LogEntry } from '@teammae/types';

/**
 * Logging primitives for MAE and build pipelines
 * Provides structured logging with levels, context, and metadata
 */

export class Logger {
  private context?: string;
  private logs: LogEntry[] = [];

  constructor(context?: string) {
    this.context = context;
  }

  debug(message: string, metadata?: Record<string, any>): void {
    this.log('debug', message, metadata);
  }

  info(message: string, metadata?: Record<string, any>): void {
    this.log('info', message, metadata);
  }

  warn(message: string, metadata?: Record<string, any>): void {
    this.log('warn', message, metadata);
  }

  error(message: string, metadata?: Record<string, any>): void {
    this.log('error', message, metadata);
  }

  private log(level: LogEntry['level'], message: string, metadata?: Record<string, any>): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: this.context,
      metadata,
    };

    this.logs.push(entry);

    // Also output to console for immediate feedback
    const consoleMethod = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
    const prefix = this.context ? `[${this.context}]` : '';
    consoleMethod(`${prefix} ${message}`, metadata || '');
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clear(): void {
    this.logs = [];
  }

  child(childContext: string): Logger {
    return new Logger(this.context ? `${this.context}:${childContext}` : childContext);
  }
}

/**
 * Parse build logs from stdout/stderr
 * Extracts structured information from unstructured build output
 */
export function parseBuildLogs(output: string): LogEntry[] {
  const logs: LogEntry[] = [];
  const lines = output.split('\n');

  for (const line of lines) {
    if (!line.trim()) continue;

    let level: LogEntry['level'] = 'info';

    // Detect log level from common patterns
    if (/error|failed|fatal/i.test(line)) {
      level = 'error';
    } else if (/warn|warning/i.test(line)) {
      level = 'warn';
    } else if (/debug|verbose/i.test(line)) {
      level = 'debug';
    }

    logs.push({
      level,
      message: line,
      timestamp: new Date().toISOString(),
    });
  }

  return logs;
}

/**
 * Repair/clean logs for better readability
 * Removes ANSI codes, deduplicates, and formats consistently
 */
export function repairLogs(logs: LogEntry[]): LogEntry[] {
  return logs.map((log) => ({
    ...log,
    message: log.message
      .replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '') // Remove ANSI codes
      .trim(),
  }));
}

/**
 * Convert LogEntry[] to human-readable format
 */
export function formatLogs(logs: LogEntry[]): string {
  return logs
    .map((log) => {
      const timestamp = new Date(log.timestamp).toISOString();
      const level = log.level.toUpperCase().padEnd(5);
      const context = log.context ? `[${log.context}]` : '';
      return `${timestamp} ${level} ${context} ${log.message}`;
    })
    .join('\n');
}
