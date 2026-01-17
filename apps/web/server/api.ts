import { buildWithMAE } from '../src/api/mae';
import { filesClient, projectsClient, buildsClient, getCurrentUserId, isSupabaseConfigured } from '@teammae/db';
import crypto from 'crypto';

/**
 * MAE Build API Handler
 */
export const maeBuildHandler = async (req: any, res: any) => {
  let buildId: string | null = null;

  try {
    const { projectId, prompt, existingFiles } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Invalid prompt' }));
      return;
    }

    // Get user context (optional - gracefully degrades if not authenticated)
    let userId: string | null = null;
    let project: any = null;

    if (isSupabaseConfigured()) {
      try {
        const authHeader = req.headers.authorization || req.headers.Authorization;
        userId = await getCurrentUserId(authHeader);

        if (userId) {
          // Get or create project for this user
          if (projectId) {
            project = await projectsClient.get(projectId);
          } else {
            project = await projectsClient.getOrCreateDefault(userId);
          }

          // Create build record
          const build = await buildsClient.create(project.id, userId, {
            trigger: 'manual',
            prompt,
          });
          buildId = build.id;

          // Update status to building
          await buildsClient.updateStatus(buildId, 'building');
          await buildsClient.addLog(buildId, 'info', 'Starting MAE build');
        }
      } catch (authError) {
        console.warn('Auth/project setup failed (continuing in mock mode):', authError);
        // Continue without user context - graceful degradation
      }
    }

    // Build with MAE
    const result = await buildWithMAE({
      projectId: project?.id || projectId || 'dev-project',
      prompt,
      existingFiles: existingFiles || [],
    });

    // Save files to database (optional - skip if Supabase not configured or no user)
    let savedCount = 0;
    if (buildId && project) {
      try {
        await buildsClient.addLog(buildId, 'info', `Saving ${result.files.length} files to database`);
        const savedFiles = await saveFilesToDB(project.id, result.files);
        savedCount = savedFiles.length;

        // Update build with summary and mark as success
        await buildsClient.updateStatus(buildId, 'success');
        await buildsClient.addLog(buildId, 'info', `Build completed successfully with ${savedCount} files`);
      } catch (dbError) {
        console.warn('Database save failed:', dbError);
        if (buildId) {
          await buildsClient.updateStatus(buildId, 'failed', dbError instanceof Error ? dbError.message : 'Database save failed');
          await buildsClient.addLog(buildId, 'error', `Failed to save files: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
        }
        // Continue without saving - preview will still work
      }
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      ...result,
      savedCount,
      buildId,
      projectId: project?.id,
    }));
  } catch (error) {
    console.error('MAE build error:', error);

    // Mark build as failed if we have a buildId
    if (buildId) {
      try {
        await buildsClient.updateStatus(buildId, 'failed', error instanceof Error ? error.message : 'Unknown error');
        await buildsClient.addLog(buildId, 'error', `Build failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } catch (logError) {
        console.error('Failed to log build error:', logError);
      }
    }

    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error',
    }));
  }
};

/**
 * Save files to database
 */
async function saveFilesToDB(
  projectId: string,
  files: Array<{ path: string; content: string }>
): Promise<any[]> {
  const saved = [];

  for (const file of files) {
    try {
      const checksum = crypto
        .createHash('sha256')
        .update(file.content)
        .digest('hex');

      const savedFile = await filesClient.save(projectId, {
        path: file.path,
        content: file.content,
        file_type: inferFileType(file.path),
      });

      saved.push(savedFile);
    } catch (error) {
      console.error(`Failed to save ${file.path}:`, error);
    }
  }

  return saved;
}

/**
 * Infer file type from path
 */
function inferFileType(path: string): 'component' | 'page' | 'config' | 'asset' | 'util' | 'style' | 'other' {
  if (path.match(/\.(tsx|jsx)$/)) {
    if (path.includes('components/')) return 'component';
    if (path.includes('pages/') || path.includes('App.')) return 'page';
    return 'component';
  }
  if (path.match(/\.(css|scss|sass|less)$/)) return 'style';
  if (path.match(/\.(json|yaml|yml|toml|config\.)$/)) return 'config';
  if (path.match(/\.(ts|js)$/)) return 'util';
  if (path.match(/\.(png|jpg|jpeg|gif|svg|ico|webp)$/)) return 'asset';
  return 'other';
}
