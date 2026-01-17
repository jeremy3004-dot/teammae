// Re-export database client classes for use in API routes only
// These should NEVER be imported by frontend code
// We export classes and instantiate them on-demand to avoid module-level initialization

import { ProjectsClient, FilesClient, BuildsClient } from '@teammae/db';

// Lazy singletons
let _projectsClient: ProjectsClient | null = null;
let _filesClient: FilesClient | null = null;
let _buildsClient: BuildsClient | null = null;

export const projectsClient = {
  get list() { return getProjectsClient().list.bind(getProjectsClient()); },
  get create() { return getProjectsClient().create.bind(getProjectsClient()); },
  get get() { return getProjectsClient().get.bind(getProjectsClient()); },
  get update() { return getProjectsClient().update.bind(getProjectsClient()); },
  get delete() { return getProjectsClient().delete.bind(getProjectsClient()); },
};

export const filesClient = {
  get list() { return getFilesClient().list.bind(getFilesClient()); },
  get save() { return getFilesClient().save.bind(getFilesClient()); },
  get get() { return getFilesClient().get.bind(getFilesClient()); },
  get delete() { return getFilesClient().delete.bind(getFilesClient()); },
};

export const buildsClient = {
  get create() { return getBuildsClient().create.bind(getBuildsClient()); },
  get get() { return getBuildsClient().get.bind(getBuildsClient()); },
  get list() { return getBuildsClient().list.bind(getBuildsClient()); },
  get updateStatus() { return getBuildsClient().updateStatus.bind(getBuildsClient()); },
  get addLog() { return getBuildsClient().addLog.bind(getBuildsClient()); },
  get getLogs() { return getBuildsClient().getLogs.bind(getBuildsClient()); },
};

function getProjectsClient() {
  if (!_projectsClient) _projectsClient = new ProjectsClient();
  return _projectsClient;
}

function getFilesClient() {
  if (!_filesClient) _filesClient = new FilesClient();
  return _filesClient;
}

function getBuildsClient() {
  if (!_buildsClient) _buildsClient = new BuildsClient();
  return _buildsClient;
}
