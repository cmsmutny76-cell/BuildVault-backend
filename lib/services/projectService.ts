import { type Project } from '../domain/project';
import { dbQuery, isDatabaseEnabled } from '../db';
import { logPlatformEvent } from '../eventLogger';

const now = new Date().toISOString();

const projectStore = new Map<string, Project>([
  [
    'proj1',
    {
      id: 'proj1',
      ownerId: 'user_2',
      projectType: 'residential-remodel',
      title: 'Kitchen Remodel',
      description: 'Replace cabinets, countertops, and flooring.',
      location: {
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
      },
      status: 'scoped',
      createdAt: now,
      updatedAt: now,
    },
  ],
  [
    'proj_1',
    {
      id: 'proj_1',
      ownerId: 'user_2',
      projectType: 'residential-remodel',
      title: 'Kitchen Remodel (Legacy)',
      description: 'Legacy seeded project for backward compatibility.',
      location: {
        city: 'Austin',
        state: 'TX',
        zipCode: '78702',
      },
      status: 'scoped',
      createdAt: now,
      updatedAt: now,
    },
  ],
]);

interface ProjectRow {
  id: string;
  owner_id: string;
  project_type: string;
  title: string;
  description: string | null;
  location: Project['location'];
  status: Project['status'];
  created_at: Date;
  updated_at: Date;
}

function mapProjectRow(row: ProjectRow): Project {
  return {
    id: row.id,
    ownerId: row.owner_id,
    projectType: row.project_type,
    title: row.title,
    description: row.description || undefined,
    location: row.location,
    status: row.status,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

export async function listProjects(): Promise<Project[]> {
  if (!isDatabaseEnabled()) {
    return Array.from(projectStore.values());
  }

  const rows = await dbQuery<ProjectRow>('SELECT * FROM app_projects ORDER BY created_at DESC');
  return rows.map(mapProjectRow);
}

export async function getProjectById(projectId: string): Promise<Project | null> {
  if (!isDatabaseEnabled()) {
    return projectStore.get(projectId) || null;
  }

  const rows = await dbQuery<ProjectRow>('SELECT * FROM app_projects WHERE id = $1 LIMIT 1', [projectId]);
  return rows[0] ? mapProjectRow(rows[0]) : null;
}

export async function projectExists(projectId: string): Promise<boolean> {
  if (!isDatabaseEnabled()) {
    return projectStore.has(projectId);
  }

  const rows = await dbQuery<{ exists: boolean }>('SELECT EXISTS(SELECT 1 FROM app_projects WHERE id = $1) AS exists', [projectId]);
  return Boolean(rows[0]?.exists);
}

export async function createProject(input: {
  ownerId: string;
  projectType: string;
  title: string;
  description?: string;
  location: Project['location'];
}): Promise<Project> {
  const project: Project = {
    id: `proj_${Date.now()}`,
    ownerId: input.ownerId,
    projectType: input.projectType,
    title: input.title,
    description: input.description,
    location: input.location,
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (isDatabaseEnabled()) {
    await dbQuery(
      `INSERT INTO app_projects (id, owner_id, project_type, title, description, location, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9)`,
      [
        project.id,
        project.ownerId,
        project.projectType,
        project.title,
        project.description || null,
        JSON.stringify(project.location),
        project.status,
        project.createdAt,
        project.updatedAt,
      ]
    );
  } else {
    projectStore.set(project.id, project);
  }

  logPlatformEvent({
    type: 'project_created',
    entityType: 'project',
    entityId: project.id,
    metadata: {
      ownerId: project.ownerId,
      projectType: project.projectType,
      status: project.status,
    },
  });
  return project;
}
