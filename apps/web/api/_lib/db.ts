// Re-export database clients for use in API routes only
// These should NEVER be imported by frontend code

export { projectsClient, filesClient, buildsClient } from '@teammae/db';
