import type { TelemetryEvent } from '@teammae/types';

/**
 * Telemetry primitives for tracking events and metrics
 */

export class Telemetry {
  private events: TelemetryEvent[] = [];

  track(
    eventName: string,
    properties?: Record<string, any>,
    userId?: string,
    projectId?: string
  ): void {
    const event: TelemetryEvent = {
      event_name: eventName,
      user_id: userId,
      project_id: projectId,
      properties,
      timestamp: new Date().toISOString(),
    };

    this.events.push(event);

    // In production, this would send to analytics service
    console.debug('[Telemetry]', eventName, properties);
  }

  getEvents(): TelemetryEvent[] {
    return [...this.events];
  }

  clear(): void {
    this.events = [];
  }
}

// Global telemetry instance
export const telemetry = new Telemetry();

// Convenience functions
export function trackEvent(
  eventName: string,
  properties?: Record<string, any>,
  userId?: string,
  projectId?: string
): void {
  telemetry.track(eventName, properties, userId, projectId);
}

export function trackBuildStart(projectId: string, userId: string, type: 'web' | 'mobile'): void {
  telemetry.track('build_started', { type }, userId, projectId);
}

export function trackBuildComplete(
  projectId: string,
  userId: string,
  type: 'web' | 'mobile',
  durationMs: number,
  status: 'success' | 'failed'
): void {
  telemetry.track('build_completed', { type, duration_ms: durationMs, status }, userId, projectId);
}

export function trackProjectCreated(projectId: string, userId: string, type: 'web' | 'mobile'): void {
  telemetry.track('project_created', { type }, userId, projectId);
}

export function trackFilesSaved(
  projectId: string,
  userId: string,
  fileCount: number,
  totalBytes: number
): void {
  telemetry.track('files_saved', { file_count: fileCount, total_bytes: totalBytes }, userId, projectId);
}
