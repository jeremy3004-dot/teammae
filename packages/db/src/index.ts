// Re-export supabase client getter function
// Note: We only export getSupabase(), not a pre-initialized client
// This is critical for serverless environments where env vars aren't available at import time
export { getSupabase } from './supabase';

// Export types
export * from './types';

// Export clients - explicit named exports to ensure they're visible
export { ProjectsClient, projectsClient } from './clients/projects';
export { FilesClient, filesClient } from './clients/files';
export { BuildsClient, buildsClient } from './clients/builds';
export { TemplatesClient, templatesClient } from './clients/templates';

// Export helpers
export * from './helpers';
